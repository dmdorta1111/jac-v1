# Manufacturing Workflow API & Command Reference

**Complete mapping of CAD scripting commands used in 4-stage workflow**

---

## TABLE OF CONTENTS
1. Model Operations
2. Drawing Operations
3. Table Operations
4. Excel Integration
5. PDF/Export Operations
6. Array & Data Operations
7. Configuration Commands
8. Error Handling

---

## 1. MODEL OPERATIONS

### Retrieval & Instantiation

#### RETRIEVE_MDL
```
Syntax: RETRIEVE_MDL {model_name} {variable}
Purpose: Load a part or assembly into active session
Example: RETRIEVE_MDL "frame_stile.prt" DXF_COMP

Parameters:
  model_name - Full filename with extension (.prt, .asm, .drw)
  variable   - Reference variable to store model handle

Usage in Workflow:
  Line 75 (export_sa.tab): RETRIEVE_MDL COMPONENT_NAME DXF_COMP
  Line 743 (export_sa.tab): RETRIEVE_MDL PDF_NAME+".prt" PDF_COMP
```

#### GET_REF_NAME
```
Syntax: GET_REF_NAME {reference} {variable}
Purpose: Extract name/ID from model reference
Example: GET_REF_NAME DXF_COMP COMPONENT_NAME

Used to:
  - Extract component name for logging
  - Get PDF naming prefix
  Line 111 (export_sa.tab): GET_REF_NAME DXF_COMP DXF_COMP_NAME
```

#### GET_REF_GENERIC
```
Syntax: GET_REF_GENERIC {instance_ref} {generic_ref}
Purpose: Get base part from family instance
Example: GET_REF_GENERIC DXF_COMP GENERIC

Used for:
  - Family table instances (PDF Mode 3)
  - Instance-to-base navigation
  Line 167 (export_sa.tab): GET_REF_GENERIC DXF_COMP GENERIC
```

#### GET_REF_FAMINSTANCE
```
Syntax: GET_REF_FAMINSTANCE {part_ref} &{instance_name} {instance_ref}
Purpose: Get specific family instance by name
Example: GET_REF_FAMINSTANCE PDF_COMP &PDF_INST_NAME PDF_INST

Used for:
  - PDF Mode 3: iterating instances for export
  Line 778 (export_sa.tab): GET_REF_FAMINSTANCE PDF_COMP &PDF_INST_NAME PDF_INST
```

#### GET_FAMINSTANCE_NAMES
```
Syntax: GET_FAMINSTANCE_NAMES {part_ref} {array}
Purpose: List all family instances in a part
Example: GET_FAMINSTANCE_NAMES PDF PDF_INST_NAMES

Used for:
  - Family table iteration
  Line 776 (export_sa.tab): GET_FAMINSTANCE_NAMES PDF PDF_INST_NAMES
```

### Model Switching & Context

#### SWITCH_TO_MDL
```
Syntax: SWITCH_TO_MDL {model_reference}
Purpose: Change active model context
Example: SWITCH_TO_MDL GENERIC

Usage:
  - When modifying generic vs instance
  Line 168 (export_sa.tab): SWITCH_TO_MDL GENERIC
  Line 173 (export_sa.tab): SWITCH_TO_MDL DXF_COMP
```

### Parameter Operations

#### SEARCH_MDL_PARAM
```
Syntax: SEARCH_MDL_PARAM {model} {param_name} {variable}
Purpose: Extract parameter value from model
Example: SEARCH_MDL_PARAM DXF_COMP "THICKNESS" THICKNESS

Parameters:
  model      - Model reference
  param_name - Parameter name (case-sensitive)
  variable   - Receives parameter value

Common Parameters:
  "THICKNESS"      - Part thickness (generic)
  "SMT_THICKNESS"  - Sheetmetal thickness (specific)
  "TYPE"           - Material type (GALV, PLAST, etc.)
  "GRADE"          - Material grade (numeric)
  "FINISH"         - Surface finish code
  "GRAIN"          - Grain direction (0/1/2)
  "PVC"            - PVC edge banding flag
  "DEBUR"          - Deburring flag
  "COMMENTS"       - Manufacturing notes
  "EMJACNUM"       - Internal part number
  "EMJACDESC"      - Internal description
  "STOCKTYPE"      - 1=Manufactured, 3=Stock, 4=Family, etc.
  "PDF"            - PDF export mode (0/1/2/3)
  "SHAPE"          - *SHEET*, SHEET, or other
  "BEND_LINES"     - Automatic bend feature flag
  "USED"           - Part usage tracking
  "WO_NUM"         - Work order association
  "SIZE1", "SIZE2" - Structural dimensions
  "CUT1", "CUT2"   - Cut dimensions

Usage:
  Line 76 (export_sa.tab): SEARCH_MDL_PARAM DXF_COMP "SHAPE" SHAPE
  Line 101 (export_sa.tab): SEARCH_MDL_PARAM DXF_COMP "SMT_THICKNESS" THICKNESS
```

#### SET_MDL_PARAM
```
Syntax: SET_MDL_PARAM {model} {param_name} {value}
Purpose: Assign parameter value to model
Example: SET_MDL_PARAM DXF_COMP "EMJACNUM" SINDEX

Usage:
  Line 115 (export_sa.tab): SET_MDL_PARAM DXF_COMP "EMJACDESC" EMJACDESC
  Line 475 (export_sa.tab): SET_MDL_PARAM DXF_COMP "EMJACNUM" SINDEX
```

#### SEARCH_MDL_REF
```
Syntax: SEARCH_MDL_REF {model} {ref_type} {ref_name} {variable}
Purpose: Find first reference by name pattern
Example: SEARCH_MDL_REF DXF_COMP CSYS "DIM*" REFCSYS

Parameters:
  ref_type - CSYS (coordinate system), SURFACE, FEATURE, COMPONENT, etc.
  ref_name - Name pattern (* = wildcard)
  variable - Receives reference

Usage:
  Line 100 (export_sa.tab): SEARCH_MDL_REF DXF_COMP CSYS "DIM*" REFCSYS
  Line 184 (export_sa.tab): SEARCH_MDL_REF DXF_COMP SURFACE "FIXED*" FIRST_SURF
```

