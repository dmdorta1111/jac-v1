/**
 * MongoDB Migration Script: Normalize form_submissions into projects, items, form_submissions
 *
 * Usage:
 *   npx ts-node --esm scripts/migrate-to-normalized-schema.ts
 *
 * Prerequisites:
 *   - MONGODB_URI environment variable set
 *   - Existing form_submissions collection with data
 */

import { MongoClient, ObjectId, Db } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

interface MigrationStats {
  originalSubmissionCount: number;
  projectsCreated: number;
  itemsCreated: number;
  submissionsUpdated: number;
  orphanedSubmissions: number;
  errors: string[];
}

async function migrateProjects(db: Db): Promise<Map<string, ObjectId>> {
  console.log('\n[1/4] Migrating projects...');

  const projectMap = new Map<string, ObjectId>();

  // Aggregate unique projects from form_submissions
  const projects = await db.collection('form_submissions').aggregate([
    {
      $match: {
        'metadata.salesOrderNumber': { $exists: true, $nin: [null, ''] }
      }
    },
    {
      $group: {
        _id: '$metadata.salesOrderNumber',
        productType: { $first: '$metadata.productType' },
        userId: { $first: '$metadata.userId' },
        createdAt: { $min: '$createdAt' },
        updatedAt: { $max: '$updatedAt' }
      }
    }
  ]).toArray();

  if (projects.length === 0) {
    console.log('  No projects found to migrate');
    return projectMap;
  }

  // Check if projects collection already has data
  const existingCount = await db.collection('projects').countDocuments();
  if (existingCount > 0) {
    console.log(`  Projects collection already has ${existingCount} documents`);
    console.log('  Loading existing project map...');
    const existing = await db.collection('projects').find({}).toArray();
    existing.forEach(p => projectMap.set(p.salesOrderNumber, p._id));
    return projectMap;
  }

  // Insert projects
  const projectDocs = projects.map(p => ({
    salesOrderNumber: p._id,
    projectName: p._id, // Default to SO# as name
    description: '',
    metadata: {
      productType: p.productType,
      userId: p.userId,
    },
    itemCount: 0, // Will be updated after items migration
    isDeleted: false,
    createdAt: p.createdAt || new Date(),
    updatedAt: p.updatedAt || new Date(),
  }));

  await db.collection('projects').insertMany(projectDocs);

  // Build lookup map
  const inserted = await db.collection('projects').find({}).toArray();
  inserted.forEach(p => projectMap.set(p.salesOrderNumber, p._id));

  console.log(`  Created ${projectDocs.length} projects`);
  return projectMap;
}

