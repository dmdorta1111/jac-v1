---
formId: steel-stiff-info
source: SDI/steel_stiff_info.tab
---
# Steel Stiff Info

Form specification with 5 configuration fields.

```json-form
{
  "formId": "steel-stiff-info",
  "itemType": "custom",
  "title": "Steel Stiff Info",
  "description": "Configuration parameters for steel stiff info",
  "sections": [
    {
      "id": "steel-stiff-info-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "steel-stiff-info-steel-stiffener-width",
          "name": "STEEL_STIFFENER_WIDTH",
          "label": "Steel Stiffener Width",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "steel-stiff-info-maximum-stiffener-ctr",
          "name": "MAXIMUM_STIFFENER_CTR",
          "label": "Maximum Stiffener Ctr",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "steel-stiff-info-steel-stiffener-gauge",
          "name": "STEEL_STIFFENER_GAUGE",
          "label": "Steel Stiffener Gauge",
          "required": false,
          "type": "integer",
          "placeholder": "0"
        },
        {
          "id": "steel-stiff-info-steel-stiffener-material",
          "name": "STEEL_STIFFENER_MATERIAL",
          "label": "Steel Stiffener Material",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "SS"
            },
            {
              "value": 1,
              "label": "GALV"
            }
          ]
        },
        {
          "id": "steel-stiff-info-steel-stiffener-insulation",
          "name": "STEEL_STIFFENER_INSULATION",
          "label": "Steel Stiffener Insulation",
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
              "label": "MINERAL WOOL"
            },
            {
              "value": 3,
              "label": "FIBERGLASS"
            },
            {
              "value": 4,
              "label": "BULLET"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "CORE",
                "operator": "equals",
                "value": 9
              }
            ],
            "logic": "AND"
          }
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
