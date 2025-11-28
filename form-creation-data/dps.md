---
formId: dps
source: SDI/dps.tab
---
# Dps

Form specification with 9 configuration fields.

```json-form
{
  "formId": "dps",
  "itemType": "custom",
  "title": "Dps",
  "description": "Configuration parameters for dps",
  "sections": [
    {
      "id": "dps-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "dps-dps-ctr",
          "name": "DPS_CTR",
          "label": "Dps Ctr",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "DPS",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "DPS",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "dps-dps-2-ctr",
          "name": "DPS_2_CTR",
          "label": "Dps 2 Ctr",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "EQUAL_DPS",
                "operator": "equals",
                "value": 0
              },
              {
                "field": "DPS",
                "operator": "equals",
                "value": 2
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "dps-select-dps",
          "name": "SELECT_DPS",
          "label": "Select Dps",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "DPS",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "DPS",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "dps-dps-blank",
          "name": "DPS_BLANK",
          "label": "Dps Blank",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "DPS",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "DPS",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "dps-equal-dps",
          "name": "EQUAL_DPS",
          "label": "Equal Dps",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "DPS",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "dps-select-dps-2",
          "name": "SELECT_DPS_2",
          "label": "Select Dps 2",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "EQUAL_DPS",
                "operator": "equals",
                "value": 0
              },
              {
                "field": "DPS",
                "operator": "equals",
                "value": 2
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "dps-dps-2-blank",
          "name": "DPS_2_BLANK",
          "label": "Dps 2 Blank",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "EQUAL_DPS",
                "operator": "equals",
                "value": 0
              },
              {
                "field": "DPS",
                "operator": "equals",
                "value": 2
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "dps-dps",
          "name": "DPS",
          "label": "Dps",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "NONE"
            },
            {
              "value": 1,
              "label": "LEFT - PAIR OR YES - SINGLE"
            },
            {
              "value": 2,
              "label": "RIGHT - FOR PAIRS ONLY"
            },
            {
              "value": 3,
              "label": "BOTH - FOR PAIRS ONLY"
            }
          ],
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
          "id": "dps-dps-position",
          "name": "DPS_POSITION",
          "label": "Dps Position",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "HEAD"
            },
            {
              "value": 1,
              "label": "JAMB"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "S"
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