#### SEARCH_MDL_REFS
```
Syntax: SEARCH_MDL_REFS {model} {ref_type} {pattern} {array}
Purpose: Find all references matching pattern, populate array
Example: SEARCH_MDL_REFS DXF_COMP CSYS "*" CSYS_ARRAY

Usage:
  Line 82 (export_sa.tab): SEARCH_MDL_REFS DXF_COMP CSYS "*" CSYS_ARRAY
  Line 84 (export_sa.tab): SEARCH_MDL_REFS DXF_COMP SURFACE "*" SURFACE_ARRAY
```

#### GET_MDL_SUBTYPE
```
Syntax: GET_MDL_SUBTYPE {model} {variable}
Purpose: Get model type classification
Example: GET_MDL_SUBTYPE DXF_COMP SUBTYPE

Returns:
  "PART_SHEETMETAL"  - Sheetmetal part
  "PART_SOLID"       - Solid part
  "ASSEMBLY"         - Assembly
  etc.

Usage:
  Line 78 (export_sa.tab): GET_MDL_SUBTYPE DXF_COMP SUBTYPE
  Line 80 (export_sa.tab): IF SHAPE == "*SHEET*" AND SUBTYPE == "PART_SHEETMETAL"
```

#### GET_MDL_NAME
```
Syntax: GET_MDL_NAME {model} {variable}
Purpose: Get model display name
Example: GET_MDL_NAME DXF_COMP DXF_COMP_NAME

Usage:
  Line 111 (export_sa.tab): GET_MDL_NAME DXF_COMP DXF_COMP_NAME
```

#### GET_MDL_EXTENSION
```
Syntax: GET_MDL_EXTENSION {model} {variable}
Purpose: Get file type
Example: GET_MDL_EXTENSION EACH_COMPONENT EXTENSION

Returns:
  "prt" - Part file
  "asm" - Assembly file
  "drw" - Drawing file

Usage in parts_list.tab:
  Line 43 (parts_list.tab): GET_MDL_EXTENSION EACH_COMPONENT EXTENSION
```

#### GET_MDL_TYPE
```
Syntax: GET_MDL_TYPE {model} {variable}
Purpose: Get model type
Example: GET_MDL_TYPE EACH_COMPONENT MDLTYPE

Usage:
  Line 70 (parts_list.tab): GET_MDL_TYPE EACH_COMPONENT MDLTYPE
```

#### SET_MDL_NAME
```
Syntax: SET_MDL_NAME {model} {new_name}
Purpose: Rename model
Example: SET_MDL_NAME ASSEM "BOM_" + WO_NUM

Usage:
  Line 810 (export_sa.tab): SET_MDL_NAME ASSEM "BOM_" + WO_NUM
```

### Geometry Analysis

#### CALC_OUTLINE
```
Syntax: CALC_OUTLINE {csys_ref} {model} {outline_struct}
Purpose: Calculate bounding box relative to coordinate system
Example: CALC_OUTLINE REFCSYS DXF_COMP outline

Returns structure:
  outline.x1, outline.x2  - X bounds
  outline.y1, outline.y2  - Y bounds
  outline.z1, outline.z2  - Z bounds

Usage:
  Line 117 (export_sa.tab): CALC_OUTLINE REFCSYS DXF_COMP outline
  Lines 119-142: Calculate absolute dimensions from bounds
```

#### CALC_OUTLINE_PARAM
```
Syntax: CALC_OUTLINE_PARAM {csys_ref} {dimension_name} {variable}
Purpose: Get specific dimension from outline
Example: CALC_OUTLINE_PARAM REFCSYS X_SIZE X

Parameters:
  X_SIZE, Y_SIZE, Z_SIZE - Dimension names

Usage:
  Line 209 (export_sa.tab): CALC_OUTLINE_PARAM REFCSYS X_SIZE X
  Line 210 (export_sa.tab): CALC_OUTLINE_PARAM REFCSYS Y_SIZE Y
```

#### GET_MASS_PROPERTIES
```
Syntax: GET_MASS_PROPERTIES {model} {csys_ref} {properties_struct}
Purpose: Calculate part properties (mass, volume, COG)
Example: GET_MASS_PROPERTIES COMP_ DIM comprops

Returns structure:
  comprops.volume - 3D volume
  comprops.center_of_gravity.x/y/z - Center point
  (other mass properties)

Usage in consolidate.tab:
  Line 55 (consolidate.tab): GET_MASS_PROPERTIES COMP_ DIM comprops
  Line 95 (consolidate.tab): IF comprops.volume == testprops.volume AND ...
```

### UDF (User-Defined Feature) Operations

#### CREATE_UDF
```
Syntax: CREATE_UDF {udf_path} {model} {udf_ref}
         [UDF_REF {ref_type} {reference}]
         [UDF_EXP_REF {exp_name} {exp_type} {exp_index}]
         END_CREATE_UDF

Purpose: Create instance of library UDF
Example: CREATE_UDF lib:udf\unbend DXF_COMP FLAT_UDF
           UDF_REF surface FIRST_SURF
           UDF_EXP_REF FLAT FEATURE 0
         END_CREATE_UDF

Parameters:
  lib:udf\unbend    - Flatten sheetmetal (FORMED → FLAT)
  lib:udf\up90      - Up 90° bend (standard material)
  lib:udf\dn90      - Down 90° bend (standard material)
  lib:udf\up90_galv - Up 90° bend (galvanized)
  lib:udf\dn90_galv - Down 90° bend (galvanized)
  lib:udf\bndother  - Custom bend (standard material)
  lib:udf\bndother_galv - Custom bend (galvanized)

Usage:
  Line 185-188 (export_sa.tab): unbend UDF for FORMED parts
  Line 501-504 (export_sa.tab): unbend UDF with name "EXPORT_UDF"
  Lines 532-606 (export_sa.tab): Bend UDFs for bend line features
```

