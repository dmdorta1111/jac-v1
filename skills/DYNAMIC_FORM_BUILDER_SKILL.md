---
name: dynamic-form-builder
description: This skill enables Claude to dynamically generate form specifications within chat conversations based on the type of item or project the user wants to build. Instead of providing text responses, Claude will output structured JSON that the frontend can render as interactive form components.
---

## Core Concept
When a user indicates they want to build, quote, or configure an item, Claude should:
1. Identify the item type from the conversation
2. Generate a comprehensive form specification in JSON format
3. Include all necessary fields with proper validation
4. Group related fields logically
5. Provide helpful descriptions and placeholder text

## Available UI Components

The following components are available in the `@/components/ui` folder:

- **Input** - Text, number, email, etc.
- **Textarea** - Multi-line text input
- **Select** (Dropdown) - Single selection from options
- **Checkbox** - Boolean or multiple selections
- **RadioGroup** - Single selection from multiple options
- **Slider** - Numeric input with range
- **DatePicker** - Date selection
- **Switch** - Toggle on/off
- **Integer** - Whole number input with validation
- **Float** - Decimal number input (max 2 decimal places)
- **Table** - Data table display (editable or read-only)
- **Label** - Field labels
- **Button** - Form submission and actions

## Item Types and Their Forms

### 1. Custom Furniture/Cabinetry
**Typical fields:**
- Dimensions (length, width, height, depth)
- Material type (wood, metal, glass, composite)
- Finish/color
- Hardware specifications
- Quantity
- Installation requirements
- Special features (drawers, shelves, doors)

### 2. Signage
**Typical fields:**
- Sign type (outdoor, indoor, illuminated, monument)
- Dimensions (length, width, height)
- Material (aluminum, acrylic, wood, vinyl)
- Mounting type (wall, ground, hanging)
- Illumination (LED, backlit, non-illuminated)
- Text/graphics specifications
- Quantity
- Installation location

### 3. Architectural Elements
**Typical fields:**
- Element type (columns, railings, decorative panels)
- Dimensions
- Material specifications
- Load-bearing requirements
- Finish/coating
- Installation method
- Building code compliance needs

### 4. Manufacturing/CNC Parts
**Typical fields:**
- Part type
- Dimensions (with tight tolerances)
- Material specification
- Surface finish requirements
- Quantity
- Tolerance requirements
- 3D file/drawing availability

### 5. Web Development Projects
**Typical fields:**
- Project type (e-commerce, portfolio, SaaS, etc.)
- Number of pages
- Features required (authentication, payment, API integration)
- Design requirements
- Timeline
- Budget range
- Hosting preferences

### 6. Consulting Services
**Typical fields:**
- Service type
- Duration (hours, days, ongoing)
- Deliverables expected
- Industry/specialization
- Timeline
- Budget range

## Form Generation Rules

### When to Generate a Form

Generate a form specification when the user:
- Says they want to "build", "create", "quote", "configure", or "design" something
- Asks about pricing for a specific item type
- Mentions they need specifications for a project
- Indicates they want to start a new project/item

### Form JSON Structure

Always output forms using this exact JSON structure wrapped in a code block with `json-form` language identifier:

```json-form
{
  "formId": "unique-form-id",
  "itemType": "furniture|signage|architectural|manufacturing|web-development|consulting|custom",
  "title": "Human-readable form title",
  "description": "Brief description of what this form collects",
  "sections": [
    {
      "id": "section-1",
      "title": "Section Title",
      "description": "Optional section description",
      "fields": [
        {
          "id": "field-1",
          "name": "fieldName",
          "label": "Field Label",
          "type": "input|textarea|select|checkbox|radio|slider|date|switch|integer|float|table",
          "inputType": "text|number|email|tel|url",
          "placeholder": "Placeholder text",
          "defaultValue": "",
          "required": true,
          "validation": {
            "min": 0,
            "max": 1000,
            "pattern": "regex-pattern",
            "message": "Validation error message"
          },
          "options": [
            { "value": "option1", "label": "Option 1" },
            { "value": "option2", "label": "Option 2" }
          ],
          "helperText": "Additional guidance for the user",
          "conditional": {
            "field": "other-field-id",
            "value": "required-value",
            "operator": "equals|notEquals|contains|greaterThan|lessThan"
          }
        }
      ]
    }
  ],
  "submitButton": {
    "text": "Generate Quote",
    "action": "generate-quote"
  }
}
```

