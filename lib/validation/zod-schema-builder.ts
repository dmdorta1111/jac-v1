import { z } from 'zod';
import type { FormSpec, FormField } from '@/lib/form-templates/types';

/**
 * Check if a conditional field should be visible based on current form data
 * Supports both boolean (true/false) and number (0/1) comparisons for switch fields
 */
function checkConditional(
  field: FormField,
  data: Record<string, unknown>
): boolean {
  if (!field.conditional) return true;

  const { conditions, logic } = field.conditional;

  const results = conditions.map(({ field: dependentField, value: requiredValue, operator }) => {
    const currentValue = data[dependentField];

    // Handle undefined/null values
    if (currentValue === undefined || currentValue === null) {
      return operator === 'notEquals';
    }

    // Normalize boolean/number comparison for switch fields
    // Switches return boolean but JSON may compare to 0/1
    const normalizedCurrent = typeof currentValue === 'boolean'
      ? (currentValue ? 1 : 0)
      : currentValue;
    const normalizedRequired = typeof requiredValue === 'boolean'
      ? (requiredValue ? 1 : 0)
      : requiredValue;

    switch (operator) {
      case 'equals':
        // Use loose equality for type coercion (string "1" == number 1)
        return normalizedCurrent == normalizedRequired;
      case 'notEquals':
        return normalizedCurrent != normalizedRequired;
      case 'greaterThan':
        return Number(currentValue) > Number(requiredValue);
      case 'greaterThanOrEqual':
        return Number(currentValue) >= Number(requiredValue);
      case 'lessThan':
        return Number(currentValue) < Number(requiredValue);
      case 'lessThanOrEqual':
        return Number(currentValue) <= Number(requiredValue);
      default:
        return true;
    }
  });

  // Apply AND/OR logic
  if (logic === 'OR') {
    return results.some(r => r);
  } else {
    return results.every(r => r);
  }
}

/**
 * Build Zod schema from FormSpec definition
 * Maps field types to Zod validators with required/optional logic
 * @param formSpec - The form specification
 * @param data - Current form data (used to evaluate conditionals)
 */
export function buildZodSchema(
  formSpec: FormSpec,
  data?: Record<string, unknown>
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  formSpec.sections.forEach((section) => {
    section.fields.forEach((field) => {
      // If data provided, check if field is visible based on conditionals
      // Hidden conditional fields should be optional (not validated as required)
      const isVisible = data ? checkConditional(field, data) : true;
      const fieldSchema = buildFieldSchema(field, isVisible);
      schemaFields[field.name] = fieldSchema;
    });
  });

  return z.object(schemaFields);
}

/**
 * Build Zod schema for individual field based on type and validation rules
 * @param field - The field specification
 * @param isVisible - Whether the field is currently visible (conditionals evaluated)
 */
function buildFieldSchema(field: FormField, isVisible: boolean = true): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  // If field is hidden (conditional not met), make it fully optional
  // This prevents validation errors for hidden required fields
  const effectiveRequired = field.required && isVisible;

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
      // Allow null/undefined for optional, coerce empty string to null
      if (effectiveRequired) {
        schema = z.number().int();
        if (field.min !== undefined) {
          schema = (schema as z.ZodNumber).min(field.min, `Minimum value is ${field.min}`);
        }
        if (field.max !== undefined) {
          schema = (schema as z.ZodNumber).max(field.max, `Maximum value is ${field.max}`);
        }
      } else {
        schema = z.preprocess(
          (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
          z.number().int().nullable()
        );
      }
      return schema; // Early return - integer handles its own required/optional

    case 'float':
      // Allow null/undefined for optional, coerce empty string to null
      if (effectiveRequired) {
        schema = z.number();
        if (field.min !== undefined) {
          schema = (schema as z.ZodNumber).min(field.min, `Minimum value is ${field.min}`);
        }
        if (field.max !== undefined) {
          schema = (schema as z.ZodNumber).max(field.max, `Maximum value is ${field.max}`);
        }
      } else {
        schema = z.preprocess(
          (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
          z.number().nullable()
        );
      }
      return schema; // Early return - float handles its own required/optional

    case 'switch':
      schema = z.boolean();
      break;

    case 'checkbox':
      // Checkbox with options = multi-select (string array)
      // Checkbox without options = single boolean toggle
      if (field.options && field.options.length > 0) {
        schema = z.array(z.union([z.string(), z.number()]));
      } else {
        schema = z.boolean();
      }
      break;

    case 'select':
    case 'radio':
      // Create union from options - support both string and number values
      if (field.options && field.options.length > 0) {
        const values = field.options.map(opt => opt.value);
        // Check if values are numbers or strings
        const hasNumbers = values.some(v => typeof v === 'number');
        const hasStrings = values.some(v => typeof v === 'string');

        if (hasNumbers && !hasStrings) {
          schema = z.number();
        } else if (hasStrings && !hasNumbers) {
          schema = z.enum(values as [string, ...string[]]);
        } else {
          // Mixed or unknown - accept both
          schema = z.union([z.string(), z.number()]);
        }
      } else {
        schema = z.union([z.string(), z.number()]);
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
      // Table stores selected row as single record (not array)
      if (effectiveRequired) {
        // Required table must have at least one key-value pair selected
        schema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
          .refine(val => Object.keys(val).length > 0, {
            message: `${field.label} requires a selection`,
          });
      } else {
        schema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
          .optional().nullable();
      }
      return schema; // Early return - table handles its own required/optional

    default:
      // Fallback to string for unknown types
      schema = z.string();
  }

  // Handle required/optional based on effective required (considers visibility)
  if (effectiveRequired) {
    // Add required error message based on schema type
    if (schema instanceof z.ZodString) {
      schema = schema.min(1, `${field.label} is required`);
    } else if (schema instanceof z.ZodNumber) {
      // Numbers are required by default, just ensure non-NaN
      schema = schema.refine(val => !isNaN(val), {
        message: `${field.label} must be a valid number`,
      });
    } else if (schema instanceof z.ZodArray) {
      // Required arrays must have at least 1 item
      schema = schema.min(1, `${field.label} requires at least one selection`);
    }
    // Other types (boolean, record, union) are required by default
  } else {
    // Make optional - allow null, undefined, or empty values
    if (schema instanceof z.ZodString) {
      schema = schema.optional().or(z.literal(''));
    } else if (schema instanceof z.ZodArray) {
      // Optional arrays can be empty or undefined
      schema = schema.optional();
    } else {
      schema = schema.optional().nullable();
    }
  }

  return schema;
}

/**
 * Validate form data against schema and return result with formatted errors
 * Passes current data to buildZodSchema so conditionals can be evaluated
 */
export function validateFormData(
  formSpec: FormSpec,
  data: Record<string, unknown>
): { success: true; data: Record<string, unknown> } | { success: false; errors: Record<string, string> } {
  // Pass data to buildZodSchema so it can evaluate conditionals
  // Hidden conditional fields will be made optional (not required)
  const schema = buildZodSchema(formSpec, data);
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
