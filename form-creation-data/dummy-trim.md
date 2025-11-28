---
formId: dummy-trim
source: SDI/dummy_trim.tab
---
# Dummy Trim

Form specification with 2 configuration fields.

```json-form
{
  "formId": "dummy-trim",
  "itemType": "custom",
  "title": "Dummy Trim",
  "description": "Configuration parameters for dummy trim",
  "sections": [
    {
      "id": "dummy-trim-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "dummy-trim-strike-center",
          "name": "STRIKE_CENTER",
          "label": "Strike Center",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "dummy-trim-select-trim",
          "name": "SELECT_TRIM",
          "label": "Select Trim",
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
