---
name: sdi-forms
description: SmartAssembly SDI GUI component form specifications extracted from 45 .tab files
---

# SDI Form Specifications

This skill contains dynamically generated form specifications extracted from SmartAssembly .tab files in the SDI folder.

## Usage

When a user requests SDI configuration forms, Claude can reference these specifications to generate interactive forms using the dynamic-form-builder pattern.

---

## Anchors

**Source:** `SDI/anchors.tab`

Form specification with 23 configuration fields.

```json-form
{
  "formId": "anchors",
  "itemType": "custom",
  "title": "Anchors",
  "description": "Configuration parameters for anchors",
  "sections": [
    {
      "id": "anchors-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "anchors-anchor-ctr",
          "name": "ANCHOR_CTR",
          "label": "Anchor Ctr",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "validation": {
            "decimalPlaces": 4
          },
          "helperText": "Precision: 4 decimal places",
          "conditional": {
            "conditions": [
              {
                "field": "ANCHOR_TYPE",
                "operator": "equals",
                "value": 8
              },
              {
                "field": "ANCHOR_TYPE",
                "operator": "equals",
                "value": 9
              },
              {
                "field": "ANCHOR_TYPE",
                "operator": "equals",
                "value": 11
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "anchors-anchor-desc",
          "name": "ANCHOR_DESC",
          "label": "Anchor Desc",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "CUSTOM_ANCHORS",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "anchors-grout-hole-dia",
          "name": "GROUT_HOLE_DIA",
          "label": "Grout Hole Dia",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "GROUT_HOLES",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "anchors-transom-anchor-center",
          "name": "TRANSOM_ANCHOR_CENTER",
          "label": "Transom Anchor Center",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "FRAME_ELEVATION",
                "operator": "equals",
                "value": 5
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "anchors-anchor-recess",
          "name": "ANCHOR_RECESS",
          "label": "Anchor Recess",
          "required": true,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "anchors-drywall-allowance",
          "name": "DRYWALL_ALLOWANCE",
          "label": "Drywall Allowance",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "ANCHOR_TYPE",
                "operator": "equals",
                "value": 4
              },
              {
                "field": "ANCHOR_TYPE",
                "operator": "equals",
                "value": 5
              },
              {
                "field": "ANCHOR_TYPE",
                "operator": "equals",
                "value": 6
              },
              {
                "field": "ANCHOR_TYPE",
                "operator": "equals",
                "value": 7
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "anchors-anchor-jt-dist",
          "name": "ANCHOR_JT_DIST",
          "label": "Anchor Jt Dist",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "anchors-anchor-jb-dist",
          "name": "ANCHOR_JB_DIST",
          "label": "Anchor Jb Dist",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "anchors-anchor-hdj-dist",
          "name": "ANCHOR_HDJ_DIST",
          "label": "Anchor Hdj Dist",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "anchors-anchor-hmax",
          "name": "ANCHOR_HMAX",
          "label": "Anchor Hmax",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "anchors-anchor-qty",
          "name": "ANCHOR_QTY",
          "label": "Anchor Qty",
          "required": false,
          "type": "integer",
          "placeholder": "0",
          "conditional": {
            "conditions": [
              {
                "field": "ANCHOR_JMAX",
                "operator": "equals",
                "value": 0
              },
              {
                "field": "ANCHOR_JMAX",
                "operator": "greaterThan",
                "value": 0
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "anchors-anchor-jmax",
          "name": "ANCHOR_JMAX",
          "label": "Anchor Jmax",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "ANCHOR_QTY",
                "operator": "equals",
                "value": 0
              },
              {
                "field": "ANCHOR_JMAX",
                "operator": "greaterThan",
                "value": 0
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "anchors-head-anchor-qty",
          "name": "HEAD_ANCHOR_QTY",
          "label": "Head Anchor Qty",
          "required": false,
          "type": "integer",
          "placeholder": "0",
          "conditional": {
            "conditions": [
              {
                "field": "ANCHOR_HMAX",
                "operator": "equals",
                "value": 0
              },
              {
                "field": "ANCHOR_HMAX",
                "operator": "greaterThan",
                "value": 0
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "anchors-help",
          "name": "HELP",
          "label": "Help",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "anchors-dust-boxes",
          "name": "DUST_BOXES",
          "label": "Dust Boxes",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "anchors-grout-holes",
          "name": "GROUT_HOLES",
          "label": "Grout Holes",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "ANCHOR_TYPE",
                "operator": "equals",
                "value": 8
              },
              {
                "field": "ANCHOR_TYPE",
                "operator": "equals",
                "value": 9
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "anchors-bottom-only",
          "name": "BOTTOM_ONLY",
          "label": "Bottom Only",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "anchors-anchor-type",
          "name": "ANCHOR_TYPE",
          "label": "Anchor Type",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "NONE"
            },
            {
              "value": 1,
              "label": "GALVANIZED WIRE"
            },
            {
              "value": 2,
              "label": "STAINLESS WIRE"
            },
            {
              "value": 3,
              "label": "LOOSE T"
            },
            {
              "value": 4,
              "label": "LOOSE STUD"
            },
            {
              "value": 5,
              "label": "WELDED STUD STRAP"
            },
            {
              "value": 6,
              "label": "HD WELDED STUD"
            },
            {
              "value": 7,
              "label": "WELDED STUD"
            },
            {
              "value": 8,
              "label": "P&D EWA"
            },
            {
              "value": 9,
              "label": "CONCEALED EWA"
            },
            {
              "value": 10,
              "label": "ADJUSTABLE MASONARY"
            },
            {
              "value": 11,
              "label": "COMPRESSION"
            }
          ]
        },
        {
          "id": "anchors-floor-clips",
          "name": "FLOOR_CLIPS_",
          "label": "Floor Clips",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "NONE"
            },
            {
              "value": 1,
              "label": "FIXED"
            },
            {
              "value": 2,
              "label": "ADJUSTABLE"
            },
            {
              "value": 3,
              "label": "HVY DUTY"
            },
            {
              "value": 4,
              "label": "CUSTOM"
            },
            {
              "value": 5,
              "label": "INVERTED"
            }
          ]
        },
        {
          "id": "anchors-base-clips",
          "name": "BASE_CLIPS",
          "label": "Base Clips",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "NONE"
            },
            {
              "value": 1,
              "label": "BASE CLIPS"
            },
            {
              "value": 2,
              "label": "CEWA"
            },
            {
              "value": 3,
              "label": "P&D EWA"
            },
            {
              "value": 4,
              "label": "FACE HOLES"
            }
          ]
        },
        {
          "id": "anchors-anchor-surf",
          "name": "ANCHOR_SURF",
          "label": "Anchor Surf",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "SOFFIT"
            },
            {
              "value": 1,
              "label": "RABBET"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "HEAD_ANCHOR_QTY",
                "operator": "equals",
                "value": 0
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "anchors-anchor-bolt-type",
          "name": "ANCHOR_BOLT_TYPE",
          "label": "Anchor Bolt Type",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "EXPANSION"
            },
            {
              "value": 1,
              "label": "LAG"
            },
            {
              "value": 2,
              "label": "MACHINE"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "ANCHOR_TYPE",
                "operator": "equals",
                "value": 8
              },
              {
                "field": "ANCHOR_TYPE",
                "operator": "equals",
                "value": 9
              },
              {
                "field": "ANCHOR_TYPE",
                "operator": "equals",
                "value": 11
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "anchors-anchor-strap-type",
          "name": "ANCHOR_STRAP_TYPE",
          "label": "Anchor Strap Type",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "FLAT"
            },
            {
              "value": 1,
              "label": "CHANNEL"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "ANCHOR_TYPE",
                "operator": "equals",
                "value": 8
              },
              {
                "field": "ANCHOR_TYPE",
                "operator": "equals",
                "value": 9
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

---

## Auto Bottom

**Source:** `SDI/auto_bottom.tab`

Form specification with 8 configuration fields.

```json-form
{
  "formId": "auto-bottom",
  "itemType": "custom",
  "title": "Auto Bottom",
  "description": "Configuration parameters for auto bottom",
  "sections": [
    {
      "id": "auto-bottom-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "auto-bottom-auto-bott-manufacturer",
          "name": "AUTO_BOTT_MANUFACTURER",
          "label": "Auto Bott Manufacturer",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "auto-bottom-auto-bott-model",
          "name": "AUTO_BOTT_MODEL",
          "label": "Auto Bott Model",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "auto-bottom-auto-bott-width",
          "name": "AUTO_BOTT_WIDTH",
          "label": "Auto Bott Width",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "auto-bottom-auto-bott-depth",
          "name": "AUTO_BOTT_DEPTH",
          "label": "Auto Bott Depth",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "auto-bottom-bottom-channel-thickness",
          "name": "BOTTOM_CHANNEL_THICKNESS",
          "label": "Bottom Channel Thickness",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "auto-bottom-plunger-hole-dia",
          "name": "PLUNGER_HOLE_DIA",
          "label": "Plunger Hole Dia",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "PLUNGER_HOLE",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "auto-bottom-plunger-hole-loc",
          "name": "PLUNGER_HOLE_LOC",
          "label": "Plunger Hole Loc",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "PLUNGER_HOLE",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "auto-bottom-plunger-hole",
          "name": "PLUNGER_HOLE",
          "label": "Plunger Hole",
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

---

## Bom Lines

**Source:** `SDI/BOM_Lines.tab`

Form specification with 4 configuration fields.

```json-form
{
  "formId": "BOM-Lines",
  "itemType": "custom",
  "title": "Bom Lines",
  "description": "Configuration parameters for bom lines",
  "sections": [
    {
      "id": "BOM-Lines-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "BOM-Lines-so-num",
          "name": "SO_NUM",
          "label": "So Num",
          "required": true,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "BOM-Lines-door-wo",
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
          "id": "BOM-Lines-frame-wo",
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
          "id": "BOM-Lines-process-type",
          "name": "PROCESS_TYPE_",
          "label": "Process Type",
          "type": "radio",
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

---

## Bom Sheets

**Source:** `SDI/BOM_Sheets.tab`

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
          "type": "radio",
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

---

## Build Asm

**Source:** `SDI/build_asm.tab`

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

---

## Build Asm Bu1

**Source:** `SDI/build_asm_bu1.tab`

Form specification with 4 configuration fields.

```json-form
{
  "formId": "build-asm-bu1",
  "itemType": "custom",
  "title": "Build Asm Bu1",
  "description": "Configuration parameters for build asm bu1",
  "sections": [
    {
      "id": "build-asm-bu1-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "build-asm-bu1-frame-wo",
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
          "id": "build-asm-bu1-door-wo",
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
          "id": "build-asm-bu1-frames",
          "name": "FRAMES_",
          "label": "Frames",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "build-asm-bu1-doors",
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

---

## Build Asm Bu2

**Source:** `SDI/build_asm_bu2.tab`

Form specification with 4 configuration fields.

```json-form
{
  "formId": "build-asm-bu2",
  "itemType": "custom",
  "title": "Build Asm Bu2",
  "description": "Configuration parameters for build asm bu2",
  "sections": [
    {
      "id": "build-asm-bu2-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "build-asm-bu2-frame-wo",
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
          "id": "build-asm-bu2-door-wo",
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
          "id": "build-asm-bu2-frames",
          "name": "FRAMES_",
          "label": "Frames",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "build-asm-bu2-doors",
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

---

## Closers

**Source:** `SDI/closers.tab`

Form specification with 7 configuration fields.

```json-form
{
  "formId": "closers",
  "itemType": "custom",
  "title": "Closers",
  "description": "Configuration parameters for closers",
  "sections": [
    {
      "id": "closers-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "closers-closer-model",
          "name": "CLOSER_MODEL",
          "label": "Closer Model",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "CLOSER_TYPE",
                "operator": "notEquals",
                "value": 0
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "closers-surface-closer-length",
          "name": "SURFACE_CLOSER_LENGTH",
          "label": "Surface Closer Length",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "CLOSER_TYPE",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "closers-surface-closer-width",
          "name": "SURFACE_CLOSER_WIDTH",
          "label": "Surface Closer Width",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "CLOSER_TYPE",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "closers-concealed-closer-manufacturer",
          "name": "CONCEALED_CLOSER_MANUFACTURER",
          "label": "Concealed Closer Manufacturer",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "CLOSER_TYPE",
                "operator": "equals",
                "value": 2
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "closers-concealed-closer-model-number",
          "name": "CONCEALED_CLOSER_MODEL_NUMBER",
          "label": "Concealed Closer Model Number",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "CLOSER_TYPE",
                "operator": "equals",
                "value": 2
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "closers-equal-closers",
          "name": "EQUAL_CLOSERS",
          "label": "Equal Closers",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "P"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "closers-closer-type",
          "name": "CLOSER_TYPE",
          "label": "Closer Type",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "NONE"
            },
            {
              "value": 1,
              "label": "SURFACE"
            },
            {
              "value": 2,
              "label": "CONCEALED"
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

---

## Copy Of Document

**Source:** `SDI/Copy of Document.tab`

Form specification with 20 configuration fields.

```json-form
{
  "formId": "Copy of Document",
  "itemType": "custom",
  "title": "Copy Of Document",
  "description": "Configuration parameters for copy of document",
  "sections": [
    {
      "id": "Copy of Document-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "Copy of Document-rev0-num",
          "name": "REV0_NUM",
          "label": "Rev0 Num",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "Copy of Document-rev0-date",
          "name": "REV0_DATE",
          "label": "Rev0 Date",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "Copy of Document-rev0-by",
          "name": "REV0_BY",
          "label": "Rev0 By",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "Copy of Document-rev1-num",
          "name": "REV1_NUM",
          "label": "Rev1 Num",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "Copy of Document-rev1-date",
          "name": "REV1_DATE",
          "label": "Rev1 Date",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "Copy of Document-rev1-by",
          "name": "REV1_BY",
          "label": "Rev1 By",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "Copy of Document-rev2-num",
          "name": "REV2_NUM",
          "label": "Rev2 Num",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "Copy of Document-rev2-date",
          "name": "REV2_DATE",
          "label": "Rev2 Date",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "Copy of Document-rev2-by",
          "name": "REV2_BY",
          "label": "Rev2 By",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "Copy of Document-rev3-num",
          "name": "REV3_NUM",
          "label": "Rev3 Num",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "Copy of Document-rev3-date",
          "name": "REV3_DATE",
          "label": "Rev3 Date",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "Copy of Document-rev3-by",
          "name": "REV3_BY",
          "label": "Rev3 By",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "Copy of Document-rev4-num",
          "name": "REV4_NUM",
          "label": "Rev4 Num",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "Copy of Document-rev4-date",
          "name": "REV4_DATE",
          "label": "Rev4 Date",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "Copy of Document-rev4-by",
          "name": "REV4_BY",
          "label": "Rev4 By",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "Copy of Document-rev5-num",
          "name": "REV5_NUM",
          "label": "Rev5 Num",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "Copy of Document-rev5-date",
          "name": "REV5_DATE",
          "label": "Rev5 Date",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "Copy of Document-rev5-by",
          "name": "REV5_BY",
          "label": "Rev5 By",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "Copy of Document-add-revision",
          "name": "ADD_REVISION",
          "label": "Add Revision",
          "type": "radio",
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
        },
        {
          "id": "Copy of Document-as-built",
          "name": "AS_BUILT",
          "label": "As Built",
          "type": "radio",
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

---

## Custom Hinges

**Source:** `SDI/custom_hinges.tab`

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
          "type": "radio",
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

---

## Door Elevation Info

**Source:** `SDI/door_elevation_info.tab`

Form specification with 1 configuration fields.

```json-form
{
  "formId": "door-elevation-info",
  "itemType": "custom",
  "title": "Door Elevation Info",
  "description": "Configuration parameters for door elevation info",
  "sections": [
    {
      "id": "door-elevation-info-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "door-elevation-info-door-elevation",
          "name": "DOOR_ELEVATION",
          "label": "Door Elevation",
          "required": true,
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

---

## Door Info

**Source:** `SDI/door_info.tab`

Form specification with 29 configuration fields.

```json-form
{
  "formId": "door-info",
  "itemType": "custom",
  "title": "Door Info",
  "description": "Configuration parameters for door info",
  "sections": [
    {
      "id": "door-info-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "door-info-door-elevation",
          "name": "DOOR_ELEVATION",
          "label": "Door Elevation",
          "required": true,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "S"
              },
              {
                "field": "EQUAL_ELEVATIONS",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "door-info-undercut",
          "name": "UNDERCUT",
          "label": "Undercut",
          "required": true,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "door-info-door-gauge",
          "name": "DOOR_GAUGE",
          "label": "Door Gauge",
          "required": true,
          "type": "integer",
          "placeholder": "0"
        },
        {
          "id": "door-info-door-grade",
          "name": "DOOR_GRADE",
          "label": "Door Grade",
          "required": true,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "door-info-body-side-finish",
          "name": "BODY_SIDE_FINISH",
          "label": "Body Side Finish",
          "required": true,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "door-info-cover-side-finish",
          "name": "COVER_SIDE_FINISH",
          "label": "Cover Side Finish",
          "required": true,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "door-info-door-thickness",
          "name": "DOOR_THICKNESS",
          "label": "Door Thickness",
          "required": true,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "door-info-top-channel-depth",
          "name": "TOP_CHANNEL_DEPTH",
          "label": "Top Channel Depth",
          "required": true,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "door-info-bottom-channel-depth",
          "name": "BOTTOM_CHANNEL_DEPTH",
          "label": "Bottom Channel Depth",
          "required": true,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "door-info-strike-gap",
          "name": "STRIKE_GAP",
          "label": "Strike Gap",
          "required": true,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "door-info-hinge-gap",
          "name": "HINGE_GAP",
          "label": "Hinge Gap",
          "required": true,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "door-info-door-width-adjustment",
          "name": "DOOR_WIDTH_ADJUSTMENT",
          "label": "Door Width Adjustment",
          "required": true,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "door-info-closure-channel-clearance",
          "name": "CLOSURE_CHANNEL_CLEARANCE",
          "label": "Closure Channel Clearance",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "BOTTOM_EDGE_",
                "operator": "equals",
                "value": 0
              },
              {
                "field": "TOP_EDGE_",
                "operator": "equals",
                "value": 0
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "door-info-active-leaf",
          "name": "ACTIVE_LEAF",
          "label": "Active Leaf",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "P"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-info-weep-holes",
          "name": "WEEP_HOLES",
          "label": "Weep Holes",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "DOOR_CONSTRUCTION_",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "BOTTOM_EDGE_",
                "operator": "equals",
                "value": 2
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-info-weep-holes-2",
          "name": "WEEP_HOLES",
          "label": "Weep Holes",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "door-info-equal-elevations",
          "name": "EQUAL_ELEVATIONS",
          "label": "Equal Elevations",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "P"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-info-astragal",
          "name": "ASTRAGAL",
          "label": "Astragal",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "P"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-info-astragal-installed",
          "name": "ASTRAGAL_INSTALLED",
          "label": "Astragal Installed",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "ASTRAGAL",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-info-add-bottom-channel",
          "name": "ADD_BOTTOM_CHANNEL",
          "label": "Add Bottom Channel",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "DOOR_CONSTRUCTION_",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "BOTTOM_EDGE_",
                "operator": "notEquals",
                "value": 0
              },
              {
                "field": "BOTTOM_EDGE_",
                "operator": "notEquals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-info-door-construction",
          "name": "DOOR_CONSTRUCTION_",
          "label": "Door Construction",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "LOCKSEAM"
            },
            {
              "value": 1,
              "label": "SEAMLESS"
            }
          ]
        },
        {
          "id": "door-info-core",
          "name": "CORE",
          "label": "Core",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "STYRENE"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "FIRE_RATING",
                "operator": "lessThanOrEqual",
                "value": 90
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-info-hinge-edge",
          "name": "HINGE_EDGE_",
          "label": "Hinge Edge",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "BEVEL"
            },
            {
              "value": 1,
              "label": "SQUARE"
            },
            {
              "value": 2,
              "label": "BULLNOSE"
            }
          ]
        },
        {
          "id": "door-info-strike-edge",
          "name": "STRIKE_EDGE_",
          "label": "Strike Edge",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "BEVEL"
            },
            {
              "value": 1,
              "label": "SQUARE"
            },
            {
              "value": 2,
              "label": "BULLNOSE"
            }
          ]
        },
        {
          "id": "door-info-top-edge",
          "name": "TOP_EDGE_",
          "label": "Top Edge",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "INVERTED"
            },
            {
              "value": 1,
              "label": "FLUSH"
            },
            {
              "value": 2,
              "label": "TACKED"
            },
            {
              "value": 3,
              "label": "SEALED"
            },
            {
              "value": 4,
              "label": "SEAMLESS"
            },
            {
              "value": 5,
              "label": "POLISHED"
            }
          ]
        },
        {
          "id": "door-info-bottom-edge",
          "name": "BOTTOM_EDGE_",
          "label": "Bottom Edge",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "INVERTED"
            },
            {
              "value": 1,
              "label": "FLUSH"
            },
            {
              "value": 2,
              "label": "TACKED"
            },
            {
              "value": 3,
              "label": "SEALED"
            },
            {
              "value": 4,
              "label": "SEAMLESS"
            },
            {
              "value": 5,
              "label": "POLISHED"
            }
          ]
        },
        {
          "id": "door-info-top-edge-2",
          "name": "TOP_EDGE_",
          "label": "Top Edge",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "INVERTED"
            },
            {
              "value": 1,
              "label": "FLUSH"
            },
            {
              "value": 2,
              "label": "SEAMLESS"
            },
            {
              "value": 3,
              "label": "WELDED"
            },
            {
              "value": 4,
              "label": "TACKED"
            }
          ]
        },
        {
          "id": "door-info-bottom-edge-2",
          "name": "BOTTOM_EDGE_",
          "label": "Bottom Edge",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "INVERTED"
            },
            {
              "value": 1,
              "label": "FLUSH"
            },
            {
              "value": 2,
              "label": "SEAMLESS"
            },
            {
              "value": 3,
              "label": "WELDED"
            },
            {
              "value": 4,
              "label": "TACKED"
            }
          ]
        },
        {
          "id": "door-info-astragal-door",
          "name": "ASTRAGAL_DOOR_",
          "label": "Astragal Door",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "ACTIVE"
            },
            {
              "value": 1,
              "label": "INACTIVE"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "P"
              },
              {
                "field": "ASTRAGAL",
                "operator": "equals",
                "value": 1
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

---

## Door Lite

**Source:** `SDI/door_lite.tab`

Form specification with 27 configuration fields.

```json-form
{
  "formId": "door-lite",
  "itemType": "custom",
  "title": "Door Lite",
  "description": "Configuration parameters for door lite",
  "sections": [
    {
      "id": "door-lite-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "door-lite-vision-diameter",
          "name": "VISION_DIAMETER",
          "label": "Vision Diameter",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "VISION_SHAPE",
                "operator": "equals",
                "value": 0
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-lite-vision-center-top",
          "name": "VISION_CENTER_TOP",
          "label": "Vision Center Top",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "VISION_DIMENSION_METHOD",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-lite-vision-center-bottom",
          "name": "VISION_CENTER_BOTTOM",
          "label": "Vision Center Bottom",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "VISION_DIMENSION_METHOD",
                "operator": "equals",
                "value": 2
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-lite-vision-width",
          "name": "VISION_WIDTH",
          "label": "Vision Width",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "VISION_SHAPE",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-lite-vision-height",
          "name": "VISION_HEIGHT",
          "label": "Vision Height",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "VISION_DIMENSION_METHOD",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "VISION_DIMENSION_METHOD",
                "operator": "equals",
                "value": 2
              },
              {
                "field": "VISION_DIMENSION_METHOD",
                "operator": "equals",
                "value": 3
              },
              {
                "field": "VISION_DIMENSION_METHOD",
                "operator": "equals",
                "value": 4
              },
              {
                "field": "VISION_DIMENSION_METHOD",
                "operator": "equals",
                "value": 7
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "door-lite-vision-height2",
          "name": "VISION_HEIGHT2",
          "label": "Vision Height2",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "VISION_DIMENSION_METHOD",
                "operator": "equals",
                "value": 7
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-lite-vision-top-rail",
          "name": "VISION_TOP_RAIL",
          "label": "Vision Top Rail",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "VISION_DIMENSION_METHOD",
                "operator": "equals",
                "value": 3
              },
              {
                "field": "VISION_DIMENSION_METHOD",
                "operator": "equals",
                "value": 5
              },
              {
                "field": "VISION_DIMENSION_METHOD",
                "operator": "equals",
                "value": 7
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "door-lite-vision-bottom-rail",
          "name": "VISION_BOTTOM_RAIL",
          "label": "Vision Bottom Rail",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "VISION_DIMENSION_METHOD",
                "operator": "equals",
                "value": 5
              },
              {
                "field": "VISION_DIMENSION_METHOD",
                "operator": "equals",
                "value": 7
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "door-lite-vision-floor-to-bottom",
          "name": "VISION_FLOOR_TO_BOTTOM",
          "label": "Vision Floor To Bottom",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "VISION_DIMENSION_METHOD",
                "operator": "equals",
                "value": 4
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-lite-vision-hinge-stile",
          "name": "VISION_HINGE_STILE",
          "label": "Vision Hinge Stile",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "DOOR_ELEVATION",
                "operator": "equals",
                "value": "N"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-lite-vision-strike-stile",
          "name": "VISION_STRIKE_STILE",
          "label": "Vision Strike Stile",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "DOOR_ELEVATION",
                "operator": "equals",
                "value": "N"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-lite-glass-thickness",
          "name": "GLASS_THICKNESS",
          "label": "Glass Thickness",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "DOOR_LITE_TRIM_TYPE_",
                "operator": "notEquals",
                "value": 0
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-lite-glass-type",
          "name": "GLASS_TYPE",
          "label": "Glass Type",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "GLASS_SUPPLIER_",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "GLASS_TYPE_",
                "operator": "equals",
                "value": 4
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-lite-glass-position-offset",
          "name": "GLASS_POSITION_OFFSET",
          "label": "Glass Position Offset",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "DOOR_LITE_TRIM_TYPE_",
                "operator": "equals",
                "value": 4
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-lite-max-glazing-hole-space",
          "name": "MAX_GLAZING_HOLE_SPACE",
          "label": "Max Glazing Hole Space",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "DOOR_LITE_TRIM_TYPE_",
                "operator": "notEquals",
                "value": 0
              },
              {
                "field": "DOOR_LITE_TRIM_TYPE_",
                "operator": "notEquals",
                "value": 2
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-lite-door-lite-trim-gauge",
          "name": "DOOR_LITE_TRIM_GAUGE",
          "label": "Door Lite Trim Gauge",
          "required": false,
          "type": "integer",
          "placeholder": "0",
          "conditional": {
            "conditions": [
              {
                "field": "DOOR_LITE_TRIM_TYPE_",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "CORNERS_",
                "operator": "equals",
                "value": 0
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-lite-input-complete",
          "name": "INPUT_COMPLETE",
          "label": "Input Complete",
          "required": true,
          "type": "integer",
          "placeholder": "0",
          "conditional": {
            "conditions": [
              {
                "field": "VISION_CENTER_TOP",
                "operator": "equals",
                "value": 0
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-lite-corners",
          "name": "CORNERS_",
          "label": "Corners",
          "type": "switch",
          "defaultValue": false
        },
        {
          "id": "door-lite-instalation",
          "name": "INSTALATION_",
          "label": "Instalation",
          "type": "switch",
          "defaultValue": false
        },
        {
          "id": "door-lite-glass-supplier",
          "name": "GLASS_SUPPLIER_",
          "label": "Glass Supplier",
          "type": "switch",
          "defaultValue": false
        },
        {
          "id": "door-lite-glass-installer",
          "name": "GLASS_INSTALLER_",
          "label": "Glass Installer",
          "type": "switch",
          "defaultValue": false
        },
        {
          "id": "door-lite-door-lite",
          "name": "DOOR_LITE",
          "label": "Door Lite",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "ACTIVE"
            },
            {
              "value": 1,
              "label": "INACTIVE"
            },
            {
              "value": 2,
              "label": "BOTH"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "P"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-lite-vision-dimension-method",
          "name": "VISION_DIMENSION_METHOD",
          "label": "Vision Dimension Method",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": " 0 - NOT SELECTED"
            },
            {
              "value": 1,
              "label": " 1 - TOP TO CENTER"
            },
            {
              "value": 2,
              "label": " 2 - FLOOR TO CENTER"
            },
            {
              "value": 3,
              "label": " 3 - TOP RAIL AND HEIGHT"
            },
            {
              "value": 4,
              "label": " 4 - FLOOR TO BOTTOM AND HEIGHT"
            },
            {
              "value": 5,
              "label": " 5 - TOP AND BOTTOM RAIL CALC HEIGHT"
            },
            {
              "value": 6,
              "label": " 6 - BOTTOM RAIL "
            },
            {
              "value": 7,
              "label": " 7 - FG2, FL2 OR GL"
            }
          ]
        },
        {
          "id": "door-lite-vision-shape",
          "name": "VISION_SHAPE",
          "label": "Vision Shape",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "ROUND"
            },
            {
              "value": 1,
              "label": "SQUARE"
            }
          ]
        },
        {
          "id": "door-lite-door-lite-trim-type",
          "name": "DOOR_LITE_TRIM_TYPE_",
          "label": "Door Lite Trim Type",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "A (CUTOUT)"
            },
            {
              "value": 1,
              "label": "B (SLOPED)"
            },
            {
              "value": 2,
              "label": "C (DUAL FLUSH GLAZING)"
            }
          ]
        },
        {
          "id": "door-lite-removable-side",
          "name": "REMOVABLE_SIDE",
          "label": "Removable Side",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "INSIDE (UNSECURE - STD)"
            },
            {
              "value": 1,
              "label": "OUTSIDE (SECURE)"
            }
          ]
        },
        {
          "id": "door-lite-glass-type-2",
          "name": "GLASS_TYPE_",
          "label": "Glass Type",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "CLEAR"
            },
            {
              "value": 1,
              "label": "WIRED"
            },
            {
              "value": 2,
              "label": "INSULATED"
            },
            {
              "value": 3,
              "label": "LEXAN"
            },
            {
              "value": 4,
              "label": "OTHER"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "DOOR_LITE_TRIM_TYPE_",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "CORNERS_",
                "operator": "equals",
                "value": 0
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

---

## Door Lite Old

**Source:** `SDI/door_lite_old.tab`

Form specification with 17 configuration fields.

```json-form
{
  "formId": "door-lite-old",
  "itemType": "custom",
  "title": "Door Lite Old",
  "description": "Configuration parameters for door lite old",
  "sections": [
    {
      "id": "door-lite-old-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "door-lite-old-vision-width",
          "name": "VISION_WIDTH",
          "label": "Vision Width",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "VISION_SHAPE_",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-lite-old-vision-height",
          "name": "VISION_HEIGHT",
          "label": "Vision Height",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "VISION_SHAPE_",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-lite-old-vision-top-rail",
          "name": "VISION_TOP_RAIL",
          "label": "Vision Top Rail",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "VISION_SHAPE_",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-lite-old-vision-bottom-rail",
          "name": "VISION_BOTTOM_RAIL",
          "label": "Vision Bottom Rail",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "VISION_SHAPE_",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-lite-old-vision-diameter",
          "name": "VISION_DIAMETER",
          "label": "Vision Diameter",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "VISION_SHAPE_",
                "operator": "equals",
                "value": 0
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-lite-old-vision-center-top",
          "name": "VISION_CENTER_TOP",
          "label": "Vision Center Top",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "VISION_SHAPE_",
                "operator": "equals",
                "value": 0
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-lite-old-vision-center-bottom",
          "name": "VISION_CENTER_BOTTOM",
          "label": "Vision Center Bottom",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "VISION_SHAPE_",
                "operator": "equals",
                "value": 0
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-lite-old-vision-hinge-stile",
          "name": "VISION_HINGE_STILE",
          "label": "Vision Hinge Stile",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "DOOR_ELEVATION",
                "operator": "equals",
                "value": "N"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-lite-old-vision-strike-stile",
          "name": "VISION_STRIKE_STILE",
          "label": "Vision Strike Stile",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "DOOR_ELEVATION",
                "operator": "equals",
                "value": "N"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-lite-old-glass-thickness",
          "name": "GLASS_THICKNESS",
          "label": "Glass Thickness",
          "required": true,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "door-lite-old-glass-type",
          "name": "GLASS_TYPE",
          "label": "Glass Type",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "door-lite-old-door-lite",
          "name": "DOOR_LITE",
          "label": "Door Lite",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "ACTIVE"
            },
            {
              "value": 1,
              "label": "INACTIVE"
            },
            {
              "value": 2,
              "label": "BOTH"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "P"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-lite-old-door-lite-trim-type",
          "name": "DOOR_LITE_TRIM_TYPE_",
          "label": "Door Lite Trim Type",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "A (SQUARE)"
            },
            {
              "value": 1,
              "label": "B (SLOPED)"
            },
            {
              "value": 2,
              "label": "C (STOPS)"
            },
            {
              "value": 3,
              "label": "BSL3"
            },
            {
              "value": 4,
              "label": "BSL4"
            }
          ]
        },
        {
          "id": "door-lite-old-rem-stop-side",
          "name": "REM_STOP_SIDE",
          "label": "Rem Stop Side",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "NONE"
            },
            {
              "value": 1,
              "label": "INSIDE (UNSECURE)"
            },
            {
              "value": 2,
              "label": "OUTSIDE (SECURE)"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "DOOR_LITE_TRIM_TYPE_",
                "operator": "equals",
                "value": 3
              },
              {
                "field": "DOOR_LITE_TRIM_TYPE_",
                "operator": "equals",
                "value": 4
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "door-lite-old-vision-shape",
          "name": "VISION_SHAPE_",
          "label": "Vision Shape",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "ROUND"
            },
            {
              "value": 1,
              "label": "SQUARE"
            }
          ]
        },
        {
          "id": "door-lite-old-glass-supplier",
          "name": "GLASS_SUPPLIER_",
          "label": "Glass Supplier",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "OTHERS"
            },
            {
              "value": 1,
              "label": "SDI"
            }
          ]
        },
        {
          "id": "door-lite-old-glass-installer",
          "name": "GLASS_INSTALLER_",
          "label": "Glass Installer",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "OTHERS"
            },
            {
              "value": 1,
              "label": "SDI"
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

---

## Door Louver

**Source:** `SDI/door_louver.tab`

Form specification with 5 configuration fields.

```json-form
{
  "formId": "door-louver",
  "itemType": "custom",
  "title": "Door Louver",
  "description": "Configuration parameters for door louver",
  "sections": [
    {
      "id": "door-louver-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "door-louver-louver-width",
          "name": "LOUVER_WIDTH",
          "label": "Louver Width",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "door-louver-louver-height",
          "name": "LOUVER_HEIGHT",
          "label": "Louver Height",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "door-louver-louver-bottom-rail",
          "name": "LOUVER_BOTTOM_RAIL",
          "label": "Louver Bottom Rail",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "door-louver-door-louver",
          "name": "DOOR_LOUVER",
          "label": "Door Louver",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "ACTIVE"
            },
            {
              "value": 1,
              "label": "INACTIVE"
            },
            {
              "value": 2,
              "label": "BOTH"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "P"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "door-louver-louver-dimension-method",
          "name": "LOUVER_DIMENSION_METHOD",
          "label": "Louver Dimension Method",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": " 0 - NOT SELECTED"
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

---

## Dps

**Source:** `SDI/dps.tab`

Form specification with 9 configuration fields.

```json-form
{
  "formId": "dps",
  "itemType": "custom",
  "title": "Dps",
  "description": "Configuration parameters for dps",
  "sections": [
    {
      "id": "dps-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "dps-dps-ctr",
          "name": "DPS_CTR",
          "label": "Dps Ctr",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "DPS",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "DPS",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "dps-dps-2-ctr",
          "name": "DPS_2_CTR",
          "label": "Dps 2 Ctr",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "EQUAL_DPS",
                "operator": "equals",
                "value": 0
              },
              {
                "field": "DPS",
                "operator": "equals",
                "value": 2
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "dps-select-dps",
          "name": "SELECT_DPS",
          "label": "Select Dps",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "DPS",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "DPS",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "dps-dps-blank",
          "name": "DPS_BLANK",
          "label": "Dps Blank",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "DPS",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "DPS",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "dps-equal-dps",
          "name": "EQUAL_DPS",
          "label": "Equal Dps",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "DPS",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "dps-select-dps-2",
          "name": "SELECT_DPS_2",
          "label": "Select Dps 2",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "EQUAL_DPS",
                "operator": "equals",
                "value": 0
              },
              {
                "field": "DPS",
                "operator": "equals",
                "value": 2
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "dps-dps-2-blank",
          "name": "DPS_2_BLANK",
          "label": "Dps 2 Blank",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "EQUAL_DPS",
                "operator": "equals",
                "value": 0
              },
              {
                "field": "DPS",
                "operator": "equals",
                "value": 2
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "dps-dps",
          "name": "DPS",
          "label": "Dps",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "NONE"
            },
            {
              "value": 1,
              "label": "LEFT - PAIR OR YES - SINGLE"
            },
            {
              "value": 2,
              "label": "RIGHT - FOR PAIRS ONLY"
            },
            {
              "value": 3,
              "label": "BOTH - FOR PAIRS ONLY"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "P"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "dps-dps-position",
          "name": "DPS_POSITION",
          "label": "Dps Position",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "HEAD"
            },
            {
              "value": 1,
              "label": "JAMB"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "S"
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

---

## Drawing History

**Source:** `SDI/Drawing_History.tab`

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
          "type": "radio",
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

---

## Dummy Trim

**Source:** `SDI/dummy_trim.tab`

Form specification with 2 configuration fields.

```json-form
{
  "formId": "dummy-trim",
  "itemType": "custom",
  "title": "Dummy Trim",
  "description": "Configuration parameters for dummy trim",
  "sections": [
    {
      "id": "dummy-trim-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "dummy-trim-strike-center",
          "name": "STRIKE_CENTER",
          "label": "Strike Center",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "dummy-trim-select-trim",
          "name": "SELECT_TRIM",
          "label": "Select Trim",
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

---

## Ept

**Source:** `SDI/ept.tab`

Form specification with 8 configuration fields.

```json-form
{
  "formId": "ept",
  "itemType": "custom",
  "title": "Ept",
  "description": "Configuration parameters for ept",
  "sections": [
    {
      "id": "ept-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "ept-ept-ctr",
          "name": "EPT_CTR",
          "label": "Ept Ctr",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "EPT",
                "operator": "greaterThan",
                "value": 0
              },
              {
                "field": "FRAME_PROCESSED",
                "operator": "notEquals",
                "value": "PROCESSED"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "ept-ept-2-ctr",
          "name": "EPT_2_CTR",
          "label": "Ept 2 Ctr",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "EQUAL_EPT",
                "operator": "equals",
                "value": 0
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "ept-ept",
          "name": "EPT",
          "label": "Ept",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "ept-select-ept",
          "name": "SELECT_EPT",
          "label": "Select Ept",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "ept-ept-blank",
          "name": "EPT_BLANK",
          "label": "Ept Blank",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "ept-equal-ept",
          "name": "EQUAL_EPT",
          "label": "Equal Ept",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "EPT",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "ept-select-ept-2",
          "name": "SELECT_EPT_2",
          "label": "Select Ept 2",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "EQUAL_EPT",
                "operator": "equals",
                "value": 0
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "ept-ept-2-blank",
          "name": "EPT_2_BLANK",
          "label": "Ept 2 Blank",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "EPT",
                "operator": "equals",
                "value": 3
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

---

## Exit Device

**Source:** `SDI/exit_device.tab`

Form specification with 1 configuration fields.

```json-form
{
  "formId": "exit-device",
  "itemType": "custom",
  "title": "Exit Device",
  "description": "Configuration parameters for exit device",
  "sections": [
    {
      "id": "exit-device-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "exit-device-strike-center",
          "name": "STRIKE_CENTER",
          "label": "Strike Center",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
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

---

## Flush Bolt Info

**Source:** `SDI/flush_bolt_info.tab`

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
          "type": "radio",
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
          "type": "radio",
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
          "type": "radio",
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

---

## Flush Pull

**Source:** `SDI/flush_pull.tab`

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
          "type": "radio",
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

---

## Frame 5 20

**Source:** `SDI/frame_5_20.tab`

Form specification with 20 configuration fields.

```json-form
{
  "formId": "frame-5-20",
  "itemType": "custom",
  "title": "Frame 5 20",
  "description": "Configuration parameters for frame 5 20",
  "sections": [
    {
      "id": "frame-5-20-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "frame-5-20-transom-head",
          "name": "TRANSOM_HEAD",
          "label": "Transom Head",
          "required": true,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "frame-5-20-transom-heightmm",
          "name": "TRANSOM_HEIGHTMM",
          "label": "Transom Heightmm",
          "required": true,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "frame-5-20-transom-section",
          "name": "TRANSOM_SECTION",
          "label": "Transom Section",
          "required": true,
          "type": "integer",
          "placeholder": "0"
        },
        {
          "id": "frame-5-20-frame-gauge",
          "name": "FRAME_GAUGE",
          "label": "Frame Gauge",
          "required": true,
          "type": "integer",
          "placeholder": "0"
        },
        {
          "id": "frame-5-20-frame-grade",
          "name": "FRAME_GRADE",
          "label": "Frame Grade",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "frame-5-20-frame-finish",
          "name": "FRAME_FINISH",
          "label": "Frame Finish",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "frame-5-20-stopp",
          "name": "STOPP",
          "label": "Stopp",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "frame-5-20-rabbet",
          "name": "RABBET",
          "label": "Rabbet",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "frame-5-20-xrabbet",
          "name": "XRABBET",
          "label": "Xrabbet",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "frame-5-20-return",
          "name": "RETURN",
          "label": "Return",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "frame-5-20-xreturn",
          "name": "XRETURN",
          "label": "Xreturn",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "frame-5-20-xfacee",
          "name": "XFACEE",
          "label": "Xfacee",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "frame-5-20-xhead",
          "name": "XHEAD",
          "label": "Xhead",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "frame-5-20-head-stopp",
          "name": "HEAD_STOPP",
          "label": "Head Stopp",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "frame-5-20-head-grain",
          "name": "HEAD_GRAIN",
          "label": "Head Grain",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "frame-5-20-active-leaf",
          "name": "ACTIVE_LEAF",
          "label": "Active Leaf",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "frame-5-20-transom-panel-height",
          "name": "TRANSOM_PANEL_HEIGHT",
          "label": "Transom Panel Height",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "frame-5-20-transom-stopp",
          "name": "TRANSOM_STOPP",
          "label": "Transom Stopp",
          "required": true,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "frame-5-20-transom-anchor-center",
          "name": "TRANSOM_ANCHOR_CENTER",
          "label": "Transom Anchor Center",
          "required": true,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "frame-5-20-construction",
          "name": "CONSTRUCTION",
          "label": "Construction",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "FACE WELD"
            },
            {
              "value": 1,
              "label": "FULLY WELDED"
            },
            {
              "value": 2,
              "label": "KNOCK DOWN"
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

---

## Frame Info

**Source:** `SDI/frame_info.tab`

Form specification with 46 configuration fields.

```json-form
{
  "formId": "frame-info",
  "itemType": "custom",
  "title": "Frame Info",
  "description": "Configuration parameters for frame info",
  "sections": [
    {
      "id": "frame-info-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "frame-info-frame-elevation",
          "name": "FRAME_ELEVATION",
          "label": "Frame Elevation",
          "required": true,
          "type": "integer",
          "placeholder": "0",
          "conditional": {
            "conditions": [
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 4
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "frame-info-section",
          "name": "SECTION",
          "label": "Section",
          "required": true,
          "type": "integer",
          "placeholder": "0"
        },
        {
          "id": "frame-info-jd",
          "name": "JD",
          "label": "Jd",
          "required": true,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "frame-info-frame-gauge",
          "name": "FRAME_GAUGE",
          "label": "Frame Gauge",
          "required": true,
          "type": "integer",
          "placeholder": "0"
        },
        {
          "id": "frame-info-frame-grade",
          "name": "FRAME_GRADE",
          "label": "Frame Grade",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "frame-info-frame-finish",
          "name": "FRAME_FINISH",
          "label": "Frame Finish",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "frame-info-stopp",
          "name": "STOPP",
          "label": "Stopp",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "validation": {
            "decimalPlaces": 4
          },
          "helperText": "Precision: 4 decimal places",
          "conditional": {
            "conditions": [
              {
                "field": "SECTION",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "SECTION",
                "operator": "equals",
                "value": 2
              },
              {
                "field": "SECTION",
                "operator": "equals",
                "value": 21
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "frame-info-rabbet",
          "name": "RABBET",
          "label": "Rabbet",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "validation": {
            "decimalPlaces": 4
          },
          "helperText": "Precision: 4 decimal places",
          "conditional": {
            "conditions": [
              {
                "field": "SECTION",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "SECTION",
                "operator": "equals",
                "value": 2
              },
              {
                "field": "SECTION",
                "operator": "equals",
                "value": 21
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "frame-info-xrabbet",
          "name": "XRABBET",
          "label": "Xrabbet",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "validation": {
            "decimalPlaces": 4
          },
          "helperText": "Precision: 4 decimal places",
          "conditional": {
            "conditions": [
              {
                "field": "SECTION",
                "operator": "equals",
                "value": 2
              },
              {
                "field": "SECTION",
                "operator": "equals",
                "value": 21
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "frame-info-return",
          "name": "RETURN",
          "label": "Return",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "validation": {
            "decimalPlaces": 4
          },
          "helperText": "Precision: 4 decimal places"
        },
        {
          "id": "frame-info-xreturn",
          "name": "XRETURN",
          "label": "Xreturn",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "validation": {
            "decimalPlaces": 4
          },
          "helperText": "Precision: 4 decimal places"
        },
        {
          "id": "frame-info-facee",
          "name": "FACEE",
          "label": "Facee",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "validation": {
            "decimalPlaces": 4
          },
          "helperText": "Precision: 4 decimal places"
        },
        {
          "id": "frame-info-xfacee",
          "name": "XFACEE",
          "label": "Xfacee",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "validation": {
            "decimalPlaces": 4
          },
          "helperText": "Precision: 4 decimal places"
        },
        {
          "id": "frame-info-head",
          "name": "HEAD",
          "label": "Head",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "validation": {
            "decimalPlaces": 4
          },
          "helperText": "Precision: 4 decimal places"
        },
        {
          "id": "frame-info-xhead",
          "name": "XHEAD",
          "label": "Xhead",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "validation": {
            "decimalPlaces": 4
          },
          "helperText": "Precision: 4 decimal places"
        },
        {
          "id": "frame-info-head-stopp",
          "name": "HEAD_STOPP",
          "label": "Head Stopp",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "validation": {
            "decimalPlaces": 4
          },
          "helperText": "Precision: 4 decimal places",
          "conditional": {
            "conditions": [
              {
                "field": "SECTION",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "SECTION",
                "operator": "equals",
                "value": 2
              },
              {
                "field": "SECTION",
                "operator": "equals",
                "value": 21
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "frame-info-hospital-stops-height",
          "name": "HOSPITAL_STOPS_HEIGHT",
          "label": "Hospital Stops Height",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "validation": {
            "decimalPlaces": 4
          },
          "helperText": "Precision: 4 decimal places",
          "conditional": {
            "conditions": [
              {
                "field": "HOSPITAL_STOPS",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "frame-info-hospital-stops-angle",
          "name": "HOSPITAL_STOPS_ANGLE",
          "label": "Hospital Stops Angle",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "validation": {
            "decimalPlaces": 4
          },
          "helperText": "Precision: 4 decimal places",
          "conditional": {
            "conditions": [
              {
                "field": "HOSPITAL_STOPS",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "frame-info-side-lite-qty",
          "name": "SIDE_LITE_QTY",
          "label": "Side Lite Qty",
          "required": false,
          "type": "integer",
          "placeholder": "0",
          "conditional": {
            "conditions": [
              {
                "field": "FRAME_ELEVATION",
                "operator": "equals",
                "value": 4
              },
              {
                "field": "FRAME_ELEVATION",
                "operator": "greaterThan",
                "value": 30
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "frame-info-sill",
          "name": "SILL",
          "label": "Sill",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "validation": {
            "decimalPlaces": 4
          },
          "helperText": "Precision: 4 decimal places",
          "conditional": {
            "conditions": [
              {
                "field": "FRAME_ELEVATION",
                "operator": "equals",
                "value": 4
              },
              {
                "field": "FRAME_ELEVATION",
                "operator": "greaterThan",
                "value": 30
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "frame-info-xsill",
          "name": "XSILL",
          "label": "Xsill",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "validation": {
            "decimalPlaces": 4
          },
          "helperText": "Precision: 4 decimal places",
          "conditional": {
            "conditions": [
              {
                "field": "FRAME_ELEVATION",
                "operator": "equals",
                "value": 4
              },
              {
                "field": "FRAME_ELEVATION",
                "operator": "greaterThan",
                "value": 30
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "frame-info-sill-stopp",
          "name": "SILL_STOPP",
          "label": "Sill Stopp",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "validation": {
            "decimalPlaces": 4
          },
          "helperText": "Precision: 4 decimal places",
          "conditional": {
            "conditions": [
              {
                "field": "FRAME_ELEVATION",
                "operator": "equals",
                "value": 4
              },
              {
                "field": "FRAME_ELEVATION",
                "operator": "greaterThan",
                "value": 30
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "frame-info-side-lite-jow",
          "name": "SIDE_LITE_JOW",
          "label": "Side Lite Jow",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "validation": {
            "decimalPlaces": 4
          },
          "helperText": "Precision: 4 decimal places",
          "conditional": {
            "conditions": [
              {
                "field": "FRAME_ELEVATION",
                "operator": "equals",
                "value": 4
              },
              {
                "field": "FRAME_ELEVATION",
                "operator": "greaterThan",
                "value": 30
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "frame-info-side-lite-mullion",
          "name": "SIDE_LITE_MULLION",
          "label": "Side Lite Mullion",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "validation": {
            "decimalPlaces": 4
          },
          "helperText": "Precision: 4 decimal places",
          "conditional": {
            "conditions": [
              {
                "field": "FRAME_ELEVATION",
                "operator": "equals",
                "value": 4
              },
              {
                "field": "FRAME_ELEVATION",
                "operator": "greaterThan",
                "value": 30
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "frame-info-side-lite-glass-thickness",
          "name": "SIDE_LITE_GLASS_THICKNESS",
          "label": "Side Lite Glass Thickness",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "validation": {
            "decimalPlaces": 4
          },
          "helperText": "Precision: 4 decimal places",
          "conditional": {
            "conditions": [
              {
                "field": "FRAME_ELEVATION",
                "operator": "equals",
                "value": 4
              },
              {
                "field": "FRAME_ELEVATION",
                "operator": "greaterThan",
                "value": 30
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "frame-info-active-leaf",
          "name": "ACTIVE_LEAF",
          "label": "Active Leaf",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "P"
              },
              {
                "field": "OPENING_TYPE",
                "operator": "notEquals",
                "value": 4
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "frame-info-glass-thickness",
          "name": "GLASS_THICKNESS",
          "label": "Glass Thickness",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 4
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "frame-info-glass-stop-width",
          "name": "GLASS_STOP_WIDTH",
          "label": "Glass Stop Width",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 4
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "frame-info-max-glazing-hole-space",
          "name": "MAX_GLAZING_HOLE_SPACE",
          "label": "Max Glazing Hole Space",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 4
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "frame-info-glass-type",
          "name": "GLASS_TYPE",
          "label": "Glass Type",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "GLASS_SUPPLIER_",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "GLASS_TYPE_",
                "operator": "equals",
                "value": 4
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "frame-info-help",
          "name": "HELP",
          "label": "Help",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "frame-info-silencers",
          "name": "SILENCERS",
          "label": "Silencers",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "SECTION",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "SECTION",
                "operator": "equals",
                "value": 2
              },
              {
                "field": "SECTION",
                "operator": "equals",
                "value": 21
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "frame-info-hospital-stops",
          "name": "HOSPITAL_STOPS",
          "label": "Hospital Stops",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "SECTION",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "SECTION",
                "operator": "equals",
                "value": 2
              },
              {
                "field": "SECTION",
                "operator": "equals",
                "value": 21
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "frame-info-custom-anchors",
          "name": "CUSTOM_ANCHORS",
          "label": "Custom Anchors",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "frame-info-full-head-reinforcement",
          "name": "FULL_HEAD_REINFORCEMENT",
          "label": "Full Head Reinforcement",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "frame-info-continuous-hinge-reinforcement",
          "name": "CONTINUOUS_HINGE_REINFORCEMENT",
          "label": "Continuous Hinge Reinforcement",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "HINGE_TYPE",
                "operator": "equals",
                "value": "CONTINUOUS"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "frame-info-transom-panel",
          "name": "TRANSOM_PANEL_",
          "label": "Transom Panel",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "frame-info-closed-back",
          "name": "CLOSED_BACK",
          "label": "Closed Back",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "frame-info-glass-supplier",
          "name": "GLASS_SUPPLIER_",
          "label": "Glass Supplier",
          "type": "switch",
          "defaultValue": false,
          "conditional": {
            "conditions": [
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 4
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "frame-info-glass-installer",
          "name": "GLASS_INSTALLER_",
          "label": "Glass Installer",
          "type": "switch",
          "defaultValue": false,
          "conditional": {
            "conditions": [
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 4
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "frame-info-construction",
          "name": "CONSTRUCTION_",
          "label": "Construction",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "FACE WELD"
            },
            {
              "value": 1,
              "label": "FULLY WELDED"
            },
            {
              "value": 2,
              "label": "KNOCK DOWN"
            }
          ]
        },
        {
          "id": "frame-info-head-grain",
          "name": "HEAD_GRAIN_",
          "label": "Head Grain",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "HORIZONTAL"
            },
            {
              "value": 1,
              "label": "VERTICAL"
            }
          ]
        },
        {
          "id": "frame-info-side-lite-side",
          "name": "SIDE_LITE_SIDE",
          "label": "Side Lite Side",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "NONE"
            },
            {
              "value": 1,
              "label": "LEFT"
            },
            {
              "value": 2,
              "label": "RIGHT"
            },
            {
              "value": 3,
              "label": "BOTH"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "FRAME_ELEVATION",
                "operator": "greaterThan",
                "value": 30
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "frame-info-side-lite-stops",
          "name": "SIDE_LITE_STOPS",
          "label": "Side Lite Stops",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "INSIDE (UNSECURE - STD)"
            },
            {
              "value": 1,
              "label": "OUTSIDE (SECURE)"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "FRAME_ELEVATION",
                "operator": "greaterThan",
                "value": 30
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "frame-info-glass-type-2",
          "name": "GLASS_TYPE_",
          "label": "Glass Type",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "CLEAR"
            },
            {
              "value": 1,
              "label": "WIRED"
            },
            {
              "value": 2,
              "label": "INSULATED"
            },
            {
              "value": 3,
              "label": "LEXAN"
            },
            {
              "value": 4,
              "label": "OTHER"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "GLASS_SUPPLIER_",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "frame-info-borrowed-lite-trim-type",
          "name": "BORROWED_LITE_TRIM_TYPE",
          "label": "Borrowed Lite Trim Type",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "DOUBLE GLAZED"
            },
            {
              "value": 1,
              "label": "B"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 4
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

---

## Hinge Info

**Source:** `SDI/hinge_info.tab`

Form specification with 17 configuration fields.

```json-form
{
  "formId": "hinge-info",
  "itemType": "custom",
  "title": "Hinge Info",
  "description": "Configuration parameters for hinge info",
  "sections": [
    {
      "id": "hinge-info-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "hinge-info-top-gap",
          "name": "TOP_GAP",
          "label": "Top Gap",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "hinge-info-hinge-manufacturer",
          "name": "HINGE_MANUFACTURER",
          "label": "Hinge Manufacturer",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "hinge-info-hinge-model",
          "name": "HINGE_MODEL",
          "label": "Hinge Model",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "HINGE_TYPE",
                "operator": "equals",
                "value": "CONTINUOUS"
              },
              {
                "field": "MANUFACTURERS_LOCATIONS",
                "operator": "equals",
                "value": "N/A"
              },
              {
                "field": "HINGE_MANUFACTURER",
                "operator": "equals",
                "value": "GENERIC"
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "hinge-info-template-hinge-gap",
          "name": "TEMPLATE_HINGE_GAP",
          "label": "Template Hinge Gap",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "HINGE_TYPE",
                "operator": "equals",
                "value": "CONTINUOUS"
              },
              {
                "field": "MANUFACTURERS_LOCATIONS",
                "operator": "equals",
                "value": "N/A"
              },
              {
                "field": "HINGE_MANUFACTURER",
                "operator": "equals",
                "value": "GENERIC"
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "hinge-info-hinge-gap-add",
          "name": "HINGE_GAP_ADD",
          "label": "Hinge Gap Add",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "HINGE_TYPE",
                "operator": "equals",
                "value": "CONTINUOUS"
              },
              {
                "field": "MANUFACTURERS_LOCATIONS",
                "operator": "equals",
                "value": "N/A"
              },
              {
                "field": "HINGE_MANUFACTURER",
                "operator": "equals",
                "value": "GENERIC"
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "hinge-info-alt-strike-center",
          "name": "ALT_STRIKE_CENTER",
          "label": "Alt Strike Center",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "ALT_STRIKE_CENTER_",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "hinge-info-custom-hinge-qty",
          "name": "CUSTOM_HINGE_QTY",
          "label": "Custom Hinge Qty",
          "required": false,
          "type": "integer",
          "placeholder": "0",
          "conditional": {
            "conditions": [
              {
                "field": "HINGE_TYPE",
                "operator": "equals",
                "value": "BUTT"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "hinge-info-electric-hinge-position",
          "name": "ELECTRIC_HINGE_POSITION",
          "label": "Electric Hinge Position",
          "required": false,
          "type": "integer",
          "placeholder": "0",
          "conditional": {
            "conditions": [
              {
                "field": "ELECTRIC_HINGE_POSITION",
                "operator": "equals",
                "value": 6
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "hinge-info-elec-hinge-model",
          "name": "ELEC_HINGE_MODEL",
          "label": "Elec Hinge Model",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "ELECTRIC_HINGE_POSITION",
                "operator": "greaterThan",
                "value": 0
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "hinge-info-elec-hinge-model-right",
          "name": "ELEC_HINGE_MODEL_RIGHT",
          "label": "Elec Hinge Model Right",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "P"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "hinge-info-alt-strike-center-2",
          "name": "ALT_STRIKE_CENTER_",
          "label": "Alt Strike Center",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "hinge-info-welded-boxes",
          "name": "WELDED_BOXES",
          "label": "Welded Boxes",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "hinge-info-thru-bolt",
          "name": "THRU_BOLT",
          "label": "Thru Bolt",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "HINGE_TYPE",
                "operator": "equals",
                "value": "CONTINUOUS"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "hinge-info-continuous-hinge-reinforcement",
          "name": "CONTINUOUS_HINGE_REINFORCEMENT",
          "label": "Continuous Hinge Reinforcement",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "HINGE_TYPE",
                "operator": "equals",
                "value": "CONTINUOUS"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "hinge-info-instal-hinge",
          "name": "INSTAL_HINGE",
          "label": "Instal Hinge",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "HINGE_TYPE",
                "operator": "equals",
                "value": "CONTINUOUS"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "hinge-info-electric-hinge-position-2",
          "name": "ELECTRIC_HINGE_POSITION",
          "label": "Electric Hinge Position",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "NONE"
            },
            {
              "value": 1,
              "label": "TOP HINGE"
            },
            {
              "value": 2,
              "label": "SECOND HINGE"
            },
            {
              "value": 3,
              "label": "THIRD HINGE"
            },
            {
              "value": 4,
              "label": "SECOND FROM BOTTOM"
            },
            {
              "value": 5,
              "label": "BOTTOM HINGE"
            },
            {
              "value": 6,
              "label": "ENTER"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "HINGE_TYPE",
                "operator": "equals",
                "value": "BUTT"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "hinge-info-elec-hinge-door",
          "name": "ELEC_HINGE_DOOR",
          "label": "Elec Hinge Door",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "LEFT"
            },
            {
              "value": 1,
              "label": "RIGHT"
            },
            {
              "value": 2,
              "label": "BOTH"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "P"
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

---

## Holder Stop

**Source:** `SDI/holder_stop.tab`

Form specification with 11 configuration fields.

```json-form
{
  "formId": "holder-stop",
  "itemType": "custom",
  "title": "Holder Stop",
  "description": "Configuration parameters for holder stop",
  "sections": [
    {
      "id": "holder-stop-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "holder-stop-hs-model",
          "name": "HS_MODEL",
          "label": "Hs Model",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "HS_TYPE",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "holder-stop-hs-length",
          "name": "HS_LENGTH",
          "label": "Hs Length",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "HS_TYPE",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "holder-stop-hs-offset",
          "name": "HS_OFFSET",
          "label": "Hs Offset",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 2
              },
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "holder-stop-hs-degree",
          "name": "HS_DEGREE",
          "label": "Hs Degree",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 2
              },
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "holder-stop-hs-a",
          "name": "HS_A",
          "label": "Hs A",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "holder-stop-hs-b",
          "name": "HS_B",
          "label": "Hs B",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "holder-stop-hs-c",
          "name": "HS_C",
          "label": "Hs C",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "holder-stop-hs-d",
          "name": "HS_D",
          "label": "Hs D",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "holder-stop-select-device",
          "name": "SELECT_DEVICE",
          "label": "Select Device",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "holder-stop-equal-holders",
          "name": "EQUAL_HOLDERS",
          "label": "Equal Holders",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "P"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "holder-stop-hs-type",
          "name": "HS_TYPE",
          "label": "Hs Type",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "NONE"
            },
            {
              "value": 1,
              "label": "SURFACE"
            },
            {
              "value": 2,
              "label": "CONCEALED"
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

---

## Hospital Latch

**Source:** `SDI/hospital_latch.tab`

Form specification with 1 configuration fields.

```json-form
{
  "formId": "hospital-latch",
  "itemType": "custom",
  "title": "Hospital Latch",
  "description": "Configuration parameters for hospital latch",
  "sections": [
    {
      "id": "hospital-latch-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "hospital-latch-orientation",
          "name": "ORIENTATION",
          "label": "Orientation",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "VERTICAL"
            },
            {
              "value": 1,
              "label": "HORIZONTAL"
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

---

## Kick Plate

**Source:** `SDI/kick_plate.tab`

Form specification with 5 configuration fields.

```json-form
{
  "formId": "kick-plate",
  "itemType": "custom",
  "title": "Kick Plate",
  "description": "Configuration parameters for kick plate",
  "sections": [
    {
      "id": "kick-plate-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "kick-plate-kick-plate-gauge",
          "name": "KICK_PLATE_GAUGE",
          "label": "Kick Plate Gauge",
          "required": false,
          "type": "integer",
          "placeholder": "0"
        },
        {
          "id": "kick-plate-kick-plate-width",
          "name": "KICK_PLATE_WIDTH",
          "label": "Kick Plate Width",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "kick-plate-kick-plate-height-push",
          "name": "KICK_PLATE_HEIGHT_PUSH",
          "label": "Kick Plate Height Push",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "KICK_PLATE_SIDE",
                "operator": "equals",
                "value": 0
              },
              {
                "field": "KICK_PLATE_SIDE",
                "operator": "equals",
                "value": 2
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "kick-plate-kick-plate-height-pull",
          "name": "KICK_PLATE_HEIGHT_PULL",
          "label": "Kick Plate Height Pull",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "KICK_PLATE_SIDE",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "KICK_PLATE_SIDE",
                "operator": "equals",
                "value": 2
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "kick-plate-kick-plate-side",
          "name": "KICK_PLATE_SIDE",
          "label": "Kick Plate Side",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "PUSH SIDE"
            },
            {
              "value": 1,
              "label": "PULL SIDE"
            },
            {
              "value": 2,
              "label": "BOTH SIDES"
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

---

## Lite Info

**Source:** `SDI/lite_info.tab`

Form specification with 21 configuration fields.

```json-form
{
  "formId": "lite-info",
  "itemType": "custom",
  "title": "Lite Info",
  "description": "Configuration parameters for lite info",
  "sections": [
    {
      "id": "lite-info-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "lite-info-frame-elevation",
          "name": "FRAME_ELEVATION",
          "label": "Frame Elevation",
          "required": true,
          "type": "integer",
          "placeholder": "0"
        },
        {
          "id": "lite-info-section",
          "name": "SECTION",
          "label": "Section",
          "required": true,
          "type": "integer",
          "placeholder": "0"
        },
        {
          "id": "lite-info-jd",
          "name": "JD",
          "label": "Jd",
          "required": true,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "lite-info-frame-gauge",
          "name": "FRAME_GAUGE",
          "label": "Frame Gauge",
          "required": true,
          "type": "integer",
          "placeholder": "0"
        },
        {
          "id": "lite-info-frame-grade",
          "name": "FRAME_GRADE",
          "label": "Frame Grade",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "lite-info-frame-finish",
          "name": "FRAME_FINISH",
          "label": "Frame Finish",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "lite-info-stopp",
          "name": "STOPP",
          "label": "Stopp",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "lite-info-rabbet",
          "name": "RABBET",
          "label": "Rabbet",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "lite-info-xrabbet",
          "name": "XRABBET",
          "label": "Xrabbet",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "lite-info-return",
          "name": "RETURN",
          "label": "Return",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "lite-info-xreturn",
          "name": "XRETURN",
          "label": "Xreturn",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "lite-info-facee",
          "name": "FACEE",
          "label": "Facee",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "lite-info-xfacee",
          "name": "XFACEE",
          "label": "Xfacee",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "lite-info-head",
          "name": "HEAD",
          "label": "Head",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "lite-info-xhead",
          "name": "XHEAD",
          "label": "Xhead",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "lite-info-head-stopp",
          "name": "HEAD_STOPP",
          "label": "Head Stopp",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "lite-info-sill",
          "name": "SILL",
          "label": "Sill",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "lite-info-xsill",
          "name": "XSILL",
          "label": "Xsill",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "lite-info-sill-stopp",
          "name": "SILL_STOPP",
          "label": "Sill Stopp",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "lite-info-construction",
          "name": "CONSTRUCTION_",
          "label": "Construction",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "FACE WELD"
            },
            {
              "value": 1,
              "label": "FULLY WELDED"
            },
            {
              "value": 2,
              "label": "KNOCK DOWN"
            }
          ]
        },
        {
          "id": "lite-info-head-grain",
          "name": "HEAD_GRAIN_",
          "label": "Head Grain",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "HORIZONTAL"
            },
            {
              "value": 1,
              "label": "VERTICAL"
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

---

## Locations

**Source:** `SDI/locations.tab`

Form specification with 1 configuration fields.

```json-form
{
  "formId": "locations",
  "itemType": "custom",
  "title": "Locations",
  "description": "Configuration parameters for locations",
  "sections": [
    {
      "id": "locations-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "locations-joh",
          "name": "JOH",
          "label": "Joh",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
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

---

## Lock Options

**Source:** `SDI/lock_options.tab`

Form specification with 15 configuration fields.

```json-form
{
  "formId": "lock-options",
  "itemType": "custom",
  "title": "Lock Options",
  "description": "Configuration parameters for lock options",
  "sections": [
    {
      "id": "lock-options-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "lock-options-strike-center",
          "name": "STRIKE_CENTER",
          "label": "Strike Center",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "FRAME_PROCESSED",
                "operator": "notEquals",
                "value": "PROCESSED"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "lock-options-mullion-add-per-door",
          "name": "MULLION_ADD_PER_DOOR",
          "label": "Mullion Add Per Door",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "EXIT_MULLION",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "lock-options-mortise-box-depth",
          "name": "MORTISE_BOX_DEPTH",
          "label": "Mortise Box Depth",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "SPECIAL_BOX_DEPTH",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "lock-options-exit-mullion",
          "name": "EXIT_MULLION",
          "label": "Exit Mullion",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "P"
              },
              {
                "field": "LOCK_TYPE",
                "operator": "equals",
                "value": 4
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "lock-options-unequal-exits",
          "name": "UNEQUAL_EXITS",
          "label": "Unequal Exits",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "P"
              },
              {
                "field": "LOCK_TYPE",
                "operator": "equals",
                "value": 4
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "lock-options-fire-bolt",
          "name": "FIRE_BOLT",
          "label": "Fire Bolt",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "P"
              },
              {
                "field": "LOCK_TYPE",
                "operator": "equals",
                "value": 4
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "lock-options-special-box-depth",
          "name": "SPECIAL_BOX_DEPTH",
          "label": "Special Box Depth",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "lock-options-select-lock",
          "name": "SELECT_LOCK",
          "label": "Select Lock",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "lock-options-select-trim",
          "name": "SELECT_TRIM",
          "label": "Select Trim",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "lock-options-lock-electrified",
          "name": "LOCK_ELECTRIFIED",
          "label": "Lock Electrified",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "lock-options-verify-strike",
          "name": "VERIFY_STRIKE",
          "label": "Verify Strike",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "lock-options-verify-lock",
          "name": "VERIFY_LOCK",
          "label": "Verify Lock",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "lock-options-lock-type",
          "name": "LOCK_TYPE",
          "label": "Lock Type",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "NONE"
            }
          ]
        },
        {
          "id": "lock-options-lock-electrified-2",
          "name": "LOCK_ELECTRIFIED",
          "label": "Lock Electrified",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "NONE"
            },
            {
              "value": 1,
              "label": "BOX"
            },
            {
              "value": 2,
              "label": "TAIL"
            }
          ]
        },
        {
          "id": "lock-options-backset-reference",
          "name": "BACKSET_REFERENCE",
          "label": "Backset Reference",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "STOP"
            },
            {
              "value": 1,
              "label": "DOOR EDGE"
            },
            {
              "value": 2,
              "label": "DOOR BEVEL CL"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "LOCK_TYPE",
                "operator": "equals",
                "value": 3
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

---

## Lock Prep

**Source:** `SDI/lock_prep.tab`

Form specification with 2 configuration fields.

```json-form
{
  "formId": "lock-prep",
  "itemType": "custom",
  "title": "Lock Prep",
  "description": "Configuration parameters for lock prep",
  "sections": [
    {
      "id": "lock-prep-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "lock-prep-mortise-box-depth",
          "name": "MORTISE_BOX_DEPTH",
          "label": "Mortise Box Depth",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "SPECIAL_BOX_DEPTH",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "lock-prep-special-box-depth",
          "name": "SPECIAL_BOX_DEPTH",
          "label": "Special Box Depth",
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

---

## Mortise Lock

**Source:** `SDI/mortise_lock.tab`

Form specification with 2 configuration fields.

```json-form
{
  "formId": "mortise-lock",
  "itemType": "custom",
  "title": "Mortise Lock",
  "description": "Configuration parameters for mortise lock",
  "sections": [
    {
      "id": "mortise-lock-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "mortise-lock-mortise-box-depth",
          "name": "MORTISE_BOX_DEPTH",
          "label": "Mortise Box Depth",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "SPECIAL_BOX_DEPTH",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "mortise-lock-special-box-depth",
          "name": "SPECIAL_BOX_DEPTH",
          "label": "Special Box Depth",
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

---

## Options

**Source:** `SDI/options.tab`

Form specification with 38 configuration fields.

```json-form
{
  "formId": "options",
  "itemType": "custom",
  "title": "Options",
  "description": "Configuration parameters for options",
  "sections": [
    {
      "id": "options-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "options-flush-bolt-center-top",
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
          "id": "options-flush-bolt-center-bottom",
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
          "id": "options-flush-bolt-model",
          "name": "FLUSH_BOLT_MODEL",
          "label": "Flush Bolt Model",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "FLUSH_BOLTS",
                "operator": "greaterThan",
                "value": 0
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "options-silencer-hole-dia",
          "name": "SILENCER_HOLE_DIA",
          "label": "Silencer Hole Dia",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "SILENCERS",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "options-hasp-center",
          "name": "HASP_CENTER",
          "label": "Hasp Center",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "HASP",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "options-tuflock-center",
          "name": "TUFLOCK_CENTER",
          "label": "Tuflock Center",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "TUFLOCK",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "options-peep-cl",
          "name": "PEEP_CL",
          "label": "Peep Cl",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "PEEP",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "options-peep-dia",
          "name": "PEEP_DIA",
          "label": "Peep Dia",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "PEEP",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "options-hinges",
          "name": "HINGES",
          "label": "Hinges",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "FRAME_PROCESSED",
                "operator": "notEquals",
                "value": "PROCESSED"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "options-closer",
          "name": "CLOSER",
          "label": "Closer",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "FRAME_PROCESSED",
                "operator": "notEquals",
                "value": "PROCESSED"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "options-welded-preps",
          "name": "WELDED_PREPS",
          "label": "Welded Preps",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "options-primary-lock",
          "name": "PRIMARY_LOCK",
          "label": "Primary Lock",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "options-secondary-lock",
          "name": "SECONDARY_LOCK",
          "label": "Secondary Lock",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "options-dummy-trim",
          "name": "DUMMY_TRIM",
          "label": "Dummy Trim",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "P"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "options-primary-strike",
          "name": "PRIMARY_STRIKE",
          "label": "Primary Strike",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 2
              },
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "S"
              },
              {
                "field": "FRAME_PROCESSED",
                "operator": "notEquals",
                "value": "PROCESSED"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "options-secondary-strike",
          "name": "SECONDARY_STRIKE",
          "label": "Secondary Strike",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 2
              },
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "S"
              },
              {
                "field": "FRAME_PROCESSED",
                "operator": "notEquals",
                "value": "PROCESSED"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "options-push-pull",
          "name": "PUSH_PULL",
          "label": "Push Pull",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "options-holder-stop",
          "name": "HOLDER_STOP",
          "label": "Holder Stop",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "options-auto-operator",
          "name": "AUTO_OPERATOR",
          "label": "Auto Operator",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "CLOSER",
                "operator": "equals",
                "value": 0
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "options-coordinator",
          "name": "COORDINATOR",
          "label": "Coordinator",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "options-mag-lock",
          "name": "MAG_LOCK",
          "label": "Mag Lock",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "S"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "options-ept",
          "name": "EPT",
          "label": "Ept",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "S"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "options-dps",
          "name": "DPS",
          "label": "Dps",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "S"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "options-astragal",
          "name": "ASTRAGAL",
          "label": "Astragal",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "P"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "options-astragal-installed",
          "name": "ASTRAGAL_INSTALLED",
          "label": "Astragal Installed",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "P"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "options-head-strike",
          "name": "HEAD_STRIKE",
          "label": "Head Strike",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 2
              },
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "options-silencers",
          "name": "SILENCERS",
          "label": "Silencers",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 2
              },
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "options-door-edge-reinforcement",
          "name": "DOOR_EDGE_REINFORCEMENT",
          "label": "Door Edge Reinforcement",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "options-kick-plate",
          "name": "KICK_PLATE",
          "label": "Kick Plate",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "options-ept-2",
          "name": "EPT",
          "label": "Ept",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "NONE"
            },
            {
              "value": 1,
              "label": "LEFT - PAIR OR YES - SINGLE"
            },
            {
              "value": 2,
              "label": "RIGHT - FOR PAIRS ONLY"
            },
            {
              "value": 3,
              "label": "BOTH - FOR PAIRS ONLY"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "P"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "options-dps-2",
          "name": "DPS",
          "label": "Dps",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "NONE"
            },
            {
              "value": 1,
              "label": "LEFT - PAIR OR YES - SINGLE"
            },
            {
              "value": 2,
              "label": "RIGHT - FOR PAIRS ONLY"
            },
            {
              "value": 3,
              "label": "BOTH - FOR PAIRS ONLY"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "P"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "options-mag-lock-2",
          "name": "MAG_LOCK",
          "label": "Mag Lock",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "NONE"
            },
            {
              "value": 1,
              "label": "LEFT - PAIR OR YES - SINGLE"
            },
            {
              "value": 2,
              "label": "RIGHT - FOR PAIRS ONLY"
            },
            {
              "value": 3,
              "label": "BOTH - FOR PAIRS ONLY"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "P"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "options-flush-bolts",
          "name": "FLUSH_BOLTS",
          "label": "Flush Bolts",
          "type": "radio",
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
          ],
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "P"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "options-top-bolt-type",
          "name": "TOP_BOLT_TYPE",
          "label": "Top Bolt Type",
          "type": "radio",
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
          "id": "options-bottom-bolt-type",
          "name": "BOTTOM_BOLT_TYPE",
          "label": "Bottom Bolt Type",
          "type": "radio",
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
        },
        {
          "id": "options-surface-bolts",
          "name": "SURFACE_BOLTS",
          "label": "Surface Bolts",
          "type": "radio",
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
          ],
          "conditional": {
            "conditions": [
              {
                "field": "SUB_TYPE",
                "operator": "equals",
                "value": "P"
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "options-auto-bottom",
          "name": "AUTO_BOTTOM",
          "label": "Auto Bottom",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "NONE"
            },
            {
              "value": 1,
              "label": "SURFACE"
            },
            {
              "value": 2,
              "label": "MORTISE"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 1
              },
              {
                "field": "OPENING_TYPE",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "options-lead-lined",
          "name": "LEAD_LINED",
          "label": "Lead Lined",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "NONE"
            },
            {
              "value": 1,
              "label": "1/16"
            },
            {
              "value": 2,
              "label": "1/8"
            },
            {
              "value": 3,
              "label": "1/4"
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

---

## Parameters

**Source:** `SDI/Parameters.tab`

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

---

## Push Pull

**Source:** `SDI/push_pull.tab`

Form specification with 13 configuration fields.

```json-form
{
  "formId": "push-pull",
  "itemType": "custom",
  "title": "Push Pull",
  "description": "Configuration parameters for push pull",
  "sections": [
    {
      "id": "push-pull-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "push-pull-push-plate-center",
          "name": "PUSH_PLATE_CENTER",
          "label": "Push Plate Center",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "PUSH_PLATE",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "push-pull-pull-plate-center",
          "name": "PULL_PLATE_CENTER",
          "label": "Pull Plate Center",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "PULL_PLATE",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "push-pull-pull-plate-height",
          "name": "PULL_PLATE_HEIGHT",
          "label": "Pull Plate Height",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "PULL_PLATE",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "push-pull-push-pull-width",
          "name": "PUSH_PULL_WIDTH",
          "label": "Push Pull Width",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "PULL_PLATE",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "push-pull-push-bar-center",
          "name": "PUSH_BAR_CENTER",
          "label": "Push Bar Center",
          "required": false,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "PUSH_BAR",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "push-pull-pull-bar-hole-centers",
          "name": "PULL_BAR_HOLE_CENTERS",
          "label": "Pull Bar Hole Centers",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "PRE_PUNCH_PULL_BAR",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "push-pull-pull-bar-backset",
          "name": "PULL_BAR_BACKSET",
          "label": "Pull Bar Backset",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "PRE_PUNCH_PULL_BAR",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "push-pull-pull-bar-screw-size",
          "name": "PULL_BAR_SCREW_SIZE",
          "label": "Pull Bar Screw Size",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "PRE_PUNCH_PULL_BAR",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "push-pull-push-plate",
          "name": "PUSH_PLATE",
          "label": "Push Plate",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "push-pull-pull-plate",
          "name": "PULL_PLATE",
          "label": "Pull Plate",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "push-pull-push-bar",
          "name": "PUSH_BAR",
          "label": "Push Bar",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "push-pull-pre-punch-pull-bar",
          "name": "PRE_PUNCH_PULL_BAR",
          "label": "Pre Punch Pull Bar",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable",
          "conditional": {
            "conditions": [
              {
                "field": "PUSH_BAR",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "push-pull-flush-pull",
          "name": "FLUSH_PULL",
          "label": "Flush Pull",
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

---

## Rixon

**Source:** `SDI/rixon.tab`

Form specification with 3 configuration fields.

```json-form
{
  "formId": "rixon",
  "itemType": "custom",
  "title": "Rixon",
  "description": "Configuration parameters for rixon",
  "sections": [
    {
      "id": "rixon-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "rixon-hs-offset",
          "name": "HS_OFFSET",
          "label": "Hs Offset",
          "required": true,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "rixon-hs-degree",
          "name": "HS_DEGREE",
          "label": "Hs Degree",
          "required": true,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "rixon-select-device",
          "name": "SELECT_DEVICE",
          "label": "Select Device",
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

---

## Sched

**Source:** `SDI/Sched.tab`

Form specification with 16 configuration fields.

```json-form
{
  "formId": "Sched",
  "itemType": "custom",
  "title": "Sched",
  "description": "Configuration parameters for sched",
  "sections": [
    {
      "id": "Sched-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "Sched-rev0-num",
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
          "id": "Sched-rev0-date",
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
          "id": "Sched-rev0-by",
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
          "id": "Sched-rev1-num",
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
          "id": "Sched-rev1-date",
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
          "id": "Sched-rev1-by",
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
          "id": "Sched-rev2-num",
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
          "id": "Sched-rev2-date",
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
          "id": "Sched-rev2-by",
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
          "id": "Sched-rev3-num",
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
          "id": "Sched-rev3-date",
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
          "id": "Sched-rev3-by",
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
          "id": "Sched-rev4-num",
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
          "id": "Sched-rev4-date",
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
          "id": "Sched-rev4-by",
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
          "id": "Sched-add-revision",
          "name": "ADD_REVISION",
          "label": "Add Revision",
          "type": "radio",
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

---

## Sdi Project

**Source:** `SDI/SDI_Project.tab`

Form specification with 22 configuration fields.

```json-form
{
  "formId": "Create New Item",
  "itemType": "Door/Frame Item",
  "title": "New Item",
  "description": "Configuration parameters for New Item",
  "sections": [
    {
      "id": "Item-Header",
      "title": "Item Details",
      "fields":[     
        {
          "id": "SDI-Project-item-num",
          "name": "ITEM_NUM",
          "label": "Item Num",
          "required": true,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "SDI-Project-qty",
          "name": "QTY",
          "label": "Qty",
          "required": true,
          "type": "integer",
          "placeholder": "0"
        },
        {
          "id": "SDI-Project-jow",
          "name": "JOW",
          "label": "Jow",
          "required": true,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "SDI-Project-joh",
          "name": "JOH",
          "label": "Joh",
          "required": true,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "SDI-Project-jd",
          "name": "JD",
          "label": "Jd",
          "required": true,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "SDI-Project-fire-rating",
          "name": "FIRE_RATING",
          "label": "Fire Rating",
          "required": true,
          "type": "integer",
          "placeholder": "0"
        },
        {
          "id": "SDI-Project-comments",
          "name": "COMMENTS",
          "label": "Comments",
          "required": false,
          "type": "input",
          "inputType": "text",
          "placeholder": ""
        },
        {
          "id": "SDI-Project-door-qty",
          "name": "DOOR_QTY",
          "label": "Door Qty",
          "required": true,
          "type": "integer",
          "placeholder": "0",
          "conditional": {
            "conditions": [
              {
                "field": "HANDI_",
                "operator": "equals",
                "value": 0
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "SDI-Project-submittal",
          "name": "SUBMITTAL",
          "label": "Submittal",
          "type": "switch",
          "defaultValue": false
        },
        {
          "id": "SDI-Project-approval",
          "name": "APPROVAL",
          "label": "Approval",
          "type": "switch",
          "defaultValue": false
        },
        {
          "id": "SDI-Project-door-label-construction",
          "name": "DOOR_LABEL_CONSTRUCTION",
          "label": "Door Label Construction",
          "type": "switch",
          "defaultValue": false
        },
        {
          "id": "SDI-Project-multiple-tags",
          "name": "MULTIPLE_TAGS",
          "label": "Multiple Tags",
          "type": "switch",
          "defaultValue": false
        },
        {
          "id": "SDI-Project-sdi-location",
          "name": "SDI_LOCATION",
          "label": "Sdi Location",
          "type": "switch",
          "defaultValue": false,
          "helperText": "Toggle to enable"
        },
        {
          "id": "SDI-Project-opening-type",
          "name": "OPENING_TYPE",
          "label": "Opening Type",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "NON SELECTED"
            },
            {
              "value": 1,
              "label": "DOOR ONLY"
            },
            {
              "value": 2,
              "label": "FRAME ONLY"
            },
            {
              "value": 3,
              "label": "BOTH"
            },
            {
              "value": 4,
              "label": "BORROWED LITE"
            }
          ]
        },
        {
          "id": "SDI-Project-handi",
          "name": "HANDI_",
          "label": "Handi",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": " LH"
            },
            {
              "value": 1,
              "label": "RH"
            },
            {
              "value": 2,
              "label": "LHA"
            },
            {
              "value": 3,
              "label": "RHA"
            },
            {
              "value": 4,
              "label": "LH/RH"
            },
            {
              "value": 5,
              "label": " LHR"
            },
            {
              "value": 6,
              "label": "RHR"
            },
            {
              "value": 7,
              "label": "LHRA"
            },
            {
              "value": 8,
              "label": "RHRA"
            },
            {
              "value": 9,
              "label": "LHR/RHR"
            },
            {
              "value": 10,
              "label": "NO HANDING"
            },
            {
              "value": 11,
              "label": "SELECT HAND"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "OPENING_TYPE",
                "operator": "notEquals",
                "value": 4
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

---

## Seconary Lock Options

**Source:** `SDI/seconary_lock_options.tab`

Form specification with 4 configuration fields.

```json-form
{
  "formId": "seconary-lock-options",
  "itemType": "custom",
  "title": "Seconary Lock Options",
  "description": "Configuration parameters for seconary lock options",
  "sections": [
    {
      "id": "seconary-lock-options-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "seconary-lock-options-strike-center",
          "name": "STRIKE_CENTER",
          "label": "Strike Center",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "seconary-lock-options-primary-strike-center",
          "name": "PRIMARY_STRIKE_CENTER",
          "label": "Primary Strike Center",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "seconary-lock-options-lock-type",
          "name": "LOCK_TYPE",
          "label": "Lock Type",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "NONE"
            },
            {
              "value": 1,
              "label": "CYLINDER"
            },
            {
              "value": 2,
              "label": "MORTISE"
            },
            {
              "value": 3,
              "label": "EXIT DEVICE"
            },
            {
              "value": 4,
              "label": "HOSPITAL LATCH"
            },
            {
              "value": 5,
              "label": "ROLLER"
            },
            {
              "value": 6,
              "label": "OTHER"
            }
          ],
          "conditional": {
            "conditions": [
              {
                "field": "LOCK",
                "operator": "equals",
                "value": 1
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "seconary-lock-options-strike-type",
          "name": "STRIKE_TYPE",
          "label": "Strike Type",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "NONE"
            },
            {
              "value": 1,
              "label": "ASA 2-3/4"
            },
            {
              "value": 2,
              "label": "ASA 4-7/8"
            },
            {
              "value": 3,
              "label": "DB 2-3/4"
            },
            {
              "value": 4,
              "label": "DB 3-1/2"
            },
            {
              "value": 5,
              "label": "DB 4-7/8"
            },
            {
              "value": 6,
              "label": "ELECTRIC"
            },
            {
              "value": 7,
              "label": "OTHER"
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

---

## Standard Componets

**Source:** `SDI/standard_componets.tab`

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

---

## Steel Stiff Info

**Source:** `SDI/steel_stiff_info.tab`

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

---

## Strikes

**Source:** `SDI/strikes.tab`

Form specification with 7 configuration fields.

```json-form
{
  "formId": "strikes",
  "itemType": "custom",
  "title": "Strikes",
  "description": "Configuration parameters for strikes",
  "sections": [
    {
      "id": "strikes-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "strikes-strike-center",
          "name": "STRIKE_CENTER",
          "label": "Strike Center",
          "required": false,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "strikes-strike-model",
          "name": "STRIKE_MODEL",
          "label": "Strike Model",
          "required": true,
          "type": "input",
          "inputType": "text",
          "placeholder": "",
          "conditional": {
            "conditions": [
              {
                "field": "STRIKE_TYPE",
                "operator": "equals",
                "value": 3
              },
              {
                "field": "STRIKE_TYPE",
                "operator": "equals",
                "value": 4
              }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "strikes-strike-plate-thickness",
          "name": "STRIKE_PLATE_THICKNESS",
          "label": "Strike Plate Thickness",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "STRIKE_TYPE",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "strikes-elec-strike-lip-thickness",
          "name": "ELEC_STRIKE_LIP_THICKNESS",
          "label": "Elec Strike Lip Thickness",
          "required": true,
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              {
                "field": "STRIKE_TYPE",
                "operator": "equals",
                "value": 3
              }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "strikes-verify-strike",
          "name": "VERIFY_STRIKE",
          "label": "Verify Strike",
          "type": "switch",
          "defaultValue": false
        },
        {
          "id": "strikes-strike-electrified",
          "name": "STRIKE_ELECTRIFIED",
          "label": "Strike Electrified",
          "type": "switch",
          "defaultValue": false
        },
        {
          "id": "strikes-alt-strike-center",
          "name": "ALT_STRIKE_CENTER_",
          "label": "Alt Strike Center",
          "type": "switch",
          "defaultValue": false
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

---

## Tags

**Source:** `SDI/tags.tab`

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

---

## Transom Panel

**Source:** `SDI/transom_panel.tab`

Form specification with 4 configuration fields.

```json-form
{
  "formId": "transom-panel",
  "itemType": "custom",
  "title": "Transom Panel",
  "description": "Configuration parameters for transom panel",
  "sections": [
    {
      "id": "transom-panel-configuration",
      "title": "Configuration",
      "fields": [
        {
          "id": "transom-panel-transom-panel-height",
          "name": "TRANSOM_PANEL_HEIGHT",
          "label": "Transom Panel Height",
          "required": true,
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "transom-panel-transom-panel-gauge",
          "name": "TRANSOM_PANEL_GAUGE",
          "label": "Transom Panel Gauge",
          "required": true,
          "type": "integer",
          "placeholder": "0"
        },
        {
          "id": "transom-panel-transom-panel-attach-method",
          "name": "TRANSOM_PANEL_ATTACH_METHOD",
          "label": "Transom Panel Attach Method",
          "type": "radio",
          "required": false,
          "options": [
            {
              "value": 0,
              "label": "LOOSE"
            },
            {
              "value": 1,
              "label": "ANGLES"
            },
            {
              "value": 2,
              "label": "WELDED"
            }
          ]
        },
        {
          "id": "transom-panel-transom-panel-core",
          "name": "TRANSOM_PANEL_CORE",
          "label": "Transom Panel Core",
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
              "label": "HONEYCOMB"
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

---

## Anchors SA

**Source:** `SDI_New/anchorsSA.tab`

Form specification with 28 configuration fields for anchor settings with advanced conditional logic.

```json-form
{
  "formId": "anchors-sa",
  "itemType": "custom",
  "title": "Anchors SA",
  "description": "Advanced anchor configuration parameters from anchorsSA.tab",
  "sections": [
    {
      "id": "anchors-sa-display",
      "title": "Display Information",
      "fields": [
        {
          "id": "anchors-sa-help",
          "name": "HELP",
          "label": "Show Help Image",
          "type": "checkbox",
          "description": "Display ANCHORS.GIF reference image"
        },
        {
          "id": "anchors-sa-item-num",
          "name": "ITEM_NUM",
          "label": "Item Number",
          "type": "display",
          "inputType": "text",
          "readOnly": true
        },
        {
          "id": "anchors-sa-jd",
          "name": "JD",
          "label": "JD",
          "type": "display",
          "inputType": "number",
          "readOnly": true
        },
        {
          "id": "anchors-sa-jamb-ctr",
          "name": "JAMB_CTR",
          "label": "Jamb Center",
          "type": "display",
          "inputType": "number",
          "readOnly": true
        },
        {
          "id": "anchors-sa-std-anchor-ctr",
          "name": "STD_ANCHOR_CTR",
          "label": "Std Anchor Center",
          "type": "display",
          "inputType": "number",
          "readOnly": true
        }
      ]
    },
    {
      "id": "anchors-sa-type",
      "title": "Anchor Type Selection",
      "fields": [
        {
          "id": "anchors-sa-anchor-type",
          "name": "ANCHOR_TYPE",
          "label": "Anchor Type",
          "type": "radioGroup",
          "required": true,
          "options": [
            { "value": 0, "label": "None" },
            { "value": 1, "label": "Galvanized Wire" },
            { "value": 2, "label": "Stainless Wire" },
            { "value": 3, "label": "Loose T" },
            { "value": 4, "label": "Loose Stud" },
            { "value": 5, "label": "Welded Stud Strap" },
            { "value": 6, "label": "HD Welded Stud" },
            { "value": 7, "label": "Welded Stud" },
            { "value": 8, "label": "P&D EWA" },
            { "value": 9, "label": "Concealed EWA" },
            { "value": 10, "label": "Adjustable Masonary" },
            { "value": 11, "label": "Compression" }
          ]
        },
        {
          "id": "anchors-sa-anchor-ctr",
          "name": "ANCHOR_CTR",
          "label": "Anchor Center",
          "type": "float",
          "required": true,
          "placeholder": "0.0000",
          "validation": {
            "decimalPlaces": 4
          },
          "conditional": {
            "conditions": [
              { "field": "ANCHOR_TYPE", "operator": "equals", "value": 8 },
              { "field": "ANCHOR_TYPE", "operator": "equals", "value": 9 },
              { "field": "ANCHOR_TYPE", "operator": "equals", "value": 11 }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "anchors-sa-anchor-desc",
          "name": "ANCHOR_DESC",
          "label": "Anchor Description",
          "type": "input",
          "inputType": "text",
          "placeholder": "Custom anchor description",
          "conditional": {
            "conditions": [
              { "field": "CUSTOM_ANCHORS", "operator": "equals", "value": 1 }
            ],
            "logic": "AND"
          }
        }
      ]
    },
    {
      "id": "anchors-sa-clips",
      "title": "Clips Configuration",
      "fields": [
        {
          "id": "anchors-sa-floor-clips",
          "name": "FLOOR_CLIPS_",
          "label": "Floor Clips",
          "type": "radioGroup",
          "options": [
            { "value": 0, "label": "None" },
            { "value": 1, "label": "Fixed" },
            { "value": 2, "label": "Adjustable" },
            { "value": 3, "label": "Hvy Duty" },
            { "value": 4, "label": "Custom" },
            { "value": 5, "label": "Inverted" }
          ]
        },
        {
          "id": "anchors-sa-base-clips",
          "name": "BASE_CLIPS",
          "label": "Base Clips",
          "type": "radioGroup",
          "options": [
            { "value": 0, "label": "None" },
            { "value": 1, "label": "Base Clips" },
            { "value": 2, "label": "CEWA" },
            { "value": 3, "label": "P&D EWA" },
            { "value": 4, "label": "Face Holes" }
          ]
        }
      ]
    },
    {
      "id": "anchors-sa-options",
      "title": "Anchor Options",
      "fields": [
        {
          "id": "anchors-sa-anchor-bolts",
          "name": "ANCHOR_BOLTS",
          "label": "Anchor Bolts",
          "type": "checkbox",
          "conditional": {
            "conditions": [
              { "field": "ANCHOR_TYPE", "operator": "equals", "value": 8 },
              { "field": "ANCHOR_TYPE", "operator": "equals", "value": 9 },
              { "field": "ANCHOR_TYPE", "operator": "equals", "value": 99 },
              { "field": "BASE_CLIPS", "operator": "equals", "value": 2 }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "anchors-sa-dust-boxes",
          "name": "DUST_BOXES",
          "label": "Dust Boxes",
          "type": "checkbox",
          "description": "Enable dust boxes"
        },
        {
          "id": "anchors-sa-grout-holes",
          "name": "GROUT_HOLES",
          "label": "Grout Holes",
          "type": "checkbox",
          "conditional": {
            "conditions": [
              { "field": "ANCHOR_TYPE", "operator": "equals", "value": 8 },
              { "field": "ANCHOR_TYPE", "operator": "equals", "value": 9 }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "anchors-sa-grout-hole-dia",
          "name": "GROUT_HOLE_DIA",
          "label": "Grout Hole Diameter",
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              { "field": "GROUT_HOLES", "operator": "equals", "value": 1 }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "anchors-sa-bottom-only",
          "name": "BOTTOM_ONLY",
          "label": "Bottom Only",
          "type": "checkbox"
        },
        {
          "id": "anchors-sa-head-anchors",
          "name": "HEAD_ANCHORS",
          "label": "Head Anchors",
          "type": "checkbox",
          "conditional": {
            "conditions": [
              { "field": "ANCHOR_TYPE", "operator": "equals", "value": 8 },
              { "field": "ANCHOR_TYPE", "operator": "equals", "value": 9 },
              { "field": "ANCHOR_TYPE", "operator": "equals", "value": 11 }
            ],
            "logic": "OR"
          }
        }
      ]
    },
    {
      "id": "anchors-sa-dimensions",
      "title": "Anchor Dimensions",
      "fields": [
        {
          "id": "anchors-sa-transom-anchor-center",
          "name": "TRANSOM_ANCHOR_CENTER",
          "label": "Transom Anchor Center",
          "type": "float",
          "required": true,
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              { "field": "FRAME_ELEVATION", "operator": "equals", "value": 5 }
            ],
            "logic": "AND"
          }
        },
        {
          "id": "anchors-sa-anchor-recess",
          "name": "ANCHOR_RECESS",
          "label": "Anchor Recess",
          "type": "float",
          "required": true,
          "placeholder": "0.00"
        },
        {
          "id": "anchors-sa-drywall-allowance",
          "name": "DRYWALL_ALLOWANCE",
          "label": "Drywall Allowance",
          "type": "float",
          "required": true,
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              { "field": "ANCHOR_TYPE", "operator": "equals", "value": 4 },
              { "field": "ANCHOR_TYPE", "operator": "equals", "value": 5 },
              { "field": "ANCHOR_TYPE", "operator": "equals", "value": 6 },
              { "field": "ANCHOR_TYPE", "operator": "equals", "value": 7 }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "anchors-sa-anchor-jt-dist",
          "name": "ANCHOR_JT_DIST",
          "label": "Anchor JT Distance",
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "anchors-sa-anchor-jb-dist",
          "name": "ANCHOR_JB_DIST",
          "label": "Anchor JB Distance",
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "anchors-sa-anchor-hdj-dist",
          "name": "ANCHOR_HDJ_DIST",
          "label": "Anchor HDJ Distance",
          "type": "float",
          "placeholder": "0.00"
        },
        {
          "id": "anchors-sa-anchor-hmax",
          "name": "ANCHOR_HMAX",
          "label": "Anchor H Max",
          "type": "float",
          "placeholder": "0.00"
        }
      ]
    },
    {
      "id": "anchors-sa-quantities",
      "title": "Anchor Quantities",
      "fields": [
        {
          "id": "anchors-sa-anchor-qty",
          "name": "ANCHOR_QTY",
          "label": "Anchor Quantity",
          "type": "integer",
          "placeholder": "0",
          "conditional": {
            "conditions": [
              { "field": "ANCHOR_JMAX", "operator": "equals", "value": 0 }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "anchors-sa-anchor-jmax",
          "name": "ANCHOR_JMAX",
          "label": "Anchor J Max",
          "type": "float",
          "placeholder": "0.00",
          "conditional": {
            "conditions": [
              { "field": "ANCHOR_QTY", "operator": "equals", "value": 0 }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "anchors-sa-head-anchor-qty",
          "name": "HEAD_ANCHOR_QTY",
          "label": "Head Anchor Quantity",
          "type": "integer",
          "placeholder": "0",
          "conditional": {
            "conditions": [
              { "field": "ANCHOR_TYPE", "operator": "in", "value": [8, 9, 11] },
              { "field": "HEAD_ANCHORS", "operator": "equals", "value": 1 },
              { "field": "ANCHOR_HMAX", "operator": "equals", "value": 0 }
            ],
            "logic": "AND"
          }
        }
      ]
    },
    {
      "id": "anchors-sa-ewa-options",
      "title": "EWA Options",
      "description": "Options specific to P&D EWA and Concealed EWA anchor types",
      "fields": [
        {
          "id": "anchors-sa-anchor-surf",
          "name": "ANCHOR_SURF",
          "label": "Anchor Surface",
          "type": "radioGroup",
          "options": [
            { "value": 0, "label": "Soffit" },
            { "value": 1, "label": "Rabbet" }
          ],
          "conditional": {
            "conditions": [
              { "field": "ANCHOR_TYPE", "operator": "equals", "value": 8 },
              { "field": "ANCHOR_TYPE", "operator": "equals", "value": 9 }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "anchors-sa-anchor-bolt-type",
          "name": "ANCHOR_BOLT_TYPE",
          "label": "Anchor Bolt Type",
          "type": "radioGroup",
          "options": [
            { "value": 0, "label": "Expansion" },
            { "value": 1, "label": "Lag" },
            { "value": 2, "label": "Machine" }
          ],
          "conditional": {
            "conditions": [
              { "field": "ANCHOR_TYPE", "operator": "equals", "value": 8 },
              { "field": "ANCHOR_TYPE", "operator": "equals", "value": 9 }
            ],
            "logic": "OR"
          }
        },
        {
          "id": "anchors-sa-anchor-strap-type",
          "name": "ANCHOR_STRAP_TYPE",
          "label": "Anchor Strap Type",
          "type": "radioGroup",
          "options": [
            { "value": 0, "label": "Flat" },
            { "value": 1, "label": "Channel" }
          ],
          "conditional": {
            "conditions": [
              { "field": "ANCHOR_TYPE", "operator": "equals", "value": 9 }
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

---

## Summary

- **Total Forms:** 46
- **Total Fields:** 512
- **Generated:** 2025-11-28T00:00:00.000Z
