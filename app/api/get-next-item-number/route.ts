import { NextRequest } from 'next/server';
import fs from 'fs/promises';
import { existsSync, writeFileSync, unlinkSync, readFileSync } from 'fs';
import path from 'path';

// Lock configuration
const LOCK_TIMEOUT_MS = 5000;  // Max wait for lock
const LOCK_RETRY_MS = 50;      // Retry interval

/**
 * Acquire exclusive lock for item number generation.
 * Uses file-based locking with timeout and stale lock detection.
 */
async function acquireLock(lockPath: string): Promise<boolean> {
  const start = Date.now();

  while (existsSync(lockPath)) {
    // Check if lock is stale (process died or timeout exceeded)
    try {
      const lockContent = readFileSync(lockPath, 'utf-8');
      const lockTime = parseInt(lockContent.split(':')[1] || '0', 10);

      if (Date.now() - lockTime > LOCK_TIMEOUT_MS) {
        // Stale lock, force remove
        console.warn('[Lock] Removing stale lock');
        unlinkSync(lockPath);
        break;
      }
    } catch {
      // Lock file unreadable, try to remove
      try { unlinkSync(lockPath); } catch { /* ignore */ }
      break;
    }

    // Check timeout
    if (Date.now() - start > LOCK_TIMEOUT_MS) {
      console.error('[Lock] Timeout waiting for lock');
      return false;
    }

    // Wait and retry
    await new Promise(r => setTimeout(r, LOCK_RETRY_MS));
  }

  // Try to create lock file
  try {
    // Ensure directory exists
    const lockDir = path.dirname(lockPath);
    if (!existsSync(lockDir)) {
      await fs.mkdir(lockDir, { recursive: true });
    }

    writeFileSync(lockPath, `${process.pid}:${Date.now()}`);
    return true;
  } catch (e) {
    console.error('[Lock] Failed to acquire:', e);
    return false;
  }
}

/**
 * Release the lock file.
 */
function releaseLock(lockPath: string): void {
  try {
    if (existsSync(lockPath)) {
      unlinkSync(lockPath);
    }
  } catch (e) {
    console.error('[Lock] Failed to release:', e);
  }
}

export async function GET(req: NextRequest) {
  const folderPath = req.nextUrl.searchParams.get('folderPath');

  if (!folderPath) {
    return Response.json({ success: false, error: 'Missing folderPath' }, { status: 400 });
  }

  // Validate folderPath (prevent directory traversal)
  if (folderPath.includes('..') || !folderPath.startsWith('project-docs/')) {
    return Response.json({ success: false, error: 'Invalid project path' }, { status: 400 });
  }

  const projectRoot = process.cwd();
  const itemsDir = path.join(projectRoot, folderPath, 'items');
  const lockPath = path.join(itemsDir, '.item-lock');

  // ACQUIRE LOCK
  const locked = await acquireLock(lockPath);
  if (!locked) {
    return Response.json(
      { success: false, error: 'Could not acquire lock, please try again' },
      { status: 503 }
    );
  }

  try {
    // Read directory to find existing item files
    let files: string[] = [];
    try {
      files = await fs.readdir(itemsDir);
    } catch {
      // Directory might not exist yet, will be created for reservation
    }

    // Filter for item-XXX.json files
    const itemFiles = files.filter(f => /^item-\d{3}\.json$/.test(f));

    let nextNumber: string;
    if (itemFiles.length === 0) {
      nextNumber = '001';
    } else {
      // Extract numbers and find max
      const itemNumbers = itemFiles.map(f => {
        const match = f.match(/^item-(\d{3})\.json$/);
        return match ? parseInt(match[1], 10) : 0;
      });

      const maxNumber = Math.max(...itemNumbers);
      nextNumber = (maxNumber + 1).toString().padStart(3, '0');
    }

    // RESERVATION: Create placeholder file immediately
    // This prevents race conditions even if lock mechanism fails
    const itemFile = path.join(itemsDir, `item-${nextNumber}.json`);

    // Ensure items directory exists
    if (!existsSync(itemsDir)) {
      await fs.mkdir(itemsDir, { recursive: true });
    }

    // Create reservation file
    writeFileSync(itemFile, JSON.stringify({
      _metadata: {
        itemNumber: nextNumber,
        reserved: true,
        reservedAt: new Date().toISOString(),
      }
    }, null, 2));

    return Response.json({ success: true, nextItemNumber: nextNumber });

  } catch (error) {
    console.error('Failed to get next item number:', error);
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  } finally {
    // ALWAYS RELEASE LOCK
    releaseLock(lockPath);
  }
}
