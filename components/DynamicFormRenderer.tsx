'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldContent,
  FieldSet,
  FieldLegend,
  FieldGroup,
} from '@/components/ui/field';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

type FormFieldValue = string | number | boolean | (string | number)[] | Date | Record<string, string | number> | undefined;

// Helper functions for type-safe value extraction
const toStringValue = (value: FormFieldValue): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
};

const toArrayValue = (value: FormFieldValue): (string | number)[] => {
  if (Array.isArray(value)) return value;
  return [];
};

const toNumberValue = (value: FormFieldValue, fallback: number): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
};

const toBooleanValue = (value: FormFieldValue): boolean => {
  return typeof value === 'boolean' ? value : false;
};

// Helper to determine column span for field in responsive grid layout
// Returns: 1-5 based on field type for responsive 5-column grid
const getFieldColSpan = (field: FormField): 1 | 2 | 5 => {
  // Always full width types - multi-option or expansive content
  if (['textarea', 'table', 'radio', 'checkbox'].includes(field.type)) {
    return 5;
  }

  // Select/date/slider get 2 columns
  if (['select', 'date', 'slider'].includes(field.type)) {
    return 2;
  }

  // All other fields: single column (input, integer, float, switch, etc.)
  return 1;
};

const toDateValue = (value: FormFieldValue): Date | undefined => {
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
  }
  return undefined;
};

const buildInitialFormData = (spec: { sections: { fields: { name: string; defaultValue?: FormFieldValue }[] }[] }): Record<string, FormFieldValue> => {
  const initial: Record<string, FormFieldValue> = {};
  spec.sections.forEach((section) => {
    section.fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        initial[field.name] = field.defaultValue;
      }
    });
  });
  return initial;
};

interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'input' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'slider' | 'date' | 'switch' | 'table' | 'integer' | 'float';
  inputType?: string;
  placeholder?: string;
  defaultValue?: FormFieldValue;
  required?: boolean;
  readonly?: boolean;  // When true, field is displayed but cannot be edited
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  options?: Array<{ value: string | number; label: string }>;
  helperText?: string;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  columns?: Array<{ key: string; label: string }>;
  tableData?: Array<Record<string, string | number>>;
  editable?: boolean;
  conditional?: {
    conditions: Array<{
      field: string;
      value: string | number;
      operator: 'equals' | 'notEquals' | 'greaterThan' | 'greaterThanOrEqual' | 'lessThan' | 'lessThanOrEqual';
    }>;
    logic: 'AND' | 'OR';
  };
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

interface DynamicFormSpec {
  formId: string;
  itemType: string;
  title: string;
  description: string;
  sections: FormSection[];
  submitButton: {
    text: string;
    action: string;
  };
}

interface DynamicFormRendererProps {
  formSpec: DynamicFormSpec;
  sessionId: string; // Unique session identifier for multi-session support
  initialData?: Record<string, FormFieldValue>; // External data to restore form state (e.g., from session switch)
  onSubmit: (data: Record<string, FormFieldValue>) => void;
  onCancel?: () => void;
  onFormDataChange?: (formId: string, data: Record<string, FormFieldValue>) => void; // Sync unsaved form data to parent
  validationErrors?: Record<string, string>;
  selectedTableRows?: Record<string, number>; // Session-scoped table row selections (fieldName -> rowIndex)
  onTableRowSelect?: (fieldName: string, rowIndex: number, rowData: Record<string, string | number>) => void; // Callback for table row selection
}

