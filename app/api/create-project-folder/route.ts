import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getProjectsCollection } from '@/lib/mongodb';

// Product type validation
const VALID_PRODUCT_TYPES = ['SDI', 'EMJAC', 'Harmonic'];

export async function POST(request: NextRequest) {
  try {
    const { productType, salesOrderNumber } = await request.json();

    // Validate inputs
    if (!productType || !salesOrderNumber) {
      return NextResponse.json(
        { success: false, error: 'Product type and sales order number required' },
        { status: 400 }
      );
    }

    // Validate product type
    if (!VALID_PRODUCT_TYPES.includes(productType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product type' },
        { status: 400 }
      );
    }

    // Sanitize sales order number
    const sanitizedSO = salesOrderNumber.replace(/[^a-zA-Z0-9-_]/g, '_');

    // Connect to MongoDB
    const db = await connectToDatabase();
    const projects = getProjectsCollection(db);

    // Check if project exists in MongoDB
    const existingProject = await projects.findOne({
      salesOrderNumber: sanitizedSO,
      isDeleted: { $ne: true }
    });

    if (existingProject) {
      return NextResponse.json({
        success: true,
        exists: true,
        // Path is virtual now, but we keep the structure for frontend compatibility
        path: `project-docs/${productType}/${sanitizedSO}`,
        folderName: sanitizedSO,
        projectId: existingProject._id.toString()
      }, { status: 200 });
    }

    // Return success for new project (without creating folders yet)
    // Folders will be created only on Export
    return NextResponse.json({
      success: true,
      exists: false,
      path: `project-docs/${productType}/${sanitizedSO}`,
      folderName: sanitizedSO,
    }, { status: 201 });

  } catch (error) {
    console.error('Error checking project existence:', error);
    try {
      const fs = require('fs');
      fs.appendFileSync('debug.log', `Error in create-project-folder: ${error instanceof Error ? error.message + '\n' + error.stack : String(error)}\n`);
    } catch (e) { /* ignore */ }

    return NextResponse.json(
      { success: false, error: 'Failed to check project existence' },
      { status: 500 }
    );
  }
}
