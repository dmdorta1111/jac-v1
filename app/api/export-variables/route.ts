import { NextRequest, NextResponse } from 'next/server';
import { ExportProjectRequestSchema } from '@/lib/schemas/form-submission';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import * as Sentry from '@sentry/nextjs';
import { spawn } from 'child_process';

/**
 * Execute a PowerShell script with arguments
 * @param scriptPath - Absolute path to the .ps1 script
 * @param args - Arguments to pass to the script
 * @returns Promise with stdout/stderr and exit code
 */
async function runPowerShellScript(
  scriptPath: string,
  args: string[]
): Promise<{ success: boolean; stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    const psArgs = [
      '-ExecutionPolicy', 'Bypass',
      '-File', scriptPath,
      ...args
    ];

    console.log(`Running PowerShell: powershell ${psArgs.join(' ')}`);

    const child = spawn('powershell', psArgs, {
      windowsHide: true,
      shell: false,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log(`[PS stdout] ${data.toString().trim()}`);
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error(`[PS stderr] ${data.toString().trim()}`);
    });

    child.on('close', (exitCode) => {
      resolve({
        success: exitCode === 0,
        stdout,
        stderr,
        exitCode: exitCode ?? 1,
      });
    });

    child.on('error', (error) => {
      console.error(`[PS error] ${error.message}`);
      resolve({
        success: false,
        stdout,
        stderr: error.message,
        exitCode: 1,
      });
    });
  });
}

