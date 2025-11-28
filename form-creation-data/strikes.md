---
formId: strikes
source: SDI/strikes.tab
---
# Strikes

Form specification with 7 configuration fields.

```json-form
{
  "formId": "strikes",
  "itemType": "custom",
  "title": "Strikes",
  "description": "Configuration parameters for strikes",
  "sections": [
    {
      "id": "strikes-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "strikes-strike-center",
          "name": "STRIKE_CENTER",
          "label": "Strike Center",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "strikes-strike-model",
          "name": "STRIKE_MODEL",
          "label": "Strike Model",
          "required": true,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "STRIKE_TYPE",
                "operator": "equals",
                "value": 3
              },
              {
                "field": "STRIKE_TYPE",
                "operator": "equals",
                "value": 4
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "strikes-strike-plate-thickness",
          "name": "STRIKE_PLATE_THICKNESS",
          "label": "Strike Plate Thickness",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "STRIKE_TYPE",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "strikes-elec-strike-lip-thickness",
          "name": "ELEC_STRIKE_LIP_THICKNESS",
          "label": "Elec Strike Lip Thickness",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "STRIKE_TYPE",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "strikes-verify-strike",
          "name": "VERIFY_STRIKE",
          "label": "Verify Strike",
          "type": "switch",
          "defaultValue": false
        },
        {
          "id": "strikes-strike-electrified",
          "name": "STRIKE_ELECTRIFIED",
          "label": "Strike Electrified",
          "type": "switch",
          "defaultValue": false
        },
        {
          "id": "strikes-alt-strike-center",
          "name": "ALT_STRIKE_CENTER_",
          "label": "Alt Strike Center",
          "type": "switch",
          "defaultValue": false
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
