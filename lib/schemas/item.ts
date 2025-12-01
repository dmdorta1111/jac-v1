import { z } from 'zod';
import { ObjectId } from 'mongodb';

/**
 * Zod schema for item data validation
 * Items belong to a project and are identified by projectId + itemNumber
 */
export const ItemSchema = z.object({
  projectId: z.custom<ObjectId>((val) => val instanceof ObjectId),
  itemNumber: z.string().regex(/^\d{3}$/, 'Must be 3-digit format (e.g., 001)'),
  productType: z.string().optional(),
  itemData: z.record(z.string(), z.any()).default({}),
  formIds: z.array(z.string()).default([]),
  renamedFrom: z.string().optional(),
  renamedAt: z.date().optional(),
  isDeleted: z.boolean().default(false),
  deletedAt: z.date().optional(),
  deletedBy: z.string().optional(),
});

/**
 * Schema for item document as stored in MongoDB
 * Extends base schema with MongoDB-specific fields
 */
export const ItemDocumentSchema = ItemSchema.extend({
  _id: z.custom<ObjectId>((val) => val instanceof ObjectId),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Schema for creating a new item (excludes auto-generated fields)
 */
export const CreateItemSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'), // String input, converted to ObjectId
  itemNumber: z.string().regex(/^\d{3}$/, 'Must be 3-digit format (e.g., 001)'),
  productType: z.string().optional(),
  itemData: z.record(z.string(), z.any()).default({}),
  formIds: z.array(z.string()).default([]),
});

/**
 * Schema for updating an item (all fields optional except identifiers)
 */
export const UpdateItemSchema = ItemSchema.partial().omit({
  projectId: true,
  itemNumber: true,
});

// TypeScript types inferred from Zod schemas
export type Item = z.infer<typeof ItemSchema>;
export type ItemDocument = z.infer<typeof ItemDocumentSchema>;
export type CreateItem = z.infer<typeof CreateItemSchema>;
export type UpdateItem = z.infer<typeof UpdateItemSchema>;