#### SET_REF_NAME
```
Syntax: SET_REF_NAME {reference} {name}
Purpose: Assign name to feature/UDF
Example: SET_REF_NAME FLAT_UDF "EXPORT_UDF"

Usage:
  Line 171 (export_sa.tab): SET_REF_NAME FIXED "FIXED"
  Line 178 (export_sa.tab): SET_REF_NAME FIXED "FIXED"
  Line 505 (export_sa.tab): SET_REF_NAME FLAT_UDF "EXPORT_UDF"
```

#### GET_REF_NAME
```
Syntax: GET_REF_NAME {reference} {variable}
Purpose: Get name of feature/reference
Example: GET_REF_NAME CSYS_REF CSYS_NAME

Usage:
  Line 89 (export_sa.tab): GET_REF_NAME CSYS_REF CSYS_NAME
```

#### GET_REF_ID
```
Syntax: GET_REF_ID {reference} {variable}
Purpose: Get unique identifier of reference
Example: GET_REF_ID FLAT_UDF REF_ID

Usage:
  Line 189 (export_sa.tab): GET_REF_ID FLAT_UDF REF_ID
```

#### REMOVE_FEATURE
```
Syntax: REMOVE_FEATURE [CLIP_ALL] {feature_ref}
Purpose: Delete feature from model
Example: REMOVE_FEATURE FLAT_UDF
         REMOVE_FEATURE CLIP_ALL FLAT_UDF  ! with suppression

Usage:
  Line 253 (export_sa.tab): REMOVE_FEATURE FLAT_UDF
  Line 260 (export_sa.tab): REMOVE_FEATURE FLAT_UDF
  Line 654 (export_sa.tab): REMOVE_FEATURE CLIP_ALL FLAT_UDF
```

#### FEAT_NOT_EXIST
```
Syntax: IF FEAT_NOT_EXIST {model} {feature_pattern}
Purpose: Check if feature exists
Example: IF FEAT_NOT_EXIST DXF_COMP "BEND_LINE*"

Usage:
  Line 515 (export_sa.tab): IF BEND_LINES == 1 AND FEAT_NOT_EXIST DXF_COMP "BEND_LINE*"
```

#### REF_INSTANCE
```
Syntax: IF REF_INSTANCE {reference}
Purpose: Check if reference is instance (not generic)
Example: IF REF_INSTANCE DXF_COMP

Usage:
  Line 166 (export_sa.tab): IF REF_INSTANCE DXF_COMP
  Line 252 (export_sa.tab): IF REF_INSTANCE DXF_COMP
  Line 689 (export_sa.tab): IF REF_INSTANCE DXF_COMP
```

#### REF_UNEQUAL
```
Syntax: IF REF_UNEQUAL {ref1} {ref2}
Purpose: Compare two references for inequality
Example: IF REF_UNEQUAL EDGE1 edge

Usage:
  Line 569 (export_sa.tab): IF REF_UNEQUAL EDGE1 edge
```

#### INVALIDATE_REF
```
Syntax: INVALIDATE_REF {reference}
Purpose: Clear reference variable
Example: INVALIDATE_REF FIXED_SURF

Usage:
  Line 560 (export_sa.tab): INVALIDATE_REF EDGE1
  Line 708 (export_sa.tab): INVALIDATE_REF FIXED_SURF
```

### Model Persistence

#### SAVE_MDL
```
Syntax: SAVE_MDL {model}
Purpose: Write model to disk
Example: SAVE_MDL DXF_COMP

Usage:
  Line 179 (export_sa.tab): SAVE_MDL GENERIC
  Line 484 (export_sa.tab): SAVE_MDL DXF_COMP
  Line 1506 (export_sa.tab): SAVE_MDL refDrawing
```

#### REGEN_MDL
```
Syntax: REGEN_MDL {model} [FORCE]
Purpose: Rebuild/regenerate model geometry
Example: REGEN_MDL PDF_DRW FORCE

Usage:
  Line 718 (export_sa.tab): REGEN_MDL PDF_DRW FORCE
  Line 719 (export_sa.tab): REGEN_MDL PDF_DRW FORCE
```

#### REPAINT
```
Syntax: REPAINT
Purpose: Refresh display
Example: REPAINT

Usage:
  Line 169 (export_sa.tab): REPAINT
  Line 644 (export_sa.tab): REPAINT
```

---

## 2. DRAWING OPERATIONS

### Drawing Creation

#### CREATE_DRW
```
Syntax: CREATE_DRW {assembly} {template_file} {drawing_ref}
Purpose: Generate new drawing from template
Example: CREATE_DRW ASSEM lib:sdi_b_template.drw refDrawing

Template Options:
  lib:sdi_b_template.drw  - Standard SDI template
  lib:hmf_b_template.drw  - HMF customer variant
  lib:dxf_temp            - Temporary DXF drawing
  req_template.drw        - BOM requisition template

Usage:
  Line 67 (drawing.tab): CREATE_DRW ASSEM lib:hmf_b_template.drw refDrawing
  Line 69 (drawing.tab): CREATE_DRW ASSEM lib:sdi_b_template.drw refDrawing
  Line 637 (export_sa.tab): USE_LIBRARY_MDL lib:dxf_temp DRAWING DXF
  Line 812 (export_sa.tab): CREATE_DRW ASSEM req_template.drw refDrawing
```

#### USE_LIBRARY_MDL
```
Syntax: USE_LIBRARY_MDL {library_path} {model_type} {variable}
Purpose: Load library template
Example: USE_LIBRARY_MDL lib:dxf_temp DRAWING DXF

Usage:
  Line 637 (export_sa.tab): USE_LIBRARY_MDL lib:dxf_temp DRAWING DXF
```

