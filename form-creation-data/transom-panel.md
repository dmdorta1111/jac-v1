---
formId: transom-panel
source: SDI/transom_panel.tab
---
# Transom Panel

Form specification with 4 configuration fields.

```json-form
{
  "formId": "transom-panel",
  "itemType": "custom",
  "title": "Transom Panel",
  "description": "Configuration parameters for transom panel",
  "sections": [
    {
      "id": "transom-panel-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "transom-panel-transom-panel-height",
          "name": "TRANSOM_PANEL_HEIGHT",
          "label": "Transom Panel Height",
          "required": true,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "transom-panel-transom-panel-gauge",
          "name": "TRANSOM_PANEL_GAUGE",
          "label": "Transom Panel Gauge",
          "required": true,
          "type": "integer",
          "placeholder": "0"
        },
        {
          "id": "transom-panel-transom-panel-attach-method",
          "name": "TRANSOM_PANEL_ATTACH_METHOD",
          "label": "Transom Panel Attach Method",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "LOOSE"
            },
            {
              "value": 1,
              "label": "ANGLES"
            },
            {
              "value": 2,
              "label": "WELDED"
            }
          ]
        },
        {
          "id": "transom-panel-transom-panel-core",
          "name": "TRANSOM_PANEL_CORE",
          "label": "Transom Panel Core",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "STYRENE"
            },
            {
              "value": 1,
              "label": "URETHANE"
            },
            {
              "value": 2,
              "label": "HONEYCOMB"
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
