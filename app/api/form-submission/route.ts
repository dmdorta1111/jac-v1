import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import {
  connectToDatabase,
  getProjectsCollection,
  getItemsCollection,
} from '@/lib/mongodb';
import { FormSubmissionSchema } from '@/lib/schemas/form-submission';
import { z } from 'zod';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import * as Sentry from '@sentry/nextjs';

/**
 * POST /api/form-submission
 * Save validated form data to MongoDB
 *
 * Rate limit: 30 requests per minute per IP
 *
 * Request body:
 * - sessionId: Unique session identifier
 * - stepId: Current step in form flow
 * - formId: Form template identifier
 * - formData: Validated form field data
 * - metadata: Submission context (salesOrderNumber, userId, etc.)
 *
 * Response:
 * - success: true if saved successfully
 * - submissionId: MongoDB document ID
 * - projectId: Reference to projects collection (NEW)
 * - itemId: Reference to items collection (NEW)
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.FORM_SUBMISSION);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();

    // Connect to MongoDB
    const db = await connectToDatabase();

    // Extract identifiers from metadata
    const salesOrderNumber = body.metadata?.salesOrderNumber;
    const itemNumber = body.metadata?.itemNumber;

    // Lookup projectId from salesOrderNumber (NEW)
    let projectId: ObjectId | undefined;
    if (salesOrderNumber) {
      const projects = getProjectsCollection(db);
      const project = await projects.findOne({
        salesOrderNumber,
        isDeleted: { $ne: true },
      });
      projectId = project?._id;
    }

    // Lookup itemId from projectId + itemNumber (NEW)
    let itemId: ObjectId | undefined;
    if (projectId && itemNumber) {
      const items = getItemsCollection(db);
      const item = await items.findOne({
        projectId,
        itemNumber,
        isDeleted: { $ne: true },
      });
      itemId = item?._id;
    }

    // Server-side Zod validation
    const validData = FormSubmissionSchema.parse({
      ...body,
      projectId,  // NEW: Add project reference
      itemId,     // NEW: Add item reference
      metadata: {
        ...body.metadata,
        submittedAt: new Date(),
      },
    });

    // Insert form submission with references
    const result = await db.collection('form_submissions').insertOne({
      ...validData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      submissionId: result.insertedId.toString(),
      projectId: projectId?.toString(),  // NEW
      itemId: itemId?.toString(),        // NEW
    }, { status: 201 });

  } catch (error) {
    console.error('Form submission error:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      // Don't send validation errors to Sentry (expected user input errors)
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    // Capture unexpected errors in Sentry
    Sentry.captureException(error, {
      tags: {
        endpoint: '/api/form-submission',
        method: 'POST',
      },
      contexts: {
        request: {
          method: request.method,
          url: request.url,
        },
      },
    });

    // Handle MongoDB errors
    return NextResponse.json(
      {
        success: false,
        error: 'Database error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/form-submission
 * Retrieve form submissions with flexible query options:
 * - ?sessionId=xxx - Get all submissions for a session
 * - ?salesOrderNumber=xxx - Get all submissions for a project (for session rebuild)
 * - ?salesOrderNumber=xxx&itemNumber=001 - Get submissions for specific item
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const salesOrderNumber = searchParams.get('salesOrderNumber');
    const itemNumber = searchParams.get('itemNumber');

    // Build query based on provided parameters
    const query: Record<string, unknown> = {};

    if (sessionId) {
      query.sessionId = sessionId;
    } else if (salesOrderNumber) {
      query['metadata.salesOrderNumber'] = salesOrderNumber;
      if (itemNumber) {
        query['metadata.itemNumber'] = itemNumber;
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Either sessionId or salesOrderNumber parameter is required' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    const submissions = await db
      .collection('form_submissions')
      .find(query)
      .sort({ 'metadata.submittedAt': 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      query: sessionId ? { sessionId } : { salesOrderNumber, itemNumber },
      count: submissions.length,
      submissions,
    });

  } catch (error) {
    console.error('Form retrieval error:', error);

    // Capture error in Sentry
    Sentry.captureException(error, {
      tags: {
        endpoint: '/api/form-submission',
        method: 'GET',
      },
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Database error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
