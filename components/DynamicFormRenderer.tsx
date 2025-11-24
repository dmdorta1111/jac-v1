'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'input' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'slider' | 'date' | 'switch';
  inputType?: string;
  placeholder?: string;
  defaultValue?: any;
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
  conditional?: {
    field: string;
    value: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
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
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
}

export default function DynamicFormRenderer({
  formSpec,
  onSubmit,
  onCancel,
}: DynamicFormRendererProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data with default values
  useEffect(() => {
    const initialData: Record<string, any> = {};
    formSpec.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.defaultValue !== undefined) {
          initialData[field.name] = field.defaultValue;
        }
      });
    });
    setFormData(initialData);
  }, [formSpec]);

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || value === '' || (Array.isArray(value) && value.length === 0))) {
      return `${field.label} is required`;
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

    const { field: dependentField, value: requiredValue, operator } = field.conditional;
    const currentValue = formData[dependentField];

    switch (operator) {
      case 'equals':
        return currentValue === requiredValue;
      case 'notEquals':
        return currentValue !== requiredValue;
      case 'contains':
        return String(currentValue).includes(requiredValue);
      case 'greaterThan':
        return Number(currentValue) > Number(requiredValue);
      case 'lessThan':
        return Number(currentValue) < Number(requiredValue);
      default:
        return true;
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
    const error = errors[field.name];

    switch (field.type) {
      case 'input':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-slate-700 dark:text-slate-200">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              name={field.name}
              type={field.inputType || 'text'}
              placeholder={field.placeholder}
              value={value || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className={`bg-white dark:bg-slate-800 ${error ? 'border-red-500' : ''}`}
            />
            {field.helperText && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{field.helperText}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-slate-700 dark:text-slate-200">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              name={field.name}
              placeholder={field.placeholder}
              value={value || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              rows={field.rows || 4}
              className={`bg-white dark:bg-slate-800 ${error ? 'border-red-500' : ''}`}
            />
            {field.helperText && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{field.helperText}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-slate-700 dark:text-slate-200">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => handleFieldChange(field.name, val)}
            >
              <SelectTrigger className={`bg-white dark:bg-slate-800 ${error ? 'border-red-500' : ''}`}>
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
            {field.helperText && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{field.helperText}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="space-y-3">
            <Label className="text-slate-700 dark:text-slate-200">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${option.value}`}
                    checked={(value || []).includes(option.value)}
                    onCheckedChange={(checked) => {
                      const currentValues = value || [];
                      const newValues = checked
                        ? [...currentValues, option.value]
                        : currentValues.filter((v: string) => v !== option.value);
                      handleFieldChange(field.name, newValues);
                    }}
                  />
                  <label
                    htmlFor={`${field.id}-${option.value}`}
                    className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
            {field.helperText && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{field.helperText}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="space-y-3">
            <Label className="text-slate-700 dark:text-slate-200">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={value}
              onValueChange={(val) => handleFieldChange(field.name, val)}
            >
              {field.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                  <Label htmlFor={`${field.id}-${option.value}`} className="font-normal text-slate-700 dark:text-slate-300">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {field.helperText && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{field.helperText}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'slider':
        return (
          <div key={field.id} className="space-y-3">
            <div className="flex justify-between">
              <Label htmlFor={field.id} className="text-slate-700 dark:text-slate-200">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {value || field.defaultValue || field.min} {field.unit || ''}
              </span>
            </div>
            <Slider
              id={field.id}
              min={field.min || 0}
              max={field.max || 100}
              step={field.step || 1}
              value={[value || field.defaultValue || field.min || 0]}
              onValueChange={(vals) => handleFieldChange(field.name, vals[0])}
              className="w-full"
            />
            {field.helperText && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{field.helperText}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-slate-700 dark:text-slate-200">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal bg-white dark:bg-slate-800 ${
                    !value && 'text-muted-foreground'
                  } ${error ? 'border-red-500' : ''}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value ? format(new Date(value), 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={value ? new Date(value) : undefined}
                  onSelect={(date) => handleFieldChange(field.name, date?.toISOString())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {field.helperText && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{field.helperText}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'switch':
        return (
          <div key={field.id} className="flex items-center justify-between space-x-2 py-2">
            <div className="space-y-0.5">
              <Label htmlFor={field.id} className="text-slate-700 dark:text-slate-200">{field.label}</Label>
              {field.helperText && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{field.helperText}</p>
              )}
            </div>
            <Switch
              id={field.id}
              checked={value || false}
              onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-slate-50 dark:bg-slate-900 rounded-lg shadow-lg p-6 space-y-6 border border-slate-200 dark:border-slate-700">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formSpec.title}</h2>
        {formSpec.description && (
          <p className="text-slate-600 dark:text-slate-400 mt-2">{formSpec.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {formSpec.sections.map((section) => (
          <div key={section.id} className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">{section.title}</h3>
              {section.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{section.description}</p>
              )}
            </div>
            <div className="space-y-4">
              {section.fields.map((field) => renderField(field))}
            </div>
          </div>
        ))}

        <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
          <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
            {formSpec.submitButton.text}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
