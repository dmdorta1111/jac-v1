import { NextRequest, NextResponse } from 'next/server';
import { BuildAsmRequestSchema } from '@/lib/schemas/form-submission';
import { z } from 'zod';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import * as Sentry from '@sentry/nextjs';

/**
 * POST /api/build-asm
 * Trigger SmartAssembly Build_Asm.tab script (PLACEHOLDER)
 *
 * Rate limit: 5 requests per minute per IP
 *
 * TODO: Implement SmartAssembly Build_Asm integration
 * This endpoint will trigger the SmartAssembly build process
 * once the integration requirements are defined.
 *
 * Request body:
 * - sessionId: Session identifier
 * - salesOrderNumber: Optional sales order number
 * - itemNumber: Optional item number
 *
 * Response:
 * - success: true (placeholder)
 * - message: Placeholder message
 * - status: 'queued' (placeholder)
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.BUILD);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();

    // Validate request
    const validData = BuildAsmRequestSchema.parse(body);

    // TODO: Implement Build_Asm trigger logic
    // This will involve:
    // 1. Verify formdata.json exists in SmartAssembly work directory
    // 2. Call SmartAssembly Build_Asm.tab script (via child_process or API)
    // 3. Monitor build status
    // 4. Return build results or error

    console.log('Build_Asm placeholder called:', {
      sessionId: validData.sessionId,
      salesOrderNumber: validData.salesOrderNumber,
      itemNumber: validData.itemNumber,
    });

    // Placeholder response
    return NextResponse.json({
      success: true,
      message: 'Build_Asm placeholder - implementation pending',
      sessionId: validData.sessionId,
      status: 'queued',
      timestamp: new Date().toISOString(),
      note: 'This endpoint is a placeholder. Build_Asm integration will be implemented in a future phase.',
    });

  } catch (error) {
    console.error('Build_Asm error:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      // Don't send validation errors to Sentry
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
        endpoint: '/api/build-asm',
        method: 'POST',
      },
      contexts: {
        request: {
          method: request.method,
          url: request.url,
        },
      },
    });

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: 'Build_Asm request failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/build-asm?sessionId=xxx
 * Check build status (PLACEHOLDER)
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

    // TODO: Implement build status check
    // Query build queue or status table

    return NextResponse.json({
      success: true,
      sessionId,
      status: 'not_implemented',
      message: 'Build status check not yet implemented',
    });

  } catch (error) {
    console.error('Build status check error:', error);

    // Capture error in Sentry
    Sentry.captureException(error, {
      tags: {
        endpoint: '/api/build-asm',
        method: 'GET',
      },
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Status check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