export default function DynamicFormRenderer({
  formSpec,
  sessionId,
  initialData,
  onSubmit,
  onCancel,
  onFormDataChange,
  validationErrors = {},
  selectedTableRows = {},
  onTableRowSelect,
}: DynamicFormRendererProps) {
  // Merge formSpec defaults with initialData (external restored state takes priority)
  const [formData, setFormData] = useState<Record<string, FormFieldValue>>(() => {
    const defaults = buildInitialFormData(formSpec);
    return { ...defaults, ...(initialData || {}) };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Merge external validation errors with internal errors
  const allErrors = { ...errors, ...validationErrors };
  const hasInitialFocused = useRef(false);
  const previousFormId = useRef(formSpec.formId);

  // Reset focus flag when form changes
  useEffect(() => {
    if (previousFormId.current !== formSpec.formId) {
      hasInitialFocused.current = false;
      previousFormId.current = formSpec.formId;
    }
  }, [formSpec.formId]);

  // Reset form data when session or form step changes to pick up restored/new form values
  // Merges formSpec defaults with initialData (restored state takes priority)
  useEffect(() => {
    const defaults = buildInitialFormData(formSpec);
    const merged = { ...defaults, ...(initialData || {}) };

    // Only reset formData if:
    // 1. initialData has content (explicit restore) OR
    // 2. formData is empty (first render)
    // This preserves unsaved changes when session switches without initialData
    const shouldReset =
      Object.keys(initialData || {}).length > 0 ||
      Object.keys(formData).length === 0;

    if (shouldReset) {
      setFormData(merged);
    }
  }, [sessionId, formSpec.formId, initialData]);

  // Sync form data to parent on mount and when formSpec changes
  // This ensures parent has visibility into pre-filled form data
  // Deferred to next tick to avoid "setState during render" error
  useEffect(() => {
    const initialData = buildInitialFormData(formSpec);
    if (Object.keys(initialData).length > 0) {
      // Use queueMicrotask to defer callback after render completes
      queueMicrotask(() => {
        onFormDataChange?.(formSpec.formId, initialData);
      });
    }
  }, [formSpec.formId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Helper to check if a field is empty
  const isFieldEmpty = (field: FormField, value: FormFieldValue): boolean => {
    if (value === undefined || value === null || value === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'object' && Object.keys(value).length === 0) return true;
    return false;
  };

  // Helper to focus on a field by id (uses session-scoped ID)
  const focusField = (fieldId: string) => {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      // Build session-scoped ID for DOM lookup
      const scopedId = `${sessionId}-${formSpec.formId}-${fieldId}`;
      const element = document.getElementById(scopedId);
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Auto-focus on first empty field when form loads
  useEffect(() => {
    if (hasInitialFocused.current) return;
    hasInitialFocused.current = true;

    // Find first empty visible field
    for (const section of formSpec.sections) {
      for (const field of section.fields) {
        // Skip non-focusable field types
        if (field.type === 'table') continue;

        const value = formData[field.name];
        if (isFieldEmpty(field, value)) {
          focusField(field.id);
          return;
        }
      }
    }

    // If all fields have values, focus on first field
    const firstField = formSpec.sections[0]?.fields[0];
    if (firstField && firstField.type !== 'table') {
      focusField(firstField.id);
    }
  }, [formSpec.formId]); // Re-run when form changes

  // Auto-focus on first error field when validation errors occur
  useEffect(() => {
    const errorKeys = Object.keys(allErrors);
    if (errorKeys.length === 0) return;

    // Find first field with error in form order
    for (const section of formSpec.sections) {
      for (const field of section.fields) {
        if (allErrors[field.name]) {
          focusField(field.id);
          return;
        }
      }
    }
  }, [errors, validationErrors]);

  // Sync form data to parent using useEffect to avoid race conditions
  // This replaces queueMicrotask which could cause state mismatch during rapid input
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  useEffect(() => {
    onFormDataChange?.(formSpec.formId, formData);
  }, [formData, formSpec.formId, onFormDataChange]);

  // Helper to create session-scoped field IDs for HTML id attribute
  const getFieldId = (field: FormField) => `${sessionId}-${formSpec.formId}-${field.id}`;

  const handleFieldChange = (name: string, value: FormFieldValue) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when field is modified
    if (allErrors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateField = (field: FormField, value: FormFieldValue): string | null => {
    // Check required - allow 0 as valid, only reject undefined/null/empty
    if (field.required && (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0))) {
      return `${field.label} is required`;
    }

    // Integer validation
    if (field.type === 'integer' && value !== '' && value !== undefined) {
      const numValue = Number(value);
      if (!Number.isInteger(numValue)) {
        return `${field.label} must be a whole number`;
      }
    }

    // Float validation (5 decimal places)
    if (field.type === 'float' && value !== '' && value !== undefined) {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return `${field.label} must be a valid number`;
      }
      // Check if it has more than 5 decimal places
      const decimalPart = value.toString().split('.')[1];
      if (decimalPart && decimalPart.length > 5) {
        return `${field.label} must have at most 5 decimal places`;
      }
    }

    if (field.validation) {
      const { min, max, pattern, message } = field.validation;

      if (min !== undefined && Number(value) < min) {
        return message || `${field.label} must be at least ${min}`;
      }

      if (max !== undefined && Number(value) > max) {
        return message || `${field.label} must be at most ${max}`;
      }

      if (pattern && typeof value === 'string') {
        const regex = new RegExp(pattern);
        if (!regex.test(value)) {
          return message || `${field.label} format is invalid`;
        }
      }
    }

    return null;
  };

  const checkConditional = (field: FormField): boolean => {
    if (!field.conditional) return true;

    const { conditions, logic } = field.conditional;

    // Evaluate each condition
    const results = conditions.map(({ field: dependentField, value: requiredValue, operator }) => {
      const currentValue = formData[dependentField];

      // Handle undefined/null values
      if (currentValue === undefined || currentValue === null) {
        return operator === 'notEquals';
      }

      switch (operator) {
        case 'equals':
          return currentValue == requiredValue; // Loose equality for type coercion
        case 'notEquals':
          return currentValue != requiredValue; // Loose inequality for type coercion
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
      return results.some(r => r); // True if ANY condition is true
    } else {
      return results.every(r => r); // True if ALL conditions are true (AND)
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    // Validate all visible fields
    formSpec.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (checkConditional(field)) {
          const error = validateField(field, formData[field.name]);
          if (error) {
            newErrors[field.name] = error;
          }
        }
      });
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const renderField = (field: FormField) => {
    if (!checkConditional(field)) {
      return null;
    }

    const value = formData[field.name];
    const error = allErrors[field.name];

    // Handler for table row selection - delegates to parent via prop
    const handleTableRowSelect = (fieldName: string, rowIndex: number, rowData: Record<string, string | number>) => {
      // Defer parent callback to avoid "setState during render" error
      queueMicrotask(() => {
        onTableRowSelect?.(fieldName, rowIndex, rowData);
      });

      // Store actual row data in form state
      handleFieldChange(fieldName, rowData);
    };

    switch (field.type) {
      case 'input':
        return (
          <Field key={getFieldId(field)} data-invalid={!!error}>
            <FieldContent>
              <FieldLabel htmlFor={getFieldId(field)}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
                {field.readonly && <span className="text-muted-foreground ml-1 text-xs">(read-only)</span>}
              </FieldLabel>
              {field.helperText && (
                <FieldDescription>{field.helperText}</FieldDescription>
              )}
            </FieldContent>
            <Input
              id={getFieldId(field)}
              name={field.name}
              type={field.inputType || 'text'}
              placeholder={field.placeholder}
              value={toStringValue(value)}
              onChange={(e) => !field.readonly && handleFieldChange(field.name, e.target.value)}
              readOnly={field.readonly}
              aria-invalid={!!error}
              className={field.readonly ? 'bg-muted cursor-not-allowed opacity-70' : ''}
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>
        );

      case 'textarea':
        return (
          <Field key={getFieldId(field)} data-invalid={!!error}>
            <FieldContent>
              <FieldLabel htmlFor={getFieldId(field)}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </FieldLabel>
              {field.helperText && (
                <FieldDescription>{field.helperText}</FieldDescription>
              )}
            </FieldContent>
            <Textarea
              id={getFieldId(field)}
              name={field.name}
              placeholder={field.placeholder}
              value={toStringValue(value)}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              rows={field.rows || 4}
              aria-invalid={!!error}
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>
        );

      case 'select':
        return (
          <Field key={getFieldId(field)} data-invalid={!!error}>
            <FieldContent>
              <FieldLabel htmlFor={getFieldId(field)}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </FieldLabel>
              {field.helperText && (
                <FieldDescription>{field.helperText}</FieldDescription>
              )}
            </FieldContent>
            <Select
              value={value !== undefined && value !== null ? String(value) : ''}
              onValueChange={(val) => {
                // Detect if original option values are numeric
                const hasNumericOptions = field.options?.some(opt => typeof opt.value === 'number');
                if (hasNumericOptions) {
                  const numVal = Number(val);
                  handleFieldChange(field.name, isNaN(numVal) ? val : numVal);
                } else {
                  handleFieldChange(field.name, val);
                }
              }}
            >
              <SelectTrigger aria-invalid={!!error} id={getFieldId(field)}>
                <SelectValue placeholder={field.placeholder || 'Select an option'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={String(option.value)} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <FieldError>{error}</FieldError>}
          </Field>
        );

      case 'checkbox':
        return (
          <FieldSet key={getFieldId(field)} data-invalid={!!error}>
            <FieldContent>
              <FieldLegend variant="label">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </FieldLegend>
              {field.helperText && (
                <FieldDescription>{field.helperText}</FieldDescription>
              )}
            </FieldContent>
            <FieldGroup data-slot="checkbox-group">
              {field.options?.map((option) => (
                <Field key={option.value} orientation="horizontal">
                  <Checkbox
                    id={`${getFieldId(field)}-${option.value}`}
                    name={`${field.name}-${option.value}`}
                    checked={toArrayValue(value).includes(option.value)}
                    onCheckedChange={(checked) => {
                      const currentValues = toArrayValue(value);
                      const newValues = checked
                        ? [...currentValues, option.value]
                        : currentValues.filter((v) => v !== option.value);
                      handleFieldChange(field.name, newValues);
                    }}
                    aria-invalid={!!error}
                    className="border-muted-foreground/40 data-[state=checked]:bg-neutral-700 data-[state=checked]:border-neutral-700 data-[state=checked]:text-white dark:data-[state=checked]:bg-neutral-400 dark:data-[state=checked]:border-neutral-400"
                  />
                  <FieldLabel htmlFor={`${getFieldId(field)}-${option.value}`} className="font-normal">
                    {option.label}
                  </FieldLabel>
                </Field>
              ))}
            </FieldGroup>
            {error && <FieldError>{error}</FieldError>}
          </FieldSet>
        );

      case 'radio':
        return (
          <FieldSet key={getFieldId(field)} data-invalid={!!error}>
            <FieldContent>
              <FieldLegend variant="label">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </FieldLegend>
              {field.helperText && (
                <FieldDescription>{field.helperText}</FieldDescription>
              )}
            </FieldContent>
            <RadioGroup
              value={value !== undefined ? String(value) : undefined}
              onValueChange={(val) => {
                // Convert back to number if option values are numbers
                const numVal = Number(val);
                handleFieldChange(field.name, isNaN(numVal) ? val : numVal);
              }}
              aria-invalid={!!error}
            >
              <FieldGroup data-slot="radio-group">
                {field.options?.map((option) => (
                  <Field key={option.value} orientation="horizontal">
                    <RadioGroupItem
                      value={String(option.value)}
                      id={`${getFieldId(field)}-${option.value}`}
                      className="border-muted-foreground/40 text-neutral-700 data-[state=checked]:border-neutral-700 dark:text-neutral-400 dark:data-[state=checked]:border-neutral-400 [&_svg]:fill-neutral-700 dark:[&_svg]:fill-neutral-400"
                    />
                    <FieldLabel htmlFor={`${getFieldId(field)}-${option.value}`} className="font-normal">
                      {option.label}
                    </FieldLabel>
                  </Field>
                ))}
              </FieldGroup>
            </RadioGroup>
            {error && <FieldError>{error}</FieldError>}
          </FieldSet>
        );

      case 'slider':
        return (
          <Field key={getFieldId(field)} data-invalid={!!error}>
            <FieldContent>
              <div className="flex justify-between items-center">
                <FieldLabel htmlFor={getFieldId(field)}>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </FieldLabel>
                <span className="text-sm font-medium text-foreground">
                  {toNumberValue(value, toNumberValue(field.defaultValue, field.min || 0))} {field.unit || ''}
                </span>
              </div>
              {field.helperText && (
                <FieldDescription>{field.helperText}</FieldDescription>
              )}
            </FieldContent>
            <Slider
              id={getFieldId(field)}
              min={field.min || 0}
              max={field.max || 100}
              step={field.step || 1}
              value={[toNumberValue(value, toNumberValue(field.defaultValue, field.min || 0))]}
              onValueChange={(vals) => handleFieldChange(field.name, vals[0])}
              className="w-full *:first:bg-neutral-200 dark:*:first:bg-neutral-700 *:first:*:bg-neutral-500 dark:*:first:*:bg-neutral-400 *:last:border-neutral-400 dark:*:last:border-neutral-500"
              aria-invalid={!!error}
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>
        );

      case 'date':
        return (
          <Field key={getFieldId(field)} data-invalid={!!error}>
            <FieldContent>
              <FieldLabel htmlFor={getFieldId(field)}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </FieldLabel>
              {field.helperText && (
                <FieldDescription>{field.helperText}</FieldDescription>
              )}
            </FieldContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={getFieldId(field)}
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    !value && 'text-muted-foreground'
                  }`}
                  aria-invalid={!!error}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {toDateValue(value) ? format(toDateValue(value)!, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  mode="single"
                  selected={toDateValue(value)}
                  captionLayout="dropdown"
                  onSelect={(date) => handleFieldChange(field.name, date?.toISOString())}
                />
              </PopoverContent>
            </Popover>
            {error && <FieldError>{error}</FieldError>}
          </Field>
        );

      case 'switch':
        return (
          <Field
            key={getFieldId(field)}
            orientation="horizontal"
            data-invalid={!!error}
            className="py-2"
          >
            <FieldContent>
              <FieldLabel htmlFor={getFieldId(field)}>{field.label}</FieldLabel>
              {field.helperText && (
                <FieldDescription>{field.helperText}</FieldDescription>
              )}
            </FieldContent>
            <Switch
              id={getFieldId(field)}
              name={field.name}
              checked={toBooleanValue(value)}
              onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
              aria-invalid={!!error}
              className="data-[state=checked]:bg-neutral-700 dark:data-[state=checked]:bg-neutral-400"
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>
        );

      case 'integer':
        return (
          <Field key={getFieldId(field)} data-invalid={!!error}>
            <FieldContent>
              <FieldLabel htmlFor={getFieldId(field)}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
                {field.readonly && <span className="text-muted-foreground ml-1 text-xs">(read-only)</span>}
              </FieldLabel>
              {field.helperText && (
                <FieldDescription>{field.helperText}</FieldDescription>
              )}
            </FieldContent>
            <Input
              id={getFieldId(field)}
              name={field.name}
              type="number"
              step="1"
              placeholder={field.placeholder}
              value={toStringValue(value)}
              onChange={(e) => {
                if (field.readonly) return;
                const val = e.target.value;
                // Only allow integers
                if (val === '' || /^-?\d+$/.test(val)) {
                  handleFieldChange(field.name, val === '' ? '' : parseInt(val, 10));
                }
              }}
              readOnly={field.readonly}
              aria-invalid={!!error}
              className={field.readonly ? 'bg-muted cursor-not-allowed opacity-70' : ''}
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>
        );

      case 'float':
        return (
          <Field key={getFieldId(field)} data-invalid={!!error}>
            <FieldContent>
              <FieldLabel htmlFor={getFieldId(field)}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </FieldLabel>
              {field.helperText && (
                <FieldDescription>{field.helperText}</FieldDescription>
              )}
            </FieldContent>
            <Input
              id={getFieldId(field)}
              name={field.name}
              type="number"
              step="0.00001"
              placeholder={field.placeholder}
              value={toStringValue(value)}
              onChange={(e) => {
                const val = e.target.value;
                // Allow decimals with up to 5 decimal places
                if (val === '' || /^-?\d*\.?\d{0,5}$/.test(val)) {
                  handleFieldChange(field.name, val === '' ? '' : parseFloat(val));
                }
              }}
              aria-invalid={!!error}
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>
        );

      case 'table': {
        // Get selected row index from session-scoped prop
        const selectedRowIndex = selectedTableRows?.[field.name];

        return (
          <Field key={getFieldId(field)} data-invalid={!!error}>
            <FieldContent>
              <FieldLabel>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </FieldLabel>
              {field.helperText && (
                <FieldDescription>{field.helperText}</FieldDescription>
              )}
            </FieldContent>

            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead> {/* Selection column */}
                    {field.columns?.map((column) => (
                      <TableHead key={column.key}>{column.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {field.tableData && field.tableData.length > 0 ? (
                    field.tableData.map((row, rowIndex) => {
                      const isSelected = selectedRowIndex === rowIndex;
                      // Session-scoped row ID to prevent collisions across multiple sessions
                      const rowId = (row as Record<string, unknown>).__id as string || `${sessionId}-${formSpec.formId}-row-${field.name}-${rowIndex}`;

                      return (
                        <TableRow
                          key={rowId}
                          onClick={() => handleTableRowSelect(field.name, rowIndex, row)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleTableRowSelect(field.name, rowIndex, row);
                            }
                          }}
                          tabIndex={0}
                          role="radio"
                          aria-checked={isSelected}
                          className={`
                            cursor-pointer transition-colors
                            hover:bg-neutral-50 dark:hover:bg-neutral-900
                            ${isSelected
                              ? 'bg-neutral-100 dark:bg-neutral-800 border-l-4 border-l-neutral-700 dark:border-l-neutral-400'
                              : ''
                            }
                          `}
                        >
                          <TableCell className="text-center">
                            <div className={`
                              w-4 h-4 rounded-full border-2 mx-auto
                              ${isSelected
                                ? 'border-neutral-700 dark:border-neutral-400 bg-neutral-700 dark:bg-neutral-400'
                                : 'border-muted-foreground/40'
                              }
                            `}>
                              {isSelected && (
                                <div className="w-full h-full rounded-full bg-white dark:bg-neutral-900 scale-50" />
                              )}
                            </div>
                          </TableCell>
                          {field.columns?.map((column) => (
                            <TableCell key={`${rowId}-${column.key}`}>
                              {row[column.key]}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={(field.columns?.length || 0) + 1}
                        className="text-center text-muted-foreground"
                      >
                        No data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {error && <FieldError>{error}</FieldError>}
          </Field>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-none px-2 sm:px-4 lg:px-6">
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          {/* Form Header */}
          <FieldSet>
            <FieldContent>
              <FieldLegend className="text-xl font-bold">{formSpec.title}</FieldLegend>
              {formSpec.description && (
                <FieldDescription className="text-sm">{formSpec.description}</FieldDescription>
              )}
            </FieldContent>
          </FieldSet>

          {/* Form Sections */}
          {/* Session-scoped section keys to prevent collisions across multiple sessions */}
          {formSpec.sections.map((section) => (
            <FieldSet
            key={`${sessionId}-${formSpec.formId}-${section.id}`}
            name={section.id}
            className="relative rounded-xl bg-neutral-100/80 dark:bg-neutral-900/50 mb-8 shadow-lg shadow-neutral-400/20 dark:shadow-neutral-950/40 overflow-hidden"
            >
              <FieldContent className="p-6 pb-4">
                <FieldLegend
                variant="label"
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-400 tracking-tight"
                >
                  {section.title}
                  </FieldLegend>
                {section.description && (
                  <FieldDescription className="mt-1.5 text-xs text-muted-foreground">
                    {section.description}
                  </FieldDescription>
                )}
              </FieldContent>

              {/* Inner container for field spacing from border - generous padding on all sides */}
              <div className="p-6">
              {/* Grid layout: responsive 1→2→4→5 columns based on breakpoint */}
              <div className="compact-fields grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 lg:gap-4
                  [&_[data-slot=field]]:gap-1
                  [&_[data-slot=field-label]]:text-xs
                  [&_[data-slot=field-description]]:text-[10px]
                  [&_[data-slot=field-error]]:text-[10px]
                  [&_[data-slot=field-content]]:gap-0
                  [&_[data-slot=input]]:h-7
                  [&_[data-slot=input]]:text-xs
                  [&_[data-slot=input]]:px-2
                  [&_[data-slot=input]]:py-1
                  [&_[data-slot=input]]:rounded-md
                  [&_button[role=combobox]]:h-7
                  [&_button[role=combobox]]:text-xs
                  [&_button[role=combobox]]:px-2
                  [&_button[role=combobox]]:py-1
                  [&_[data-slot=field-set]]:gap-2
                  [&_[data-slot=field-group]]:gap-1.5
                  [&_[data-slot=checkbox-group]]:gap-1
                  [&_[data-slot=radio-group]]:gap-1
                  [&_[role=checkbox]]:h-3.5
                  [&_[role=checkbox]]:w-3.5
                  [&_[role=radio]]:h-3.5
                  [&_[role=radio]]:w-3.5
                  [&_[role=switch]]:h-4
                  [&_[role=switch]]:w-7
                  [&_textarea]:text-xs
                  [&_textarea]:min-h-[60px]
                  [&_.text-sm]:text-xs">
                {section.fields.map((field) => {
                  const colSpan = getFieldColSpan(field);
                  const renderedField = renderField(field);
                  if (!renderedField) return null;

                  // Build responsive col-span classes for 5-column grid
                  let spanClass = "col-span-1"; // Default single column
                  if (colSpan === 5) {
                    // Full width across all breakpoints
                    spanClass = "col-span-1 sm:col-span-2 lg:col-span-4 xl:col-span-5";
                  } else if (colSpan === 2) {
                    // Medium width fields (select, date, slider)
                    spanClass = "col-span-1 sm:col-span-1 lg:col-span-2 xl:col-span-2";
                  }

                  return (
                    <div
                      key={`${sessionId}-${formSpec.formId}-${field.id}`}
                      className={spanClass}
                    >
                      {renderedField}
                    </div>
                  );
                })}
              </div>
              </div>
            </FieldSet>
          ))}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 sm:pt-6 border-t border-border mt-4">
            <div className="scale-75 origin-left">
              <Button type="submit" variant="secondary">
                {formSpec.submitButton.text}
              </Button>
            </div>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
