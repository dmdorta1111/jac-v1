import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import {
  connectToDatabase,
  getItemsCollection,
  getProjectsCollection,
  getClient,
} from '@/lib/mongodb';
import { CreateItemSchema } from '@/lib/schemas/item';
import { z } from 'zod';

/**
 * POST /api/items
 * Create a new item under a project
 *
 * Request body:
 * - projectId: string (ObjectId of parent project)
 * - itemNumber: string (3-digit format, e.g., "001")
 * - productType?: string
 * - itemData?: Record<string, any>
 * - formIds?: string[]
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validData = CreateItemSchema.parse(body);

    const db = await connectToDatabase();
    const items = getItemsCollection(db);
    const projects = getProjectsCollection(db);

    // Convert projectId string to ObjectId
    const projectId = new ObjectId(validData.projectId);

    // Verify project exists and not deleted
    const project = await projects.findOne({
      _id: projectId,
      isDeleted: { $ne: true },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check for duplicate itemNumber in project
    const exists = await items.findOne({
      projectId,
      itemNumber: validData.itemNumber,
      isDeleted: { $ne: true },
    });

    if (exists) {
      return NextResponse.json(
        { success: false, error: 'Item number already exists in this project' },
        { status: 409 }
      );
    }

    // Insert item and update project itemCount atomically
    const now = new Date();
    const client = getClient();

    if (client) {
      // Use transaction for atomicity
      const session = client.startSession();
      try {
        let insertedId: ObjectId | undefined;

        await session.withTransaction(async () => {
          const result = await items.insertOne({
            projectId,
            itemNumber: validData.itemNumber,
            productType: validData.productType || '',
            itemData: validData.itemData || {},
            formIds: validData.formIds || [],
            isDeleted: false,
            createdAt: now,
            updatedAt: now,
          } as any, { session });

          insertedId = result.insertedId;

          // Increment project itemCount
          await projects.updateOne(
            { _id: projectId },
            {
              $inc: { itemCount: 1 },
              $set: { updatedAt: now },
            },
            { session }
          );
        });

        await session.endSession();

        return NextResponse.json({
          success: true,
          itemId: insertedId?.toString(),
          itemNumber: validData.itemNumber,
          projectId: validData.projectId,
        }, { status: 201 });

      } catch (txError) {
        await session.endSession();
        throw txError;
      }
    } else {
      // Fallback without transaction (less safe but works)
      const result = await items.insertOne({
        projectId,
        itemNumber: validData.itemNumber,
        productType: validData.productType || '',
        itemData: validData.itemData || {},
        formIds: validData.formIds || [],
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
      } as any);

      // Update project itemCount (non-atomic)
      await projects.updateOne(
        { _id: projectId },
        {
          $inc: { itemCount: 1 },
          $set: { updatedAt: now },
        }
      );

      return NextResponse.json({
        success: true,
        itemId: result.insertedId.toString(),
        itemNumber: validData.itemNumber,
        projectId: validData.projectId,
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Item creation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/items
 * Query items with filters
 *
 * Query params:
 * - projectId: Get all items for a project (required)
 * - itemNumber: Get specific item by number
 * - includeDeleted: Include soft-deleted items (default: false)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectIdParam = searchParams.get('projectId');
    const itemNumber = searchParams.get('itemNumber');
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    if (!projectIdParam) {
      return NextResponse.json(
        { success: false, error: 'projectId parameter required' },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(projectIdParam)) {
      return NextResponse.json(
        { success: false, error: 'Invalid projectId format' },
        { status: 400 }
      );
    }

    const projectId = new ObjectId(projectIdParam);

    const db = await connectToDatabase();
    const items = getItemsCollection(db);

    // Build query
    const query: Record<string, unknown> = { projectId };

    if (!includeDeleted) {
      query.isDeleted = { $ne: true };
    }

    if (itemNumber) {
      query.itemNumber = itemNumber;

      // Single item lookup
      const item = await items.findOne(query);

      if (!item) {
        return NextResponse.json(
          { success: false, error: 'Item not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        item: {
          ...item,
          _id: item._id.toString(),
          projectId: item.projectId.toString(),
        },
      });
    }

    // List all items for project
    const itemList = await items
      .find(query)
      .sort({ itemNumber: 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      count: itemList.length,
      items: itemList.map(i => ({
        ...i,
        _id: i._id.toString(),
        projectId: i.projectId.toString(),
      })),
    });

  } catch (error) {
    console.error('Item retrieval error:', error);

    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/items
 * Update an item's data
 *
 * Query params:
 * - projectId: string
 * - itemNumber: string
 *
 * Request body:
 * - productType?: string
 * - itemData?: Record<string, any>
 * - formIds?: string[]
 */
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectIdParam = searchParams.get('projectId');
    const itemNumber = searchParams.get('itemNumber');

    if (!projectIdParam || !itemNumber) {
      return NextResponse.json(
        { success: false, error: 'projectId and itemNumber parameters required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(projectIdParam)) {
      return NextResponse.json(
        { success: false, error: 'Invalid projectId format' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const projectId = new ObjectId(projectIdParam);

    const db = await connectToDatabase();
    const items = getItemsCollection(db);

    // Build update object
    const update: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (body.productType !== undefined) update.productType = body.productType;
    if (body.itemData !== undefined) update.itemData = body.itemData;
    if (body.formIds !== undefined) update.formIds = body.formIds;

    const result = await items.updateOne(
      { projectId, itemNumber, isDeleted: { $ne: true } },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Item updated',
      projectId: projectIdParam,
      itemNumber,
    });

  } catch (error) {
    console.error('Item update error:', error);

    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/items (soft delete)
 *
 * Query params:
 * - projectId: string
 * - itemNumber: string
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectIdParam = searchParams.get('projectId');
    const itemNumber = searchParams.get('itemNumber');

    if (!projectIdParam || !itemNumber) {
      return NextResponse.json(
        { success: false, error: 'projectId and itemNumber parameters required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(projectIdParam)) {
      return NextResponse.json(
        { success: false, error: 'Invalid projectId format' },
        { status: 400 }
      );
    }

    const projectId = new ObjectId(projectIdParam);

    const db = await connectToDatabase();
    const items = getItemsCollection(db);
    const projects = getProjectsCollection(db);
    const client = getClient();

    const now = new Date();

    if (client) {
      const session = client.startSession();
      try {
        await session.withTransaction(async () => {
          // Soft delete item
          const result = await items.updateOne(
            { projectId, itemNumber, isDeleted: { $ne: true } },
            {
              $set: {
                isDeleted: true,
                deletedAt: now,
                updatedAt: now,
              }
            },
            { session }
          );

          if (result.matchedCount === 0) {
            throw new Error('Item not found');
          }

          // Decrement project itemCount
          await projects.updateOne(
            { _id: projectId },
            {
              $inc: { itemCount: -1 },
              $set: { updatedAt: now },
            },
            { session }
          );
        });

        await session.endSession();

        return NextResponse.json({
          success: true,
          message: 'Item soft-deleted',
          projectId: projectIdParam,
          itemNumber,
        });

      } catch (txError) {
        await session.endSession();
        if ((txError as Error).message === 'Item not found') {
          return NextResponse.json(
            { success: false, error: 'Item not found or already deleted' },
            { status: 404 }
          );
        }
        throw txError;
      }
    } else {
      // Fallback without transaction
      const result = await items.updateOne(
        { projectId, itemNumber, isDeleted: { $ne: true } },
        {
          $set: {
            isDeleted: true,
            deletedAt: now,
            updatedAt: now,
          }
        }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json(
          { success: false, error: 'Item not found or already deleted' },
          { status: 404 }
        );
      }

      // Decrement project itemCount (non-atomic)
      await projects.updateOne(
        { _id: projectId },
        {
          $inc: { itemCount: -1 },
          $set: { updatedAt: now },
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Item soft-deleted',
        projectId: projectIdParam,
        itemNumber,
      });
    }

  } catch (error) {
    console.error('Item deletion error:', error);

    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    );
  }
}
