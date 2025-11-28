import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ExportVariablesRequestSchema } from '@/lib/schemas/form-submission';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import * as Sentry from '@sentry/nextjs';

/**
 * POST /api/export-variables
 * Export all form data for a session as SmartAssembly JSON
 *
 * Rate limit: 10 requests per minute per IP
 *
 * Request body:
 * - sessionId: Session to export
 * - salesOrderNumber: Optional sales order filter
 * - itemNumber: Optional item number filter
 *
 * Response:
 * - success: true if exported successfully
 * - exportPath: Path to generated formdata.json
 * - variableCount: Number of variables exported
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.EXPORT);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();

    // Validate request
    const validData = ExportVariablesRequestSchema.parse(body);

    // Connect to MongoDB
    const db = await connectToDatabase();

    // Fetch all submissions for session
    const submissions = await db
      .collection('form_submissions')
      .find({ sessionId: validData.sessionId })
      .sort({ 'metadata.submittedAt': 1 })
      .toArray();

    if (submissions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No submissions found for session',
          sessionId: validData.sessionId,
        },
        { status: 404 }
      );
    }

    // Merge all form data into single object
    // Later submissions override earlier ones for same field names
    const mergedData = submissions.reduce((acc, sub) => ({
      ...acc,
      ...sub.formData,
    }), {} as Record<string, any>);

    // Add metadata fields to exported variables
    const firstSubmission = submissions[0];
    const exportData = {
      ...mergedData,
      _metadata: {
        sessionId: validData.sessionId,
        salesOrderNumber: firstSubmission.metadata.salesOrderNumber,
        itemNumber: firstSubmission.metadata.itemNumber,
        productType: firstSubmission.metadata.productType,
        exportedAt: new Date().toISOString(),
        formCount: submissions.length,
      },
    };

    // Get SmartAssembly work directory from environment
    const workDir = process.env.SMARTASSEMBLY_WORK_DIR || './smartassembly-work';

    // Ensure directory exists
    await fs.mkdir(workDir, { recursive: true });

    // Write JSON file for SmartAssembly
    const jsonPath = path.join(workDir, 'formdata.json');
    await fs.writeFile(jsonPath, JSON.stringify(exportData, null, 2), 'utf-8');

    console.log(`Exported ${Object.keys(mergedData).length} variables to ${jsonPath}`);

    return NextResponse.json({
      success: true,
      exportPath: jsonPath,
      variableCount: Object.keys(mergedData).length,
      sessionId: validData.sessionId,
      metadata: exportData._metadata,
    });

  } catch (error) {
    console.error('Export variables error:', error);

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
        endpoint: '/api/export-variables',
        method: 'POST',
      },
      contexts: {
        request: {
          method: request.method,
          url: request.url,
        },
      },
    });

    // Handle file system errors
    if (error instanceof Error && 'code' in error) {
      return NextResponse.json(
        {
          success: false,
          error: 'File system error',
          message: error.message,
        },
        { status: 500 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: 'Export failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/export-variables?sessionId=xxx
 * Check if export exists for a session
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

    const workDir = process.env.SMARTASSEMBLY_WORK_DIR || './smartassembly-work';
    const jsonPath = path.join(workDir, 'formdata.json');

    try {
      const content = await fs.readFile(jsonPath, 'utf-8');
      const data = JSON.parse(content);

      // Check if export matches session
      const isCurrentSession = data._metadata?.sessionId === sessionId;

      return NextResponse.json({
        success: true,
        exists: true,
        isCurrentSession,
        exportPath: jsonPath,
        metadata: data._metadata,
      });

    } catch (fileError) {
      // File doesn't exist
      return NextResponse.json({
        success: true,
        exists: false,
        sessionId,
      });
    }

  } catch (error) {
    console.error('Export check error:', error);

    // Capture error in Sentry
    Sentry.captureException(error, {
      tags: {
        endpoint: '/api/export-variables',
        method: 'GET',
      },
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
