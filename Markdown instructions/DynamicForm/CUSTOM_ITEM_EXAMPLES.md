# Custom Item Type Examples

Add these examples to your `DYNAMIC_FORM_BUILDER_SKILL.md` file to teach Claude about your specific products.

## Example 1: Metal Fabrication Parts

```markdown
### 8. Metal Fabrication Parts

**Typical fields:**
- Part type (brackets, frames, panels, structural)
- Dimensions (length, width, height, thickness)
- Material (steel, stainless steel, aluminum, brass, copper)
- Gauge/thickness
- Finish (powder coat, galvanized, polished, brushed)
- Welding requirements
- Quantity
- Tolerance specifications
- Technical drawings availability

**Example Form:**

```json-form
{
  "formId": "metal-fab-001",
  "itemType": "manufacturing",
  "title": "Metal Fabrication Specification",
  "description": "Specify your custom metal fabrication requirements",
  "sections": [
    {
      "id": "part-basics",
      "title": "Part Information",
      "fields": [
        {
          "id": "partType",
          "name": "partType",
          "label": "Part Type",
          "type": "select",
          "required": true,
          "options": [
            { "value": "bracket", "label": "Bracket" },
            { "value": "frame", "label": "Frame" },
            { "value": "panel", "label": "Panel" },
            { "value": "enclosure", "label": "Enclosure" },
            { "value": "structural", "label": "Structural Component" },
            { "value": "custom", "label": "Custom/Other" }
          ]
        },
        {
          "id": "partName",
          "name": "partName",
          "label": "Part Name/Description",
          "type": "input",
          "inputType": "text",
          "placeholder": "e.g., Mounting Bracket for Equipment Rack",
          "required": true
        }
      ]
    },
    {
      "id": "dimensions",
      "title": "Dimensions",
      "description": "Provide all dimensions in inches",
      "fields": [
        {
          "id": "length",
          "name": "length",
          "label": "Length",
          "type": "input",
          "inputType": "number",
          "required": true,
          "validation": {
            "min": 0.1,
            "max": 240
          },
          "helperText": "Overall length of the part"
        },
        {
          "id": "width",
          "name": "width",
          "label": "Width",
          "type": "input",
          "inputType": "number",
          "required": true
        },
        {
          "id": "height",
          "name": "height",
          "label": "Height/Depth",
          "type": "input",
          "inputType": "number",
          "required": true
        },
        {
          "id": "thickness",
          "name": "thickness",
          "label": "Material Thickness",
          "type": "select",
          "required": true,
          "options": [
            { "value": "18ga", "label": "18 Gauge (0.048\")" },
            { "value": "16ga", "label": "16 Gauge (0.060\")" },
            { "value": "14ga", "label": "14 Gauge (0.075\")" },
            { "value": "12ga", "label": "12 Gauge (0.105\")" },
            { "value": "11ga", "label": "11 Gauge (0.120\")" },
            { "value": "10ga", "label": "10 Gauge (0.135\")" },
            { "value": "1-8", "label": "1/8\" Plate" },
            { "value": "1-4", "label": "1/4\" Plate" },
            { "value": "3-8", "label": "3/8\" Plate" },
            { "value": "1-2", "label": "1/2\" Plate" },
            { "value": "custom", "label": "Custom Thickness" }
          ]
        }
      ]
    },
    {
      "id": "material",
      "title": "Material Specifications",
      "fields": [
        {
          "id": "material",
          "name": "material",
          "label": "Base Material",
          "type": "select",
          "required": true,
          "options": [
            { "value": "mild-steel", "label": "Mild Steel (A36)" },
            { "value": "stainless-304", "label": "Stainless Steel 304" },
            { "value": "stainless-316", "label": "Stainless Steel 316" },
            { "value": "aluminum-6061", "label": "Aluminum 6061" },
            { "value": "aluminum-5052", "label": "Aluminum 5052" },
            { "value": "brass", "label": "Brass" },
            { "value": "copper", "label": "Copper" }
          ]
        },
        {
          "id": "finish",
          "name": "finish",
          "label": "Finish/Coating",
          "type": "select",
          "required": true,
          "options": [
            { "value": "as-is", "label": "As-Is (No Finish)" },
            { "value": "powder-coat", "label": "Powder Coat" },
            { "value": "galvanized", "label": "Hot-Dip Galvanized" },
            { "value": "zinc-plated", "label": "Zinc Plated" },
            { "value": "anodized", "label": "Anodized (Aluminum Only)" },
            { "value": "polished", "label": "Polished" },
            { "value": "brushed", "label": "Brushed/Satin" },
            { "value": "painted", "label": "Industrial Paint" }
          ]
        },
        {
          "id": "finishColor",
          "name": "finishColor",
          "label": "Finish Color",
          "type": "input",
          "inputType": "text",
          "placeholder": "e.g., RAL 9005 Black, Custom color",
          "required": false,
          "conditional": {
            "field": "finish",
            "value": "powder-coat",
            "operator": "equals"
          }
        }
      ]
    },
    {
      "id": "fabrication",
      "title": "Fabrication Requirements",
      "fields": [
        {
          "id": "processes",
          "name": "processes",
          "label": "Required Processes",
          "type": "checkbox",
          "required": false,
          "options": [
            { "value": "cutting", "label": "Laser/Plasma Cutting" },
            { "value": "bending", "label": "Bending/Forming" },
            { "value": "welding", "label": "Welding" },
            { "value": "drilling", "label": "Drilling/Tapping" },
            { "value": "machining", "label": "CNC Machining" },
            { "value": "assembly", "label": "Assembly Required" }
          ]
        },
        {
          "id": "weldingType",
          "name": "weldingType",
          "label": "Welding Type",
          "type": "radio",
          "required": false,
          "options": [
            { "value": "mig", "label": "MIG Welding" },
            { "value": "tig", "label": "TIG Welding (Higher Quality)" },
            { "value": "spot", "label": "Spot Welding" }
          ],
          "conditional": {
            "field": "processes",
            "value": "welding",
            "operator": "contains"
          }
        },
        {
          "id": "tolerance",
          "name": "tolerance",
          "label": "Tolerance Requirements",
          "type": "radio",
          "required": true,
          "options": [
            { "value": "standard", "label": "Standard (±1/16\")" },
            { "value": "precision", "label": "Precision (±0.010\")" },
            { "value": "tight", "label": "Tight Tolerance (±0.005\")" }
          ]
        }
      ]
    },
    {
      "id": "drawings",
      "title": "Technical Documentation",
      "fields": [
        {
          "id": "hasDrawings",
          "name": "hasDrawings",
          "label": "Do you have technical drawings?",
          "type": "switch",
          "defaultValue": false,
          "required": false
        },
        {
          "id": "drawingFormat",
          "name": "drawingFormat",
          "label": "Drawing Format",
          "type": "checkbox",
          "required": false,
          "options": [
            { "value": "pdf", "label": "PDF" },
            { "value": "dwg", "label": "AutoCAD (DWG)" },
            { "value": "dxf", "label": "DXF" },
            { "value": "step", "label": "STEP (3D)" },
            { "value": "solidworks", "label": "SolidWorks" }
          ],
          "conditional": {
            "field": "hasDrawings",
            "value": "true",
            "operator": "equals"
          },
          "helperText": "Select all formats you can provide"
        },
        {
          "id": "drawingNotes",
          "name": "drawingNotes",
          "label": "Additional Specifications",
          "type": "textarea",
          "placeholder": "Any special requirements, notes, or details not captured above...",
          "rows": 4,
          "required": false
        }
      ]
    },
    {
      "id": "order-details",
      "title": "Order Information",
      "fields": [
        {
          "id": "quantity",
          "name": "quantity",
          "label": "Quantity",
          "type": "input",
          "inputType": "number",
          "defaultValue": "1",
          "required": true,
          "validation": {
            "min": 1,
            "max": 10000
          },
          "helperText": "Pricing varies with quantity"
        },
        {
          "id": "timeline",
          "name": "timeline",
          "label": "Required Delivery Date",
          "type": "date",
          "required": false
        },
        {
          "id": "budgetRange",
          "name": "budgetRange",
          "label": "Budget Range",
          "type": "select",
          "required": false,
          "options": [
            { "value": "under-500", "label": "Under $500" },
            { "value": "500-1000", "label": "$500 - $1,000" },
            { "value": "1000-5000", "label": "$1,000 - $5,000" },
            { "value": "5000-10000", "label": "$5,000 - $10,000" },
            { "value": "over-10000", "label": "Over $10,000" }
          ]
        }
      ]
    }
  ],
  "submitButton": {
    "text": "Request Fabrication Quote",
    "action": "generate-quote"
  }
}
```
```

