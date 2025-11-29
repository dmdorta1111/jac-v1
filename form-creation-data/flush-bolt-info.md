---
formId: flush-bolt-info
source: SDI/flush_bolt_info.tab
---
# Flush Bolt Info

Form specification with 5 configuration fields.

```json-form
{
  "formId": "flush-bolt-info",
  "itemType": "custom",
  "title": "Flush Bolt Info",
  "description": "Configuration parameters for flush bolt info",
  "sections": [
    {
      "id": "flush-bolt-info-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "flush-bolt-info-flush-bolt-center-top",
          "name": "FLUSH_BOLT_CENTER_TOP",
          "label": "Flush Bolt Center Top",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "FLUSH_BOLTS",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "FLUSH_BOLTS",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "flush-bolt-info-flush-bolt-center-bottom",
          "name": "FLUSH_BOLT_CENTER_BOTTOM",
          "label": "Flush Bolt Center Bottom",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "FLUSH_BOLTS",
                "operator": "equals",
                "value": 2
              },
              {
                "field": "FLUSH_BOLTS",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "flush-bolt-info-flush-bolts",
          "name": "FLUSH_BOLTS",
          "label": "Flush Bolts",
          "type": "select",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "NO"
            },
            {
              "value": 1,
              "label": "TOP"
            },
            {
              "value": 2,
              "label": "BOTTOM"
            },
            {
              "value": 3,
              "label": "TOP AND BOTTOM"
            }
          ]
        },
        {
          "id": "flush-bolt-info-top-bolt-type",
          "name": "TOP_BOLT_TYPE",
          "label": "Top Bolt Type",
          "type": "select",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "STD"
            },
            {
              "value": 1,
              "label": "AUTOMATIC"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "FLUSH_BOLTS",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "FLUSH_BOLTS",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "flush-bolt-info-bottom-bolt-type",
          "name": "BOTTOM_BOLT_TYPE",
          "label": "Bottom Bolt Type",
          "type": "select",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "STD"
            },
            {
              "value": 1,
              "label": "AUTOMATIC"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "FLUSH_BOLTS",
                "operator": "equals",
                "value": 2
              },
              {
                "field": "FLUSH_BOLTS",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "OR"
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
