---
formId: locations
source: SDI/locations.tab
---
# Locations

Form specification with 1 configuration fields.

```json-form
{
  "formId": "locations",
  "itemType": "custom",
  "title": "Locations",
  "description": "Configuration parameters for locations",
  "sections": [
    {
      "id": "locations-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "locations-joh",
          "name": "JOH",
          "label": "Joh",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
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
