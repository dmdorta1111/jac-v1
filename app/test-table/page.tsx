'use client';

import { useState } from 'react';
import DynamicFormRenderer from '@/components/DynamicFormRenderer';

// Local type definition (not exported from DynamicFormRenderer)
type FormFieldValue = string | number | boolean | (string | number)[] | Date | Record<string, string | number> | undefined;

// Test form spec with multiple table fields and scenarios
const testFormSpec = {
  formId: 'test-table-selection',
  itemType: 'test',
  title: 'Table Row Selection Test Form',
  description: 'Testing table field row selection functionality with various scenarios',
  sections: [
    {
      id: 'required-table',
      title: 'Required Table Field',
      description: 'Test required validation for table fields',
      fields: [
        {
          id: 'requiredTable',
          name: 'requiredTable',
          label: 'Select a Product (Required)',
          type: 'table' as const,
          required: true,
          helperText: 'Click a row to select a product. This field is required.',
          columns: [
            { key: 'product', label: 'Product' },
            { key: 'sku', label: 'SKU' },
            { key: 'price', label: 'Price' },
            { key: 'stock', label: 'Stock' }
          ],
          tableData: [
            { product: 'Widget A', sku: 'WDG-001', price: '$29.99', stock: 150 },
            { product: 'Widget B', sku: 'WDG-002', price: '$39.99', stock: 75 },
            { product: 'Widget C', sku: 'WDG-003', price: '$49.99', stock: 200 },
            { product: 'Widget D', sku: 'WDG-004', price: '$59.99', stock: 50 }
          ]
        }
      ]
    },
    {
      id: 'optional-table',
      title: 'Optional Table Field',
      description: 'Test optional table field (not required)',
      fields: [
        {
          id: 'optionalTable',
          name: 'optionalTable',
          label: 'Select Shipping Method (Optional)',
          type: 'table' as const,
          required: false,
          helperText: 'Optional: Select a shipping method if needed',
          columns: [
            { key: 'method', label: 'Shipping Method' },
            { key: 'cost', label: 'Cost' },
            { key: 'time', label: 'Estimated Time' }
          ],
          tableData: [
            { method: 'Standard', cost: '$5.00', time: '5-7 days' },
            { method: 'Express', cost: '$15.00', time: '2-3 days' },
            { method: 'Overnight', cost: '$25.00', time: '1 day' }
          ]
        }
      ]
    },
    {
      id: 'empty-table',
      title: 'Empty Table Field',
      description: 'Test empty table display',
      fields: [
        {
          id: 'emptyTable',
          name: 'emptyTable',
          label: 'Empty Table Test',
          type: 'table' as const,
          required: false,
          helperText: 'This table has no data',
          columns: [
            { key: 'col1', label: 'Column 1' },
            { key: 'col2', label: 'Column 2' }
          ],
          tableData: []
        }
      ]
    },
    {
      id: 'dimensions',
      title: 'Engineering Dimensions',
      description: 'Table with numeric values',
      fields: [
        {
          id: 'dimensionsTable',
          name: 'dimensionsTable',
          label: 'Critical Dimensions',
          type: 'table' as const,
          required: false,
          helperText: 'Reference dimensions with tolerances',
          columns: [
            { key: 'dimension', label: 'Dimension' },
            { key: 'nominal', label: 'Nominal (mm)' },
            { key: 'tolerance', label: 'Tolerance (±)' }
          ],
          tableData: [
            { dimension: 'Length', nominal: 100.00, tolerance: 0.05 },
            { dimension: 'Width', nominal: 50.00, tolerance: 0.05 },
            { dimension: 'Height', nominal: 25.00, tolerance: 0.02 },
            { dimension: 'Hole Diameter', nominal: 6.00, tolerance: 0.01 }
          ]
        }
      ]
    },
    {
      id: 'other-fields',
      title: 'Other Field Types (Regression Test)',
      description: 'Ensure other field types still work correctly',
      fields: [
        {
          id: 'textInput',
          name: 'textInput',
          label: 'Text Input',
          type: 'input' as const,
          placeholder: 'Enter text here',
          required: true
        },
        {
          id: 'selectField',
          name: 'selectField',
          label: 'Select Field',
          type: 'select' as const,
          required: false,
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' }
          ]
        },
        {
          id: 'checkboxGroup',
          name: 'checkboxGroup',
          label: 'Checkbox Group',
          type: 'checkbox' as const,
          required: false,
          options: [
            { value: 'cb1', label: 'Checkbox 1' },
            { value: 'cb2', label: 'Checkbox 2' },
            { value: 'cb3', label: 'Checkbox 3' }
          ]
        }
      ]
    }
  ],
  submitButton: {
    text: 'Submit Test Form',
    action: 'test'
  }
};

export default function TestTablePage() {
  const [submittedData, setSubmittedData] = useState<Record<string, FormFieldValue> | null>(null);
  const [showForm, setShowForm] = useState(true);

  const handleSubmit = (data: Record<string, FormFieldValue>) => {
    console.log('Form submitted with data:', data);
    setSubmittedData(data);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const resetForm = () => {
    setSubmittedData(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold mb-4">Table Row Selection Test Page</h1>
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">Test Instructions:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click on any row in the required table - it should highlight with left border</li>
            <li>Try selecting different rows - previous selection should clear</li>
            <li>Use Tab key to navigate to table rows, then press Enter or Space to select</li>
            <li>Try submitting without selecting required table - should show validation error</li>
            <li>Select a row and submit - form data should contain row object</li>
            <li>Check empty table displays "No data available"</li>
            <li>Verify other field types (input, select, checkbox) still work correctly</li>
          </ol>
        </div>
      </div>

      {showForm ? (
        <DynamicFormRenderer
          formSpec={testFormSpec}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      ) : (
        <div className="max-w-3xl mx-auto text-center">
          <p className="mb-4">Form cancelled</p>
          <button
            onClick={resetForm}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Reset Form
          </button>
        </div>
      )}

      {submittedData && (
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-green-800 dark:text-green-200">
            ✅ Form Submitted Successfully!
          </h2>
          <div className="bg-white dark:bg-zinc-900 rounded-md p-4 overflow-auto">
            <h3 className="font-semibold mb-2">Submitted Data:</h3>
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(submittedData, null, 2)}
            </pre>
          </div>
          <button
            onClick={resetForm}
            className="mt-4 px-4 py-2 bg-green-700 dark:bg-green-600 text-white rounded-md hover:bg-green-800 dark:hover:bg-green-700"
          >
            Reset Form
          </button>
        </div>
      )}
    </div>
  );
}
