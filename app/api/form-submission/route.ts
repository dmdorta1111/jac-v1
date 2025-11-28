import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
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
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.FORM_SUBMISSION);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();

    // Server-side Zod validation
    const validData = FormSubmissionSchema.parse({
      ...body,
      metadata: {
        ...body.metadata,
        submittedAt: new Date(),
      },
    });

    // Connect to MongoDB
    const db = await connectToDatabase();

    // Insert form submission
    const result = await db.collection('form_submissions').insertOne({
      ...validData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      submissionId: result.insertedId.toString(),
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
 * GET /api/form-submission?sessionId=xxx
 * Retrieve all form submissions for a session
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId parameter is required' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    const submissions = await db
      .collection('form_submissions')
      .find({ sessionId })
      .sort({ 'metadata.submittedAt': 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      sessionId,
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
