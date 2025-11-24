import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readdir } from 'fs/promises';
import { join } from 'path';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { projectData, action } = body;

    // Validate required fields
    if (!projectData?.projectId) {
      return NextResponse.json(
        { error: 'Missing required project data (projectId)' },
        { status: 400 }
      );
    }

    // Generate documentation using Claude with dynamic form data
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: `Generate a professional project documentation markdown file for a custom fabrication quote. Create a well-structured document with the following information:

Project ID: ${projectData.projectId}
Action Type: ${action || 'initial_quote'}
Project Specifications: ${JSON.stringify(projectData, null, 2)}

Create a professional markdown document with:
1. **Project Overview** - Summary of the item being quoted
2. **Specifications Summary** - Key dimensions, materials, and options selected
3. **Features & Options** - List of selected features and configurations
4. **Project Details** - Quantity, timeline, installation requirements
5. **Additional Notes** - Any special requirements noted
6. **Quote Information** - Project ID and timestamp

Format it as a clean, professional quote document suitable for a fabrication company. Use the field names from the project data to create meaningful section content.`
      }]
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const markdownContent = content.text;

    // Prepare file path
    const projectDocsDir = join(process.cwd(), 'project-docs');
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${projectData.projectId}_${action || 'quote'}_${timestamp}.md`;
    const filePath = join(projectDocsDir, filename);

    // Ensure directory exists
    await mkdir(projectDocsDir, { recursive: true });

    // Write file to disk
    await writeFile(filePath, markdownContent, 'utf-8');

    // Return success response with summary
    const summaryLines = markdownContent.split('\n').slice(0, 15).join('\n');

    return NextResponse.json({
      success: true,
      filename,
      path: filePath,
      content: summaryLines + '\n\n...(see full document for complete details)',
      message: 'Project documentation generated successfully',
    });
  } catch (error) {
    console.error('Error generating project documentation:', error);
    return NextResponse.json(
      {
        success: false,
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