#### DELETE_DRW_MDL
```
Syntax: DELETE_DRW_MDL {drawing} {model}
Purpose: Remove model from drawing
Example: DELETE_DRW_MDL DXF DXF_COMP

Usage:
  Line 650 (export_sa.tab): DELETE_DRW_MDL DXF DXF_COMP
```

### Drawing Configuration

#### GET_DRW_OPTIONS
```
Syntax: GET_DRW_OPTIONS {drawing} {struct}
Purpose: Read drawing settings
Example: GET_DRW_OPTIONS refDrawing options

Returns struct:
  options.drawing_text_height
  options.text_thickness
  (other drawing properties)

Usage:
  Line 82 (drawing.tab): GET_DRW_OPTIONS refDrawing options
```

#### SET_DRW_OPTIONS
```
Syntax: SET_DRW_OPTIONS {drawing} {struct}
Purpose: Write drawing settings
Example: SET_DRW_OPTIONS refDrawing options

Usage:
  Line 85 (drawing.tab): SET_DRW_OPTIONS refDrawing options
```

#### SET_DRW_SCALE
```
Syntax: SET_DRW_SCALE {drawing} {sheet} {view} {scale}
Purpose: Set drawing view scale
Example: SET_DRW_SCALE refDrawing 1 NULL Scale

Usage:
  Line 87 (drawing.tab): SET_DRW_SCALE refDrawing 1 NULL Scale
```

#### SET_DRW_FORMAT
```
Syntax: SET_DRW_FORMAT {drawing} {sheet} {format_file}
Purpose: Apply format template to sheet
Example: SET_DRW_FORMAT refDrawing SHEET_INDEX material_req_format.frm

Format Files:
  material_req_format.frm - Material requisition page
  stock_req_format.frm    - Stock parts requisition page

Usage:
  Line 940 (export_sa.tab): SET_DRW_FORMAT refDrawing SHEET_INDEX material_req_format.frm
  Line 945 (export_sa.tab): SET_DRW_FORMAT refDrawing SHEET_INDEX material_req_format.frm
```

### Sheets

#### INSERT_DRW_SHEET
```
Syntax: INSERT_DRW_SHEET {drawing} {sheet_index}
Purpose: Add new sheet to drawing
Example: INSERT_DRW_SHEET refDrawing SHEET_INDEX

Usage:
  Line 943 (export_sa.tab): INSERT_DRW_SHEET refDrawing SHEET_INDEX
  Line 1098 (export_sa.tab): INSERT_DRW_SHEET refDrawing SHEET_INDEX
```

#### SET_DRW_CUR_SHEET
```
Syntax: SET_DRW_CUR_SHEET {drawing} {sheet_index}
Purpose: Activate sheet for editing
Example: SET_DRW_CUR_SHEET refDrawing SHEET_INDEX

Usage:
  Line 944 (export_sa.tab): SET_DRW_CUR_SHEET refDrawing SHEET_INDEX
  Line 1405 (export_sa.tab): SET_DRW_CUR_SHEET refDrawing SHEET_INDEX
```

### Views

#### CREATE_DRW_VIEW_GENERAL
```
Syntax: CREATE_DRW_VIEW_GENERAL {drawing} {model} &{view_dir}
         {sheet} {x} {y} {scale} {view_ref}

Purpose: Create orthographic view of model
Example: CREATE_DRW_VIEW_GENERAL DXF DXF_COMP &VIEW 1 60 36 0 dxfView

Parameters:
  &view_dir - View direction (address of variable, not string)
              0=default, 1=rotated, 2=alternate (for grain)
  x, y      - Position on sheet (inches)
  scale     - View scale factor (0=auto-fit)
  view_ref  - Reference to new view

Usage:
  Line 639 (export_sa.tab): CREATE_DRW_VIEW_GENERAL DXF DXF_COMP &VIEW 1 60 36 0 dxfView
```

#### SET_DRW_VIEW_TANGENT_EDGE_DISPLAY
```
Syntax: SET_DRW_VIEW_TANGENT_EDGE_DISPLAY {view} {mode}
Purpose: Control tangent edge visibility
Example: SET_DRW_VIEW_TANGENT_EDGE_DISPLAY dxfView NONE

Modes:
  NONE     - Hide tangent edges
  DIMMED   - Show dimmed
  VISIBLE  - Show bold

Usage:
  Line 640 (export_sa.tab): SET_DRW_VIEW_TANGENT_EDGE_DISPLAY dxfView NONE
```

#### SET_DRW_VIEW_DISPLAY
```
Syntax: SET_DRW_VIEW_DISPLAY {view} {mode}
Purpose: Set view rendering mode
Example: SET_DRW_VIEW_DISPLAY dxfView NO_HIDDEN

Modes:
  WIREFRAME  - Outline only
  NO_HIDDEN  - Visible lines only (no hidden)
  HIDDEN     - Include hidden edges
  SHADED    - Shaded display

Usage:
  Line 641 (export_sa.tab): SET_DRW_VIEW_DISPLAY dxfView NO_HIDDEN
```

#### GET_DRW_VIEW_MDL
```
Syntax: GET_DRW_VIEW_MDL {view} {variable}
Purpose: Get model displayed in view
Example: GET_DRW_VIEW_MDL PDF_VIEW PDF_VIEW_MDL

Usage:
  Line 784 (export_sa.tab): GET_DRW_VIEW_MDL PDF_VIEW PDF_VIEW_MDL
```

#### REPLACE_DRW_VIEW_MDL
```
Syntax: REPLACE_DRW_VIEW_MDL {view} {new_model}
Purpose: Swap model in view
Example: REPLACE_DRW_VIEW_MDL PDF_VIEW PDF_INST

Usage for PDF Mode 3:
  Line 786 (export_sa.tab): REPLACE_DRW_VIEW_MDL PDF_VIEW PDF_INST
```

