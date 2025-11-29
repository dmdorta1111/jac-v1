---
formId: seconary-lock-options
source: SDI/seconary_lock_options.tab
---
# Seconary Lock Options

Form specification with 4 configuration fields.

```json-form
{
  "formId": "seconary-lock-options",
  "itemType": "custom",
  "title": "Seconary Lock Options",
  "description": "Configuration parameters for seconary lock options",
  "sections": [
    {
      "id": "seconary-lock-options-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "seconary-lock-options-strike-center",
          "name": "STRIKE_CENTER",
          "label": "Strike Center",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "seconary-lock-options-primary-strike-center",
          "name": "PRIMARY_STRIKE_CENTER",
          "label": "Primary Strike Center",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "seconary-lock-options-lock-type",
          "name": "LOCK_TYPE",
          "label": "Lock Type",
          "type": "select",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "NONE"
            },
            {
              "value": 1,
              "label": "CYLINDER"
            },
            {
              "value": 2,
              "label": "MORTISE"
            },
            {
              "value": 3,
              "label": "EXIT DEVICE"
            },
            {
              "value": 4,
              "label": "HOSPITAL LATCH"
            },
            {
              "value": 5,
              "label": "ROLLER"
            },
            {
              "value": 6,
              "label": "OTHER"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "LOCK",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "seconary-lock-options-strike-type",
          "name": "STRIKE_TYPE",
          "label": "Strike Type",
          "type": "select",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "NONE"
            },
            {
              "value": 1,
              "label": "ASA 2-3/4"
            },
            {
              "value": 2,
              "label": "ASA 4-7/8"
            },
            {
              "value": 3,
              "label": "DB 2-3/4"
            },
            {
              "value": 4,
              "label": "DB 3-1/2"
            },
            {
              "value": 5,
              "label": "DB 4-7/8"
            },
            {
              "value": 6,
              "label": "ELECTRIC"
            },
            {
              "value": 7,
              "label": "OTHER"
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
