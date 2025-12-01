import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getProjectsCollection } from '@/lib/mongodb';
import { CreateProjectSchema } from '@/lib/schemas/project';
import { z } from 'zod';

/**
 * POST /api/projects
 * Create a new project
 *
 * Request body:
 * - salesOrderNumber: string (unique identifier)
 * - projectName: string
 * - description?: string
 * - metadata?: Record<string, any>
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validData = CreateProjectSchema.parse(body);

    const db = await connectToDatabase();
    const projects = getProjectsCollection(db);

    // Check for duplicate salesOrderNumber
    const exists = await projects.findOne({
      salesOrderNumber: validData.salesOrderNumber,
      isDeleted: { $ne: true },
    });

    if (exists) {
      return NextResponse.json(
        { success: false, error: 'Project with this sales order number already exists' },
        { status: 409 }
      );
    }

    // Insert new project
    const now = new Date();
    const result = await projects.insertOne({
      ...validData,
      itemCount: 0,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    } as any);

    return NextResponse.json({
      success: true,
      projectId: result.insertedId.toString(),
      salesOrderNumber: validData.salesOrderNumber,
    }, { status: 201 });

  } catch (error) {
    console.error('Project creation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/projects
 * Query projects with filters
 *
 * Query params:
 * - salesOrderNumber: Get specific project by SO#
 * - includeDeleted: Include soft-deleted projects (default: false)
 * - limit: Max results (default: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salesOrderNumber = searchParams.get('salesOrderNumber');
    const includeDeleted = searchParams.get('includeDeleted') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    const db = await connectToDatabase();
    const projects = getProjectsCollection(db);

    // Build query
    const query: Record<string, unknown> = {};

    if (!includeDeleted) {
      query.isDeleted = { $ne: true };
    }

    // Single project lookup
    if (salesOrderNumber) {
      query.salesOrderNumber = salesOrderNumber;

      const project = await projects.findOne(query);

      if (!project) {
        return NextResponse.json(
          { success: false, error: 'Project not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        project: {
          ...project,
          _id: project._id.toString(),
        },
      });
    }

    // List all projects
    const projectList = await projects
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      count: projectList.length,
      projects: projectList.map(p => ({
        ...p,
        _id: p._id.toString(),
      })),
    });

  } catch (error) {
    console.error('Project retrieval error:', error);

    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects (soft delete)
 * Soft-delete a project by salesOrderNumber
 *
 * Query params:
 * - salesOrderNumber: Project to delete
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salesOrderNumber = searchParams.get('salesOrderNumber');

    if (!salesOrderNumber) {
      return NextResponse.json(
        { success: false, error: 'salesOrderNumber parameter required' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const projects = getProjectsCollection(db);

    // Soft delete
    const result = await projects.updateOne(
      { salesOrderNumber, isDeleted: { $ne: true } },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          updatedAt: new Date(),
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Project not found or already deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Project soft-deleted',
      salesOrderNumber,
    });

  } catch (error) {
    console.error('Project deletion error:', error);

    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    );
  }
}
