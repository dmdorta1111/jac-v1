---
formId: tags
source: SDI/tags.tab
---
# Tags

Form specification with 2 configuration fields.

```json-form
{
  "formId": "tags",
  "itemType": "custom",
  "title": "Tags",
  "description": "Configuration parameters for tags",
  "sections": [
    {
      "id": "tags-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "tags-tag-num",
          "name": "TAG_NUM",
          "label": "Tag Num",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "tags-tag-qty",
          "name": "TAG_QTY",
          "label": "Tag Qty",
          "required": false,
          "type": "integer",
          "placeholder": "0"
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