async function migrateItems(db: Db, projectMap: Map<string, ObjectId>): Promise<Map<string, ObjectId>> {
  console.log('\n[2/4] Migrating items...');

  const itemMap = new Map<string, ObjectId>(); // Key: `${projectId}-${itemNumber}`

  // Aggregate unique items from form_submissions
  const items = await db.collection('form_submissions').aggregate([
    {
      $match: {
        'metadata.salesOrderNumber': { $exists: true, $ne: null },
        'metadata.itemNumber': { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: {
          so: '$metadata.salesOrderNumber',
          item: '$metadata.itemNumber'
        },
        productType: { $first: '$metadata.productType' },
        formIds: { $addToSet: '$formId' },
        renamedFrom: { $first: '$metadata.renamedFrom' },
        renamedAt: { $first: '$metadata.renamedAt' },
        createdAt: { $min: '$createdAt' },
        updatedAt: { $max: '$updatedAt' }
      }
    }
  ]).toArray();

  if (items.length === 0) {
    console.log('  No items found to migrate');
    return itemMap;
  }

  // Check if items collection already has data
  const existingCount = await db.collection('items').countDocuments();
  if (existingCount > 0) {
    console.log(`  Items collection already has ${existingCount} documents`);
    console.log('  Loading existing item map...');
    const existing = await db.collection('items').find({}).toArray();
    existing.forEach(i => itemMap.set(`${i.projectId}-${i.itemNumber}`, i._id));
    return itemMap;
  }

  // Build item documents
  const itemDocs: any[] = [];
  const projectItemCounts = new Map<string, number>();

  for (const item of items) {
    const projectId = projectMap.get(item._id.so);
    if (!projectId) {
      console.warn(`  Warning: No project found for SO#: ${item._id.so}`);
      continue;
    }

    // Track item count per project
    const currentCount = projectItemCounts.get(item._id.so) || 0;
    projectItemCounts.set(item._id.so, currentCount + 1);

    itemDocs.push({
      projectId,
      itemNumber: item._id.item,
      productType: item.productType || '',
      itemData: {}, // Will be populated from file system if needed
      formIds: item.formIds || [],
      renamedFrom: item.renamedFrom,
      renamedAt: item.renamedAt ? new Date(item.renamedAt) : undefined,
      isDeleted: false,
      createdAt: item.createdAt || new Date(),
      updatedAt: item.updatedAt || new Date(),
    });
  }

  if (itemDocs.length > 0) {
    await db.collection('items').insertMany(itemDocs);

    // Update project item counts
    for (const [so, count] of projectItemCounts) {
      const projectId = projectMap.get(so);
      if (projectId) {
        await db.collection('projects').updateOne(
          { _id: projectId },
          { $set: { itemCount: count } }
        );
      }
    }
  }

  // Build lookup map
  const inserted = await db.collection('items').find({}).toArray();
  inserted.forEach(i => itemMap.set(`${i.projectId}-${i.itemNumber}`, i._id));

  console.log(`  Created ${itemDocs.length} items`);
  return itemMap;
}

async function updateFormSubmissions(
  db: Db,
  projectMap: Map<string, ObjectId>,
  itemMap: Map<string, ObjectId>
): Promise<number> {
  console.log('\n[3/4] Updating form submissions with references...');

  let updatedCount = 0;
  const batchSize = 100;

  // Get all submissions without projectId
  const submissions = await db.collection('form_submissions')
    .find({ projectId: { $exists: false } })
    .toArray();

  console.log(`  Found ${submissions.length} submissions to update`);

  // Process in batches
  for (let i = 0; i < submissions.length; i += batchSize) {
    const batch = submissions.slice(i, i + batchSize);
    const bulkOps: any[] = [];

    for (const sub of batch) {
      const so = sub.metadata?.salesOrderNumber;
      const itemNum = sub.metadata?.itemNumber;

      const projectId = so ? projectMap.get(so) : undefined;
      const itemId = (projectId && itemNum)
        ? itemMap.get(`${projectId}-${itemNum}`)
        : undefined;

      if (projectId) {
        bulkOps.push({
          updateOne: {
            filter: { _id: sub._id },
            update: {
              $set: {
                projectId,
                ...(itemId ? { itemId } : {}),
              }
            }
          }
        });
      }
    }

    if (bulkOps.length > 0) {
      const result = await db.collection('form_submissions').bulkWrite(bulkOps);
      updatedCount += result.modifiedCount;
    }

    // Progress indicator
    if ((i + batchSize) % 500 === 0 || i + batchSize >= submissions.length) {
      console.log(`  Progress: ${Math.min(i + batchSize, submissions.length)}/${submissions.length}`);
    }
  }

  console.log(`  Updated ${updatedCount} submissions`);
  return updatedCount;
}

async function verifyMigration(db: Db): Promise<MigrationStats> {
  console.log('\n[4/4] Verifying migration...');

  const stats: MigrationStats = {
    originalSubmissionCount: 0,
    projectsCreated: 0,
    itemsCreated: 0,
    submissionsUpdated: 0,
    orphanedSubmissions: 0,
    errors: [],
  };

  // Count documents
  stats.originalSubmissionCount = await db.collection('form_submissions').countDocuments();
  stats.projectsCreated = await db.collection('projects').countDocuments();
  stats.itemsCreated = await db.collection('items').countDocuments();
  stats.submissionsUpdated = await db.collection('form_submissions').countDocuments({
    projectId: { $exists: true }
  });

  // Check for orphaned submissions (have projectId but project doesn't exist)
  const projectIds = await db.collection('projects')
    .find({}, { projection: { _id: 1 } })
    .map(p => p._id)
    .toArray();

  if (projectIds.length > 0) {
    stats.orphanedSubmissions = await db.collection('form_submissions').countDocuments({
      projectId: { $exists: true, $nin: projectIds }
    });
  }

  // Calculate success rate
  const successRate = stats.originalSubmissionCount > 0
    ? (stats.submissionsUpdated / stats.originalSubmissionCount * 100).toFixed(1)
    : 0;

  console.log('\n=== Migration Statistics ===');
  console.log(`  Original submissions: ${stats.originalSubmissionCount}`);
  console.log(`  Projects created: ${stats.projectsCreated}`);
  console.log(`  Items created: ${stats.itemsCreated}`);
  console.log(`  Submissions with projectId: ${stats.submissionsUpdated} (${successRate}%)`);
  console.log(`  Orphaned submissions: ${stats.orphanedSubmissions}`);

  if (stats.orphanedSubmissions > 0) {
    stats.errors.push(`${stats.orphanedSubmissions} orphaned submissions detected`);
  }

  if (Number(successRate) < 95) {
    stats.errors.push(`Migration success rate below 95%: ${successRate}%`);
  }

  return stats;
}

async function createIndexes(db: Db): Promise<void> {
  console.log('\n[Pre] Creating indexes...');

  // Projects collection
  await db.collection('projects').createIndex(
    { salesOrderNumber: 1 },
    { unique: true }
  );
  await db.collection('projects').createIndex(
    { isDeleted: 1, createdAt: -1 }
  );

  // Items collection
  await db.collection('items').createIndex(
    { projectId: 1, itemNumber: 1 }
  );
  await db.collection('items').createIndex(
    { projectId: 1, createdAt: -1 }
  );

  // Form submissions (new indexes)
  await db.collection('form_submissions').createIndex({ projectId: 1 });
  await db.collection('form_submissions').createIndex({ itemId: 1 });

  console.log('  Indexes created');
}

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Error: MONGODB_URI environment variable not set');
    process.exit(1);
  }

  const dbName = process.env.MONGODB_DB || 'jac-forms';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log(`Connected to MongoDB (database: ${dbName})`);

    const db = client.db(dbName);

    // Create indexes first
    await createIndexes(db);

    // Run migration steps
    const projectMap = await migrateProjects(db);
    const itemMap = await migrateItems(db, projectMap);
    await updateFormSubmissions(db, projectMap, itemMap);

    // Verify migration
    const stats = await verifyMigration(db);

    // Final status
    console.log('\n=== Migration Complete ===');
    if (stats.errors.length === 0) {
      console.log('✓ Migration successful!');
    } else {
      console.log('⚠ Migration completed with warnings:');
      stats.errors.forEach(e => console.log(`  - ${e}`));
    }

  } catch (error) {
    console.error('\n✗ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\nMongoDB connection closed');
  }
}

// Run migration
migrate();
