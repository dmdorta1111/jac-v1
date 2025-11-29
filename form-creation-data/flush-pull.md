---
formId: flush-pull
source: SDI/flush_pull.tab
---
# Flush Pull

Form specification with 3 configuration fields.

```json-form
{
  "formId": "flush-pull",
  "itemType": "custom",
  "title": "Flush Pull",
  "description": "Configuration parameters for flush pull",
  "sections": [
    {
      "id": "flush-pull-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "flush-pull-flush-pull-center",
          "name": "FLUSH_PULL_CENTER",
          "label": "Flush Pull Center",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "flush-pull-flush-pull-backset",
          "name": "FLUSH_PULL_BACKSET",
          "label": "Flush Pull Backset",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "flush-pull-flush-pull-side",
          "name": "FLUSH_PULL_SIDE",
          "label": "Flush Pull Side",
          "type": "select",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "PUSH"
            },
            {
              "value": 1,
              "label": "PULL (STD)"
            },
            {
              "value": 2,
              "label": "BOTH"
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
