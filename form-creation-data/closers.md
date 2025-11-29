---
formId: closers
source: SDI/closers.tab
---
# Closers

Form specification with 7 configuration fields.

```json-form
{
  "formId": "closers",
  "itemType": "custom",
  "title": "Closers",
  "description": "Configuration parameters for closers",
  "sections": [
    {
      "id": "closers-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "closers-closer-model",
          "name": "CLOSER_MODEL",
          "label": "Closer Model",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "CLOSER_TYPE",
                "operator": "notEquals",
                "value": 0
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "closers-surface-closer-length",
          "name": "SURFACE_CLOSER_LENGTH",
          "label": "Surface Closer Length",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "CLOSER_TYPE",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "closers-surface-closer-width",
          "name": "SURFACE_CLOSER_WIDTH",
          "label": "Surface Closer Width",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "CLOSER_TYPE",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "closers-concealed-closer-manufacturer",
          "name": "CONCEALED_CLOSER_MANUFACTURER",
          "label": "Concealed Closer Manufacturer",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "CLOSER_TYPE",
                "operator": "equals",
                "value": 2
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "closers-concealed-closer-model-number",
          "name": "CONCEALED_CLOSER_MODEL_NUMBER",
          "label": "Concealed Closer Model Number",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "CLOSER_TYPE",
                "operator": "equals",
                "value": 2
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "closers-equal-closers",
          "name": "EQUAL_CLOSERS",
          "label": "Equal Closers",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "P"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "closers-closer-type",
          "name": "CLOSER_TYPE",
          "label": "Closer Type",
          "type": "select",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "NONE"
            },
            {
              "value": 1,
              "label": "SURFACE"
            },
            {
              "value": 2,
              "label": "CONCEALED"
            }
          ]
        }
      ]
    }
  ],
  "submitButton": {
    "text": "Save Configuration",
    "action": "save-config"
  }
}
```
