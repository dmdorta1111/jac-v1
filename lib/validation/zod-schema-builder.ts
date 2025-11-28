import { z } from 'zod';
import type { FormSpec, FormField } from '@/lib/form-templates/types';

/**
 * Build Zod schema from FormSpec definition
 * Maps field types to Zod validators with required/optional logic
 */
export function buildZodSchema(formSpec: FormSpec): z.ZodObject<any> {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  formSpec.sections.forEach((section) => {
    section.fields.forEach((field) => {
      const fieldSchema = buildFieldSchema(field);
      schemaFields[field.name] = fieldSchema;
    });
  });

  return z.object(schemaFields);
}

/**
 * Build Zod schema for individual field based on type and validation rules
 */
function buildFieldSchema(field: FormField): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  // Map field types to Zod validators
  switch (field.type) {
    case 'input':
    case 'textarea':
      schema = z.string();

      // Apply validation rules
      if (field.validation) {
        if (field.validation.min !== undefined) {
          schema = (schema as z.ZodString).min(field.validation.min, field.validation.message);
        }
        if (field.validation.max !== undefined) {
          schema = (schema as z.ZodString).max(field.validation.max, field.validation.message);
        }
        if (field.validation.pattern) {
          schema = (schema as z.ZodString).regex(
            new RegExp(field.validation.pattern),
            field.validation.message || 'Invalid format'
          );
        }
      }
      break;

    case 'integer':
      schema = z.number().int();

      if (field.min !== undefined) {
        schema = (schema as z.ZodNumber).min(field.min, `Minimum value is ${field.min}`);
      }
      if (field.max !== undefined) {
        schema = (schema as z.ZodNumber).max(field.max, `Maximum value is ${field.max}`);
      }
      break;

    case 'float':
      schema = z.number();

      if (field.min !== undefined) {
        schema = (schema as z.ZodNumber).min(field.min, `Minimum value is ${field.min}`);
      }
      if (field.max !== undefined) {
        schema = (schema as z.ZodNumber).max(field.max, `Maximum value is ${field.max}`);
      }
      break;

    case 'checkbox':
    case 'switch':
      schema = z.boolean();
      break;

    case 'select':
    case 'radio':
      // Create enum from options
      if (field.options && field.options.length > 0) {
        const values = field.options.map(opt => opt.value);
        schema = z.enum(values as [string, ...string[]]);
      } else {
        schema = z.string();
      }
      break;

    case 'date':
      schema = z.date().or(z.string().transform(str => new Date(str)));
      break;

    case 'slider':
      schema = z.number();

      if (field.min !== undefined) {
        schema = (schema as z.ZodNumber).min(field.min);
      }
      if (field.max !== undefined) {
        schema = (schema as z.ZodNumber).max(field.max);
      }
      break;

    case 'table':
      // Table data is array of records
      schema = z.array(z.record(z.string(), z.union([z.string(), z.number()])));
      break;

    default:
      // Fallback to string for unknown types
      schema = z.string();
  }

  // Handle required/optional
  if (field.required) {
    // Add required error message
    if (schema instanceof z.ZodString) {
      schema = schema.min(1, `${field.label} is required`);
    } else if (schema instanceof z.ZodNumber) {
      schema = schema.refine(val => val !== null && val !== undefined, {
        message: `${field.label} is required`,
      });
    }
  } else {
    // Make optional - allow null, undefined, or empty string
    if (schema instanceof z.ZodString) {
      schema = schema.optional().or(z.literal(''));
    } else {
      schema = schema.optional().nullable();
    }
  }

  return schema;
}

/**
 * Validate form data against schema and return result with formatted errors
 */
export function validateFormData(
  formSpec: FormSpec,
  data: Record<string, any>
): { success: true; data: Record<string, any> } | { success: false; errors: Record<string, string> } {
  const schema = buildZodSchema(formSpec);
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    // Format Zod errors into field-name => error-message map
    const errors: Record<string, string> = {};
    result.error.issues.forEach((err) => {
      const fieldName = String(err.path[0]);
      errors[fieldName] = err.message;
    });
    return { success: false, errors };
  }
}