#### SEARCH_DRW_VIEWS
```
Syntax: SEARCH_DRW_VIEWS {drawing} {pattern} {sheet} {array}
Purpose: Find views matching criteria
Example: SEARCH_DRW_VIEWS PDF_DRW "*" 1 PDF_VIEWS

Parameters:
  pattern - "*" for all views
  sheet   - Sheet number
  array   - Receives view references

Usage:
  Line 782 (export_sa.tab): SEARCH_DRW_VIEWS PDF_DRW "*" 1 PDF_VIEWS
```

### Notes

#### CREATE_DRW_NOTE
```
Syntax: CREATE_DRW_NOTE {drawing} {x} {y} {text}
         [HORIZONTAL {align}] [VERTICAL {valign}]

Purpose: Add text annotation to drawing
Example: CREATE_DRW_NOTE refDrawing 1.0625 7.6875 WO_NUM

Parameters:
  x, y       - Position (inches from origin)
  HORIZONTAL - LEFT, CENTER, RIGHT
  VERTICAL   - TOP, MIDDLE, BOTTOM

Usage:
  Line 949 (export_sa.tab): CREATE_DRW_NOTE refDrawing 1.0625 7.6875 WO_NUM
  Line 950 (export_sa.tab): CREATE_DRW_NOTE refDrawing 2.8125 7.6875 "&todays_date" HORIZONTAL CENTER
```

---

## 3. TABLE OPERATIONS

### Table Creation & Management

#### CREATE_DRW_TABLE
```
Syntax: CREATE_DRW_TABLE {drawing} {model} {sheet}
         {x} {y} {table_def} {table_ref}

Purpose: Create table in drawing
Example: CREATE_DRW_TABLE refDrawing ASSEM 1 0.5625 10.4375 "lib:heading.tbl" HEADING

Table Definitions:
  "lib:heading.tbl"        - Door/frame specifications
  "lib:mat_body.tbl"       - Material requisition items
  "lib:stock_body.tbl"     - Stock parts list
  "lib:tags.tbl"           - Optional metadata pairs
  "lib:Drwhistory.tbl"     - Revision history

Usage:
  Line 71 (drawing.tab): CREATE_DRW_TABLE refDrawing ASSEM 1 0.5625 10.4375 "lib:heading.tbl" HEADING
  Line 226 (drawing.tab): CREATE_DRW_TABLE refDrawing NULL 1 x1 y2 "lib:tags.tbl" TAGS
  Line 941 (export_sa.tab): CREATE_DRW_TABLE refDrawing ASSEM 1 0.4375 6.625 "lib:mat_body.tbl" BODY
```

#### SET_DRW_TABLE_TEXT
```
Syntax: SET_DRW_TABLE_TEXT {drawing} {table} {row} {col} {text}
Purpose: Set cell content
Example: SET_DRW_TABLE_TEXT refDrawing HEADING 2 1 ITEM_NUM

Parameters:
  row - Row number (1-indexed, row 1 is header)
  col - Column number (1-indexed)
  text - String or variable to display

Usage Examples:
  Line 72 (drawing.tab): SET_DRW_TABLE_TEXT refDrawing heading 2 1 ITEM_NUM
  Line 74 (drawing.tab): SET_DRW_TABLE_TEXT refDrawing heading 2 2 itos(QTY)
  Line 1002 (export_sa.tab): SET_DRW_TABLE_TEXT refDrawing BODY LINE_INDEX 1 SINDEX
```

#### SET_DRW_TABLE_FORMAT
```
Syntax: SET_DRW_TABLE_FORMAT {drawing} {table} {row} {col}
         HORIZONTAL {halign} VERTICAL {valign} [HEIGHT {height}]

Purpose: Format cell appearance
Example: SET_DRW_TABLE_FORMAT refDrawing HEADING 2 1 HEIGHT 0.09

Parameters:
  HORIZONTAL - LEFT, CENTER, RIGHT
  VERTICAL   - TOP, MIDDLE, BOTTOM
  HEIGHT     - Text height (inches)

Usage:
  Line 73 (drawing.tab): SET_DRW_TABLE_FORMAT refDrawing HEADING 2 1 HEIGHT 0.09
  Line 93 (drawing.tab): SET_DRW_TABLE_FORMAT refDrawing HEADING 1 NEWCOL HEIGHT 0.09 HORIZONTAL CENTER
```

#### ADD_DRW_TABLE_COL
```
Syntax: ADD_DRW_TABLE_COL {drawing} {table} {width} {col_ref}
Purpose: Insert column into table
Example: ADD_DRW_TABLE_COL refDrawing HEADING 4 NEWCOL

Parameters:
  width - Column width (typically 4, 8, 10, 12, 14)

Usage:
  Line 90 (drawing.tab): ADD_DRW_TABLE_COL refDrawing HEADING 4 NEWCOL
  Line 97 (drawing.tab): ADD_DRW_TABLE_COL refDrawing HEADING 8 NEWCOL
```

#### ADD_DRW_TABLE_ROW
```
Syntax: ADD_DRW_TABLE_ROW {drawing} {table} {count} {row_ref}
Purpose: Insert rows into table
Example: ADD_DRW_TABLE_ROW refDrawing TAGS 1 NEWROW

Usage:
  Line 255 (drawing.tab): ADD_DRW_TABLE_ROW refDrawing TAGS 1 NEWROW
```

#### MERGE_DRW_TABLE
```
Syntax: MERGE_DRW_TABLE {drawing} {table} {row1} {col1} {row2} {col2}
Purpose: Merge cell range
Example: MERGE_DRW_TABLE refDrawing BODY LINE_INDEX 1 LINE_INDEX 8

Usage (material group header):
  Line 977 (export_sa.tab): MERGE_DRW_TABLE refDrawing BODY LINE_INDEX 1 LINE_INDEX 8
```

