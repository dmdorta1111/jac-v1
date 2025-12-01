/**
 * Migration Verification Script
 * Validates data integrity after running migrate-to-normalized-schema.ts
 *
 * Usage: npx ts-node --esm scripts/verify-migration.ts
 */

import { MongoClient, ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verifyMigration() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Error: MONGODB_URI not set');
    process.exit(1);
  }

  const dbName = process.env.MONGODB_DB || 'jac-forms';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    console.log('=== Migration Verification Report ===\n');

    // 1. Document Counts
    const formSubmissionCount = await db.collection('form_submissions').countDocuments();
    const projectCount = await db.collection('projects').countDocuments();
    const itemCount = await db.collection('items').countDocuments();

    console.log('Document Counts:');
    console.log(`  form_submissions: ${formSubmissionCount}`);
    console.log(`  projects: ${projectCount}`);
    console.log(`  items: ${itemCount}\n`);

    // 2. Referential Integrity
    const submissionsWithProjectId = await db.collection('form_submissions').countDocuments({
      projectId: { $exists: true, $ne: null }
    });

    const submissionsWithItemId = await db.collection('form_submissions').countDocuments({
      itemId: { $exists: true, $ne: null }
    });

    const projectRefRate = formSubmissionCount > 0
      ? (submissionsWithProjectId / formSubmissionCount * 100).toFixed(1)
      : 0;

    const itemRefRate = formSubmissionCount > 0
      ? (submissionsWithItemId / formSubmissionCount * 100).toFixed(1)
      : 0;

    console.log('Referential Integrity:');
    console.log(`  Submissions with projectId: ${submissionsWithProjectId} (${projectRefRate}%)`);
    console.log(`  Submissions with itemId: ${submissionsWithItemId} (${itemRefRate}%)\n`);

    // 3. Orphaned Records Check
    const projectIds = await db.collection('projects')
      .find({}, { projection: { _id: 1 } })
      .map(p => p._id)
      .toArray();

    const orphanedSubmissions = projectIds.length > 0
      ? await db.collection('form_submissions').countDocuments({
          projectId: { $exists: true, $nin: projectIds }
        })
      : 0;

    const itemIds = await db.collection('items')
      .find({}, { projection: { _id: 1 } })
      .map(i => i._id)
      .toArray();

    const orphanedItemRefs = itemIds.length > 0
      ? await db.collection('form_submissions').countDocuments({
          itemId: { $exists: true, $nin: itemIds }
        })
      : 0;

    console.log('Orphaned Records:');
    console.log(`  Submissions with invalid projectId: ${orphanedSubmissions}`);
    console.log(`  Submissions with invalid itemId: ${orphanedItemRefs}\n`);

    // 4. Item Count Verification
    console.log('Item Count Consistency:');
    const projects = await db.collection('projects').find({}).toArray();
    let mismatchCount = 0;

    for (const project of projects.slice(0, 10)) { // Sample first 10
      const actualItemCount = await db.collection('items').countDocuments({
        projectId: project._id,
        isDeleted: { $ne: true },
      });

      if (actualItemCount !== project.itemCount) {
        console.log(`  ⚠ ${project.salesOrderNumber}: stored=${project.itemCount}, actual=${actualItemCount}`);
        mismatchCount++;
      }
    }

    if (mismatchCount === 0) {
      console.log(`  ✓ All sampled projects have consistent item counts\n`);
    } else {
      console.log(`  ⚠ ${mismatchCount} projects have inconsistent item counts\n`);
    }

    // 5. Index Check
    console.log('Index Status:');
    const projectIndexes = await db.collection('projects').indexes();
    const itemIndexes = await db.collection('items').indexes();
    const submissionIndexes = await db.collection('form_submissions').indexes();

    const hasSalesOrderIndex = projectIndexes.some(i =>
      i.key && 'salesOrderNumber' in i.key
    );
    const hasProjectItemIndex = itemIndexes.some(i =>
      i.key && 'projectId' in i.key && 'itemNumber' in i.key
    );
    const hasProjectIdIndex = submissionIndexes.some(i =>
      i.key && 'projectId' in i.key
    );

    console.log(`  projects.salesOrderNumber: ${hasSalesOrderIndex ? '✓' : '✗'}`);
    console.log(`  items.{projectId,itemNumber}: ${hasProjectItemIndex ? '✓' : '✗'}`);
    console.log(`  form_submissions.projectId: ${hasProjectIdIndex ? '✓' : '✗'}\n`);

    // 6. Sample Aggregation Test
    console.log('Sample Aggregation Query:');
    const startTime = Date.now();

    const sampleProject = await db.collection('projects').aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $limit: 1 },
      {
        $lookup: {
          from: 'items',
          localField: '_id',
          foreignField: 'projectId',
          as: 'items'
        }
      }
    ]).toArray();

    const queryTime = Date.now() - startTime;

    if (sampleProject.length > 0) {
      console.log(`  Project: ${sampleProject[0].salesOrderNumber}`);
      console.log(`  Items: ${sampleProject[0].items?.length || 0}`);
      console.log(`  Query time: ${queryTime}ms (target: <10ms)\n`);
    } else {
      console.log('  No projects found for sampling\n');
    }

    // Final Verdict
    console.log('=== Verification Summary ===');

    const issues: string[] = [];

    if (orphanedSubmissions > 0) {
      issues.push(`${orphanedSubmissions} orphaned submission-project references`);
    }
    if (orphanedItemRefs > 0) {
      issues.push(`${orphanedItemRefs} orphaned submission-item references`);
    }
    if (Number(projectRefRate) < 95 && formSubmissionCount > 0) {
      issues.push(`Low project reference rate: ${projectRefRate}%`);
    }
    if (mismatchCount > 0) {
      issues.push(`${mismatchCount} item count mismatches`);
    }
    if (queryTime > 10 && sampleProject.length > 0) {
      issues.push(`Slow aggregation query: ${queryTime}ms`);
    }

    if (issues.length === 0) {
      console.log('✓ Migration verification PASSED\n');
    } else {
      console.log('⚠ Migration verification completed with issues:');
      issues.forEach(i => console.log(`  - ${i}`));
      console.log('');
    }

  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

verifyMigration();
