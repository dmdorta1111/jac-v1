// Form field types (extracted from DynamicFormRenderer)
export type FieldType =
  | 'input' | 'textarea' | 'select' | 'checkbox'
  | 'radio' | 'slider' | 'date' | 'switch'
  | 'table' | 'integer' | 'float';

export type ConditionalOperator =
  | 'equals'
  | 'notEquals'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'lessThan'
  | 'lessThanOrEqual';

export interface FieldCondition {
  field: string;
  operator: ConditionalOperator;
  value: string | number | boolean;
}

export interface FieldConditional {
  conditions: FieldCondition[];
  logic: 'AND' | 'OR';
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  inputType?: string;
  placeholder?: string;
  defaultValue?: string | number | boolean | string[] | Date;
  required?: boolean;
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
  conditional?: FieldConditional;
}

export interface FormSection {
  id?: string;
  title?: string;
  description?: string;
  fields: FormField[];
}

export interface FormSpec {
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

export interface TemplateMetadata {
  lastModified: string;
  md5: string;
}

export type TemplateManifest = Record<string, TemplateMetadata>;
