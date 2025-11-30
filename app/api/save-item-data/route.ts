import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * POST /api/save-item-data
 * Save/merge item form data to JSON file
 *
 * Body:
 * - projectPath: string (e.g., "project-docs/SDI/SO123")
 * - itemNumber: string (e.g., "001")
 * - formData: Record<string, any>
 * - merge: boolean (default true - merge with existing)
 */
export async function POST(request: NextRequest) {
  try {
    const { projectPath, itemNumber, formData, merge = true } = await request.json();

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

    // Sanitize item number
    const sanitizedItemNumber = String(itemNumber).replace(/[^a-zA-Z0-9-_]/g, '');
    if (!sanitizedItemNumber) {
      return NextResponse.json(
        { success: false, error: 'Invalid item number' },
        { status: 400 }
      );
    }

    // Build paths
    const itemsDir = path.join(process.cwd(), projectPath, 'items');
    const itemFile = path.join(itemsDir, `${sanitizedItemNumber}.json`);

    // Ensure items directory exists
    await mkdir(itemsDir, { recursive: true });

    // Merge with existing data if requested and file exists
    let finalData = { ...formData };
    const isNewItem = !existsSync(itemFile);

    if (merge && !isNewItem) {
      try {
        const existingContent = await readFile(itemFile, 'utf-8');
        const existingData = JSON.parse(existingContent);
        finalData = {
          ...existingData,
          ...formData,
          updatedAt: new Date().toISOString(),
        };
      } catch (parseError) {
        console.warn('Failed to parse existing item file, overwriting:', parseError);
        finalData = {
          CHOICE: 1, // Default CHOICE value for new items
          ...formData,
          createdAt: new Date().toISOString(),
        };
      }
    } else {
      finalData = {
        CHOICE: 1, // Default CHOICE value for new items
        ...formData,
        createdAt: new Date().toISOString(),
      };
    }

    // Write file
    await writeFile(itemFile, JSON.stringify(finalData, null, 2), 'utf-8');

    const relativePath = path.relative(process.cwd(), itemFile);

    return NextResponse.json({
      success: true,
      filePath: relativePath,
      itemNumber: sanitizedItemNumber,
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
      const sanitizedItemNumber = String(itemNumber).replace(/[^a-zA-Z0-9-_]/g, '');
      const itemFile = path.join(itemsDir, `${sanitizedItemNumber}.json`);

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
      jsonFiles.map(async (filename) => {
        const filePath = path.join(itemsDir, filename);
        const content = await readFile(filePath, 'utf-8');
        const data = JSON.parse(content);
        return {
          itemNumber: filename.replace('.json', ''),
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
