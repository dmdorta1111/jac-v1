---
formId: exit-device
source: SDI/exit_device.tab
---
# Exit Device

Form specification with 1 configuration fields.

```json-form
{
  "formId": "exit-device",
  "itemType": "custom",
  "title": "Exit Device",
  "description": "Configuration parameters for exit device",
  "sections": [
    {
      "id": "exit-device-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "exit-device-strike-center",
          "name": "STRIKE_CENTER",
          "label": "Strike Center",
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
