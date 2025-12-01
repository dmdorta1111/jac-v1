import { NextRequest } from 'next/server';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { connectToDatabase, getProjectsCollection } from '@/lib/mongodb';

/**
 * GET /api/get-next-item-number
 * Returns the next available item number for a project
 *
 * CRITICAL: Uses atomic MongoDB increment to prevent race conditions
 * Two concurrent requests will always get different numbers
 *
 * Query params:
 * - folderPath: Project folder path (e.g., "project-docs/SDI/SO12345")
 * - salesOrderNumber: (optional) Explicit SO# for DB lookup
 */
export async function GET(req: NextRequest) {
  const folderPath = req.nextUrl.searchParams.get('folderPath');
  const explicitSO = req.nextUrl.searchParams.get('salesOrderNumber');

  if (!folderPath) {
    return Response.json({ success: false, error: 'Missing folderPath' }, { status: 400 });
  }

  // Validate folderPath (prevent directory traversal)
  if (folderPath.includes('..') || !folderPath.startsWith('project-docs/')) {
    return Response.json({ success: false, error: 'Invalid project path' }, { status: 400 });
  }

  // Extract salesOrderNumber from folderPath (last segment)
  // Format: project-docs/{productType}/{salesOrderNumber}
  const pathParts = folderPath.split('/');
  const salesOrderNumber = explicitSO || pathParts[pathParts.length - 1];

  if (!salesOrderNumber) {
    return Response.json({ success: false, error: 'Could not extract sales order number' }, { status: 400 });
  }

  try {
    // PRIMARY: Use atomic MongoDB counter (race-condition-safe)
    const db = await connectToDatabase();
    const projects = getProjectsCollection(db);

    // Atomically increment and return the new value
    // findOneAndUpdate is atomic - two concurrent requests will NEVER get same number
    const result = await projects.findOneAndUpdate(
      { salesOrderNumber, isDeleted: { $ne: true } },
      {
        $inc: { nextItemNumber: 1 },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );

    if (result) {
      // Project found in DB - use atomic counter
      const nextNumber = (result.nextItemNumber || 1).toString().padStart(3, '0');
      return Response.json({
        success: true,
        nextItemNumber: nextNumber,
        source: 'database'
      });
    }

    // FALLBACK: Project not in MongoDB yet - use file system
    // This handles projects created before DB migration
    console.log(`[get-next-item-number] Project ${salesOrderNumber} not in DB, using file system fallback`);

    const projectRoot = process.cwd();
    const itemsDir = path.join(projectRoot, folderPath, 'items');

    // Read directory to find existing item files
    let files: string[] = [];
    try {
      files = await fs.readdir(itemsDir);
    } catch {
      // Directory might not exist yet - first item
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

    // For file-based fallback, create reservation file to prevent race conditions
    // This is less robust than DB atomic counter but better than nothing
    const reservationDir = path.join(itemsDir);
    if (!existsSync(reservationDir)) {
      await fs.mkdir(reservationDir, { recursive: true });
    }

    // Write a minimal reservation file
    const reservationFile = path.join(reservationDir, `item-${nextNumber}.json`);
    if (!existsSync(reservationFile)) {
      await fs.writeFile(reservationFile, JSON.stringify({
        _reserved: true,
        _reservedAt: new Date().toISOString(),
        _note: 'Placeholder - will be replaced when form is submitted'
      }, null, 2));
    }

    return Response.json({
      success: true,
      nextItemNumber: nextNumber,
      source: 'filesystem'
    });

  } catch (error) {
    console.error('Failed to get next item number:', error);
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
}