### Field Types Mapping

**Input (type: "input")**
```json
{
  "type": "input",
  "inputType": "text|number|email|tel|url",
  "placeholder": "Enter value...",
  "required": true
}
```

**Textarea (type: "textarea")**
```json
{
  "type": "textarea",
  "placeholder": "Enter detailed description...",
  "rows": 4,
  "required": false
}
```

**Select/Dropdown (type: "select")**
```json
{
  "type": "select",
  "options": [
    { "value": "oak", "label": "Oak Wood" },
    { "value": "maple", "label": "Maple Wood" }
  ],
  "required": true
}
```

**Checkbox (type: "checkbox")**
```json
{
  "type": "checkbox",
  "options": [
    { "value": "feature1", "label": "Include Feature 1" },
    { "value": "feature2", "label": "Include Feature 2" }
  ],
  "required": false
}
```

**Radio Group (type: "radio")**
```json
{
  "type": "radio",
  "options": [
    { "value": "indoor", "label": "Indoor Installation" },
    { "value": "outdoor", "label": "Outdoor Installation" }
  ],
  "required": true
}
```

**Slider (type: "slider")**
```json
{
  "type": "slider",
  "min": 0,
  "max": 100,
  "step": 1,
  "defaultValue": 50,
  "unit": "inches",
  "required": true
}
```

**Date Picker (type: "date")**
```json
{
  "type": "date",
  "minDate": "2024-01-01",
  "maxDate": "2025-12-31",
  "required": true
}
```

**Switch (type: "switch")**
```json
{
  "type": "switch",
  "label": "Enable this feature",
  "defaultValue": false,
  "required": false
}
```

**Integer (type: "integer")**
```json
{
  "type": "integer",
  "placeholder": "Enter a whole number",
  "required": true,
  "validation": {
    "min": 1,
    "max": 1000,
    "message": "Must be between 1 and 1000"
  },
  "helperText": "Only whole numbers allowed"
}
```

**Float (type: "float")**
```json
{
  "type": "float",
  "placeholder": "Enter a decimal number",
  "required": true,
  "validation": {
    "min": 0.01,
    "max": 999.99,
    "message": "Must be between 0.01 and 999.99"
  },
  "helperText": "Up to 2 decimal places"
}
```

**Table (type: "table")**
```json
{
  "type": "table",
  "columns": [
    { "key": "item", "label": "Item" },
    { "key": "quantity", "label": "Quantity" },
    { "key": "price", "label": "Price" }
  ],
  "tableData": [
    { "item": "Product A", "quantity": "5", "price": "$50.00" },
    { "item": "Product B", "quantity": "3", "price": "$30.00" }
  ],
  "editable": false,
  "required": false,
  "helperText": "Review the items below"
}
```

## Example Form Generations

### Example 1: Custom Cabinet Quote

**User:** "I need a quote for a custom cabinet"

**Claude Response:**

I'll help you get a quote for a custom cabinet. Please fill out the specifications below:

