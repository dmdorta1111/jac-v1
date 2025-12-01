import { z } from 'zod';
import { ObjectId } from 'mongodb';

/**
 * Zod schema for project data validation
 * Projects are identified by unique salesOrderNumber
 */
export const ProjectSchema = z.object({
  salesOrderNumber: z.string().min(1, 'Sales order number is required'),
  projectName: z.string().min(1, 'Project name is required'),
  description: z.string().default(''),
  metadata: z.record(z.string(), z.any()).default({}),
  itemCount: z.number().int().nonnegative().default(0),
  isDeleted: z.boolean().default(false),
  deletedAt: z.date().optional(),
  deletedBy: z.string().optional(),
});

/**
 * Schema for project document as stored in MongoDB
 * Extends base schema with MongoDB-specific fields
 */
export const ProjectDocumentSchema = ProjectSchema.extend({
  _id: z.custom<ObjectId>((val) => val instanceof ObjectId),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Schema for creating a new project (excludes auto-generated fields)
 */
export const CreateProjectSchema = ProjectSchema.pick({
  salesOrderNumber: true,
  projectName: true,
  description: true,
  metadata: true,
});

/**
 * Schema for updating a project (all fields optional except identifier)
 */
export const UpdateProjectSchema = ProjectSchema.partial().omit({
  salesOrderNumber: true, // Can't change identifier
});

// TypeScript types inferred from Zod schemas
export type Project = z.infer<typeof ProjectSchema>;
export type ProjectDocument = z.infer<typeof ProjectDocumentSchema>;
export type CreateProject = z.infer<typeof CreateProjectSchema>;
export type UpdateProject = z.infer<typeof UpdateProjectSchema>;