## Example 2: Vinyl Decals/Graphics

```json-form
{
  "formId": "vinyl-decal-001",
  "itemType": "signage",
  "title": "Custom Vinyl Decal Specification",
  "description": "Design your custom vinyl graphics",
  "sections": [
    {
      "id": "decal-type",
      "title": "Decal Type",
      "fields": [
        {
          "id": "applicationType",
          "name": "applicationType",
          "label": "Application Type",
          "type": "radio",
          "required": true,
          "options": [
            { "value": "vehicle", "label": "Vehicle Wrap/Decal" },
            { "value": "window", "label": "Window Graphics" },
            { "value": "wall", "label": "Wall Decal" },
            { "value": "floor", "label": "Floor Graphics" },
            { "value": "equipment", "label": "Equipment/Machinery" }
          ]
        },
        {
          "id": "vinylType",
          "name": "vinylType",
          "label": "Vinyl Type",
          "type": "select",
          "required": true,
          "options": [
            { "value": "calendared", "label": "Calendared (Short-term, 3-5 years)" },
            { "value": "cast", "label": "Cast (Long-term, 7-10 years)" },
            { "value": "reflective", "label": "Reflective (Safety/Traffic)" },
            { "value": "perforated", "label": "Perforated (One-way vision)" },
            { "value": "magnetic", "label": "Magnetic" }
          ]
        }
      ]
    },
    {
      "id": "dimensions",
      "title": "Size & Quantity",
      "fields": [
        {
          "id": "width",
          "name": "width",
          "label": "Width",
          "type": "input",
          "inputType": "number",
          "required": true,
          "helperText": "Width in inches"
        },
        {
          "id": "height",
          "name": "height",
          "label": "Height",
          "type": "input",
          "inputType": "number",
          "required": true,
          "helperText": "Height in inches"
        },
        {
          "id": "quantity",
          "name": "quantity",
          "label": "Quantity",
          "type": "slider",
          "min": 1,
          "max": 100,
          "step": 1,
          "defaultValue": 1,
          "required": true
        }
      ]
    },
    {
      "id": "design",
      "title": "Design Details",
      "fields": [
        {
          "id": "hasDesign",
          "name": "hasDesign",
          "label": "I have my own design",
          "type": "switch",
          "defaultValue": false,
          "required": false
        },
        {
          "id": "colors",
          "name": "colors",
          "label": "Number of Colors",
          "type": "slider",
          "min": 1,
          "max": 8,
          "step": 1,
          "defaultValue": 2,
          "required": true,
          "helperText": "More colors may increase cost"
        },
        {
          "id": "colorList",
          "name": "colorList",
          "label": "Specify Colors",
          "type": "textarea",
          "placeholder": "List your colors (e.g., Red, Blue, White) or provide Pantone codes",
          "rows": 3,
          "required": true
        },
        {
          "id": "lamination",
          "name": "lamination",
          "label": "Add Protective Laminate?",
          "type": "switch",
          "defaultValue": false,
          "required": false,
          "helperText": "Recommended for outdoor use and durability"
        }
      ]
    },
    {
      "id": "installation",
      "title": "Installation",
      "fields": [
        {
          "id": "installationNeeded",
          "name": "installationNeeded",
          "label": "Professional Installation Required?",
          "type": "switch",
          "defaultValue": false,
          "required": false
        },
        {
          "id": "location",
          "name": "location",
          "label": "Installation Location",
          "type": "input",
          "inputType": "text",
          "placeholder": "City, State",
          "required": false,
          "conditional": {
            "field": "installationNeeded",
            "value": "true",
            "operator": "equals"
          }
        },
        {
          "id": "notes",
          "name": "notes",
          "label": "Additional Notes",
          "type": "textarea",
          "placeholder": "Any special requirements or questions...",
          "rows": 3,
          "required": false
        }
      ]
    }
  ],
  "submitButton": {
    "text": "Get Vinyl Decal Quote",
    "action": "generate-quote"
  }
}
```

