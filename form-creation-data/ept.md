---
formId: ept
source: SDI/ept.tab
---
# Ept

Form specification with 8 configuration fields.

```json-form
{
  "formId": "ept",
  "itemType": "custom",
  "title": "Ept",
  "description": "Configuration parameters for ept",
  "sections": [
    {
      "id": "ept-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "ept-ept-ctr",
          "name": "EPT_CTR",
          "label": "Ept Ctr",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "EPT",
                "operator": "greaterThan",
                "value": 0
              },
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
          "id": "ept-ept-2-ctr",
          "name": "EPT_2_CTR",
          "label": "Ept 2 Ctr",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "EQUAL_EPT",
                "operator": "equals",
                "value": 0
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "ept-ept",
          "name": "EPT",
          "label": "Ept",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "ept-select-ept",
          "name": "SELECT_EPT",
          "label": "Select Ept",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "ept-ept-blank",
          "name": "EPT_BLANK",
          "label": "Ept Blank",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "ept-equal-ept",
          "name": "EQUAL_EPT",
          "label": "Equal Ept",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "EPT",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "ept-select-ept-2",
          "name": "SELECT_EPT_2",
          "label": "Select Ept 2",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "EQUAL_EPT",
                "operator": "equals",
                "value": 0
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "ept-ept-2-blank",
          "name": "EPT_2_BLANK",
          "label": "Ept 2 Blank",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "EPT",
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