```json-form
{
  "formId": "cabinet-quote-001",
  "itemType": "furniture",
  "title": "Custom Cabinet Specification",
  "description": "Provide the details for your custom cabinet to receive an accurate quote",
  "sections": [
    {
      "id": "dimensions",
      "title": "Dimensions",
      "description": "All measurements in inches",
      "fields": [
        {
          "id": "length",
          "name": "length",
          "label": "Length (Width)",
          "type": "input",
          "inputType": "number",
          "placeholder": "48",
          "required": true,
          "validation": {
            "min": 12,
            "max": 120,
            "message": "Length must be between 12 and 120 inches"
          },
          "helperText": "The width of the cabinet face"
        },
        {
          "id": "height",
          "name": "height",
          "label": "Height",
          "type": "input",
          "inputType": "number",
          "placeholder": "36",
          "required": true,
          "validation": {
            "min": 12,
            "max": 96,
            "message": "Height must be between 12 and 96 inches"
          }
        },
        {
          "id": "depth",
          "name": "depth",
          "label": "Depth",
          "type": "input",
          "inputType": "number",
          "placeholder": "24",
          "required": true,
          "validation": {
            "min": 6,
            "max": 48,
            "message": "Depth must be between 6 and 48 inches"
          }
        }
      ]
    },
    {
      "id": "materials",
      "title": "Materials & Finish",
      "fields": [
        {
          "id": "material",
          "name": "material",
          "label": "Cabinet Material",
          "type": "select",
          "required": true,
          "options": [
            { "value": "oak", "label": "Oak" },
            { "value": "maple", "label": "Maple" },
            { "value": "cherry", "label": "Cherry" },
            { "value": "walnut", "label": "Walnut" },
            { "value": "birch", "label": "Birch" },
            { "value": "mdf", "label": "MDF (Medium Density Fiberboard)" },
            { "value": "plywood", "label": "Plywood" }
          ]
        },
        {
          "id": "finish",
          "name": "finish",
          "label": "Finish Type",
          "type": "select",
          "required": true,
          "options": [
            { "value": "stain-natural", "label": "Natural Stain" },
            { "value": "stain-dark", "label": "Dark Stain" },
            { "value": "stain-medium", "label": "Medium Stain" },
            { "value": "paint-white", "label": "White Paint" },
            { "value": "paint-custom", "label": "Custom Paint Color" },
            { "value": "unfinished", "label": "Unfinished" }
          ]
        },
        {
          "id": "customColor",
          "name": "customColor",
          "label": "Custom Paint Color",
          "type": "input",
          "inputType": "text",
          "placeholder": "e.g., Sherwin Williams SW 7005",
          "required": false,
          "conditional": {
            "field": "finish",
            "value": "paint-custom",
            "operator": "equals"
          }
        }
      ]
    },
    {
      "id": "features",
      "title": "Cabinet Features",
      "fields": [
        {
          "id": "doorStyle",
          "name": "doorStyle",
          "label": "Door Style",
          "type": "radio",
          "required": true,
          "options": [
            { "value": "shaker", "label": "Shaker Style" },
            { "value": "flat-panel", "label": "Flat Panel" },
            { "value": "raised-panel", "label": "Raised Panel" },
            { "value": "glass", "label": "Glass Front" },
            { "value": "no-doors", "label": "Open Shelving (No Doors)" }
          ]
        },
        {
          "id": "shelves",
          "name": "shelves",
          "label": "Number of Shelves",
          "type": "slider",
          "min": 0,
          "max": 10,
          "step": 1,
          "defaultValue": 2,
          "required": true,
          "helperText": "Adjustable shelves inside the cabinet"
        },
        {
          "id": "drawers",
          "name": "drawers",
          "label": "Number of Drawers",
          "type": "slider",
          "min": 0,
          "max": 6,
          "step": 1,
          "defaultValue": 0,
          "required": true
        },
        {
          "id": "hardware",
          "name": "hardware",
          "label": "Hardware Finish",
          "type": "select",
          "required": true,
          "options": [
            { "value": "brushed-nickel", "label": "Brushed Nickel" },
            { "value": "oil-rubbed-bronze", "label": "Oil-Rubbed Bronze" },
            { "value": "chrome", "label": "Chrome" },
            { "value": "brass", "label": "Brass" },
            { "value": "black", "label": "Matte Black" }
          ]
        },
        {
          "id": "additionalFeatures",
          "name": "additionalFeatures",
          "label": "Additional Features",
          "type": "checkbox",
          "required": false,
          "options": [
            { "value": "soft-close", "label": "Soft-Close Hinges" },
            { "value": "lighting", "label": "Interior LED Lighting" },
            { "value": "pull-out-shelves", "label": "Pull-Out Shelves" },
            { "value": "lazy-susan", "label": "Lazy Susan (Corner Cabinets)" }
          ]
        }
      ]
    },
    {
      "id": "project-details",
      "title": "Project Details",
      "fields": [
        {
          "id": "quantity",
          "name": "quantity",
          "label": "Quantity Needed",
          "type": "input",
          "inputType": "number",
          "placeholder": "1",
          "defaultValue": "1",
          "required": true,
          "validation": {
            "min": 1,
            "max": 100,
            "message": "Quantity must be between 1 and 100"
          }
        },
        {
          "id": "installation",
          "name": "installation",
          "label": "Installation Required?",
          "type": "switch",
          "defaultValue": false,
          "required": false,
          "helperText": "Toggle on if you need professional installation"
        },
        {
          "id": "timeline",
          "name": "timeline",
          "label": "Desired Completion Date",
          "type": "date",
          "required": false,
          "helperText": "When do you need this completed?"
        },
        {
          "id": "additionalNotes",
          "name": "additionalNotes",
          "label": "Additional Requirements or Notes",
          "type": "textarea",
          "placeholder": "Any special requirements, matching existing furniture, etc.",
          "rows": 4,
          "required": false
        }
      ]
    }
  ],
  "submitButton": {
    "text": "Generate Cabinet Quote",
    "action": "generate-quote"
  }
}
```

