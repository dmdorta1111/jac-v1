import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readdir } from 'fs/promises';
import { join } from 'path';
import { generateProjectDocumentation, ProjectDocumentationRequest } from '@/lib/claude-client';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ProjectDocumentationRequest = await request.json();

    // Validate required fields
    if (!body.projectData?.projectId || !body.projectData?.clientName) {
      return NextResponse.json(
        { error: 'Missing required project data' },
        { status: 400 }
      );
    }

    // Generate documentation using Claude
    const markdownContent = await generateProjectDocumentation(body);

    // Prepare file path
    const projectDocsDir = join(process.cwd(), 'project-docs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${body.projectData.projectId}_${body.action}_${timestamp}.md`;
    const filePath = join(projectDocsDir, filename);

    // Ensure directory exists
    await mkdir(projectDocsDir, { recursive: true });

    // Write file to disk
    await writeFile(filePath, markdownContent, 'utf-8');

    // Return success response
    return NextResponse.json({
      success: true,
      filename,
      path: filePath,
      content: markdownContent,
      message: 'Project documentation generated successfully',
    });
  } catch (error) {
    console.error('Error generating project documentation:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate project documentation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve existing documentation
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json(
      { error: 'Project ID required' },
      { status: 400 }
    );
  }

  try {
    const docsDir = join(process.cwd(), 'project-docs');

    // Ensure directory exists
    await mkdir(docsDir, { recursive: true });

    const files = await readdir(docsDir);
    const projectFiles = files.filter(f => f.startsWith(projectId));

    return NextResponse.json({
      projectId,
      docs: projectFiles
    });
  } catch (error) {
    console.error('Error retrieving project documentation:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve project documentation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
