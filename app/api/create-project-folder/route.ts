import { NextRequest, NextResponse } from 'next/server';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// Product type to folder mapping
const PRODUCT_FOLDERS: Record<string, string> = {
  'SDI': 'SDI',
  'EMJAC': 'EMJAC',
  'Harmonic': 'HARMONIC',
};

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
    const folderName = PRODUCT_FOLDERS[productType];
    if (!folderName) {
      return NextResponse.json(
        { success: false, error: 'Invalid product type' },
        { status: 400 }
      );
    }

    // Sanitize sales order number
    const sanitizedSO = salesOrderNumber.replace(/[^a-zA-Z0-9-_]/g, '_');

    // Build paths
    const projectDocsDir = join(process.cwd(), 'project-docs');
    const productDir = join(projectDocsDir, folderName);
    const orderDir = join(productDir, sanitizedSO);
    const customerDrawingsDir = join(orderDir, 'Customer Drawings');
    const proeModelsDir = join(orderDir, 'ProE Models');

    // Check if folder exists - if so, return success with exists flag
    // This allows reopening existing projects
    if (existsSync(orderDir)) {
      return NextResponse.json({
        success: true,
        exists: true,
        path: `project-docs/${folderName}/${sanitizedSO}`,
        folderName: sanitizedSO,
      }, { status: 200 });
    }

    // Create folders for new project
    await mkdir(orderDir, { recursive: true });
    await mkdir(customerDrawingsDir, { recursive: true });
    await mkdir(proeModelsDir, { recursive: true });

    return NextResponse.json({
      success: true,
      exists: false,
      path: `project-docs/${folderName}/${sanitizedSO}`,
      folderName: sanitizedSO,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating project folder:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project folder' },
      { status: 500 }
    );
  }
}
