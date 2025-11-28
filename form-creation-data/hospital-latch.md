---
formId: hospital-latch
source: SDI/hospital_latch.tab
---
# Hospital Latch

Form specification with 1 configuration fields.

```json-form
{
  "formId": "hospital-latch",
  "itemType": "custom",
  "title": "Hospital Latch",
  "description": "Configuration parameters for hospital latch",
  "sections": [
    {
      "id": "hospital-latch-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "hospital-latch-orientation",
          "name": "ORIENTATION",
          "label": "Orientation",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "VERTICAL"
            },
            {
              "value": 1,
              "label": "HORIZONTAL"
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
