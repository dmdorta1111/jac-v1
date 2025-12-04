import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getProjectsCollection } from '@/lib/mongodb';

/**
 * POST /api/save-project-header
 * Save project header data to MongoDB projects collection only (no filesystem writes)
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

    // Extract salesOrderNumber from path or data
    const salesOrderNumber = explicitSO ||
      data.SALES_ORDER_NUMBER ||
      data.salesOrderNumber ||
      folderPath.split('/').pop(); // Last segment of path

    if (!salesOrderNumber) {
      return NextResponse.json(
        { success: false, error: 'Could not determine sales order number' },
        { status: 400 }
      );
    }

    // Create/update project in MongoDB
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
    let projectId: string | undefined;
    if (result.upsertedId) {
      projectId = result.upsertedId.toString();
    } else {
      const project = await projects.findOne({ salesOrderNumber });
      projectId = project?._id?.toString();
    }

    console.log(`Project ${salesOrderNumber} synced to MongoDB (${result.upsertedId ? 'created' : 'updated'})`);

    return NextResponse.json({
      success: true,
      path: folderPath, // Return virtual path for frontend compatibility
      projectId,
      salesOrderNumber,
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
