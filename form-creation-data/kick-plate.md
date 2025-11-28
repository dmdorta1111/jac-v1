---
formId: kick-plate
source: SDI/kick_plate.tab
---
# Kick Plate

Form specification with 5 configuration fields.

```json-form
{
  "formId": "kick-plate",
  "itemType": "custom",
  "title": "Kick Plate",
  "description": "Configuration parameters for kick plate",
  "sections": [
    {
      "id": "kick-plate-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "kick-plate-kick-plate-gauge",
          "name": "KICK_PLATE_GAUGE",
          "label": "Kick Plate Gauge",
          "required": false,
          "type": "integer",
          "placeholder": "0"
        },
        {
          "id": "kick-plate-kick-plate-width",
          "name": "KICK_PLATE_WIDTH",
          "label": "Kick Plate Width",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "kick-plate-kick-plate-height-push",
          "name": "KICK_PLATE_HEIGHT_PUSH",
          "label": "Kick Plate Height Push",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "KICK_PLATE_SIDE",
                "operator": "equals",
                "value": 0
              },
              {
                "field": "KICK_PLATE_SIDE",
                "operator": "equals",
                "value": 2
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "kick-plate-kick-plate-height-pull",
          "name": "KICK_PLATE_HEIGHT_PULL",
          "label": "Kick Plate Height Pull",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "KICK_PLATE_SIDE",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "KICK_PLATE_SIDE",
                "operator": "equals",
                "value": 2
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "kick-plate-kick-plate-side",
          "name": "KICK_PLATE_SIDE",
          "label": "Kick Plate Side",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "PUSH SIDE"
            },
            {
              "value": 1,
              "label": "PULL SIDE"
            },
            {
              "value": 2,
              "label": "BOTH SIDES"
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