#### INSERT_DRW_TABLE_ROW
```
Syntax: INSERT_DRW_TABLE_ROW {drawing} {table} {row} {height} {row_id}
Purpose: Insert row at position
Example: INSERT_DRW_TABLE_ROW refDrawing HIST HISTORY_INDEX 0.465 ROW_ID

Usage:
  Line 285 (drawing.tab): INSERT_DRW_TABLE_ROW refDrawing HIST HISTORY_INDEX 0.465 ROW_ID
```

#### GET_DRW_TABLE_OUTLINE
```
Syntax: GET_DRW_TABLE_OUTLINE {drawing} {table}
         {x1_var} {y1_var} {x2_var} {y2_var}
Purpose: Get table bounding box
Example: GET_DRW_TABLE_OUTLINE refDrawing HEADING x1 y1 x2 y2

Returns:
  x1, y1 - Top-left corner
  x2, y2 - Bottom-right corner

Usage (position tags table below heading):
  Line 225 (drawing.tab): GET_DRW_TABLE_OUTLINE refDrawing HEADING x1 y1 x2 y2
  Line 226 (drawing.tab): CREATE_DRW_TABLE refDrawing NULL 1 x1 y2 "lib:tags.tbl" TAGS
```

---

## 4. EXCEL INTEGRATION

### Document Management

#### EXCEL_ACTIVATE_DOCUMENT
```
Syntax: EXCEL_ACTIVATE_DOCUMENT {document_name}
Purpose: Open/switch to Excel workbook
Example: EXCEL_ACTIVATE_DOCUMENT BOM_DOCUMENT_NAME

Prerequisites:
  BOM_DOCUMENT_NAME = "BOM_" + WO_NUM

Usage:
  Line 55 (export_sa.tab): EXCEL_ACTIVATE_DOCUMENT BOM_DOCUMENT_NAME
```

#### EXCEL_ACTIVATE_SHEET
```
Syntax: EXCEL_ACTIVATE_SHEET SHEET_BY_NAME {sheet_name}
Purpose: Switch to named worksheet
Example: EXCEL_ACTIVATE_SHEET SHEET_BY_NAME "LISTING"

Usage:
  Line 56 (export_sa.tab): EXCEL_ACTIVATE_SHEET SHEET_BY_NAME "LISTING"
```

#### EXCEL_SAVE_DOCUMENT
```
Syntax: EXCEL_SAVE_DOCUMENT {document_name}
Purpose: Write Excel file to disk
Example: EXCEL_SAVE_DOCUMENT BOM_DOCUMENT_NAME

Usage:
  Line 1507 (export_sa.tab): EXCEL_SAVE_DOCUMENT BOM_DOCUMENT_NAME
```

### Cell Operations

#### EXCEL_GET_VALUE
```
Syntax: EXCEL_GET_VALUE {row} {col} {variable}
Purpose: Read numeric cell value
Example: EXCEL_GET_VALUE EXCEL_ROW 2 STOCKTYPE

Parameters:
  row - Row number (0-indexed)
  col - Column number (0-indexed)

Usage:
  Line 59 (export_sa.tab): EXCEL_GET_VALUE EXCEL_ROW 1 EXCEL_COMPONENT_NAME
  Line 68 (export_sa.tab): EXCEL_GET_VALUE EXCEL_ROW 2 STOCKTYPE
```

#### EXCEL_GET_STRING
```
Syntax: EXCEL_GET_STRING {row} {col} {variable}
Purpose: Read text cell value
Example: EXCEL_GET_STRING EXCEL_ROW 1 EXCEL_COMPONENT_NAME

Usage in parts_list.tab:
  Line 51 (parts_list.tab): EXCEL_GET_STRING EXCEL_ROW 1 EXCEL_COMPONENT_NAME
```

#### EXCEL_SET_VALUE
```
Syntax: EXCEL_SET_VALUE {row} {col} {value}
Purpose: Write cell value
Example: EXCEL_SET_VALUE EXCEL_ROW 4 ftos(THICKNESS, 3)

Usage:
  Line 151 (export_sa.tab): EXCEL_SET_VALUE EXCEL_ROW 16 "FORMED"
  Line 236 (export_sa.tab): EXCEL_SET_VALUE EXCEL_ROW 4 ftos(THICKNESS, 3)
```

#### EXCEL_GET_VALUES
```
Syntax: EXCEL_GET_VALUES CELL_BY_INDEX {r1} {c1}
         CELL_BY_INDEX {r2} {c2} {array}
Purpose: Extract rectangular range into array
Example: EXCEL_GET_VALUES CELL_BY_INDEX 6 0 CELL_BY_INDEX (EXCEL_ROW-1) 22 arrayData

Parameters:
  (r1,c1) to (r2,c2) - Range bounds
  array - Receives flattened data

Usage (BOM data extraction):
  Line 841 (export_sa.tab): EXCEL_GET_VALUES CELL_BY_INDEX 6 0 CELL_BY_INDEX (EXCEL_ROW-1) 22 arrayData
```

### Macros

#### EXCEL_RUN_MACRO
```
Syntax: EXCEL_RUN_MACRO {macro_name} {array}
Purpose: Execute VBA macro
Example: EXCEL_RUN_MACRO "macro2" MACRO

Purpose of "macro2" (inferred):
  - Recalculate formulas
  - Refresh pivot tables
  - Update named ranges

Usage:
  Line 427 (export_sa.tab): EXCEL_RUN_MACRO "macro2" MACRO
  Line 105 (consolidate.tab): EXCEL_RUN_MACRO "macro2" MACRO
```

---

## 5. PDF/EXPORT OPERATIONS

### DXF Export

