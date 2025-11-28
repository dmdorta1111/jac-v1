import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

interface GenerateDocRequest {
  projectData: Record<string, any>;
  action: 'initial_quote' | 'project_header' | 'quote';
  targetFolder?: string;
}

/**
 * Validate folder path to prevent directory traversal attacks
 */
function validateFolderPath(folderPath: string): string | null {
  // Prevent directory traversal
  if (folderPath.includes('..') || folderPath.startsWith('/') || folderPath.startsWith('\\')) {
    return null;
  }

  const absolutePath = path.join(process.cwd(), folderPath);

  // Ensure path is within project directory
  if (!absolutePath.startsWith(process.cwd())) {
    return null;
  }

  // Check folder exists
  if (!existsSync(absolutePath)) {
    return null;
  }

  return absolutePath;
}

/**
 * Generate structured project header markdown from form data
 */
function generateProjectHeaderMarkdown(data: Record<string, any>): string {
  const timestamp = new Date().toISOString();
  const dateStr = new Date().toLocaleDateString();
  const timeStr = new Date().toLocaleTimeString();

  return `# Project Header

**Generated:** ${dateStr} ${timeStr}

---

## Project Information

- **Sales Order Number:** ${data.SO_NUM || 'N/A'}
- **Job Name:** ${data.JOB_NAME || 'N/A'}
- **Sub Job Name:** ${data.SUB_JOB_NAME || 'N/A'}
- **Customer Name:** ${data.CUSTOMER_NAME || 'N/A'}

---

## Project Details

**Product Type:** ${data.productType || 'N/A'}
**Created:** ${timestamp}

---

## Notes

This project header was generated from the initial project creation form.
Update this file as project requirements evolve.
`;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateDocRequest = await request.json();
    const { projectData, action, targetFolder } = body;

    // Validate required fields
    if (!projectData) {
      return NextResponse.json(
        { error: 'Missing required project data' },
        { status: 400 }
      );
    }

    const actionType = action || 'initial_quote';

    // Determine save location based on action
    let outputPath: string;
    let filename: string;

    if (actionType === 'project_header' && targetFolder) {
      // Validate and resolve target folder
      const validatedPath = validateFolderPath(targetFolder);

      if (!validatedPath) {
        return NextResponse.json(
          { error: 'Invalid or non-existent target folder' },
          { status: 400 }
        );
      }

      // Save to project root as project-header.md
      filename = 'project-header.md';
      outputPath = path.join(validatedPath, filename);

    } else {
      // Legacy behavior: Save to top-level project-docs
      const projectDocsDir = path.join(process.cwd(), 'project-docs');
      await mkdir(projectDocsDir, { recursive: true });

      const timestamp = new Date().toISOString().split('T')[0];
      const projectId = projectData.projectId || `PRJ-${Date.now()}`;
      filename = `${projectId}_${actionType}_${timestamp}.md`;
      outputPath = path.join(projectDocsDir, filename);
    }

    // Generate markdown content
    let markdownContent: string;

    if (actionType === 'project_header') {
      // Use structured template for project header
      markdownContent = generateProjectHeaderMarkdown(projectData);
    } else {
      // Use Claude AI for quote generation
      const message = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: `Generate a professional project documentation markdown file for a custom fabrication quote. Create a well-structured document with the following information:

Project Specifications: ${JSON.stringify(projectData, null, 2)}

Create a professional markdown document with:
1. **Project Overview** - Summary of the item being quoted
2. **Specifications Summary** - Key dimensions, materials, and options selected
3. **Features & Options** - List of selected features and configurations
4. **Project Details** - Quantity, timeline, installation requirements
5. **Additional Notes** - Any special requirements noted
6. **Quote Information** - Project ID and timestamp

Format it as a clean, professional quote document suitable for a fabrication company.`
        }]
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      markdownContent = content.text;
    }

    // Write file to disk
    await writeFile(outputPath, markdownContent, 'utf-8');

    // Return success with relative path
    const relativePath = path.relative(process.cwd(), outputPath);

    return NextResponse.json({
      success: true,
      filename,
      path: relativePath,
      content: markdownContent.split('\n').slice(0, 10).join('\n') + '\n\n...(see full document)',
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
    const docsDir = path.join(process.cwd(), 'project-docs');

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
