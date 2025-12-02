import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import * as Sentry from '@sentry/nextjs';

/**
 * DELETE /api/form-submission/[id]
 * Rollback: Remove form submission by ID
 *
 * Used by atomic persistence to rollback MongoDB saves
 * when disk persistence fails.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing submission ID' },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid submission ID format' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const collection = db.collection('form_submissions');

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    console.log(`[Rollback] Deleted form submission: ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Submission rolled back',
      deletedId: id,
    });

  } catch (error) {
    console.error('[Rollback] MongoDB delete failed:', error);

    // Capture error in Sentry
    Sentry.captureException(error, {
      tags: {
        endpoint: '/api/form-submission/[id]',
        method: 'DELETE',
      },
    });

    return NextResponse.json(
      { success: false, error: 'Rollback failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/form-submission/[id]
 * Get a single form submission by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid submission ID' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const submission = await db.collection('form_submissions').findOne({
      _id: new ObjectId(id),
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      submission,
    });

  } catch (error) {
    console.error('[FormSubmission] GET error:', error);

    Sentry.captureException(error, {
      tags: {
        endpoint: '/api/form-submission/[id]',
        method: 'GET',
      },
    });

    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    );
  }
}
