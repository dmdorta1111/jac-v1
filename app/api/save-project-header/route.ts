import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

/**
 * POST /api/save-project-header
 * Save project header data to JSON file
 *
 * Body:
 * - folderPath: string (e.g., "project-docs/SDI/SO123")
 * - data: Record<string, any>
 */
export async function POST(request: NextRequest) {
  try {
    const { folderPath, data } = await request.json();

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

    return NextResponse.json({
      success: true,
      path: relativePath,
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
