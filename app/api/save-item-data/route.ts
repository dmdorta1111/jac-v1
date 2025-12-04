import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/save-item-data
 * Save/merge item form data to MongoDB only (no filesystem writes)
 * Handles item renaming when item number changes
 *
 * Body:
 * - itemNumber: string (e.g., "001") - the NEW/current item number
 * - originalItemNumber: string (optional) - the ORIGINAL item number (for rename detection)
 * - formId: string (optional) - form identifier for nested data
 * - formData: Record<string, any>
 * - sessionId: string - for form_submissions backward compatibility
 * - salesOrderNumber: string - required for MongoDB queries
 */
export async function POST(request: NextRequest) {
  try {
    const {
      itemNumber,
      originalItemNumber,
      formId,
      formData,
      sessionId,
      salesOrderNumber,
    } = await request.json();

    // Validate required fields
    if (!itemNumber || !formData || !sessionId || !salesOrderNumber) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: itemNumber, formData, sessionId, salesOrderNumber' },
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

    // Connect to MongoDB
    const { connectToDatabase, getProjectsCollection, getItemsCollection } = await import('@/lib/mongodb');
    const db = await connectToDatabase();
    const projects = getProjectsCollection(db);
    const items = getItemsCollection(db);

    // Get projectId
    const project = await projects.findOne({
      salesOrderNumber,
      isDeleted: { $ne: true },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found for sales order number' },
        { status: 404 }
      );
    }

    // Check if item number changed (rename scenario)
    const isRename = sanitizedOriginalItemNumber &&
      sanitizedOriginalItemNumber !== sanitizedItemNumber;

    // Check for existing item data (for merge)
    const existingItem = await items.findOne({
      projectId: project._id,
      itemNumber: sanitizedItemNumber,
      isDeleted: { $ne: true },
    });

    // If rename, load data from original item
    let sourceItem = existingItem;
    if (isRename && !existingItem) {
      sourceItem = await items.findOne({
        projectId: project._id,
        itemNumber: sanitizedOriginalItemNumber,
        isDeleted: { $ne: true },
      });
    }

    const existingData = sourceItem?.itemData || {};
    const existingFormIds = sourceItem?.formIds || [];

    // Merge new form data (accumulate all forms)
    // Keep formData intact - don't extract CHOICE/FRAME_PROCESSED
    // They need to be in BOTH the nested structure AND at root level
    const finalData = {
      ...existingData,
      ...(formId ? { [formId]: formData } : formData),
      // Also preserve CHOICE and FRAME_PROCESSED at root level for SmartAssembly compatibility
      ...(formData.CHOICE !== undefined ? { CHOICE: formData.CHOICE } : {}),
      ...(formData.FRAME_PROCESSED !== undefined ? { FRAME_PROCESSED: formData.FRAME_PROCESSED } : {}),
      _metadata: {
        itemNumber: sanitizedItemNumber,
        lastUpdated: new Date().toISOString(),
        formIds: formId
          ? Array.from(new Set([...existingFormIds, formId]))
          : existingFormIds,
        ...(isRename ? { renamedFrom: sanitizedOriginalItemNumber } : {}),
      },
    };

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

    // If renamed, soft-delete old item record
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

    // Update form_submissions for backward compatibility (rename tracking)
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

    console.log(`Saved ${formId || 'form data'} to MongoDB item ${sanitizedItemNumber}${isRename ? ` (renamed from ${sanitizedOriginalItemNumber})` : ''}`);

    return NextResponse.json({
      success: true,
      itemNumber: sanitizedItemNumber,
      renamed: isRename,
      renamedFrom: isRename ? sanitizedOriginalItemNumber : undefined,
      itemId: existingItem?._id?.toString() || 'created',
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
 * GET /api/save-item-data?salesOrderNumber=xxx&itemNumber=xxx
 * Load item data from MongoDB
 *
 * If itemNumber provided: returns single item data
 * If no itemNumber: returns all items in project
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salesOrderNumber = searchParams.get('salesOrderNumber');
    const itemNumber = searchParams.get('itemNumber');

    if (!salesOrderNumber) {
      return NextResponse.json(
        { success: false, error: 'salesOrderNumber parameter is required' },
        { status: 400 }
      );
    }

    const { connectToDatabase, getProjectsCollection, getItemsCollection } = await import('@/lib/mongodb');
    const db = await connectToDatabase();
    const projects = getProjectsCollection(db);
    const items = getItemsCollection(db);

    // Get projectId
    const project = await projects.findOne({
      salesOrderNumber,
      isDeleted: { $ne: true },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Load specific item
    if (itemNumber) {
      const sanitizedItemNumber = String(itemNumber).padStart(3, '0');
      const item = await items.findOne({
        projectId: project._id,
        itemNumber: sanitizedItemNumber,
        isDeleted: { $ne: true },
      });

      if (!item) {
        return NextResponse.json(
          { success: false, error: 'Item not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        itemNumber: sanitizedItemNumber,
        itemData: item.itemData,
        metadata: {
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          formIds: item.formIds,
        },
      });
    }

    // Load all items for project
    const projectItems = await items.find({
      projectId: project._id,
      isDeleted: { $ne: true },
    }).toArray();

    return NextResponse.json({
      success: true,
      items: projectItems.map(item => ({
        itemNumber: item.itemNumber,
        itemData: item.itemData,
        metadata: {
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          formIds: item.formIds,
        },
      })),
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
