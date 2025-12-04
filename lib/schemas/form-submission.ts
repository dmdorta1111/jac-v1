import { z } from 'zod';
import { ObjectId } from 'mongodb';

/**
 * Schema for form submission metadata
 * Tracks submission context and versioning
 */
export const FormSubmissionMetadataSchema = z.object({
  submittedAt: z.date(),
  formVersion: z.string().default('1.0.0'),
  userId: z.string().optional(),
  // Keep old fields for backward compatibility during migration
  salesOrderNumber: z.string(),
  itemNumber: z.string().optional(),
  productType: z.string().optional(),
  isRevision: z.boolean().default(false),
  // Rename tracking (if item was renamed)
  renamedFrom: z.string().optional(),
  renamedAt: z.string().optional(),
});

/**
 * Schema for complete form submission
 * Stores validated form data with context
 * NEW: Includes projectId/itemId for normalized schema references
 */
export const FormSubmissionSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  projectId: z.custom<ObjectId>((val) => val instanceof ObjectId).optional(), // NEW: Reference to projects collection
  itemId: z.custom<ObjectId>((val) => val instanceof ObjectId).optional(),    // NEW: Reference to items collection
  stepId: z.string().min(1, 'Step ID is required'),
  formId: z.string().min(1, 'Form ID is required'),
  formData: z.record(z.string(), z.any()), // Validated by step-specific schema before submission
  metadata: FormSubmissionMetadataSchema,
});

/**
 * TypeScript types inferred from Zod schemas
 */
export type FormSubmissionMetadata = z.infer<typeof FormSubmissionMetadataSchema>;
export type FormSubmission = z.infer<typeof FormSubmissionSchema>;

/**
 * Schema for SmartAssembly variable export request (legacy - per session)
 * @deprecated Use ExportProjectRequestSchema for multi-item projects
 */
export const ExportVariablesRequestSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  salesOrderNumber: z.string().optional(),
  itemNumber: z.string().optional(),
});

export type ExportVariablesRequest = z.infer<typeof ExportVariablesRequestSchema>;

/**
 * Schema for project export request (Phase 03 - per-item files)
 * Exports all items for a project to individual JSON files
 */
export const ExportProjectRequestSchema = z.object({
  salesOrderNumber: z.string()
    .min(1, 'Sales order number is required')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Sales order number must contain only alphanumeric characters, hyphens, and underscores'),
  productType: z.string()
    .regex(/^[A-Z]{2,10}$/, 'Product type must be 2-10 uppercase letters')
    .default('SDI'),
});

export type ExportProjectRequest = z.infer<typeof ExportProjectRequestSchema>;

/**
 * Schema for Build_Asm trigger request
 */
export const BuildAsmRequestSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  salesOrderNumber: z.string().optional(),
  itemNumber: z.string().optional(),
});

export type BuildAsmRequest = z.infer<typeof BuildAsmRequestSchema>;
