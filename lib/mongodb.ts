import { MongoClient, Db, Collection } from 'mongodb';
import type { ProjectDocument } from './schemas/project';
import type { ItemDocument } from './schemas/item';

// Form submission document type for collection typing
interface FormSubmissionDocument {
  _id?: import('mongodb').ObjectId;
  sessionId: string;
  projectId?: import('mongodb').ObjectId;
  itemId?: import('mongodb').ObjectId;
  stepId: string;
  formId: string;
  formData: Record<string, unknown>;
  metadata: {
    submittedAt: Date;
    formVersion: string;
    userId?: string;
    salesOrderNumber: string;
    itemNumber?: string;
    productType?: string;
    isRevision: boolean;
    renamedFrom?: string;
    renamedAt?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

/**
 * Connect to MongoDB with connection pooling
 * Reuses existing connection if available
 */
export async function connectToDatabase(): Promise<Db> {
  // Return cached connection if available
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  // Validate environment variables
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set in .env.local');
  }

  const dbName = process.env.MONGODB_DB || 'jac-forms';

  try {
    // Create new MongoDB client with connection pooling
    const client = await MongoClient.connect(uri, {
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    // Cache client and database for reuse
    cachedClient = client;
    cachedDb = client.db(dbName);

    console.log(`Connected to MongoDB database: ${dbName}`);

    return cachedDb;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get MongoDB database instance (assumes connection already established)
 */
export function getDatabase(): Db {
  if (!cachedDb) {
    throw new Error('Database not initialized. Call connectToDatabase() first.');
  }
  return cachedDb;
}

/**
 * Close MongoDB connection (for cleanup/testing)
 */
export async function closeDatabase(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    console.log('MongoDB connection closed');
  }
}

/**
 * Get typed collection for projects
 * @param db - Database instance from connectToDatabase()
 */
export function getProjectsCollection(db: Db): Collection<ProjectDocument> {
  return db.collection<ProjectDocument>('projects');
}

/**
 * Get typed collection for items
 * @param db - Database instance from connectToDatabase()
 */
export function getItemsCollection(db: Db): Collection<ItemDocument> {
  return db.collection<ItemDocument>('items');
}

/**
 * Get typed collection for form submissions
 * @param db - Database instance from connectToDatabase()
 */
export function getFormSubmissionsCollection(db: Db): Collection<FormSubmissionDocument> {
  return db.collection<FormSubmissionDocument>('form_submissions');
}

/**
 * Get cached MongoDB client (for transactions)
 * @returns MongoDB client or null if not connected
 */
export function getClient(): MongoClient | null {
  return cachedClient;
}
