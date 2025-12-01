import { NextRequest, NextResponse } from 'next/server';
import fs, { writeFile, readFile, mkdir, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * POST /api/save-item-data
 * Save/merge item form data to JSON file
 * Handles file renaming when item number changes
 *
 * Body:
 * - projectPath: string (e.g., "project-docs/SDI/SO123")
 * - itemNumber: string (e.g., "001") - the NEW/current item number
 * - originalItemNumber: string (optional) - the ORIGINAL item number (for rename detection)
 * - formData: Record<string, any>
 * - merge: boolean (default true - merge with existing)
 * - sessionId: string (optional) - for MongoDB updates
 * - salesOrderNumber: string (optional) - for MongoDB updates
 */
export async function POST(request: NextRequest) {
  try {
    const {
      projectPath,
      itemNumber,
      originalItemNumber,  // NEW: Track original for rename
      formId,
      formData,
      merge = true,
      sessionId,
      salesOrderNumber,
    } = await request.json();

    // Validate required fields
    if (!projectPath || !itemNumber || !formData) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: projectPath, itemNumber, formData' },
        { status: 400 }
      );
    }

    // Validate projectPath (prevent directory traversal)
    if (projectPath.includes('..') || !projectPath.startsWith('project-docs/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid project path' },
        { status: 400 }
      );
    }

    // Sanitize and validate item numbers (must be 3 digits)
    const sanitizedItemNumber = String(itemNumber).replace(/[^0-9]/g, '').padStart(3, '0');
    if (!sanitizedItemNumber || !/^\d{3}$/.test(sanitizedItemNumber)) {
      return NextResponse.json(
        { success: false, error: 'Item number must be 3 digits (e.g., "001")' },
        { status: 400 }
      );
    }

    const sanitizedOriginalItemNumber = originalItemNumber
      ? String(originalItemNumber).replace(/[^0-9]/g, '').padStart(3, '0')
      : null;

    // Build paths
    const itemsDir = path.join(process.cwd(), projectPath, 'items');
    const itemFile = path.join(itemsDir, `item-${sanitizedItemNumber}.json`);
    const originalItemFile = sanitizedOriginalItemNumber
      ? path.join(itemsDir, `item-${sanitizedOriginalItemNumber}.json`)
      : null;

    // Ensure items directory exists
    await mkdir(itemsDir, { recursive: true });

    // Check if item number changed (rename scenario)
    const isRename = sanitizedOriginalItemNumber &&
                     sanitizedOriginalItemNumber !== sanitizedItemNumber;

    let existingData: any = {};
    let existingFormIds: string[] = [];

    if (isRename && originalItemFile && existsSync(originalItemFile)) {
      // RENAME SCENARIO: Load data from ORIGINAL file
      try {
        const existingContent = await readFile(originalItemFile, 'utf-8');
        existingData = JSON.parse(existingContent);
        existingFormIds = existingData._metadata?.formIds || [];
        console.log(`Rename detected: ${sanitizedOriginalItemNumber} -> ${sanitizedItemNumber}`);
      } catch (parseError) {
        console.warn('Failed to parse original item file:', parseError);
      }
    } else if (merge && existsSync(itemFile)) {
      // Normal merge: Load from target file
      try {
        const existingContent = await readFile(itemFile, 'utf-8');
        existingData = JSON.parse(existingContent);
        existingFormIds = existingData._metadata?.formIds || [];
      } catch (parseError) {
        console.warn('Failed to parse existing item file, starting fresh:', parseError);
      }
    }

    // Merge new form data (accumulate all forms)
    const finalData = {
      ...existingData,
      ...(formId ? { [formId]: formData } : formData),
      _metadata: {
        itemNumber: sanitizedItemNumber,
        lastUpdated: new Date().toISOString(),
        formIds: formId
          ? Array.from(new Set([...existingFormIds, formId]))
          : existingFormIds,
        ...(isRename ? { renamedFrom: sanitizedOriginalItemNumber } : {}),
      },
    };

    // Write to NEW file location
    await writeFile(itemFile, JSON.stringify(finalData, null, 2), 'utf-8');

    // DELETE original file if renamed
    if (isRename && originalItemFile && existsSync(originalItemFile)) {
      try {
        await fs.unlink(originalItemFile);
        console.log(`Deleted original file: item-${sanitizedOriginalItemNumber}.json`);
      } catch (unlinkError) {
        console.warn('Failed to delete original file:', unlinkError);
      }
    }

    // Update MongoDB items collection (NEW normalized schema)
    if (salesOrderNumber) {
      try {
        const { connectToDatabase, getProjectsCollection, getItemsCollection } = await import('@/lib/mongodb');
        const db = await connectToDatabase();
        const projects = getProjectsCollection(db);
        const items = getItemsCollection(db);

        // Get projectId
        const project = await projects.findOne({
          salesOrderNumber,
          isDeleted: { $ne: true },
        });

        if (project) {
          const now = new Date();

          // Upsert item in items collection
          await items.updateOne(
            {
              projectId: project._id,
              itemNumber: sanitizedItemNumber,
            },
            {
              $set: {
                productType: formData.PRODUCT_TYPE || formData.productType || '',
                itemData: finalData,
                updatedAt: now,
                ...(isRename ? {
                  renamedFrom: sanitizedOriginalItemNumber,
                  renamedAt: now,
                } : {}),
              },
              $addToSet: formId ? { formIds: formId } : {},
              $setOnInsert: {
                projectId: project._id,
                itemNumber: sanitizedItemNumber,
                isDeleted: false,
                createdAt: now,
              },
            },
            { upsert: true }
          );

          // If renamed, delete old item record
          if (isRename && sanitizedOriginalItemNumber) {
            await items.updateOne(
              {
                projectId: project._id,
                itemNumber: sanitizedOriginalItemNumber,
              },
              {
                $set: {
                  isDeleted: true,
                  deletedAt: now,
                  updatedAt: now,
                },
              }
            );
          }

          console.log(`Synced item ${sanitizedItemNumber} to MongoDB items collection`);
        }

        // Also update form_submissions for backward compatibility (rename tracking)
        if (isRename && sessionId) {
          await db.collection('form_submissions').updateMany(
            {
              sessionId,
              'metadata.salesOrderNumber': salesOrderNumber,
            },
            {
              $set: {
                'metadata.itemNumber': sanitizedItemNumber,
                'metadata.renamedFrom': sanitizedOriginalItemNumber,
                'metadata.renamedAt': new Date().toISOString(),
              }
            }
          );
        }
      } catch (dbError) {
        console.warn('MongoDB update failed (non-blocking):', dbError);
        // Continue - file operations succeeded, DB update is best-effort
      }
    }

    const relativePath = path.relative(process.cwd(), itemFile);

    console.log(`Saved ${formId || 'form data'} to item-${sanitizedItemNumber}.json${isRename ? ` (renamed from ${sanitizedOriginalItemNumber})` : ''}`);

    return NextResponse.json({
      success: true,
      filePath: relativePath,
      itemNumber: sanitizedItemNumber,
      renamed: isRename,
      renamedFrom: isRename ? sanitizedOriginalItemNumber : undefined,
    });

  } catch (error) {
    console.error('Error saving item data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save item data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/save-item-data?projectPath=xxx&itemNumber=xxx
 * Load item data from JSON file
 *
 * If itemNumber provided: returns single item data
 * If no itemNumber: returns all items in project
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectPath = searchParams.get('projectPath');
    const itemNumber = searchParams.get('itemNumber');

    if (!projectPath) {
      return NextResponse.json(
        { success: false, error: 'projectPath parameter is required' },
        { status: 400 }
      );
    }

    // Validate projectPath
    if (projectPath.includes('..') || !projectPath.startsWith('project-docs/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid project path' },
        { status: 400 }
      );
    }

    const itemsDir = path.join(process.cwd(), projectPath, 'items');

    // Load specific item
    if (itemNumber) {
      const sanitizedItemNumber = String(itemNumber).replace(/[^0-9]/g, '').padStart(3, '0');
      const itemFile = path.join(itemsDir, `item-${sanitizedItemNumber}.json`);

      if (!existsSync(itemFile)) {
        return NextResponse.json(
          { success: false, error: 'Item not found' },
          { status: 404 }
        );
      }

      const content = await readFile(itemFile, 'utf-8');
      const data = JSON.parse(content);

      return NextResponse.json({
        success: true,
        itemNumber: sanitizedItemNumber,
        data,
      });
    }

    // Load all items
    if (!existsSync(itemsDir)) {
      return NextResponse.json({
        success: true,
        items: [],
      });
    }

    const files = await readdir(itemsDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    const items = await Promise.all(
      jsonFiles
        .filter(f => /^item-\d{3}\.json$/.test(f))  // Only item-XXX.json files
        .map(async (filename) => {
          const filePath = path.join(itemsDir, filename);
          const content = await readFile(filePath, 'utf-8');
          const data = JSON.parse(content);
          // Extract item number from filename (item-001.json -> 001)
          const match = filename.match(/^item-(\d{3})\.json$/);
          return {
            itemNumber: match ? match[1] : filename.replace('.json', ''),
            data,
          };
        })
    );

    return NextResponse.json({
      success: true,
      items,
    });

  } catch (error) {
    console.error('Error loading item data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load item data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