Once you complete the form, I'll generate a detailed quote with pricing and timeline.

### Example 2: Manufacturing Order with Advanced Field Types

**User:** "I need to order custom CNC-machined parts"

**Claude Response:**

I'll help you create an order for CNC-machined parts. Please provide the specifications:

```json-form
{
  "formId": "cnc-parts-order-001",
  "itemType": "manufacturing",
  "title": "CNC Parts Manufacturing Order",
  "description": "Specify your precision-machined parts requirements",
  "sections": [
    {
      "id": "part-specs",
      "title": "Part Specifications",
      "description": "Provide exact dimensions and quantities",
      "fields": [
        {
          "id": "partName",
          "name": "partName",
          "label": "Part Name/ID",
          "type": "input",
          "inputType": "text",
          "placeholder": "e.g., Bracket-A-001",
          "required": true,
          "helperText": "Internal part identifier"
        },
        {
          "id": "quantity",
          "name": "quantity",
          "label": "Quantity Required",
          "type": "integer",
          "placeholder": "100",
          "required": true,
          "validation": {
            "min": 1,
            "max": 10000,
            "message": "Quantity must be between 1 and 10,000"
          },
          "helperText": "Total number of parts needed"
        },
        {
          "id": "unitPrice",
          "name": "unitPrice",
          "label": "Target Unit Price ($)",
          "type": "float",
          "placeholder": "12.50",
          "required": false,
          "validation": {
            "min": 0.01,
            "max": 9999.99,
            "message": "Price must be between $0.01 and $9,999.99"
          },
          "helperText": "Optional budget per unit (2 decimal places max)"
        }
      ]
    },
    {
      "id": "dimensions",
      "title": "Dimensional Requirements",
      "description": "All measurements in millimeters",
      "fields": [
        {
          "id": "dimensionsTable",
          "name": "dimensionsTable",
          "label": "Critical Dimensions",
          "type": "table",
          "columns": [
            { "key": "dimension", "label": "Dimension" },
            { "key": "nominal", "label": "Nominal (mm)" },
            { "key": "tolerance", "label": "Tolerance (±)" }
          ],
          "tableData": [
            { "dimension": "Length", "nominal": "100.00", "tolerance": "0.05" },
            { "dimension": "Width", "nominal": "50.00", "tolerance": "0.05" },
            { "dimension": "Height", "nominal": "25.00", "tolerance": "0.02" },
            { "dimension": "Hole Diameter", "nominal": "6.00", "tolerance": "0.01" }
          ],
          "editable": false,
          "required": false,
          "helperText": "Reference dimensions with tolerances"
        }
      ]
    },
    {
      "id": "material-finish",
      "title": "Material & Finish",
      "fields": [
        {
          "id": "material",
          "name": "material",
          "label": "Material Type",
          "type": "select",
          "required": true,
          "options": [
            { "value": "aluminum-6061", "label": "Aluminum 6061-T6" },
            { "value": "aluminum-7075", "label": "Aluminum 7075-T6" },
            { "value": "steel-1018", "label": "Steel 1018" },
            { "value": "steel-4140", "label": "Steel 4140" },
            { "value": "stainless-304", "label": "Stainless Steel 304" },
            { "value": "stainless-316", "label": "Stainless Steel 316" },
            { "value": "brass", "label": "Brass" },
            { "value": "copper", "label": "Copper" }
          ]
        },
        {
          "id": "surfaceFinish",
          "name": "surfaceFinish",
          "label": "Surface Finish",
          "type": "radio",
          "required": true,
          "options": [
            { "value": "as-machined", "label": "As-Machined" },
            { "value": "bead-blast", "label": "Bead Blasted" },
            { "value": "anodized", "label": "Anodized (Type II)" },
            { "value": "powder-coat", "label": "Powder Coated" },
            { "value": "electropolish", "label": "Electropolished" }
          ]
        },
        {
          "id": "threadedHoles",
          "name": "threadedHoles",
          "label": "Number of Threaded Holes",
          "type": "integer",
          "placeholder": "4",
          "defaultValue": 0,
          "required": false,
          "validation": {
            "min": 0,
            "max": 50
          },
          "helperText": "Total count of tapped holes"
        }
      ]
    },
    {
      "id": "delivery",
      "title": "Delivery Requirements",
      "fields": [
        {
          "id": "rushOrder",
          "name": "rushOrder",
          "label": "Rush Order (Expedited Production)",
          "type": "switch",
          "defaultValue": false,
          "required": false,
          "helperText": "Additional charges may apply"
        },
        {
          "id": "deliveryDate",
          "name": "deliveryDate",
          "label": "Required Delivery Date",
          "type": "date",
          "required": true,
          "helperText": "When do you need these parts?"
        },
        {
          "id": "inspectionLevel",
          "name": "inspectionLevel",
          "label": "Quality Inspection Level",
          "type": "radio",
          "required": true,
          "options": [
            { "value": "standard", "label": "Standard (Visual + Dimensional Spot Check)" },
            { "value": "full", "label": "Full First Article Inspection (FAI)" },
            { "value": "cmm", "label": "CMM Report Required" }
          ],
          "helperText": "Select inspection requirements"
        },
        {
          "id": "specialInstructions",
          "name": "specialInstructions",
          "label": "Special Instructions",
          "type": "textarea",
          "placeholder": "Any special handling, packaging, or certification requirements...",
          "rows": 3,
          "required": false
        }
      ]
    }
  ],
  "submitButton": {
    "text": "Submit Parts Order",
    "action": "generate-quote"
  }
}
```

