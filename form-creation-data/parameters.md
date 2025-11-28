---
formId: Parameters
source: SDI/Parameters.tab
---
# Parameters

Form specification with 6 configuration fields.

```json-form
{
  "formId": "Parameters",
  "itemType": "custom",
  "title": "Parameters",
  "description": "Configuration parameters for parameters",
  "sections": [
    {
      "id": "Parameters-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "Parameters-parameter-name",
          "name": "PARAMETER_NAME",
          "label": "Parameter Name",
          "required": true,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "Parameters-user-input",
          "name": "USER_INPUT",
          "label": "User Input",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "Parameters-add-to-family-table",
          "name": "ADD_TO_FAMILY_TABLE",
          "label": "Add To Family Table",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "Parameters-operation",
          "name": "OPERATION",
          "label": "Operation",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "NEW"
            },
            {
              "value": 1,
              "label": "REPLACE"
            },
            {
              "value": 2,
              "label": "DELETE"
            }
          ]
        },
        {
          "id": "Parameters-model-type",
          "name": "MODEL_TYPE",
          "label": "Model Type",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "PART"
            },
            {
              "value": 1,
              "label": "ASSEMBLY"
            },
            {
              "value": 2,
              "label": "BOTH"
            }
          ]
        },
        {
          "id": "Parameters-parameter-type",
          "name": "PARAMETER_TYPE",
          "label": "Parameter Type",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "DOUBLE"
            },
            {
              "value": 1,
              "label": "INTEGER"
            },
            {
              "value": 2,
              "label": "STRING"
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
