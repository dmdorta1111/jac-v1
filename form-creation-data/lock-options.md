---
formId: lock-options
source: SDI/lock_options.tab
---
# Lock Options

Form specification with 15 configuration fields.

```json-form
{
  "formId": "lock-options",
  "itemType": "custom",
  "title": "Lock Options",
  "description": "Configuration parameters for lock options",
  "sections": [
    {
      "id": "lock-options-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "lock-options-strike-center",
          "name": "STRIKE_CENTER",
          "label": "Strike Center",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "FRAME_PROCESSED",
                "operator": "notEquals",
                "value": "PROCESSED"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "lock-options-mullion-add-per-door",
          "name": "MULLION_ADD_PER_DOOR",
          "label": "Mullion Add Per Door",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "EXIT_MULLION",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "lock-options-mortise-box-depth",
          "name": "MORTISE_BOX_DEPTH",
          "label": "Mortise Box Depth",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "SPECIAL_BOX_DEPTH",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "lock-options-exit-mullion",
          "name": "EXIT_MULLION",
          "label": "Exit Mullion",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "P"
              },
              {
                "field": "LOCK_TYPE",
                "operator": "equals",
                "value": 4
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "lock-options-unequal-exits",
          "name": "UNEQUAL_EXITS",
          "label": "Unequal Exits",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "P"
              },
              {
                "field": "LOCK_TYPE",
                "operator": "equals",
                "value": 4
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "lock-options-fire-bolt",
          "name": "FIRE_BOLT",
          "label": "Fire Bolt",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "P"
              },
              {
                "field": "LOCK_TYPE",
                "operator": "equals",
                "value": 4
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "lock-options-special-box-depth",
          "name": "SPECIAL_BOX_DEPTH",
          "label": "Special Box Depth",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "lock-options-select-lock",
          "name": "SELECT_LOCK",
          "label": "Select Lock",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "lock-options-select-trim",
          "name": "SELECT_TRIM",
          "label": "Select Trim",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "lock-options-lock-electrified",
          "name": "LOCK_ELECTRIFIED",
          "label": "Lock Electrified",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "lock-options-verify-strike",
          "name": "VERIFY_STRIKE",
          "label": "Verify Strike",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "lock-options-verify-lock",
          "name": "VERIFY_LOCK",
          "label": "Verify Lock",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "lock-options-lock-type",
          "name": "LOCK_TYPE",
          "label": "Lock Type",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "NONE"
            }
          ]
        },
        {
          "id": "lock-options-lock-electrified-2",
          "name": "LOCK_ELECTRIFIED",
          "label": "Lock Electrified",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "NONE"
            },
            {
              "value": 1,
              "label": "BOX"
            },
            {
              "value": 2,
              "label": "TAIL"
            }
          ]
        },
        {
          "id": "lock-options-backset-reference",
          "name": "BACKSET_REFERENCE",
          "label": "Backset Reference",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "STOP"
            },
            {
              "value": 1,
              "label": "DOOR EDGE"
            },
            {
              "value": 2,
              "label": "DOOR BEVEL CL"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "LOCK_TYPE",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "AND"
          }
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