This form demonstrates the new field types:
- **Integer field** for quantity and threaded holes (whole numbers only)
- **Float field** for unit price (up to 2 decimal places)
- **Table field** for displaying critical dimensions with tolerances

## Response Guidelines

1. **Always introduce the form** - Tell the user what information you need and why
2. **Use clear field names** - Make labels and descriptions user-friendly
3. **Provide helper text** - Guide users on what to enter
4. **Set appropriate validation** - Prevent invalid data entry
5. **Group related fields** - Use sections to organize the form logically
6. **Make smart defaults** - Pre-fill common values when appropriate
7. **Use conditional fields** - Show/hide fields based on other selections
8. **Keep forms focused** - Only ask for information necessary for the quote/item

## After Form Submission

Once the user submits the form, Claude should:
1. Acknowledge receipt of the information
2. Summarize the key specifications
3. Ask any clarifying questions if needed
4. Generate the markdown documentation with all collected data
5. Provide next steps (quote generation, timeline, etc.)

## Important Notes

- **Always use the `json-form` code block identifier** for the frontend to recognize and render the form
- **Validate that all required fields are marked correctly**
- **Use appropriate field types** for the data being collected (don't use text input for dates, etc.)
- **Consider mobile users** - keep forms scannable and not too long
- **Test conditional logic** - ensure dependent fields reference the correct parent field IDs
- **Provide units** - always specify measurement units (inches, feet, meters, etc.)

## Custom Item Types

If the user requests a quote for an item type not listed above, use your best judgment to:
1. Identify the key dimensions and specifications needed
2. Determine appropriate material options
3. Consider installation/delivery requirements
4. Include quantity and timeline fields
5. Add a notes field for special requirements

Always err on the side of collecting more information rather than less - it's easier to ignore extra data than to follow up for missing information.
