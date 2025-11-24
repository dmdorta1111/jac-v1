# Quick Start - Minimal Implementation

Copy and paste these files to get started immediately.


```typescript
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { projectId, clientName, requirements, action } = await request.json();

    // Generate documentation with Claude
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: `Generate a project documentation markdown file for:
        
Project ID: ${projectId}
Client: ${clientName}
Requirements: ${requirements}
Action Type: ${action}

Create a professional markdown document with:
1. Project Overview
2. Requirements Summary
3. Steps Taken
4. Data Collected
5. Next Actions
6. Timestamp

Make it clear and well-structured.`
      }]
    });

    const markdown = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    // Save to file
    const docsDir = join(process.cwd(), 'project-docs');
    await mkdir(docsDir, { recursive: true });
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${projectId}_${action}_${timestamp}.md`;
    const filePath = join(docsDir, filename);
    
    await writeFile(filePath, markdown, 'utf-8');

    return NextResponse.json({ 
      success: true, 
      filename,
      content: markdown 
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate documentation' },
      { status: 500 }
    );
  }
}
```

## 4. Test with cURL

```bash
curl -X POST http://localhost:3000/api/generate-doc \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "TEST-001",
    "clientName": "Test Client",
    "requirements": "Need a new website with shopping cart",
    "action": "initial_quote"
  }'
```

## 5. Simple React Form: `app/page.tsx` (or any component)

```typescript
'use client';
import { useState } from 'react';

export default function QuoteForm() {
  const [projectId, setProjectId] = useState('');
  const [clientName, setClientName] = useState('');
  const [requirements, setRequirements] = useState('');
  const [result, setResult] = useState('');

  const handleSubmit = async (action: string) => {
    const res = await fetch('/api/generate-doc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, clientName, requirements, action }),
    });
    const data = await res.json();
    setResult(data.success ? `✓ Saved: ${data.filename}` : '✗ Error');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h1>Project Documentation Generator</h1>
      
      <input
        placeholder="Project ID"
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
        style={{ display: 'block', width: '100%', margin: '10px 0', padding: '8px' }}
      />
      
      <input
        placeholder="Client Name"
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
        style={{ display: 'block', width: '100%', margin: '10px 0', padding: '8px' }}
      />
      
      <textarea
        placeholder="Requirements"
        value={requirements}
        onChange={(e) => setRequirements(e.target.value)}
        style={{ display: 'block', width: '100%', margin: '10px 0', padding: '8px', height: '100px' }}
      />
      
      <button onClick={() => handleSubmit('initial_quote')} style={{ margin: '5px', padding: '10px' }}>
        Generate Quote
      </button>
      
      <button onClick={() => handleSubmit('data_collection')} style={{ margin: '5px', padding: '10px' }}>
        Collect Data
      </button>

      {result && <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>{result}</div>}
    </div>
  );
}
```

## 6. Update `.gitignore`

```
.env.local
project-docs/
```

## That's It! 🎉

Run your dev server and test:
```bash
npm run dev
```

Your markdown files will be saved in `project-docs/` folder!

---

## Example Generated File

**File:** `project-docs/TEST-001_initial_quote_2024-11-23.md`

```markdown
# Project Documentation: TEST-001

**Client:** Test Client
**Date:** November 23, 2024
**Type:** Initial Quote

## Project Overview
Project for Test Client requiring a new website with shopping cart functionality...

## Requirements Summary
- E-commerce website
- Shopping cart integration
- Product catalog
...

## Steps Taken
1. Initial requirements gathered
2. Project scope assessment initiated
...

## Next Actions
- Schedule technical discovery call
- Prepare detailed proposal
- Gather additional requirements
```
