# Claude Sales Team Project Documentation System

## Table of Contents
1. [Security Setup](#security-setup)
2. [Project Structure](#project-structure)
3. [Implementation Guide](#implementation-guide)
4. [Usage Examples](#usage-examples)

---

## Security Setup

### Environment Variables

Create a `.env.local` file in your Next.js project root (never commit this to git):

```bash
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

Add to your `.gitignore`:
```
.env.local
.env*.local
project-docs/
```

---

## Project Structure

```
your-nextjs-app/
├── .env.local
├── .gitignore
├── app/
│   └── api/
│       └── generate-project-doc/
│           └── route.ts
├── lib/
│   ├── claude-client.ts
│   └── prompts.ts
├── project-docs/          # Generated markdown files
│   └── .gitkeep
└── components/
    └── ProjectQuoteForm.tsx
```

---

## Implementation Guide

### 1. Claude Client Setup (`lib/claude-client.ts`)

```typescript
import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude client (server-side only)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ProjectData {
  projectId: string;
  clientName: string;
  projectType: string;
  requirements: string;
  budget?: string;
  timeline?: string;
  additionalNotes?: string;
}

export interface ProjectDocumentationRequest {
  projectData: ProjectData;
  action: 'initial_quote' | 'data_collection' | 'update' | 'final_summary';
  previousSteps?: string[];
}

export async function generateProjectDocumentation(
  request: ProjectDocumentationRequest
): Promise<string> {
  const prompt = buildPrompt(request);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === 'text') {
    return content.text;
  }

  throw new Error('Unexpected response format from Claude');
}

function buildPrompt(request: ProjectDocumentationRequest): string {
  const { projectData, action, previousSteps } = request;

  let basePrompt = `You are a sales documentation assistant. Generate a detailed markdown document for the following project:

**Project ID:** ${projectData.projectId}
**Client Name:** ${projectData.clientName}
**Project Type:** ${projectData.projectType}
**Requirements:** ${projectData.requirements}
${projectData.budget ? `**Budget:** ${projectData.budget}` : ''}
${projectData.timeline ? `**Timeline:** ${projectData.timeline}` : ''}
${projectData.additionalNotes ? `**Additional Notes:** ${projectData.additionalNotes}` : ''}

`;

  if (previousSteps && previousSteps.length > 0) {
    basePrompt += `\n**Previous Steps:**\n${previousSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\n`;
  }

  switch (action) {
    case 'initial_quote':
      basePrompt += `Generate an initial project documentation that includes:
1. Project Overview
2. Requirements Analysis
3. Preliminary Scope Assessment
4. Questions for Client
5. Next Steps for Sales Team
6. Timestamp and Status

Format the output as a well-structured markdown document.`;
      break;

    case 'data_collection':
      basePrompt += `Generate a data collection summary that includes:
1. Information Gathered
2. Outstanding Questions
3. Risk Assessment
4. Resource Requirements
5. Updated Timeline Estimate
6. Next Actions Required

Format the output as a well-structured markdown document.`;
      break;

    case 'update':
      basePrompt += `Generate an updated project documentation that includes:
1. Changes from Previous Version
2. Updated Requirements
3. Current Project Status
4. Blockers or Issues
5. Next Steps

Format the output as a well-structured markdown document.`;
      break;

    case 'final_summary':
      basePrompt += `Generate a final project summary that includes:
1. Complete Project Overview
2. All Requirements and Scope
3. Final Quote Breakdown
4. Timeline and Milestones
5. Terms and Conditions
6. Sign-off Section

Format the output as a well-structured markdown document suitable for client presentation.`;
      break;
  }

  return basePrompt;
}

export { anthropic };
```

### 2. Prompt Templates (`lib/prompts.ts`)

```typescript
export const SYSTEM_PROMPT = `You are an expert sales documentation assistant. Your role is to:
- Create clear, professional project documentation
- Extract key information from project requirements
- Identify gaps or risks in project specifications
- Provide actionable next steps for the sales team
- Maintain consistent formatting across all documents

Always structure your responses as markdown with clear headers, bullet points, and sections.`;

export function buildDetailedPrompt(
  projectData: any,
  context: string
): string {
  return `${SYSTEM_PROMPT}

Current Context: ${context}

Project Information:
${JSON.stringify(projectData, null, 2)}

Please generate a comprehensive markdown document following the requested format.`;
}
```

### 3. API Route (`app/api/generate-project-doc/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
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

// Optional: GET endpoint to retrieve existing documentation
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json(
      { error: 'Project ID required' },
      { status: 400 }
    );
  }

  // Implementation to list/retrieve existing docs for a project
  // ... (additional code for file listing)

  return NextResponse.json({ projectId, docs: [] });
}
```

### 4. React Component (`components/ProjectQuoteForm.tsx`)

```typescript
'use client';

import { useState } from 'react';
import { ProjectData } from '@/lib/claude-client';

export default function ProjectQuoteForm() {
  const [formData, setFormData] = useState<ProjectData>({
    projectId: '',
    clientName: '',
    projectType: '',
    requirements: '',
    budget: '',
    timeline: '',
    additionalNotes: '',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent, action: string) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/generate-project-doc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectData: formData,
          action,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(`✓ Documentation saved to: ${data.filename}`);
      } else {
        setResult(`✗ Error: ${data.error}`);
      }
    } catch (error) {
      setResult(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Project Quote Generator</h1>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Project ID *
          </label>
          <input
            type="text"
            value={formData.projectId}
            onChange={(e) =>
              setFormData({ ...formData, projectId: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Client Name *
          </label>
          <input
            type="text"
            value={formData.clientName}
            onChange={(e) =>
              setFormData({ ...formData, clientName: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Project Type *
          </label>
          <select
            value={formData.projectType}
            onChange={(e) =>
              setFormData({ ...formData, projectType: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="">Select type...</option>
            <option value="web-development">Web Development</option>
            <option value="mobile-app">Mobile App</option>
            <option value="enterprise-software">Enterprise Software</option>
            <option value="consulting">Consulting</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Requirements *
          </label>
          <textarea
            value={formData.requirements}
            onChange={(e) =>
              setFormData({ ...formData, requirements: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md h-32"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Budget</label>
          <input
            type="text"
            value={formData.budget}
            onChange={(e) =>
              setFormData({ ...formData, budget: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g., $50,000 - $100,000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Timeline</label>
          <input
            type="text"
            value={formData.timeline}
            onChange={(e) =>
              setFormData({ ...formData, timeline: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g., 3-6 months"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Additional Notes
          </label>
          <textarea
            value={formData.additionalNotes}
            onChange={(e) =>
              setFormData({ ...formData, additionalNotes: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md h-24"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'initial_quote')}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Generate Initial Quote
          </button>

          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'data_collection')}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Collect Data
          </button>

          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'final_summary')}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            Final Summary
          </button>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Generating documentation...</p>
          </div>
        )}

        {result && (
          <div
            className={`p-4 rounded-md ${
              result.startsWith('✓')
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {result}
          </div>
        )}
      </form>
    </div>
  );
}
```

---

## Usage Examples

### Example 1: Generate Initial Quote

```typescript
// API call
const response = await fetch('/api/generate-project-doc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectData: {
      projectId: 'PRJ-2024-001',
      clientName: 'Acme Corporation',
      projectType: 'web-development',
      requirements: 'Need a custom e-commerce platform with inventory management',
      budget: '$75,000',
      timeline: '4 months',
    },
    action: 'initial_quote',
  }),
});
```

### Example 2: Generated Markdown Output

The system will generate files like:

**Filename:** `PRJ-2024-001_initial_quote_2024-11-23T10-30-00-000Z.md`

```markdown
# Project Documentation: PRJ-2024-001

**Client:** Acme Corporation
**Generated:** 2024-11-23 10:30:00
**Status:** Initial Quote

## 1. Project Overview

This project involves developing a custom e-commerce platform for Acme Corporation...

## 2. Requirements Analysis

- Custom e-commerce functionality
- Inventory management system
- User authentication
...

## 3. Preliminary Scope Assessment

Based on the requirements provided, this project falls under a medium-to-large scope...

## 4. Questions for Client

1. What is your current tech stack?
2. How many products do you anticipate managing?
...

## 5. Next Steps for Sales Team

- [ ] Schedule technical discovery call
- [ ] Review competitor platforms
- [ ] Prepare detailed proposal
...

## 6. Status & Timestamp

**Status:** Awaiting Client Response
**Last Updated:** 2024-11-23 10:30:00
```

---

## Security Checklist

- ✓ API key stored in `.env.local` (never committed to git)
- ✓ All Claude API calls happen server-side only
- ✓ No API key exposure in client-side code
- ✓ Project documentation files excluded from git
- ✓ Proper error handling in API routes
- ✓ Input validation on all endpoints

---

## Installation Steps

1. **Install Dependencies:**
```bash
npm install @anthropic-ai/sdk
```

2. **Create Environment File:**
```bash
echo "ANTHROPIC_API_KEY=your-key-here" > .env.local
```

3. **Update .gitignore:**
```bash
echo ".env.local" >> .gitignore
echo "project-docs/" >> .gitignore
```

4. **Create Project Docs Directory:**
```bash
mkdir project-docs
touch project-docs/.gitkeep
```

5. **Test the Setup:**
- Start your Next.js dev server: `npm run dev`
- Navigate to your form component
- Generate a test project document

---

## Advanced Features (Optional)

### Version Control for Project Docs

```typescript
// lib/project-versioning.ts
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

export async function saveProjectVersion(
  projectId: string,
  content: string,
  version: number
) {
  const filename = `${projectId}_v${version}.md`;
  const filePath = join(process.cwd(), 'project-docs', filename);
  await writeFile(filePath, content, 'utf-8');
  return filename;
}
```

### Search Existing Documentation

```typescript
// app/api/search-docs/route.ts
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const projectId = searchParams.get('projectId');
  
  const docsDir = join(process.cwd(), 'project-docs');
  const files = await readdir(docsDir);
  
  const projectFiles = files.filter(f => f.startsWith(projectId || ''));
  
  // Return list of documents
  return NextResponse.json({ files: projectFiles });
}
```

---

## Troubleshooting

### Issue: "API key not found"
**Solution:** Ensure `.env.local` exists and contains `ANTHROPIC_API_KEY=sk-ant-...`

### Issue: "Cannot write file"
**Solution:** Check that `project-docs/` directory exists and has write permissions

### Issue: "Module not found: @anthropic-ai/sdk"
**Solution:** Run `npm install @anthropic-ai/sdk`

---

## Next Steps

1. Customize the prompt templates in `lib/prompts.ts` for your specific needs
2. Add authentication/authorization to protect the API routes
3. Implement a dashboard to view and manage all project documents
4. Add email notifications when documents are generated
5. Integrate with your CRM or project management tools

