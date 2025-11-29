---
formId: BOM-Sheets
source: SDI/BOM_Sheets.tab
---
# Bom Sheets

Form specification with 4 configuration fields.

```json-form
{
  "formId": "BOM-Sheets",
  "itemType": "custom",
  "title": "Bom Sheets",
  "description": "Configuration parameters for bom sheets",
  "sections": [
    {
      "id": "BOM-Sheets-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "BOM-Sheets-so-num",
          "name": "SO_NUM",
          "label": "So Num",
          "required": true,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "BOM-Sheets-door-wo",
          "name": "DOOR_WO",
          "label": "Door Wo",
          "required": true,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "DOOR_WO",
                "operator": "equals",
                "value": ""
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "BOM-Sheets-frame-wo",
          "name": "FRAME_WO",
          "label": "Frame Wo",
          "required": true,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "FRAME_WO",
                "operator": "equals",
                "value": ""
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "BOM-Sheets-process-type",
          "name": "PROCESS_TYPE_",
          "label": "Process Type",
          "type": "select",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "DOORS"
            },
            {
              "value": 1,
              "label": "FRAMES"
            },
            {
              "value": 2,
              "label": "LITES"
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
