import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * GET /api/read-json?path=xxx
 * Read JSON file from project-docs directory
 *
 * Query params:
 * - path: string (e.g., "project-docs/SDI/SO123/project-header.json")
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json(
        { success: false, error: 'path parameter is required' },
        { status: 400 }
      );
    }

    // Validate path (prevent directory traversal)
    if (filePath.includes('..') || !filePath.startsWith('project-docs/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file path' },
        { status: 400 }
      );
    }

    // Ensure it's a JSON file
    if (!filePath.endsWith('.json')) {
      return NextResponse.json(
        { success: false, error: 'Only JSON files can be read' },
        { status: 400 }
      );
    }

    const fullPath = path.join(process.cwd(), filePath);

    if (!existsSync(fullPath)) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    const content = await readFile(fullPath, 'utf-8');
    const data = JSON.parse(content);

    return NextResponse.json({
      success: true,
      path: filePath,
      data,
    });

  } catch (error) {
    console.error('Error reading JSON file:', error);

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON file' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to read file',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
