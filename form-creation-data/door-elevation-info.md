---
formId: door-elevation-info
source: SDI/door_elevation_info.tab
---
# Door Elevation Info

Form specification with 1 configuration fields.

```json-form
{
  "formId": "door-elevation-info",
  "itemType": "custom",
  "title": "Door Elevation Info",
  "description": "Configuration parameters for door elevation info",
  "sections": [
    {
      "id": "door-elevation-info-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "door-elevation-info-door-elevation",
          "name": "DOOR_ELEVATION",
          "label": "Door Elevation",
          "required": true,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
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
