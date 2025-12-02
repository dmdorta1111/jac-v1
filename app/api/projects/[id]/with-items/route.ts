import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';

/**
 * GET /api/projects/{projectId}/with-items
 * Get a project with all its items in a single aggregation query
 *
 * Uses MongoDB $lookup for efficient join
 * Performance target: <10ms
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID format' },
        { status: 400 }
      );
    }

    const projectId = new ObjectId(id);
    const db = await connectToDatabase();

    // Aggregation pipeline with $lookup
    const result = await db.collection('projects').aggregate([
      // Match the specific project
      {
        $match: {
          _id: projectId,
          isDeleted: { $ne: true },
        }
      },
      // Join with items collection
      {
        $lookup: {
          from: 'items',
          let: { projectId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$projectId', '$$projectId'] },
                isDeleted: { $ne: true },
              }
            },
            {
              $sort: { itemNumber: 1 }
            },
            {
              $project: {
                _id: 1,
                itemNumber: 1,
                productType: 1,
                itemData: 1,
                formIds: 1,
                renamedFrom: 1,
                renamedAt: 1,
                createdAt: 1,
                updatedAt: 1,
              }
            }
          ],
          as: 'items'
        }
      },
      // Project only needed fields
      {
        $project: {
          _id: 1,
          salesOrderNumber: 1,
          projectName: 1,
          description: 1,
          metadata: 1,
          itemCount: 1,
          createdAt: 1,
          updatedAt: 1,
          items: 1,
        }
      }
    ]).toArray();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const project = result[0];

    return NextResponse.json({
      success: true,
      project: {
        ...project,
        _id: project._id.toString(),
        items: project.items.map((item: unknown) => ({
          ...(item as Record<string, unknown>),
          _id: (item as { _id: { toString(): string } })._id.toString(),
        })),
      },
    });

  } catch (error) {
    console.error('Project+items retrieval error:', error);

    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    );
  }
}
