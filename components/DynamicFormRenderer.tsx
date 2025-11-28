'use client';

import { useState } from 'react';
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

type FormFieldValue = string | number | boolean | string[] | Date | Record<string, string | number> | undefined;

// Helper functions for type-safe value extraction
const toStringValue = (value: FormFieldValue): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
};

const toArrayValue = (value: FormFieldValue): string[] => {
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
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  options?: Array<{ value: string; label: string }>;
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
  onSubmit: (data: Record<string, FormFieldValue>) => void;
  onCancel?: () => void;
  validationErrors?: Record<string, string>;
}

export default function DynamicFormRenderer({
  formSpec,
  onSubmit,
  onCancel,
  validationErrors = {},
}: DynamicFormRendererProps) {
  const [formData, setFormData] = useState<Record<string, FormFieldValue>>(() => buildInitialFormData(formSpec));
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Merge external validation errors with internal errors
  const allErrors = { ...errors, ...validationErrors };
  const [selectedTableRows, setSelectedTableRows] = useState<Record<string, number>>({});

  // Helper to create form-scoped state keys (defensive against name collisions)
  const getTableStateKey = (fieldName: string) => `${formSpec.formId}__${fieldName}`;

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
    if (field.required && (!value || value === '' || (Array.isArray(value) && value.length === 0))) {
      return `${field.label} is required`;
    }

    // Integer validation
    if (field.type === 'integer' && value !== '' && value !== undefined) {
      const numValue = Number(value);
      if (!Number.isInteger(numValue)) {
        return `${field.label} must be a whole number`;
      }
    }

    // Float validation (2 decimal places)
    if (field.type === 'float' && value !== '' && value !== undefined) {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return `${field.label} must be a valid number`;
      }
      // Check if it has more than 2 decimal places
      const decimalPart = value.toString().split('.')[1];
      if (decimalPart && decimalPart.length > 2) {
        return `${field.label} must have at most 2 decimal places`;
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

    // Handler for table row selection
    const handleTableRowSelect = (fieldName: string, rowIndex: number, rowData: Record<string, string | number>) => {
      // Use prefixed state key for defensive collision prevention
      const stateKey = getTableStateKey(fieldName);
      setSelectedTableRows(prev => ({ ...prev, [stateKey]: rowIndex }));

      // Store actual row data in form state (not prefixed, just fieldName)
      handleFieldChange(fieldName, rowData);
    };

    switch (field.type) {
      case 'input':
        return (
          <Field key={field.id} data-invalid={!!error}>
            <FieldContent>
              <FieldLabel htmlFor={field.id}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </FieldLabel>
              {field.helperText && (
                <FieldDescription>{field.helperText}</FieldDescription>
              )}
            </FieldContent>
            <Input
              id={field.id}
              name={field.name}
              type={field.inputType || 'text'}
              placeholder={field.placeholder}
              value={toStringValue(value)}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              aria-invalid={!!error}
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>
        );

      case 'textarea':
        return (
          <Field key={field.id} data-invalid={!!error}>
            <FieldContent>
              <FieldLabel htmlFor={field.id}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </FieldLabel>
              {field.helperText && (
                <FieldDescription>{field.helperText}</FieldDescription>
              )}
            </FieldContent>
            <Textarea
              id={field.id}
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
          <Field key={field.id} data-invalid={!!error}>
            <FieldContent>
              <FieldLabel htmlFor={field.id}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </FieldLabel>
              {field.helperText && (
                <FieldDescription>{field.helperText}</FieldDescription>
              )}
            </FieldContent>
            <Select
              value={typeof value === 'string' ? value : undefined}
              onValueChange={(val) => handleFieldChange(field.name, val)}
            >
              <SelectTrigger aria-invalid={!!error} id={field.id}>
                <SelectValue placeholder={field.placeholder || 'Select an option'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
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
          <FieldSet key={field.id} data-invalid={!!error}>
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
                    id={`${field.id}-${option.value}`}
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
                    className="border-muted-foreground/40 data-[state=checked]:bg-zinc-700 data-[state=checked]:border-zinc-700 data-[state=checked]:text-white dark:data-[state=checked]:bg-zinc-400 dark:data-[state=checked]:border-zinc-400"
                  />
                  <FieldLabel htmlFor={`${field.id}-${option.value}`} className="font-normal">
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
          <FieldSet key={field.id} data-invalid={!!error}>
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
                      id={`${field.id}-${option.value}`}
                      className="border-muted-foreground/40 text-zinc-700 data-[state=checked]:border-zinc-700 dark:text-zinc-400 dark:data-[state=checked]:border-zinc-400 [&_svg]:fill-zinc-700 dark:[&_svg]:fill-zinc-400"
                    />
                    <FieldLabel htmlFor={`${field.id}-${option.value}`} className="font-normal">
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
          <Field key={field.id} data-invalid={!!error}>
            <FieldContent>
              <div className="flex justify-between items-center">
                <FieldLabel htmlFor={field.id}>
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
              id={field.id}
              min={field.min || 0}
              max={field.max || 100}
              step={field.step || 1}
              value={[toNumberValue(value, toNumberValue(field.defaultValue, field.min || 0))]}
              onValueChange={(vals) => handleFieldChange(field.name, vals[0])}
              className="w-full *:first:bg-zinc-200 dark:*:first:bg-zinc-700 *:first:*:bg-zinc-500 dark:*:first:*:bg-zinc-400 *:last:border-zinc-400 dark:*:last:border-zinc-500"
              aria-invalid={!!error}
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>
        );

      case 'date':
        return (
          <Field key={field.id} data-invalid={!!error}>
            <FieldContent>
              <FieldLabel htmlFor={field.id}>
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
                  id={field.id}
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
            key={field.id}
            orientation="horizontal"
            data-invalid={!!error}
            className="py-2"
          >
            <FieldContent>
              <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
              {field.helperText && (
                <FieldDescription>{field.helperText}</FieldDescription>
              )}
            </FieldContent>
            <Switch
              id={field.id}
              name={field.name}
              checked={toBooleanValue(value)}
              onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
              aria-invalid={!!error}
              className="data-[state=checked]:bg-zinc-700 dark:data-[state=checked]:bg-zinc-400"
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>
        );

      case 'integer':
        return (
          <Field key={field.id} data-invalid={!!error}>
            <FieldContent>
              <FieldLabel htmlFor={field.id}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </FieldLabel>
              {field.helperText && (
                <FieldDescription>{field.helperText}</FieldDescription>
              )}
            </FieldContent>
            <Input
              id={field.id}
              name={field.name}
              type="number"
              step="1"
              placeholder={field.placeholder}
              value={toStringValue(value)}
              onChange={(e) => {
                const val = e.target.value;
                // Only allow integers
                if (val === '' || /^-?\d+$/.test(val)) {
                  handleFieldChange(field.name, val === '' ? '' : parseInt(val, 10));
                }
              }}
              aria-invalid={!!error}
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>
        );

      case 'float':
        return (
          <Field key={field.id} data-invalid={!!error}>
            <FieldContent>
              <FieldLabel htmlFor={field.id}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </FieldLabel>
              {field.helperText && (
                <FieldDescription>{field.helperText}</FieldDescription>
              )}
            </FieldContent>
            <Input
              id={field.id}
              name={field.name}
              type="number"
              step="0.01"
              placeholder={field.placeholder}
              value={toStringValue(value)}
              onChange={(e) => {
                const val = e.target.value;
                // Allow decimals with up to 2 decimal places
                if (val === '' || /^-?\d*\.?\d{0,2}$/.test(val)) {
                  handleFieldChange(field.name, val === '' ? '' : parseFloat(val));
                }
              }}
              aria-invalid={!!error}
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>
        );

      case 'table': {
        // Use prefixed state key to get selected row index
        const stateKey = getTableStateKey(field.name);
        const selectedRowIndex = selectedTableRows[stateKey];

        return (
          <Field key={field.id} data-invalid={!!error}>
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

                      return (
                        <TableRow
                          key={rowIndex}
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
                            hover:bg-zinc-50 dark:hover:bg-zinc-900
                            ${isSelected
                              ? 'bg-zinc-100 dark:bg-zinc-800 border-l-4 border-l-zinc-700 dark:border-l-zinc-400'
                              : ''
                            }
                          `}
                        >
                          <TableCell className="text-center">
                            <div className={`
                              w-4 h-4 rounded-full border-2 mx-auto
                              ${isSelected
                                ? 'border-zinc-700 dark:border-zinc-400 bg-zinc-700 dark:bg-zinc-400'
                                : 'border-muted-foreground/40'
                              }
                            `}>
                              {isSelected && (
                                <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 scale-50" />
                              )}
                            </div>
                          </TableCell>
                          {field.columns?.map((column) => (
                            <TableCell key={`${rowIndex}-${column.key}`}>
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
    <div className="w-full max-w-3xl mx-auto px-4">
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          {/* Form Header */}
          <FieldSet>
            <FieldContent>
              <FieldLegend className="text-2xl font-bold">{formSpec.title}</FieldLegend>
              {formSpec.description && (
                <FieldDescription className="text-base">{formSpec.description}</FieldDescription>
              )}
            </FieldContent>
          </FieldSet>

          {/* Form Sections */}
          {formSpec.sections.map((section) => (
            <FieldSet key={section.id}>
              <FieldContent>
                <FieldLegend variant="label">{section.title}</FieldLegend>
                {section.description && (
                  <FieldDescription>{section.description}</FieldDescription>
                )}
              </FieldContent>

              <FieldGroup>
                {section.fields.map((field) => (
                  <div key={field.id}>{renderField(field)}</div>
                ))}
              </FieldGroup>
            </FieldSet>
          ))}

          {/* Form Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="secondary" className="flex-1">
              {formSpec.submitButton.text}
            </Button>
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