#### EXPORT_FILE
```
Syntax: EXPORT_FILE {export_type} {format} {filename}
Purpose: Export drawing to file
Example: EXPORT_FILE dxf DXF WO_NUM + "_" + SINDEX

Parameters:
  export_type - dxf (drawing exchange format)
  format      - DXF (uppercase)
  filename    - Without extension

Output:
  {filename}.dxf in current working directory

Usage:
  Line 648 (export_sa.tab): EXPORT_FILE dxf DXF WO_NUM +"_"+ SINDEX
  Result: "2024001_001.dxf", "2024001_002.dxf", etc.
```

#### SET_WORKING_DIRECTORY
```
Syntax: SET_WORKING_DIRECTORY {path}
Purpose: Set export output directory
Example: SET_WORKING_DIRECTORY DXF_DIRECTORY

Usage:
  Line 646 (export_sa.tab): SET_WORKING_DIRECTORY DXF_DIRECTORY
```

### PDF Export

#### EXPORT_DRW_PDF
```
Syntax: EXPORT_DRW_PDF {drawing} {options_struct} {filename}
Purpose: Export drawing to PDF
Example: EXPORT_DRW_PDF PDF_DRW option PDF_NAME

Parameters:
  options_struct - PDF_OPTION struct (see below)
  filename       - Without extension

PDF_OPTION Struct:
  option.title              - Document title
  option.author             - Creator name
  option.subject            - Content description
  option.keywords           - Search keywords
  option.launch_viewer      - Open after export (TRUE/FALSE)
  option.color_depth        - "Gray" (grayscale) or "Color"
  option.layer_mode         - "None" (flatten) or "ByLayer"
  option.use_pentable       - "TRUE" (use custom pen table)
  option.pentable_file      - Path to .pnt file (color/width mapping)

Usage:
  Line 733 (export_sa.tab): EXPORT_DRW_PDF PDF_DRW option PDF_NAME
  Lines 749-758 (export_sa.tab): PDF Mode 2 with family table
  Line 800 (export_sa.tab): PDF Mode 3 for each instance
  Line 1501 (export_sa.tab): Master BOM drawing PDF
```

---

## 6. ARRAY & DATA OPERATIONS

### Array Management

#### DECLARE_ARRAY
```
Syntax: DECLARE_ARRAY {array_name} [, {array2}, ...]
Purpose: Create dynamic array
Example: DECLARE_ARRAY CSYS_ARRAY

Usage:
  Line 46 (export_sa.tab): DECLARE_ARRAY CSYS_ARRAY
  Line 426 (export_sa.tab): DECLARE_ARRAY MACRO
```

#### CLEAR_ARRAY
```
Syntax: CLEAR_ARRAY {array}
Purpose: Empty array (reset to size 0)
Example: CLEAR_ARRAY CSYS_ARRAY

Usage:
  Line 81 (export_sa.tab): CLEAR_ARRAY CSYS_ARRAY
  Line 452 (export_sa.tab): CLEAR_ARRAY PDF1
```

#### ADD_ARRAY_ELEM
```
Syntax: ADD_ARRAY_ELEM {array} {element}
Purpose: Append element to array
Example: ADD_ARRAY_ELEM PDF1 DXF_COMP

Usage:
  Line 682 (export_sa.tab): ADD_ARRAY_ELEM PDF1 DXF_COMP
  Line 687 (export_sa.tab): ADD_ARRAY_ELEM PDF2 GENERIC
```

#### GET_ARRAY_SIZE
```
Syntax: GET_ARRAY_SIZE {array} {variable}
Purpose: Get number of elements
Example: GET_ARRAY_SIZE PDF1 PDF_SIZE

Usage:
  Line 712 (export_sa.tab): GET_ARRAY_SIZE PDF1 PDF_SIZE
  Line 853 (export_sa.tab): GET_ARRAY_SIZE ITEMS SIZE
```

#### GET_ARRAY_ELEM
```
Syntax: GET_ARRAY_ELEM {array} {index} {variable}
Purpose: Read array element (0-indexed)
Example: GET_ARRAY_ELEM ITEMS (((ITEM_INDEX-1)*23)+0) COL0

Usage:
  Line 881 (export_sa.tab): GET_ARRAY_ELEM ITEMS (((ITEM_INDEX-1)*23)+0) COL0
  Line 964 (export_sa.tab): GET_ARRAY_ELEM ITEMS (((ITEM_INDEX-1)*23)+21) MatNum
```

#### FIND_ARRAY_ELEM
```
Syntax: FIND_ARRAY_ELEM {array} {search_value} {index_var}
Purpose: Search array for element
Example: FIND_ARRAY_ELEM PDF2 GENERIC PDF_INDEX

Returns:
  -1 if not found
  0+ if found (index of first match)

Usage:
  Line 684 (export_sa.tab): FIND_ARRAY_ELEM PDF2 GENERIC PDF_INDEX
```

#### FOR...END_FOR
```
Syntax: FOR {element_var} REF ARRAY {array}
         ... code ...
         END_FOR

Purpose: Iterate array elements
Example: FOR CSYS_REF REF ARRAY CSYS_ARRAY
           GET_REF_NAME CSYS_REF CSYS_NAME
           ...
         END_FOR

Usage:
  Line 88 (export_sa.tab): FOR CSYS_REF REF ARRAY CSYS_ARRAY
  Line 155 (export_sa.tab): FOR SURFACE_REF REF ARRAY SURFACE_ARRAY
  Line 714 (export_sa.tab): FOR PDF REF ARRAY PDF1
```

### Data Type Operations

#### Type Conversion Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `itos(n)` | Integer to string | `itos(5)` → `"5"` |
| `ftos(d,p)` | Float to string, precision | `ftos(12.5, 3)` → `"012.500"` |
| `stof(s)` | String to float | `stof("12.5")` → `12.5` |
| `stoi(s)` | String to integer | `stoi("5")` → `5` |
| `strlen(s)` | String length | `strlen("hello")` → `5` |
| `strmid(s,i,n)` | String substring | `strmid("hello", 1, 3)` → `"ell"` |
| `strfind(s, pat)` | Find pattern in string | `strfind("hello", "ll")` → `2` |

