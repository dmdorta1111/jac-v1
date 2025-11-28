import { z } from 'zod';

/**
 * Schema for form submission metadata
 * Tracks submission context and versioning
 */
export const FormSubmissionMetadataSchema = z.object({
  submittedAt: z.date(),
  formVersion: z.string().default('1.0.0'),
  userId: z.string().optional(),
  salesOrderNumber: z.string(),
  itemNumber: z.string().optional(),
  productType: z.string().optional(),
  isRevision: z.boolean().default(false),
});

/**
 * Schema for complete form submission
 * Stores validated form data with context
 */
export const FormSubmissionSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
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
 * Schema for SmartAssembly variable export request
 */
export const ExportVariablesRequestSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  salesOrderNumber: z.string().optional(),
  itemNumber: z.string().optional(),
});

export type ExportVariablesRequest = z.infer<typeof ExportVariablesRequestSchema>;

/**
 * Schema for Build_Asm trigger request
 */
export const BuildAsmRequestSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  salesOrderNumber: z.string().optional(),
  itemNumber: z.string().optional(),
});

export type BuildAsmRequest = z.infer<typeof BuildAsmRequestSchema>;
