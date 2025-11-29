---
formId: custom-hinges
source: SDI/custom_hinges.tab
---
# Custom Hinges

Form specification with 18 configuration fields.

```json-form
{
  "formId": "custom-hinges",
  "itemType": "custom",
  "title": "Custom Hinges",
  "description": "Configuration parameters for custom hinges",
  "sections": [
    {
      "id": "custom-hinges-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "custom-hinges-top-gap",
          "name": "TOP_GAP",
          "label": "Top Gap",
          "required": true,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "custom-hinges-custom-hinge-qty",
          "name": "CUSTOM_HINGE_QTY",
          "label": "Custom Hinge Qty",
          "required": false,
          "type": "integer",
          "placeholder": "0",
          "conditional": {
            "conditions": [
              {
                "field": "MAXIMUM_HINGE_SPACING",
                "operator": "equals",
                "value": 0
              },
              {
                "field": "MAXIMUM_HINGE_SPACING",
                "operator": "greaterThan",
                "value": 0
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "custom-hinges-maximum-hinge-spacing",
          "name": "MAXIMUM_HINGE_SPACING",
          "label": "Maximum Hinge Spacing",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "CUSTOM_HINGE_QTY",
                "operator": "equals",
                "value": 0
              },
              {
                "field": "MAXIMUM_HINGE_SPACING",
                "operator": "greaterThan",
                "value": 0
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "custom-hinges-jamb-hinge-setback",
          "name": "JAMB_HINGE_SETBACK",
          "label": "Jamb Hinge Setback",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "custom-hinges-door-hinge-setback",
          "name": "DOOR_HINGE_SETBACK",
          "label": "Door Hinge Setback",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "custom-hinges-door-face-setback",
          "name": "DOOR_FACE_SETBACK",
          "label": "Door Face Setback",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "custom-hinges-top-hinge",
          "name": "TOP_HINGE",
          "label": "Top Hinge",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "HINGE_DIMENSION_METHOD",
                "operator": "equals",
                "value": 0
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "custom-hinges-bottom-hinge",
          "name": "BOTTOM_HINGE",
          "label": "Bottom Hinge",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "HINGE_DIMENSION_METHOD",
                "operator": "equals",
                "value": 0
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "custom-hinges-hinge-location-1",
          "name": "HINGE_LOCATION_1",
          "label": "Hinge Location 1",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "CUSTOM_HINGE_QTY",
                "operator": "greaterThanOrEqual",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "custom-hinges-hinge-location-2",
          "name": "HINGE_LOCATION_2",
          "label": "Hinge Location 2",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "CUSTOM_HINGE_QTY",
                "operator": "greaterThanOrEqual",
                "value": 2
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "custom-hinges-hinge-location-3",
          "name": "HINGE_LOCATION_3",
          "label": "Hinge Location 3",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "CUSTOM_HINGE_QTY",
                "operator": "greaterThanOrEqual",
                "value": 3
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "custom-hinges-hinge-location-4",
          "name": "HINGE_LOCATION_4",
          "label": "Hinge Location 4",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "CUSTOM_HINGE_QTY",
                "operator": "greaterThanOrEqual",
                "value": 4
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "custom-hinges-hinge-location-5",
          "name": "HINGE_LOCATION_5",
          "label": "Hinge Location 5",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "CUSTOM_HINGE_QTY",
                "operator": "greaterThanOrEqual",
                "value": 5
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "custom-hinges-hinge-location-6",
          "name": "HINGE_LOCATION_6",
          "label": "Hinge Location 6",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "CUSTOM_HINGE_QTY",
                "operator": "greaterThanOrEqual",
                "value": 6
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "custom-hinges-hinge-location-7",
          "name": "HINGE_LOCATION_7",
          "label": "Hinge Location 7",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "CUSTOM_HINGE_QTY",
                "operator": "greaterThanOrEqual",
                "value": 7
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "custom-hinges-hinge-location-8",
          "name": "HINGE_LOCATION_8",
          "label": "Hinge Location 8",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "CUSTOM_HINGE_QTY",
                "operator": "greaterThanOrEqual",
                "value": 8
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "custom-hinges-hinge-location-9",
          "name": "HINGE_LOCATION_9",
          "label": "Hinge Location 9",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "CUSTOM_HINGE_QTY",
                "operator": "greaterThanOrEqual",
                "value": 9
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "custom-hinges-hinge-dimension-method",
          "name": "HINGE_DIMENSION_METHOD",
          "label": "Hinge Dimension Method",
          "type": "select",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "EQUAL SPACING"
            },
            {
              "value": 1,
              "label": "TOP-CENTER"
            },
            {
              "value": 2,
              "label": "TOP-TOP"
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