#### Mathematical Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `ROUND(n, p)` | Round to precision | `ROUND(3.7, 0)` → `4` |
| `FLOOR(n)` | Round down | `FLOOR(3.7)` → `3` |
| `MOD(a,b)` | Modulo operation | `MOD(7, 2)` → `1` |

---

## 7. CONFIGURATION COMMANDS

#### GET_CONFIG_OPTION
```
Syntax: GET_CONFIG_OPTION {option_name} {variable}
Purpose: Read system setting
Example: GET_CONFIG_OPTION "override_store_back" OSB

Usage:
  Line 4 (export_sa.tab): GET_CONFIG_OPTION "override_store_back" OSB
```

#### SET_CONFIG_OPTION
```
Syntax: SET_CONFIG_OPTION {option_name} {value}
Purpose: Change system setting
Example: SET_CONFIG_OPTION "override_store_back" "no"

Configuration Options:
  "override_store_back"         - YES/NO: persist design changes
  "system_colors_file"          - Path to color scheme (.scl)
  "create_fraction_dim"         - YES/NO: auto fractional dims
  "dim_fraction_denominator"    - 16, 32, 64 (fraction size)

Usage:
  Line 5 (export_sa.tab): SET_CONFIG_OPTION "override_store_back" "no"
  Line 63 (drawing.tab): SET_CONFIG_OPTION "create_fraction_dim" "yes"
  Line 64 (drawing.tab): SET_CONFIG_OPTION "dim_fraction_denominator" "64"
  Line 721 (export_sa.tab): SET_CONFIG_OPTION "system_colors_file" "C:\SIGMAXIM\...\sa.scl"
```

---

## 8. ERROR HANDLING

#### BEGIN_CATCH_ERROR / END_CATCH_ERROR
```
Syntax: BEGIN_CATCH_ERROR
         ... code that may error ...
         END_CATCH_ERROR
         IF ERROR
           ... handle error ...
         END_IF
         CLEAR_CATCH_ERROR

Purpose: Trap runtime errors
Example: BEGIN_CATCH_ERROR
           SEARCH_MDL_PARAM DXF_COMP "BEND_LINES" BEND_LINES
         END_CATCH_ERROR
         IF ERROR
           BEND_LINES = 0
         END_IF
         CLEAR_CATCH_ERROR

Usage:
  Line 507-513 (export_sa.tab): Optional BEND_LINES parameter
  Line 675-679 (export_sa.tab): Optional PDF parameter
```

#### CLEAR_CATCH_ERROR
```
Syntax: CLEAR_CATCH_ERROR
Purpose: Reset error flag
Example: CLEAR_CATCH_ERROR

Usage:
  Line 513 (export_sa.tab): CLEAR_CATCH_ERROR
  Line 679 (export_sa.tab): CLEAR_CATCH_ERROR
```

#### PRINT
```
Syntax: PRINT {message} [%] {variable}
Purpose: Output to console/log
Example: PRINT "THERE IS NO DIM CSYS FOR THIS PART"
         PRINT "%" DXF_COMP
         PRINT "VIEW %" VIEW

Usage:
  Line 96 (export_sa.tab): PRINT "THERE IS NO DIM CSYS FOR THIS PART"
  Line 183 (export_sa.tab): PRINT "%" DXF_COMP
```

#### STOP
```
Syntax: STOP
Purpose: Halt script execution
Example: STOP

Usage:
  Line 97 (export_sa.tab): STOP (after missing DIM CSYS error)
```

#### USER_SELECT
```
Syntax: USER_SELECT {element_type} {variable}
Purpose: Interactive element selection
Example: USER_SELECT SURFACE FIXED

Usage (missing FIXED surface fallback):
  Line 170 (export_sa.tab): USER_SELECT SURFACE FIXED
  Line 177 (export_sa.tab): USER_SELECT SURFACE FIXED
```

#### USER_INPUT_PARAM
```
Syntax: USER_INPUT_PARAM {type} {variable}
Purpose: Prompt user for input
Example: USER_INPUT_PARAM STRING CUSTOMER_NAME

Usage:
  Line 1109 (export_sa.tab): USER_INPUT_PARAM STRING CUSTOMER_NAME
```

---

## SPECIAL VARIABLES & STRUCT TYPES

### PDF_OPTION Struct
```
DECLARE_STRUCT PDF_OPTION option

option.title              STRING    Document title
option.author             STRING    Creator name
option.subject            STRING    Content description
option.keywords           STRING    Search keywords
option.launch_viewer      STRING    "FALSE"/"TRUE"
option.color_depth        STRING    "Gray" or "Color"
option.layer_mode         STRING    "None" (flatten)
option.use_pentable       STRING    "TRUE"/"FALSE"
option.pentable_file      STRING    Path to .pnt file
```

### MASS_PROPERTIES Struct
```
DECLARE_STRUCT MASS_PROPERTIES props

props.volume              DOUBLE    3D volume (cubic inches)
props.center_of_gravity.x DOUBLE    X coordinate
props.center_of_gravity.y DOUBLE    Y coordinate
props.center_of_gravity.z DOUBLE    Z coordinate
props.mass                DOUBLE    Part mass
props.density             DOUBLE    Material density
```

### DRAWING_OPTIONS Struct
```
DECLARE_STRUCT DRAWING_OPTIONS options

options.drawing_text_height   DOUBLE    Text size (inches)
options.text_thickness        DOUBLE    Pen width (inches)
```

### SMT_BEND_SURFACE_PROPS Struct
```
GET_SMT_BEND_SURFACE_PROPS surface_ref props

props.radius           DOUBLE    Inner bend radius
props.angle            DOUBLE    Bend angle (degrees)
props.length           DOUBLE    Edge length
props.bend_upwards     BOOLEAN   Direction (TRUE=up, FALSE=down)
```

---

**END OF API REFERENCE**
