---
formId: standard-componets
source: SDI/standard_componets.tab
---
# Standard Componets

Form specification with 4 configuration fields.

```json-form
{
  "formId": "standard-componets",
  "itemType": "custom",
  "title": "Standard Componets",
  "description": "Configuration parameters for standard componets",
  "sections": [
    {
      "id": "standard-componets-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "standard-componets-customer-name",
          "name": "CUSTOMER_NAME",
          "label": "Customer Name",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "standard-componets-job-name",
          "name": "JOB_NAME",
          "label": "Job Name",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "standard-componets-sub-job-name",
          "name": "SUB_JOB_NAME",
          "label": "Sub Job Name",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "standard-componets-wo-num",
          "name": "WO_NUM",
          "label": "Wo Num",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
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
