---
formId: lock-prep
source: SDI/lock_prep.tab
---
# Lock Prep

Form specification with 2 configuration fields.

```json-form
{
  "formId": "lock-prep",
  "itemType": "custom",
  "title": "Lock Prep",
  "description": "Configuration parameters for lock prep",
  "sections": [
    {
      "id": "lock-prep-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "lock-prep-mortise-box-depth",
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
          "id": "lock-prep-special-box-depth",
          "name": "SPECIAL_BOX_DEPTH",
          "label": "Special Box Depth",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
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