## Example 3: Woodworking/Carpentry

```json-form
{
  "formId": "woodwork-001",
  "itemType": "furniture",
  "title": "Custom Woodworking Project",
  "description": "Specify your custom wood project requirements",
  "sections": [
    {
      "id": "project-type",
      "title": "Project Type",
      "fields": [
        {
          "id": "projectType",
          "name": "projectType",
          "label": "What are you building?",
          "type": "select",
          "required": true,
          "options": [
            { "value": "furniture", "label": "Furniture (Table, Chair, etc.)" },
            { "value": "cabinet", "label": "Cabinetry" },
            { "value": "shelving", "label": "Shelving/Storage" },
            { "value": "trim", "label": "Trim/Molding" },
            { "value": "deck", "label": "Deck/Outdoor Structure" },
            { "value": "doors", "label": "Custom Doors" },
            { "value": "other", "label": "Other Custom Woodwork" }
          ]
        },
        {
          "id": "projectDescription",
          "name": "projectDescription",
          "label": "Project Description",
          "type": "textarea",
          "placeholder": "Describe what you want built...",
          "rows": 4,
          "required": true
        }
      ]
    },
    {
      "id": "dimensions",
      "title": "Dimensions",
      "description": "Provide measurements in inches",
      "fields": [
        {
          "id": "length",
          "name": "length",
          "label": "Length",
          "type": "input",
          "inputType": "number",
          "required": true
        },
        {
          "id": "width",
          "name": "width",
          "label": "Width",
          "type": "input",
          "inputType": "number",
          "required": true
        },
        {
          "id": "height",
          "name": "height",
          "label": "Height",
          "type": "input",
          "inputType": "number",
          "required": true
        }
      ]
    },
    {
      "id": "wood-selection",
      "title": "Wood Selection",
      "fields": [
        {
          "id": "woodType",
          "name": "woodType",
          "label": "Wood Species",
          "type": "select",
          "required": true,
          "options": [
            { "value": "oak-red", "label": "Red Oak" },
            { "value": "oak-white", "label": "White Oak" },
            { "value": "maple", "label": "Maple" },
            { "value": "cherry", "label": "Cherry" },
            { "value": "walnut", "label": "Walnut" },
            { "value": "mahogany", "label": "Mahogany" },
            { "value": "pine", "label": "Pine" },
            { "value": "cedar", "label": "Cedar" },
            { "value": "poplar", "label": "Poplar" },
            { "value": "birch", "label": "Birch" },
            { "value": "ash", "label": "Ash" },
            { "value": "plywood", "label": "Plywood/MDF" },
            { "value": "reclaimed", "label": "Reclaimed Wood" }
          ],
          "helperText": "Wood choice affects both appearance and cost"
        },
        {
          "id": "gradeQuality",
          "name": "gradeQuality",
          "label": "Wood Grade/Quality",
          "type": "radio",
          "required": true,
          "options": [
            { "value": "select", "label": "Select Grade (Highest Quality)" },
            { "value": "common", "label": "Common Grade (Character Marks)" },
            { "value": "rustic", "label": "Rustic (More Knots/Character)" }
          ]
        }
      ]
    },
    {
      "id": "finish",
      "title": "Finish & Details",
      "fields": [
        {
          "id": "finishType",
          "name": "finishType",
          "label": "Finish Type",
          "type": "select",
          "required": true,
          "options": [
            { "value": "natural-stain", "label": "Natural/Clear Stain" },
            { "value": "dark-stain", "label": "Dark Stain" },
            { "value": "medium-stain", "label": "Medium Stain" },
            { "value": "painted", "label": "Painted" },
            { "value": "whitewash", "label": "Whitewash/Pickled" },
            { "value": "oil", "label": "Natural Oil Finish" },
            { "value": "lacquer", "label": "Lacquer" },
            { "value": "unfinished", "label": "Unfinished" }
          ]
        },
        {
          "id": "paintColor",
          "name": "paintColor",
          "label": "Paint Color",
          "type": "input",
          "inputType": "text",
          "placeholder": "e.g., Sherwin Williams SW 7005",
          "required": false,
          "conditional": {
            "field": "finishType",
            "value": "painted",
            "operator": "equals"
          }
        },
        {
          "id": "edgeProfile",
          "name": "edgeProfile",
          "label": "Edge Profile",
          "type": "radio",
          "required": true,
          "options": [
            { "value": "square", "label": "Square Edge" },
            { "value": "rounded", "label": "Rounded Edge" },
            { "value": "beveled", "label": "Beveled Edge" },
            { "value": "ogee", "label": "Ogee (Decorative)" },
            { "value": "live-edge", "label": "Live Edge (Natural)" }
          ]
        }
      ]
    },
    {
      "id": "construction",
      "title": "Construction Details",
      "fields": [
        {
          "id": "joinery",
          "name": "joinery",
          "label": "Joinery Type",
          "type": "radio",
          "required": true,
          "options": [
            { "value": "standard", "label": "Standard Construction" },
            { "value": "mortise-tenon", "label": "Mortise & Tenon (Traditional)" },
            { "value": "dovetail", "label": "Dovetail Joints" },
            { "value": "biscuit", "label": "Biscuit Joints" }
          ],
          "helperText": "Higher quality joinery increases durability and cost"
        },
        {
          "id": "features",
          "name": "features",
          "label": "Additional Features",
          "type": "checkbox",
          "required": false,
          "options": [
            { "value": "drawers", "label": "Include Drawers" },
            { "value": "shelves", "label": "Include Shelves" },
            { "value": "doors", "label": "Include Doors" },
            { "value": "hardware", "label": "Premium Hardware" },
            { "value": "glass", "label": "Glass Inserts" },
            { "value": "lighting", "label": "Built-in Lighting" }
          ]
        }
      ]
    },
    {
      "id": "delivery",
      "title": "Delivery & Installation",
      "fields": [
        {
          "id": "deliveryNeeded",
          "name": "deliveryNeeded",
          "label": "Delivery Service Required?",
          "type": "switch",
          "defaultValue": false,
          "required": false
        },
        {
          "id": "installationNeeded",
          "name": "installationNeeded",
          "label": "Installation Service Required?",
          "type": "switch",
          "defaultValue": false,
          "required": false
        },
        {
          "id": "timeline",
          "name": "timeline",
          "label": "When do you need this completed?",
          "type": "date",
          "required": false
        },
        {
          "id": "additionalNotes",
          "name": "additionalNotes",
          "label": "Additional Notes or Requirements",
          "type": "textarea",
          "placeholder": "Any special considerations, matching existing pieces, etc.",
          "rows": 4,
          "required": false
        }
      ]
    }
  ],
  "submitButton": {
    "text": "Request Woodworking Quote",
    "action": "generate-quote"
  }
}
```

## Tips for Adding Your Own Item Types

### 1. Identify Core Dimensions
Every physical item needs dimensions. Start with the basic measurements.

### 2. Material Options
List all materials you work with, organized by quality/price tiers.

### 3. Finish/Appearance
Include color, texture, and protective coating options.

### 4. Functional Features
What optional features or add-ons can customers choose?

### 5. Installation/Delivery
Does the item require professional installation or delivery services?

### 6. Technical Requirements
Include any technical specs, tolerances, or compliance needs.

### 7. Quantity & Timeline
Always include quantity and deadline fields.

### 8. Budget Context
Optional but helpful for scoping the project appropriately.

## Form Design Best Practices

1. **Start Simple** - Basic info first, details later
2. **Use Sections** - Group related fields logically
3. **Provide Defaults** - Set common values to speed up entry
4. **Add Helper Text** - Explain technical terms
5. **Use Conditionals** - Only show relevant fields
6. **Validate Inputs** - Catch errors early
7. **Mobile-Friendly** - Keep labels short and clear
8. **Progressive Disclosure** - Don't overwhelm with too many fields at once

Add these examples to your skill file and Claude will be able to generate forms for these specific item types!
