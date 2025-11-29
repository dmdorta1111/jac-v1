---
formId: Drawing-History
source: SDI/Drawing_History.tab
---
# Drawing History

Form specification with 16 configuration fields.

```json-form
{
  "formId": "Drawing-History",
  "itemType": "custom",
  "title": "Drawing History",
  "description": "Configuration parameters for drawing history",
  "sections": [
    {
      "id": "Drawing-History-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "Drawing-History-rev0-num",
          "name": "REV0_NUM",
          "label": "Rev0 Num",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "REV1_NUM",
                "operator": "notEquals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "Drawing-History-rev0-date",
          "name": "REV0_DATE",
          "label": "Rev0 Date",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "REV1_NUM",
                "operator": "notEquals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "Drawing-History-rev0-by",
          "name": "REV0_BY",
          "label": "Rev0 By",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "REV1_NUM",
                "operator": "notEquals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "Drawing-History-rev1-num",
          "name": "REV1_NUM",
          "label": "Rev1 Num",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "REV0",
                "operator": "notEquals",
                "value": ""
              },
              {
                "field": "REV1_NUM",
                "operator": "equals",
                "value": ""
              },
              {
                "field": "ADD_REV",
                "operator": "notEquals",
                "value": 1
              },
              {
                "field": "ADD_REVISION",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "Drawing-History-rev1-date",
          "name": "REV1_DATE",
          "label": "Rev1 Date",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "REV0",
                "operator": "notEquals",
                "value": ""
              },
              {
                "field": "REV1_NUM",
                "operator": "equals",
                "value": ""
              },
              {
                "field": "ADD_REV",
                "operator": "notEquals",
                "value": 1
              },
              {
                "field": "ADD_REVISION",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "Drawing-History-rev1-by",
          "name": "REV1_BY",
          "label": "Rev1 By",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "REV0",
                "operator": "notEquals",
                "value": ""
              },
              {
                "field": "REV1_NUM",
                "operator": "equals",
                "value": ""
              },
              {
                "field": "ADD_REV",
                "operator": "notEquals",
                "value": 1
              },
              {
                "field": "ADD_REVISION",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "Drawing-History-rev2-num",
          "name": "REV2_NUM",
          "label": "Rev2 Num",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "REV0",
                "operator": "notEquals",
                "value": ""
              },
              {
                "field": "REV1_NUM",
                "operator": "equals",
                "value": ""
              },
              {
                "field": "ADD_REV",
                "operator": "notEquals",
                "value": 1
              },
              {
                "field": "ADD_REVISION",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "Drawing-History-rev2-date",
          "name": "REV2_DATE",
          "label": "Rev2 Date",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "REV0",
                "operator": "notEquals",
                "value": ""
              },
              {
                "field": "REV1_NUM",
                "operator": "equals",
                "value": ""
              },
              {
                "field": "ADD_REV",
                "operator": "notEquals",
                "value": 1
              },
              {
                "field": "ADD_REVISION",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "Drawing-History-rev2-by",
          "name": "REV2_BY",
          "label": "Rev2 By",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "REV0",
                "operator": "notEquals",
                "value": ""
              },
              {
                "field": "REV1_NUM",
                "operator": "equals",
                "value": ""
              },
              {
                "field": "ADD_REV",
                "operator": "notEquals",
                "value": 1
              },
              {
                "field": "ADD_REVISION",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "Drawing-History-rev3-num",
          "name": "REV3_NUM",
          "label": "Rev3 Num",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "REV0",
                "operator": "notEquals",
                "value": ""
              },
              {
                "field": "REV1_NUM",
                "operator": "equals",
                "value": ""
              },
              {
                "field": "ADD_REV",
                "operator": "notEquals",
                "value": 1
              },
              {
                "field": "ADD_REVISION",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "Drawing-History-rev3-date",
          "name": "REV3_DATE",
          "label": "Rev3 Date",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "REV0",
                "operator": "notEquals",
                "value": ""
              },
              {
                "field": "REV1_NUM",
                "operator": "equals",
                "value": ""
              },
              {
                "field": "ADD_REV",
                "operator": "notEquals",
                "value": 1
              },
              {
                "field": "ADD_REVISION",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "Drawing-History-rev3-by",
          "name": "REV3_BY",
          "label": "Rev3 By",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "REV0",
                "operator": "notEquals",
                "value": ""
              },
              {
                "field": "REV1_NUM",
                "operator": "equals",
                "value": ""
              },
              {
                "field": "ADD_REV",
                "operator": "notEquals",
                "value": 1
              },
              {
                "field": "ADD_REVISION",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "Drawing-History-rev4-num",
          "name": "REV4_NUM",
          "label": "Rev4 Num",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "REV0",
                "operator": "notEquals",
                "value": ""
              },
              {
                "field": "REV1_NUM",
                "operator": "equals",
                "value": ""
              },
              {
                "field": "ADD_REV",
                "operator": "notEquals",
                "value": 1
              },
              {
                "field": "ADD_REVISION",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "Drawing-History-rev4-date",
          "name": "REV4_DATE",
          "label": "Rev4 Date",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "REV0",
                "operator": "notEquals",
                "value": ""
              },
              {
                "field": "REV1_NUM",
                "operator": "equals",
                "value": ""
              },
              {
                "field": "ADD_REV",
                "operator": "notEquals",
                "value": 1
              },
              {
                "field": "ADD_REVISION",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "Drawing-History-rev4-by",
          "name": "REV4_BY",
          "label": "Rev4 By",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "REV0",
                "operator": "notEquals",
                "value": ""
              },
              {
                "field": "REV1_NUM",
                "operator": "equals",
                "value": ""
              },
              {
                "field": "ADD_REV",
                "operator": "notEquals",
                "value": 1
              },
              {
                "field": "ADD_REVISION",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "Drawing-History-add-revision",
          "name": "ADD_REVISION",
          "label": "Add Revision",
          "type": "select",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "NO"
            },
            {
              "value": 1,
              "label": "YES"
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
