import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * Validate folder path to prevent directory traversal attacks
 */
function validateProjectPath(projectPath: string): string | null {
  // Must start with project-docs/
  if (!projectPath.startsWith('project-docs/')) {
    return null;
  }

  // Prevent directory traversal
  if (projectPath.includes('..')) {
    return null;
  }

  const absolutePath = path.join(process.cwd(), projectPath);

  // Ensure path is within project directory
  if (!absolutePath.startsWith(process.cwd())) {
    return null;
  }

  return absolutePath;
}

/**
 * GET /api/project-standards?projectPath=project-docs/SDI/12345
 * Load standards from project-header.json
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectPath = searchParams.get('projectPath');

    if (!projectPath) {
      return NextResponse.json(
        { success: false, error: 'projectPath parameter is required' },
        { status: 400 }
      );
    }

    const validatedPath = validateProjectPath(projectPath);
    if (!validatedPath) {
      return NextResponse.json(
        { success: false, error: 'Invalid project path' },
        { status: 400 }
      );
    }

    const headerFile = path.join(validatedPath, 'project-header.json');

    if (!existsSync(headerFile)) {
      return NextResponse.json(
        { success: false, error: 'Project header not found' },
        { status: 404 }
      );
    }

    const content = await readFile(headerFile, 'utf-8');
    const headerData = JSON.parse(content);

    return NextResponse.json({
      success: true,
      projectPath,
      standards: headerData.standards || {},
      header: {
        SO_NUM: headerData.SO_NUM,
        JOB_NAME: headerData.JOB_NAME,
        CUSTOMER_NAME: headerData.CUSTOMER_NAME,
        productType: headerData.productType,
      },
    });

  } catch (error) {
    console.error('Error loading project standards:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load project standards',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/project-standards
 * Update standards in project-header.json
 *
 * Body:
 * - projectPath: string (e.g., "project-docs/SDI/12345")
 * - standards: Record<string, any> (standards form data)
 */
export async function POST(request: NextRequest) {
  try {
    const { projectPath, standards } = await request.json();

    // Validate required fields
    if (!projectPath || !standards) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: projectPath, standards' },
        { status: 400 }
      );
    }

    const validatedPath = validateProjectPath(projectPath);
    if (!validatedPath) {
      return NextResponse.json(
        { success: false, error: 'Invalid project path' },
        { status: 400 }
      );
    }

    const headerFile = path.join(validatedPath, 'project-header.json');

    if (!existsSync(headerFile)) {
      return NextResponse.json(
        { success: false, error: 'Project header not found' },
        { status: 404 }
      );
    }

    // Read existing header data
    const content = await readFile(headerFile, 'utf-8');
    const headerData = JSON.parse(content);

    // Update standards while preserving other header data
    const updatedData = {
      ...headerData,
      standards: {
        ...(headerData.standards || {}),
        ...standards,
      },
      standardsUpdatedAt: new Date().toISOString(),
    };

    // Write updated file
    await writeFile(headerFile, JSON.stringify(updatedData, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      projectPath,
      message: 'Project standards updated successfully',
    });

  } catch (error) {
    console.error('Error updating project standards:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update project standards',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
