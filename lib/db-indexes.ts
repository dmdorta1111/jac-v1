import { Db } from 'mongodb';

/**
 * Create all required indexes for the normalized schema
 * Safe to run multiple times (indexes are created only if not existing)
 */
export async function createIndexes(db: Db): Promise<void> {
  console.log('Creating database indexes...');

  // Projects collection indexes
  await db.collection('projects').createIndex(
    { salesOrderNumber: 1 },
    { unique: true, name: 'idx_projects_salesOrderNumber' }
  );
  await db.collection('projects').createIndex(
    { isDeleted: 1, createdAt: -1 },
    { name: 'idx_projects_active_created' }
  );

  // Items collection indexes
  await db.collection('items').createIndex(
    { projectId: 1, itemNumber: 1 },
    { name: 'idx_items_project_itemNumber' }
  );
  await db.collection('items').createIndex(
    { projectId: 1, createdAt: -1 },
    { name: 'idx_items_project_created' }
  );
  await db.collection('items').createIndex(
    { projectId: 1, isDeleted: 1 },
    { name: 'idx_items_project_active' }
  );

  // Form submissions collection indexes (new references)
  await db.collection('form_submissions').createIndex(
    { projectId: 1 },
    { name: 'idx_submissions_projectId' }
  );
  await db.collection('form_submissions').createIndex(
    { itemId: 1 },
    { name: 'idx_submissions_itemId' }
  );
  // Existing indexes (keep for backward compatibility)
  await db.collection('form_submissions').createIndex(
    { sessionId: 1 },
    { name: 'idx_submissions_sessionId' }
  );
  await db.collection('form_submissions').createIndex(
    { 'metadata.salesOrderNumber': 1, 'metadata.itemNumber': 1 },
    { name: 'idx_submissions_so_item' }
  );

  console.log('Database indexes created successfully');
}

/**
 * List all indexes for diagnostic purposes
 */
export async function listIndexes(db: Db): Promise<void> {
  console.log('\n=== Current Database Indexes ===\n');

  const collections = ['projects', 'items', 'form_submissions'];

  for (const collName of collections) {
    const indexes = await db.collection(collName).indexes();
    console.log(`${collName}:`);
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });
    console.log('');
  }
}
