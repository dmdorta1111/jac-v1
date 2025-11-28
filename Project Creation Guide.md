I'll help you create a Next.js API route that creates project folders based on sales order numbers. Here's how to implement this:

## Setup Instructions

### 1. Create the API Route

Create a file at `pages/api/create-project-folder.js` (or `app/api/create-project-folder/route.js` if using App Router):

**Pages Router** (`pages/api/create-project-folder.js`):
```javascript
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { salesOrderNumber } = req.body;

  // Validate input
  if (!salesOrderNumber || typeof salesOrderNumber !== 'string') {
    return res.status(400).json({ error: 'Valid sales order number required' });
  }

  // Sanitize the folder name to prevent path traversal attacks
  const sanitizedOrderNumber = salesOrderNumber.replace(/[^a-zA-Z0-9-_]/g, '_');

  try {
    // Define the projects directory path
    const projectsDir = path.join(process.cwd(), 'public', 'projects');
    const orderFolderPath = path.join(projectsDir, sanitizedOrderNumber);

    // Create the projects directory if it doesn't exist
    if (!fs.existsSync(projectsDir)) {
      fs.mkdirSync(projectsDir, { recursive: true });
    }

    // Check if folder already exists
    if (fs.existsSync(orderFolderPath)) {
      return res.status(409).json({ 
        error: 'Project folder already exists',
        path: `/projects/${sanitizedOrderNumber}`
      });
    }

    // Create the project folder
    fs.mkdirSync(orderFolderPath, { recursive: true });

    return res.status(201).json({
      success: true,
      message: 'Project folder created successfully',
      path: `/projects/${sanitizedOrderNumber}`,
      folderName: sanitizedOrderNumber
    });

  } catch (error) {
    console.error('Error creating project folder:', error);
    return res.status(500).json({ error: 'Failed to create project folder' });
  }
}
```

**App Router** (`app/api/create-project-folder/route.js`):
```javascript
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { salesOrderNumber } = await request.json();

    // Validate input
    if (!salesOrderNumber || typeof salesOrderNumber !== 'string') {
      return NextResponse.json(
        { error: 'Valid sales order number required' },
        { status: 400 }
      );
    }

    // Sanitize the folder name
    const sanitizedOrderNumber = salesOrderNumber.replace(/[^a-zA-Z0-9-_]/g, '_');

    // Define the projects directory path
    const projectsDir = path.join(process.cwd(), 'public', 'projects');
    const orderFolderPath = path.join(projectsDir, sanitizedOrderNumber);

    // Create the projects directory if it doesn't exist
    if (!fs.existsSync(projectsDir)) {
      fs.mkdirSync(projectsDir, { recursive: true });
    }

    // Check if folder already exists
    if (fs.existsSync(orderFolderPath)) {
      return NextResponse.json(
        { 
          error: 'Project folder already exists',
          path: `/projects/${sanitizedOrderNumber}`
        },
        { status: 409 }
      );
    }

    // Create the project folder
    fs.mkdirSync(orderFolderPath, { recursive: true });

    return NextResponse.json({
      success: true,
      message: 'Project folder created successfully',
      path: `/projects/${sanitizedOrderNumber}`,
      folderName: sanitizedOrderNumber
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating project folder:', error);
    return NextResponse.json(
      { error: 'Failed to create project folder' },
      { status: 500 }
    );
  }
}
```

### 2. Create the Client-Side Component

Create a component for your employees to use:

```javascript
import { useState } from 'react';

export default function CreateProjectFolder() {
  const [salesOrderNumber, setSalesOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/create-project-folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ salesOrderNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Success! Folder created at: ${data.path}`);
        setSalesOrderNumber('');
      } else {
        setError(data.error || 'Failed to create folder');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px' }}>
      <h2>Create Project Folder</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="salesOrder" style={{ display: 'block', marginBottom: '5px' }}>
            Sales Order Number:
          </label>
          <input
            id="salesOrder"
            type="text"
            value={salesOrderNumber}
            onChange={(e) => setSalesOrderNumber(e.target.value)}
            placeholder="Enter sales order number"
            required
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creating...' : 'Create Folder'}
        </button>
      </form>

      {message && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px' }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>
          {error}
        </div>
      )}
    </div>
  );
}
```

### 3. Important Notes

**Security Considerations:**
- The code sanitizes folder names to prevent path traversal attacks
- Consider adding authentication/authorization to restrict who can create folders
- Validate sales order numbers against your database if needed

**File Access:**
- Folders created in `public/projects/` will be publicly accessible at `/projects/[order-number]`
- If you need private storage, create folders outside `public/` and use API routes to serve files

**Alternative Storage Location:**
If you want folders outside the public directory:
```javascript
const projectsDir = path.join(process.cwd(), 'project-data', 'orders');
```
Then create a separate API route to serve/access those files.

Would you like me to add authentication, file upload capabilities, or help with serving private files?