/**
 * POST /api/export-variables
 * Export all items for a project to individual JSON files for SmartAssembly
 *
 * Rate limit: 10 requests per minute per IP
 *
 * Request body:
 * - salesOrderNumber: Sales order number (required)
 * - productType: Product type (default: SDI)
 *
 * Response:
 * - success: true if exported successfully
 * - exportPath: Path to items directory
 * - itemCount: Number of items exported
 * - exportedFiles: Array of file names created
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.EXPORT);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();

    // Validate request
    const validData = ExportProjectRequestSchema.parse(body);

    // Connect to MongoDB
    const { connectToDatabase, getProjectsCollection, getItemsCollection } = await import('@/lib/mongodb');
    const db = await connectToDatabase();
    const projects = getProjectsCollection(db);
    const items = getItemsCollection(db);

    // Find project
    const project = await projects.findOne({
      salesOrderNumber: validData.salesOrderNumber,
      isDeleted: { $ne: true },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Query all items for project
    const projectItems = await items.find({
      projectId: project._id,
      isDeleted: { $ne: true },
    }).sort({ itemNumber: 1 }).toArray();

    if (projectItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No items found for project' },
        { status: 404 }
      );
    }

    console.log(`Exporting ${projectItems.length} items for ${validData.salesOrderNumber}`);

    // Construct project directories
    const projectRoot = path.join(
      process.cwd(),
      'project-docs',
      validData.productType,
      validData.salesOrderNumber
    );
    const projectItemsDir = path.join(projectRoot, 'items');
    const customerDrawingsDir = path.join(projectRoot, 'Customer Drawings');
    const proeModelsDir = path.join(projectRoot, 'ProE Models');

    // Security: Validate path doesn't escape project-docs directory
    const normalizedPath = path.normalize(projectRoot);
    const projectDocsRoot = path.join(process.cwd(), 'project-docs');
    if (!normalizedPath.startsWith(projectDocsRoot)) {
      return NextResponse.json(
        { success: false, error: 'Invalid path: directory traversal detected' },
        { status: 400 }
      );
    }

    // Ensure all directories exist
    await fs.mkdir(projectItemsDir, { recursive: true });
    await fs.mkdir(customerDrawingsDir, { recursive: true });
    await fs.mkdir(proeModelsDir, { recursive: true });

    // Write project-header.json
    const headerData = {
      ...project.metadata,
      salesOrderNumber: validData.salesOrderNumber,
      productType: validData.productType,
      exportedAt: new Date().toISOString(),
    };
    await fs.writeFile(
      path.join(projectRoot, 'project-header.json'),
      JSON.stringify(headerData, null, 2),
      'utf-8'
    );

    // Cleanup: Delete existing item-XXX.json files
    try {
      const existingFiles = await fs.readdir(projectItemsDir);
      const itemFiles = existingFiles.filter(f => /^item-\d{3}\.json$/.test(f));

      if (itemFiles.length > 0) {
        console.log(`Deleting ${itemFiles.length} old item files...`);
        await Promise.all(
          itemFiles.map(file =>
            fs.unlink(path.join(projectItemsDir, file)).catch(err =>
              console.warn(`Failed to delete ${file}:`, err)
            )
          )
        );
      }
    } catch (readError) {
      // Directory doesn't exist or is empty - ignore
      console.log('No existing files to clean up');
    }

    // Write one JSON file per item
    const exportedFiles: string[] = [];

    for (const item of projectItems) {
      // Ensure system fields exist at root level
      const exportData = {
        ...item.itemData,
        CHOICE: item.itemData.CHOICE ?? 1,
        FRAME_PROCESSED: item.itemData.FRAME_PROCESSED ?? "",
        _metadata: {
          itemNumber: item.itemNumber,
          productType: item.productType,
          salesOrderNumber: validData.salesOrderNumber,
          exportedAt: new Date().toISOString(),
          formIds: item.formIds || [],
        },
      };

      const fileName = `item-${item.itemNumber}.json`;
      const filePath = path.join(projectItemsDir, fileName);

      await fs.writeFile(filePath, JSON.stringify(exportData, null, 2), 'utf-8');

      exportedFiles.push(fileName);
      console.log(`Exported ${fileName} (${Object.keys(item.itemData).length} fields)`);
    }

    const relativePath = path.relative(process.cwd(), projectItemsDir);

    // Chain PowerShell scripts after file export
    const scriptsDir = path.join(process.cwd(), 'programs');
    const scriptResults: { script: string; success: boolean; output: string }[] = [];

    // 1. Run json_to_tab.ps1 - converts JSON to SmartAssembly .tab format
    const jsonToTabScript = path.join(scriptsDir, 'json_to_tab.ps1');
    try {
      await fs.access(jsonToTabScript);
      console.log(`Running json_to_tab.ps1 on ${projectItemsDir}...`);
      const jsonToTabResult = await runPowerShellScript(jsonToTabScript, [projectItemsDir]);
      scriptResults.push({
        script: 'json_to_tab.ps1',
        success: jsonToTabResult.success,
        output: jsonToTabResult.stdout || jsonToTabResult.stderr,
      });

      if (!jsonToTabResult.success) {
        console.error(`json_to_tab.ps1 failed: ${jsonToTabResult.stderr}`);
      }
    } catch (scriptError) {
      console.warn(`json_to_tab.ps1 not found or not accessible: ${scriptError}`);
      scriptResults.push({
        script: 'json_to_tab.ps1',
        success: false,
        output: 'Script not found',
      });
    }

    // 2. Run creoD.ps1 - launches Creo Parametric with project directory
    const creoDScript = path.join(scriptsDir, 'creoD.ps1');
    try {
      await fs.access(creoDScript);
      console.log(`Running creoD.ps1 on ${projectRoot}...`);
      const creoDResult = await runPowerShellScript(creoDScript, [projectRoot]);
      scriptResults.push({
        script: 'creoD.ps1',
        success: creoDResult.success,
        output: creoDResult.stdout || creoDResult.stderr,
      });

      if (!creoDResult.success) {
        console.error(`creoD.ps1 failed: ${creoDResult.stderr}`);
      }
    } catch (scriptError) {
      console.warn(`creoD.ps1 not found or not accessible: ${scriptError}`);
      scriptResults.push({
        script: 'creoD.ps1',
        success: false,
        output: 'Script not found',
      });
    }

    return NextResponse.json({
      success: true,
      exportPath: relativePath,
      projectPath: path.relative(process.cwd(), projectRoot),
      itemCount: projectItems.length,
      exportedFiles,
      salesOrderNumber: validData.salesOrderNumber,
      productType: validData.productType,
      exportedAt: new Date().toISOString(),
      scripts: scriptResults,
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
 * GET /api/export-variables?sessionId=xxx&productType=xxx&salesOrderNumber=xxx
 * Check if export exists for a session
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const productType = searchParams.get('productType');
    const salesOrderNumber = searchParams.get('salesOrderNumber');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId parameter is required' },
        { status: 400 }
      );
    }

    if (!productType || !salesOrderNumber) {
      return NextResponse.json(
        { success: false, error: 'productType and salesOrderNumber parameters are required' },
        { status: 400 }
      );
    }

    const projectItemsDir = path.join('project-docs', productType, salesOrderNumber, 'items');
    const jsonPath = path.join(projectItemsDir, 'formdata.json');

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
