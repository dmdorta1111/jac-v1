---
formId: build-asm
source: SDI/build_asm.tab
---
# Build Asm

Form specification with 4 configuration fields.

```json-form
{
  "formId": "build-asm",
  "itemType": "custom",
  "title": "Build Asm",
  "description": "Configuration parameters for build asm",
  "sections": [
    {
      "id": "build-asm-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "build-asm-frame-wo",
          "name": "FRAME_WO",
          "label": "Frame Wo",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "FRAMES_",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "build-asm-door-wo",
          "name": "DOOR_WO",
          "label": "Door Wo",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "DOORS_",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "build-asm-frames",
          "name": "FRAMES_",
          "label": "Frames",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "build-asm-doors",
          "name": "DOORS_",
          "label": "Doors",
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
