import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

/**
 * POST /api/save-project-header
 * Save project header data to JSON file AND MongoDB projects collection
 *
 * Body:
 * - folderPath: string (e.g., "project-docs/SDI/SO123")
 * - data: Record<string, any>
 * - salesOrderNumber: string (optional, extracted from data if not provided)
 */
export async function POST(request: NextRequest) {
  try {
    const { folderPath, data, salesOrderNumber: explicitSO } = await request.json();

    // Validate required fields
    if (!folderPath || !data) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: folderPath, data' },
        { status: 400 }
      );
    }

    // Validate folderPath (prevent directory traversal)
    if (folderPath.includes('..') || !folderPath.startsWith('project-docs/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid folder path' },
        { status: 400 }
      );
    }

    // Extract salesOrderNumber from path or data
    const salesOrderNumber = explicitSO ||
      data.SALES_ORDER_NUMBER ||
      data.salesOrderNumber ||
      folderPath.split('/').pop(); // Last segment of path

    // Build file path
    const projectDir = path.join(process.cwd(), folderPath);
    const headerFile = path.join(projectDir, 'project-header.json');

    // Ensure directory exists
    await mkdir(projectDir, { recursive: true });

    // Add metadata
    const enrichedData = {
      ...data,
      createdAt: new Date().toISOString(),
    };

    // Write JSON file
    await writeFile(headerFile, JSON.stringify(enrichedData, null, 2), 'utf-8');

    const relativePath = path.relative(process.cwd(), headerFile);

    // Create/update project in MongoDB (NEW)
    let projectId: string | undefined;
    if (salesOrderNumber) {
      try {
        const { connectToDatabase, getProjectsCollection } = await import('@/lib/mongodb');
        const db = await connectToDatabase();
        const projects = getProjectsCollection(db);

        const now = new Date();

        const result = await projects.updateOne(
          { salesOrderNumber },
          {
            $set: {
              projectName: data.PROJECT_NAME || data.projectName || salesOrderNumber,
              description: data.DESCRIPTION || data.description || '',
              metadata: {
                productType: data.PRODUCT_TYPE || data.productType,
                userId: data.USER_ID || data.userId,
                ...data,
              },
              updatedAt: now,
            },
            $setOnInsert: {
              salesOrderNumber,
              itemCount: 0,
              isDeleted: false,
              createdAt: now,
            },
          },
          { upsert: true }
        );

        // Get projectId
        if (result.upsertedId) {
          projectId = result.upsertedId.toString();
        } else {
          const project = await projects.findOne({ salesOrderNumber });
          projectId = project?._id?.toString();
        }

        console.log(`Project ${salesOrderNumber} synced to MongoDB (${result.upsertedId ? 'created' : 'updated'})`);
      } catch (dbError) {
        console.warn('MongoDB project sync failed (non-blocking):', dbError);
        // Continue - file save succeeded, DB is best-effort
      }
    }

    return NextResponse.json({
      success: true,
      path: relativePath,
      projectId,           // NEW: Return project reference
      salesOrderNumber,    // NEW: Confirm SO#
    });

  } catch (error) {
    console.error('Error saving project header:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save project header',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
