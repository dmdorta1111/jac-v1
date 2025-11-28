# Model→Drawing→Export→PDF 4-Stage Manufacturing Workflow Documentation

**Project:** JAC-V1 (SDI Manufacturing System)
**Date:** 2025-11-27
**Status:** Complete Workflow Analysis
**Scope:** Full end-to-end CAD manufacturing pipeline

---

## Executive Summary

The JAC-V1 manufacturing system implements a 4-stage automated pipeline converting parametric CAD models into production-ready BOMs and drawings:

1. **Stage 1: Model Generation** - UDF placement, feature groups, geometry analysis, parameters
2. **Stage 2: Drawing Creation** - Multi-sheet layouts, templates, view generation, annotations
3. **Stage 3: Export** - DXF flattening, PDF generation with branded styling
4. **Stage 4: PDF Assembly** - Multi-document merging into single deliverable

**Key Files:**
- `export_sa.tab` (1512 lines) - Primary workflow orchestrator
- `drawing.tab` (5419 lines) - Drawing creation & multi-sheet generation
- `parts_list.tab` (247 lines) - BOM assembly logic
- `consolidate.tab` (134 lines) - Duplicate detection & consolidation

---

## STAGE 1: MODEL GENERATION

### Purpose
Prepare parametric source models with UDFs, feature groups, geometry analysis, and property extraction.

### Input Artifacts
- `.prt` (part files) - Base components
- `.asm` (assembly files) - Composite structures
- Excel workbooks - BOM specifications

### Key Variables Declared
```plaintext
COMPONENT_NAME       - Source part identifier
STOCKTYPE           - 1=Manufactured, 3=Stock, 4=Family instances
SHAPE               - *SHEET* (sheetmetal) or other (structural)
THICKNESS           - Material thickness (SMT_THICKNESS for sheetmetal)
TYPE                - Material classification (GALV, PLAST, etc.)
GRADE               - Material grade designation
FINISH              - Surface treatment code (numeric 001-999)
GRAIN               - Grain direction (0=across, 1=with, 2=alternate)
PVC                 - PVC edge banding flag (0=none, 1=applied)
DEBUR               - Deburring requirement flag
COMMENTS            - Manufacturing notes
EMJACNUM            - Internal part number
EMJACDESC           - Internal description
WO_NUM              - Work order identifier
```

### Stage 1 Operations (export_sa.tab lines 1-70)

#### 1.1 Configuration & Initialization
```plaintext
ENABLE_DATA_CAPTURE_MODE FALSE
SET_CONFIG_OPTION "override_store_back" "no"
DECLARE_VARIABLE BOOL EOF FALSE
DECLARE_ARRAY CSYS_ARRAY, SURFACE_ARRAY, PDF1, PDF2, PDF3
```
**Purpose:** Disable change tracking, prepare arrays for coordinate systems, surfaces, PDF references

#### 1.2 Excel Document Activation
```plaintext
EXCEL_ACTIVATE_DOCUMENT BOM_DOCUMENT_NAME
EXCEL_ACTIVATE_SHEET SHEET_BY_NAME "LISTING"
EXCEL_ROW = 6
EXCEL_GET_VALUE EXCEL_ROW 1 EXCEL_COMPONENT_NAME
```
**Purpose:** Open BOM spreadsheet at row 6 (header rows 1-5), iterate component list

#### 1.3 Component Classification & Retrieval
```plaintext
WHILE EOF == "FALSE"
    EXCEL_GET_VALUE EXCEL_ROW 2 STOCKTYPE
    EXCEL_GET_VALUE EXCEL_ROW 16 MDLTYPE

    IF STOCKTYPE == 1 AND MDLTYPE == ""
        EXCEL_GET_VALUE EXCEL_ROW 1 EXCEL_COMPONENT_NAME
        COMPONENT_NAME = EXCEL_COMPONENT_NAME + ".prt"
        RETRIEVE_MDL COMPONENT_NAME DXF_COMP
```
**Purpose:**
- Row 2: STOCKTYPE (manufactured=1, stock=3, phantom=2)
- Row 16: Model type indicator
- RETRIEVE_MDL loads part into CAD session

#### 1.4 Sheetmetal Feature Analysis (export_sa.tab lines 80-192)

**Sheetmetal Detection:**
```plaintext
IF SHAPE == "*SHEET*" AND SUBTYPE == "PART_SHEETMETAL"
    SEARCH_MDL_REFS DXF_COMP CSYS "*" CSYS_ARRAY
    SEARCH_MDL_REFS DXF_COMP SURFACE "*" SURFACE_ARRAY

    ! Validate DIM coordinate system exists
    CSYS_QTY = 0
    FOR CSYS_REF REF ARRAY CSYS_ARRAY
        GET_REF_NAME CSYS_REF CSYS_NAME
        IF CSYS_NAME == "DIM*"
            CSYS_QTY = CSYS_QTY + 1
        END_IF
    END_FOR
```

**Geometry Outline Calculation:**
```plaintext
SEARCH_MDL_REF DXF_COMP CSYS "DIM*" REFCSYS
CALC_OUTLINE REFCSYS DXF_COMP outline

! Calculate X, Y, Z dimensions
IF outline.x1 < outline.x2
    X = outline.x2 - outline.x1
ELSE
    X = outline.x1 - outline.x2
END_IF

IF X < 0: X = X*-1
! Similar for Y, Z
```

**State Determination (Formed vs Flat):**
```plaintext
IF X > THICKNESS*1.25 AND Y > THICKNESS*1.25 AND Z > THICKNESS*1.25
    STATE = "FORMED"
ELSE
    STATE = "FLAT"
END_IF
```
**Logic:** If all dimensions exceed thickness by 1.25x, part is formed; otherwise flat-pattern candidate

#### 1.5 UDF Unbend Feature Creation (export_sa.tab lines 185-192)

**For FORMED sheetmetal:**
```plaintext
IF STATE == "FORMED"
    SEARCH_MDL_REF DXF_COMP SURFACE "FIXED*" FIRST_SURF
    CREATE_UDF lib:udf\unbend DXF_COMP FLAT_UDF
        UDF_REF surface FIRST_SURF
        UDF_EXP_REF FLAT FEATURE 0
    END_CREATE_UDF
    GET_REF_ID FLAT_UDF REF_ID
    FEATURE_ID = "FID:" + itos(REF_ID)
END_IF
```
**Purpose:**
- Creates "unbend" UDF (User-Defined Feature) for flat-pattern export
- References FIXED surface (bend datum)
- Generates flat representation for DXF export

#### 1.6 Parameter Extraction & Dimension Calculation (export_sa.tab lines 101-248)

**Sheetmetal Parameters:**
```plaintext
SEARCH_MDL_PARAM DXF_COMP "SMT_THICKNESS" THICKNESS
SEARCH_MDL_PARAM DXF_COMP "TYPE" TYPE
SEARCH_MDL_PARAM DXF_COMP "GRADE" GRADE
SEARCH_MDL_PARAM DXF_COMP "FINISH" FINISH
SEARCH_MDL_PARAM DXF_COMP "GRAIN" GRAIN
SEARCH_MDL_PARAM DXF_COMP "PVC" PVC
SEARCH_MDL_PARAM DXF_COMP "DEBUR" DEBUR
SEARCH_MDL_PARAM DXF_COMP "COMMENTS" COMMENTS
SEARCH_MDL_PARAM DXF_COMP "EMJACNUM" EMJACNUM
SEARCH_MDL_PARAM DXF_COMP "EMJACDESC" EMJACDESC
```

**Dimension Formatting (string padding for numeric keys):**
```plaintext
SWIDTH = ftos(WIDTH, 3)
IF strlen(SWIDTH) == 5
    SWIDTH = "00" + SWIDTH
ELSE_IF strlen(SWIDTH) == 6
    SWIDTH = "0" + SWIDTH
END_IF

! Format: XXXX.XXX (e.g., "0010.500" = 10.5 inches)
```

**Finish Code Formatting (0-padded 3-digit):**
```plaintext
IF strlen(FINISH) == 1
    FINISH = "00" + FINISH
ELSE_IF strlen(FINISH) == 2
    FINISH = "0" + FINISH
END_IF
```

#### 1.7 Bend Line Feature Creation (export_sa.tab lines 515-606)

**Conditional bend line processing:**
```plaintext
IF BEND_LINES == 1 AND FEAT_NOT_EXIST DXF_COMP "BEND_LINE*"
    CLEAR_ARRAY SURFACES
    SEARCH_MDL_REFS DXF_COMP SURFACE "*" SURFACES

    FOR refSurface REF ARRAY SURFACES
        IF IS_SMT_BEND_SURFACE refSurface
            GET_SMT_SURFACE_TYPE refSurface SurfType
            IF SurfType == "GREEN_FACE"
                GET_SMT_BEND_SURFACE_PROPS refSurface surface_props
                ! Get radius, angle, length, bend direction
```

**Bend Type Detection (material-dependent UDFs):**
```plaintext
IF TYPE == "*GALV*"
    UP90 = "lib:udf\\up90_galv"
    DN90 = "lib:udf\\dn90_galv"
    BND = "lib:udf\\bndother_galv"
ELSE
    UP90 = "lib:udf\\up90"
    DN90 = "lib:udf\\dn90"
    BND = "lib:udf\\bndother"
END_IF
```

**Bend Classification Logic:**
```plaintext
! DOWN 90-degree bend (classic stamping radius)
IF surface_props.bend_upwards == FALSE AND
   surface_props.angle == 90 AND
   LENGTH_EDGE_1 > 2 AND
   (surface_props.radius == (0.03 + THICKNESS) OR
    surface_props.radius == (THICKNESS*2))
    CREATE_UDF &DN90 DXF_COMP BEND
        UDF_REF EDGE1 EDGE1
        UDF_REF SURFACE refSurface
        UDF_REF EDGE2 EDGE2
    END_CREATE_UDF

! UP 90-degree bend
ELSE_IF surface_props.bend_upwards == TRUE AND
        surface_props.angle == 90 AND
        LENGTH_EDGE_1 > 2 AND
        (surface_props.radius == 0.03 OR
         surface_props.radius == THICKNESS)
    CREATE_UDF &UP90 ...

! Other bend conditions (custom radius, angle != 90)
ELSE_IF LENGTH_EDGE_1 > 2 AND
        ((surface_props.radius <> 0.03 AND ...))
    CREATE_UDF &BND ...
END_IF
```

#### 1.8 Duplicate Detection (consolidate.tab)

**Purpose:** Identify and consolidate identical components by mass properties

```plaintext
! Compare current part properties
GET_MASS_PROPERTIES COMP_ DIM comprops

! Find duplicates in subsequent rows
WHILE EOF == "FALSE"
    EXCEL_GET_VALUE TEST_ROW 4 TEST_THICKNESS

    IF TEST_THICKNESS == THICKNESS
        EXCEL_GET_VALUE TEST_ROW 5 TEST_TYPE
        IF TEST_TYPE == TYPE
            ! Continue comparing SHAPE, GRADE, FINISH, SIZE1, SIZE2, WIDTH, LENGTH, GRAIN, PVC, DEBUR

            ! Final validation: mass properties match
            IF comprops.volume == testprops.volume AND
               comprops.center_of_gravity.x == testprops.center_of_gravity.x AND
               comprops.center_of_gravity.y == testprops.center_of_gravity.y AND
               comprops.center_of_gravity.z == testprops.center_of_gravity.z

                ! Consolidate: increment quantity, hide duplicate
                EXCEL_GET_VALUE EXCEL_ROW 3 QUANTITY
                EXCEL_SET_VALUE EXCEL_ROW 3 QUANTITY + TEST_QUANTITY
                EXCEL_SET_VALUE TEST_ROW 1 "XX_" + TEST_COMPONENT_NAME
                EXCEL_SET_VALUE TEST_ROW 2 "99"
                SET_MDL_PARAM TEST_COMP "EMJACNUM" SINDEX
                SET_MDL_PARAM TEST_COMP "EMJACDESC" EXCEL_COMPONENT_NAME
                SAVE_MDL TEST_COMP
            END_IF
        END_IF
    END_IF
END_WHILE
```

---

## STAGE 2: DRAWING CREATION

### Purpose
Generate multi-sheet engineering drawings with templates, dynamic views, parametric notes, and material requisition tables.

### Input Artifacts
- `lib:sdi_b_template.drw` - Standard SDI template
- `lib:hmf_b_template.drw` - HMF customer variant
- `lib:material_req_format.frm` - Material requisition format
- `lib:stock_req_format.frm` - Stock part requisition format
- Table definitions: `lib:heading.tbl`, `lib:mat_body.tbl`, `lib:stock_body.tbl`, `lib:tags.tbl`, `lib:Drwhistory.tbl`

### Stage 2 Operations (drawing.tab)

#### 2.1 Drawing Initialization (lines 1-70)

**Scale Calculation (adaptive to dimensions):**
```plaintext
DECLARE_VARIABLE DOUBLE Scale
Scale = 0.5/12

IF 4.0/OA_WIDTH < 6/OA_HEIGHT
    Scale = 4.0/OA_WIDTH
    XCTR = 5.0
    YCTR = ((OA_HEIGHT*SCALE)/2) + 1.8125
ELSE
    Scale = 6/OA_HEIGHT
    XCTR = 5.0
    YCTR = 3 + 1.8125
END_IF

! Special case: elevation view
IF FRAME_ELEVATION == 32
    Scale = 0.05
    YCTR = 5.25
END_IF
```

**Snap Grid Calculation:**
```plaintext
SNAPX = 0.5/Scale
SNAPY = 0.3125/Scale
```

**Drawing Creation (template selection by customer):**
```plaintext
SET_CONFIG_OPTION "create_fraction_dim" "yes"
SET_CONFIG_OPTION "dim_fraction_denominator" "64"

IF CUSTOMER_NAME == "HMF*"
    CREATE_DRW ASSEM lib:hmf_b_template.drw refDrawing
ELSE
    CREATE_DRW ASSEM lib:sdi_b_template.drw refDrawing
END_IF
```

#### 2.2 Heading Table Creation (lines 71-197)

**Base Heading Table:**
```plaintext
CREATE_DRW_TABLE refDrawing ASSEM 1 0.5625 10.4375 "lib:heading.tbl" HEADING

SET_DRW_TABLE_TEXT refDrawing heading 2 1 ITEM_NUM
SET_DRW_TABLE_TEXT refDrawing heading 2 2 itos(QTY)
SET_DRW_TABLE_TEXT refDrawing heading 2 3 HAND          ! LH/RH/LHR/RHR
SET_DRW_TABLE_TEXT refDrawing heading 2 4 itos(FIRE_RATING)
```

**Dynamic Hardware Column (conditional):**
```plaintext
IF HARDWARE_SCHEDULE_ID <> ""
    ADD_DRW_TABLE_COL refDrawing HEADING 4 NEWCOL
    SET_DRW_TABLE_TEXT refDrawing HEADING 1 NEWCOL "HDWE"
    SET_DRW_TABLE_TEXT refDrawing HEADING 2 NEWCOL HARDWARE_SCHEDULE_ID
    SET_DRW_TABLE_FORMAT refDrawing HEADING 1 NEWCOL HEIGHT 0.09 HORIZONTAL CENTER
END_IF
```

**Manufacturer Locations Column:**
```plaintext
ADD_DRW_TABLE_COL refDrawing HEADING 8 NEWCOL
SET_DRW_TABLE_TEXT refDrawing HEADING 1 NEWCOL "MFG LOC'S"
SET_DRW_TABLE_TEXT refDrawing HEADING 2 NEWCOL MANUFACTURERS_LOCATIONS
```

**Door Specifications (if OPENING_TYPE == 1 or 3):**
```plaintext
! Thickness conversion to fractions
TEMPD = 1/DENOMINATOR
TEMPN = ROUND((DOOR_THICKNESS / TEMPD), 0)
NUMBER = FLOOR(TEMPN / DENOMINATOR)
TEMPN = TEMPN - (NUMBER*DENOMINATOR)
TEMPD = DENOMINATOR

WHILE MOD(TEMPN,2) == 0 AND MOD(TEMPD,2) == 0
    TEMPN = TEMPN/2
    TEMPD = TEMPD/2
END_WHILE

IF NUMBER > 0
    FRACTION = itos(NUMBER) + " " + ftos(TEMPN,0) + "/" + ftos(TEMPD,0) + "\""
ELSE
    FRACTION = ftos(TEMPN,0) + "/" + ftos(TEMPD,0) + "\""
END_IF

ADD_DRW_TABLE_COL refDrawing HEADING 4 NEWCOL
SET_DRW_TABLE_TEXT refDrawing HEADING 1 NEWCOL "THICK"
SET_DRW_TABLE_TEXT refDrawing HEADING 2 NEWCOL FRACTION
```

**Door Material Specification:**
```plaintext
DECLARE_VARIABLE STRING FINISH
IF BODY_SIDE_FINISH == COVER_SIDE_FINISH
    FINISH = "#" + BODY_SIDE_FINISH
ELSE
    FINISH = "#" + BODY_SIDE_FINISH + " / #" + COVER_SIDE_FINISH
END_IF

ADD_DRW_TABLE_COL refDrawing HEADING 14 NEWCOL
SET_DRW_TABLE_TEXT refDrawing HEADING 1 NEWCOL "DOOR MATL"
SET_DRW_TABLE_TEXT refDrawing HEADING 2 NEWCOL itos(DOOR_GAUGE) + "GA  " + MAT_TYPE + "  T" + DOOR_GRADE + "  " + FINISH
```

**Door Construction & Edges:**
```plaintext
ADD_DRW_TABLE_COL refDrawing HEADING 8 NEWCOL
SET_DRW_TABLE_TEXT refDrawing HEADING 1 NEWCOL "CONST"
SET_DRW_TABLE_TEXT refDrawing HEADING 2 NEWCOL DOOR_CONSTRUCTION

ADD_DRW_TABLE_COL refDrawing HEADING 8 NEWCOL
SET_DRW_TABLE_TEXT refDrawing HEADING 1 NEWCOL "EDGES"
IF HINGE_EDGE_SHAPE == "BEVEL" AND STRIKE_EDGE_SHAPE == "BEVEL"
    SET_DRW_TABLE_TEXT refDrawing HEADING 2 NEWCOL STRIKE_EDGE_SHAPE
ELSE_IF HINGE_EDGE_SHAPE == "SQUARE" AND STRIKE_EDGE_SHAPE == "BEVEL"
    SET_DRW_TABLE_TEXT refDrawing HEADING 2 NEWCOL "SQ/BEVEL"
ELSE_IF HINGE_EDGE_SHAPE == "BEVEL" AND STRIKE_EDGE_SHAPE == "SQUARE"
    SET_DRW_TABLE_TEXT refDrawing HEADING 2 NEWCOL "BEVEL/SQ"
END_IF
```

**Door Core Type:**
```plaintext
ADD_DRW_TABLE_COL refDrawing HEADING 12 NEWCOL
SET_DRW_TABLE_TEXT refDrawing HEADING 1 NEWCOL "CORE"
SET_DRW_TABLE_TEXT refDrawing HEADING 2 NEWCOL CORE_DESC

ADD_DRW_TABLE_COL refDrawing HEADING 8 NEWCOL
SET_DRW_TABLE_TEXT refDrawing HEADING 1 NEWCOL "DR TOP"
SET_DRW_TABLE_TEXT refDrawing HEADING 2 NEWCOL TOP_EDGE

ADD_DRW_TABLE_COL refDrawing HEADING 8 NEWCOL
SET_DRW_TABLE_TEXT refDrawing HEADING 1 NEWCOL "DR BOT"
SET_DRW_TABLE_TEXT refDrawing HEADING 2 NEWCOL BOTTOM_EDGE
```

**Optional Sill Column:**
```plaintext
IF SILL_CODE <> ""
    ADD_DRW_TABLE_COL refDrawing HEADING 4 NEWCOL
    SET_DRW_TABLE_TEXT refDrawing HEADING 1 NEWCOL "SILL"
    SET_DRW_TABLE_TEXT refDrawing HEADING 2 NEWCOL SILL_CODE
END_IF
```

**Frame Specifications (if OPENING_TYPE == 2, 3, or 4):**
```plaintext
ADD_DRW_TABLE_COL refDrawing HEADING 14 NEWCOL
SET_DRW_TABLE_TEXT refDrawing HEADING 1 NEWCOL "FRAME MATL"
SET_DRW_TABLE_TEXT refDrawing HEADING 2 NEWCOL itos(FRAME_GAUGE) + "GA  " + MAT_TYPE + "  T" + FRAME_GRADE + " #" + FRAME_FINISH

ADD_DRW_TABLE_COL refDrawing HEADING 10 NEWCOL
SET_DRW_TABLE_TEXT refDrawing HEADING 1 NEWCOL "FR CONST"
SET_DRW_TABLE_TEXT refDrawing HEADING 2 NEWCOL FRAME_CONSTRUCTION

ADD_DRW_TABLE_COL refDrawing HEADING 8 NEWCOL
SET_DRW_TABLE_TEXT refDrawing HEADING 1 NEWCOL "HD GRAIN"
IF FRAME_FINISH == "8"
    SET_DRW_TABLE_TEXT refDrawing HEADING 2 NEWCOL "MF"
ELSE
    SET_DRW_TABLE_TEXT refDrawing HEADING 2 NEWCOL HEAD_GRAIN
END_IF
```

#### 2.3 Tags Table (lines 224-259)

**Parse delimited tag data:**
```plaintext
IF SUB_TAGS <> ""
    GET_DRW_TABLE_OUTLINE refDrawing HEADING x1 y1 x2 y2
    CREATE_DRW_TABLE refDrawing NULL 1 x1 y2 "lib:tags.tbl" TAGS

    DECLARE_VARIABLE INTEGER TEXT_LEN = strlen(SUB_TAGS)
    TAG_INDEX = 1
    TEXT_INDEX = 0

    WHILE TEXT_INDEX < TEXT_LEN
        ! Extract tag name (until "^" delimiter)
        VALUE1 = ""
        WHILE strmid(SUB_TAGS, TEXT_INDEX, 1) <> "^" AND TEXT_INDEX <= TEXT_LEN
            VALUE1 = VALUE1 + strmid(SUB_TAGS, TEXT_INDEX, 1)
            TEXT_INDEX++
        END_WHILE

        SET_DRW_TABLE_TEXT refDrawing TAGS TAG_INDEX 1 VALUE1
        TEXT_INDEX++

        ! Extract tag value (until next "^" delimiter)
        VALUE1 = ""
        WHILE strmid(SUB_TAGS, TEXT_INDEX, 1) <> "^" AND TEXT_INDEX <= TEXT_LEN
            VALUE1 = VALUE1 + strmid(SUB_TAGS, TEXT_INDEX, 1)
            TEXT_INDEX++
        END_WHILE

        SET_DRW_TABLE_TEXT refDrawing TAGS TAG_INDEX 2 VALUE1
        TEXT_INDEX++

        IF TEXT_LEN > TEXT_INDEX
            ADD_DRW_TABLE_ROW refDrawing TAGS 1 NEWROW
        END_IF
        TAG_INDEX++
    END_WHILE
END_IF
```

**Format:** `TAG1^Value1^TAG2^Value2^TAG3^Value3`

#### 2.4 History Table (lines 261-294)

**Parse drawing revision history:**
```plaintext
CREATE_DRW_TABLE refDrawing ASSEM 1 14.03125 10.4375 "lib:Drwhistory.tbl" HIST

HISTORY_INDEX = 2
TEXT_INDEX = 0
TEXT_LEN = strlen(HISTORY)

WHILE TEXT_INDEX < TEXT_LEN
    VALUE1 = ""  ! Revision
    VALUE2 = ""  ! Date
    VALUE3 = ""  ! Description

    ! Extract revision (until "^")
    WHILE strmid(HISTORY, TEXT_INDEX, 1) <> "^" AND TEXT_INDEX <= TEXT_LEN
        VALUE1 = VALUE1 + strmid(HISTORY, TEXT_INDEX, 1)
        TEXT_INDEX++
    END_WHILE
    TEXT_INDEX++

    ! Extract date
    WHILE strmid(HISTORY, TEXT_INDEX, 1) <> "^" AND TEXT_INDEX <= TEXT_LEN
        VALUE2 = VALUE2 + strmid(HISTORY, TEXT_INDEX, 1)
        TEXT_INDEX++
    END_WHILE
    TEXT_INDEX++

    ! Extract description
    WHILE strmid(HISTORY, TEXT_INDEX, 1) <> "^" AND TEXT_INDEX <= TEXT_LEN
        VALUE3 = VALUE3 + strmid(HISTORY, TEXT_INDEX, 1)
        TEXT_INDEX++
    END_WHILE
    TEXT_INDEX++

    INSERT_DRW_TABLE_ROW refDrawing HIST HISTORY_INDEX 0.465 ROW_ID
    SET_DRW_TABLE_TEXT refDrawing HIST HISTORY_INDEX + 1 1 VALUE1  ! Revision
    SET_DRW_TABLE_TEXT refDrawing HIST HISTORY_INDEX + 1 2 VALUE2  ! Date
    SET_DRW_TABLE_TEXT refDrawing HIST HISTORY_INDEX + 1 3 VALUE3  ! Description

    HISTORY_INDEX++
END_WHILE
```

**Format:** `REV1^DATE1^DESC1^REV2^DATE2^DESC2^...`

#### 2.5 Material Requisition Sheets (lines 935-1086)

**Sheet 1 (SHAPE == "1*" - Sheet material):**
```plaintext
WHILE ITEM_INDEX <= ITP AND STOCKTYPE == 1 AND SHAPE2 == "1*"
    SHEET_INDEX++
    SHEET = SHEET_INDEX
    LINE_INDEX = 1

    IF SHEET_INDEX == 1
        SET_DRW_FORMAT refDrawing SHEET_INDEX material_req_format.frm
        CREATE_DRW_TABLE refDrawing ASSEM 1 0.4375 6.625 "lib:mat_body.tbl" BODY
    ELSE_IF SHEET_INDEX > 1
        INSERT_DRW_SHEET refDrawing SHEET_INDEX
        SET_DRW_CUR_SHEET refDrawing SHEET_INDEX
        SET_DRW_FORMAT refDrawing SHEET_INDEX material_req_format.frm
        CREATE_DRW_TABLE refDrawing ASSEM SHEET_INDEX 0.4375 6.625 "lib:mat_body.tbl" BODY
    END_IF

    ! Header notes
    CREATE_DRW_NOTE refDrawing 1.0625 7.6875 WO_NUM
    CREATE_DRW_NOTE refDrawing 2.8125 7.6875 "&todays_date" HORIZONTAL CENTER

    ! Job info
    IF SUB_JOB_NAME == ""
        CREATE_DRW_NOTE refDrawing 5.5 7.125 JOB_NAME HORIZONTAL CENTER
    ELSE
        CREATE_DRW_NOTE refDrawing 5.5 7.209 JOB_NAME HORIZONTAL CENTER
        CREATE_DRW_NOTE refDrawing 5.5 7.042 SUB_JOB_NAME HORIZONTAL CENTER
    END_IF

    ! Sheet numbering
    CREATE_DRW_NOTE refDrawing 9.5 7.9375 itos(SHEET)
    CREATE_DRW_NOTE refDrawing 9.0625 7.125 ITEM_DESC HORIZONTAL CENTER

    ! Material group header
    MAX_LINES = 26
    LINE_INDEX = 1

    WHILE ITEM_INDEX <= ITP AND LINE_INDEX <= MAX_LINES AND SHAPE2 == "1*" AND STOCKTYPE == 1
        GET_ARRAY_ELEM ITEMS (((ITEM_INDEX-1)*23)+21) MatNum
        GET_ARRAY_ELEM ITEMS (((ITEM_INDEX-1)*23)+20) SHAPE2

        IF LINE_INDEX == 1
            GET_ARRAY_ELEM ITEMS (((ITEM_INDEX-1)*23)+21) MAT_NUM
            GET_ARRAY_ELEM ITEMS (((ITEM_INDEX-1)*23)+22) MAT_DESC
            SET_DRW_TABLE_TEXT refDrawing BODY LINE_INDEX 1 MAT_NUM + "  -  " + MAT_DESC
            SET_DRW_TABLE_FORMAT refDrawing BODY LINE_INDEX 1 HORIZONTAL CENTER VERTICAL MIDDLE
            LINE_INDEX++
        END_IF

        ! Material change detection
        IF MAT_NUM <> MatNum AND SHAPE2 == "1*"
            IF LINE_INDEX > 1 AND LINE_INDEX <= MAX_LINES - 4
                MERGE_DRW_TABLE refDrawing BODY LINE_INDEX 1 LINE_INDEX 8
                LINE_INDEX++
                ! Next material group
            END_IF
        END_IF

        ! Item row
        GET_ARRAY_ELEM ITEMS (((ITEM_INDEX-1)*23)+0) INDEX
        SINDEX = itos(INDEX)
        IF strlen(SINDEX) == 1: SINDEX = "00" + SINDEX
        ELSE_IF strlen(SINDEX) == 2: SINDEX = "0" + SINDEX
        END_IF

        SET_DRW_TABLE_TEXT refDrawing BODY LINE_INDEX 1 SINDEX           ! Index
        SET_DRW_TABLE_TEXT refDrawing BODY LINE_INDEX 2 DESC             ! Description
        SET_DRW_TABLE_TEXT refDrawing BODY LINE_INDEX 3 itos(QTY)        ! Quantity

        ! Width formatting (to fractions)
        GET_ARRAY_ELEM ITEMS (((ITEM_INDEX-1)*23)+11) SWIDTH
        WIDTH = stof(SWIDTH)
        TEMPD = 1/DENOMINATOR
        TEMPN = ROUND((WIDTH / TEMPD), 0)
        NUMBER = FLOOR(TEMPN / DENOMINATOR)
        TEMPN = TEMPN - (NUMBER*DENOMINATOR)
        TEMPD = DENOMINATOR
        WHILE MOD(TEMPN,2) == 0 AND MOD(TEMPD,2) == 0
            TEMPN = TEMPN/2
            TEMPD = TEMPD/2
        END_WHILE

        IF NUMBER > 0 AND TEMPN > 0
            SWIDTH = itos(NUMBER) + "-" + ftos(TEMPN,0) + "/" + ftos(TEMPD,0)
        ELSE_IF NUMBER > 0 AND TEMPN == 0
            SWIDTH = itos(NUMBER)
        ELSE
            SWIDTH = ftos(TEMPN,0) + "/" + ftos(TEMPD,0)
        END_IF

        ! Length formatting (similar to width)
        GET_ARRAY_ELEM ITEMS (((ITEM_INDEX-1)*23)+12) SLENGTH
        ! ... same fraction conversion logic ...

        ! Grain direction (0=across, 1=with, 2=alternate)
        GET_ARRAY_ELEM ITEMS (((ITEM_INDEX-1)*23)+13) GRAIN
        IF GRAIN == "0"
            SET_DRW_TABLE_TEXT refDrawing BODY LINE_INDEX 5 "  " + SWIDTH + "   x   " + SLENGTH
        ELSE_IF GRAIN == "1"
            SET_DRW_TABLE_TEXT refDrawing BODY LINE_INDEX 5 "  " + SWIDTH + "   x   " + SLENGTH + "  **"
        ELSE_IF GRAIN == "2"
            SET_DRW_TABLE_TEXT refDrawing BODY LINE_INDEX 5 "  " + SLENGTH + "   x   " + SWIDTH + "  **"
        END_IF

        ! PVC edge banding (0=none, >0=applied)
        GET_ARRAY_ELEM ITEMS (((ITEM_INDEX-1)*23)+14) PVC
        IF PVC <> "0"
            SET_DRW_TABLE_TEXT refDrawing BODY LINE_INDEX 6 "*"
        END_IF

        ! Deburring (0=none, >0=required)
        GET_ARRAY_ELEM ITEMS (((ITEM_INDEX-1)*23)+15) DEBUR
        IF DEBUR <> "0"
            SET_DRW_TABLE_TEXT refDrawing BODY LINE_INDEX 7 "*"
        END_IF

        ! Manufacturing comments
        GET_ARRAY_ELEM ITEMS (((ITEM_INDEX-1)*23)+17) COMMENTS
        IF COMMENTS <> ""
            SET_DRW_TABLE_TEXT refDrawing BODY LINE_INDEX 8 COMMENTS
        END_IF

        LINE_INDEX++
        ITEM_INDEX++
    END_WHILE
END_WHILE
```

**Sheet 2 (SHAPE == "2*" - Shaped material):**
Similar structure, column 5 = length only (lines 1090-1235)

**Sheet 3 (SHAPE == "3*" - Foam & Wood):**
Similar structure with different material properties (lines 1239-1399)

#### 2.6 Sheet Numbering (lines 1401-1409)

```plaintext
IF SHEET_INDEX > 0
    TOTAL_SHEETS = SHEET_INDEX
    SHEET_INDEX = 1
    WHILE SHEET_INDEX <= TOTAL_SHEETS
        SET_DRW_CUR_SHEET refDrawing SHEET_INDEX
        CREATE_DRW_NOTE refDrawing 10.125 7.9375 itos(TOTAL_SHEETS)  ! "Total of X"
        SHEET_INDEX++
    END_WHILE
END_IF
```

#### 2.7 Stock Requisition Sheet (lines 1411-1491)

```plaintext
SHEET_INDEX = TOTAL_SHEETS
MAX_LINES = 26

IF ITEM_INDEX <= ITP AND STOCKTYPE == 3
    WHILE ITEM_INDEX <= ITP AND STOCKTYPE == 3
        SHEET_INDEX++
        SHEET = SHEET_INDEX - TOTAL_SHEETS
        LINE_INDEX = 1

        INSERT_DRW_SHEET refDrawing SHEET_INDEX
        SET_DRW_CUR_SHEET refDrawing SHEET_INDEX
        SET_DRW_FORMAT refDrawing SHEET_INDEX "lib:stock_req_format.frm"
        CREATE_DRW_TABLE refDrawing ASSEM SHEET_INDEX 0.4375 6.625 "lib:stock_body.tbl" BODY

        ! Header information
        CREATE_DRW_NOTE refDrawing 1.0625 7.6875 WO_NUM
        CREATE_DRW_NOTE refDrawing 2.8125 7.6875 "&todays_date" HORIZONTAL CENTER

        ! Stock items (STOCKTYPE == 3)
        WHILE ITEM_INDEX <= ITP AND LINE_INDEX <= MAX_LINES
            GET_ARRAY_ELEM ITEMS (((ITEM_INDEX-1)*23)+19) EMJACDESC
            SET_DRW_TABLE_TEXT refDrawing BODY LINE_INDEX 2 EMJACDESC

            GET_ARRAY_ELEM ITEMS (((ITEM_INDEX-1)*23)+18) MatNum
            SET_DRW_TABLE_TEXT refDrawing BODY LINE_INDEX 3 MatNum

            GET_ARRAY_ELEM ITEMS (((ITEM_INDEX-1)*23)+3) QTY
            SET_DRW_TABLE_TEXT refDrawing BODY LINE_INDEX 4 itos(QTY)

            LINE_INDEX++
            ITEM_INDEX++
        END_WHILE
    END_WHILE
END_IF
```

#### 2.8 Drawing PDF Export (lines 1493-1501)

```plaintext
DECLARE_STRUCT PDF_OPTION option
option.title = "sample drawing"
option.author = "DRAFTER"
option.subject = "detail"
option.keywords = "SmartAssembly example"
option.launch_viewer = "FALSE"
option.color_depth = "Gray"
option.layer_mode = "None"

EXPORT_DRW_PDF refDrawing option WO_NUM
```

---

## STAGE 3: EXPORT (DXF & PDF Generation)

### Purpose
Generate manufacturing flats (DXF) and branded PDFs for each component.

### Stage 3 Operations (export_sa.tab lines 430-806)

#### 3.1 DXF Export Preparation (lines 430-664)

**Display datum cleanup:**
```plaintext
DISPLAY_DATUM PLANES FALSE
DISPLAY_DATUM AXES FALSE
DISPLAY_DATUM POINTS FALSE
DISPLAY_DATUM CSYS FALSE
```

**Component iteration for DXF export:**
```plaintext
EXCEL_ROW = 6
EXCEL_ACTIVATE_DOCUMENT BOM_DOCUMENT_NAME
EXCEL_ACTIVATE_SHEET SHEET_BY_NAME "LISTING"
EXCEL_GET_VALUE EXCEL_ROW 1 EXCEL_COMPONENT_NAME

CLEAR_ARRAY PDF1
CLEAR_ARRAY PDF2
CLEAR_ARRAY PDF3

WHILE EOF == "FALSE"
    EXCEL_GET_VALUE EXCEL_ROW 2 STOCKTYPE
    EXCEL_GET_VALUE EXCEL_ROW 4 THICKNESS

    IF STOCKTYPE == 1
        EXCEL_GET_VALUE EXCEL_ROW 0 INDEX
        EXCEL_GET_VALUE EXCEL_ROW 5 TYPE
        EXCEL_GET_VALUE EXCEL_ROW 13 GRAIN

        SINDEX = itos(INDEX)
        IF strlen(SINDEX) == 1: SINDEX = "00" + SINDEX
        ELSE_IF strlen(SINDEX) == 2: SINDEX = "0" + SINDEX
        END_IF

        COMPONENT_NAME = EXCEL_COMPONENT_NAME + ".prt"
        RETRIEVE_MDL COMPONENT_NAME DXF_COMP
```

**Sheetmetal flat-pattern export (lines 488-607):**

```plaintext
IF SHAPE == "SHEET" AND SUBTYPE == "PART_SHEETMETAL"
    ! Get thickness
    SEARCH_MDL_PARAM DXF_COMP "SMT_THICKNESS" THICKNESS
    EXCEL_GET_VALUE EXCEL_ROW 16 STATE    ! FORMED or FLAT

    ! Apply unbend UDF if FORMED state
    IF STATE == "FORMED"
        SEARCH_MDL_REF DXF_COMP SURFACE "FIXED*" FIRST_SURF
        CREATE_UDF lib:udf\unbend DXF_COMP FLAT_UDF
            UDF_REF surface FIRST_SURF
            UDF_EXP_REF FLAT FEATURE 0
        END_CREATE_UDF
        SET_REF_NAME FLAT_UDF "EXPORT_UDF"

        ! Optional: Add bend lines if needed
        BEGIN_CATCH_ERROR
            SEARCH_MDL_PARAM DXF_COMP "BEND_LINES" BEND_LINES
        END_CATCH_ERROR

        IF ERROR == FALSE AND BEND_LINES == 1 AND FEAT_NOT_EXIST DXF_COMP "BEND_LINE*"
            ! Create bend line features (DOWN90, UP90, other bends)
            ! [as documented in Stage 1]
        END_IF
    END_IF
```

**Grain-based view direction (lines 631-639):**
```plaintext
SEARCH_MDL_REF DXF_COMP SURFACE "FIXED*" FIXED_SURF
GET_REF_NAME FIXED_SURF FIXED_SURF_NAME

SEARCH_MDL_PARAM DXF_COMP "GRAIN" MDL_GRAIN
VIEW = itos(MDL_GRAIN)  ! 0=default, 1=rotated, 2=alternate
```

**Drawing view creation (lines 637-650):**
```plaintext
USE_LIBRARY_MDL lib:dxf_temp DRAWING DXF

CREATE_DRW_VIEW_GENERAL DXF DXF_COMP &VIEW 1 60 36 0 dxfView
SET_DRW_VIEW_TANGENT_EDGE_DISPLAY dxfView NONE
SET_DRW_VIEW_DISPLAY dxfView NO_HIDDEN
SET_LAYER_STATUS DXF_COMP 03___PRT_ALL_CURVES BLANK
SET_DRW_LAYER_STATUS dxfView 03___PRT_ALL_CURVES BLANK
REPAINT

SET_WORKING_DIRECTORY DXF_DIRECTORY
EXPORT_FILE dxf DXF WO_NUM + "_" + SINDEX
```

**Parameters:**
- `VIEW` parameter: 0=natural, 1=rotated 90°, 2=alternate orientation
- File naming: `WO_NUM_INDEX.dxf` (e.g., "2024001_001.dxf")
- Layer `03___PRT_ALL_CURVES`: hidden for clean drawing
- `NO_HIDDEN` display: shows outline only

**Unbend UDF cleanup (lines 652-663):**
```plaintext
IF STATE == "FORMED"
    IF REF_INSTANCE DXF_COMP
        ! Remove UDF from instance
        REMOVE_FEATURE CLIP_ALL FLAT_UDF
        GET_REF_GENERIC DXF_COMP GENERIC
        SWITCH_TO_MDL GENERIC
        SEARCH_MDL_REF ALLOW_SUPPRESSED GENERIC FEATURE "EXPORT_UDF" FEAT_REF
        REMOVE_FEATURE CLIP_ALL FEAT_REF
        SWITCH_TO_MDL DXF_COMP
    ELSE
        ! Remove from base part
        REMOVE_FEATURE CLIP_ALL FLAT_UDF
    END_IF
END_IF
```

#### 3.2 PDF Generation Strategy (lines 665-806)

**Three PDF modes (comments at lines 665-670):**
```plaintext
!PDF == 0 (NO PDF)
!PDF == 1 (MAKES A PDF FOR THE GENERIC ITEM ONLY, program will fail if you try to make a PDF of an instance)
!PDF == 2 (MAKES A PDF FOR THE GENERIC ONLY, INCLUDES FAMILY TABLE INFO)
!PDF == 3 (MAKES A PDF OF EACH INSTANCE USED BY THE WORK ORDER BY REPLACING THE GENERIC)
```

**PDF property detection (lines 674-698):**
```plaintext
CLEAR_CATCH_ERROR
BEGIN_CATCH_ERROR
    SEARCH_MDL_PARAM DXF_COMP "PDF" PDF
IF ERROR
    END_CATCH_ERROR
    CLEAR_CATCH_ERROR
ELSE
    IF PDF == 1
        ADD_ARRAY_ELEM PDF1 DXF_COMP
    ELSE_IF PDF == 2
        FIND_ARRAY_ELEM PDF2 GENERIC PDF_INDEX
        IF PDF_INDEX == -1
            ADD_ARRAY_ELEM PDF2 GENERIC
        END_IF
    ELSE_IF PDF == 3
        IF REF_INSTANCE DXF_COMP
            GET_REF_GENERIC DXF_COMP GENERIC
            FIND_ARRAY_ELEM PDF3 GENERIC PDF_INDEX
            IF PDF_INDEX == -1
                ADD_ARRAY_ELEM PDF3 GENERIC
            END_IF
        END_IF
    END_IF
END_IF
```

**PDF Mode 1: Generic only (lines 712-736):**
```plaintext
GET_ARRAY_SIZE PDF1 PDF_SIZE
IF PDF_SIZE > 0
    FOR PDF REF ARRAY PDF1
        GET_REF_NAME PDF PDF_NAME
        RETRIEVE_MDL PDF_NAME + ".prt" PDF_COMP
        RETRIEVE_MDL PDF_NAME + ".drw" PDF_DRW
        REGEN_MDL PDF_DRW FORCE
        REGEN_MDL PDF_DRW FORCE

        SET_CONFIG_OPTION "system_colors_file" "C:\SIGMAXIM\Library\component_engine\SDI\sa.scl"
        DECLARE_STRUCT PDF_OPTION option
        option.title = "sample drawing"
        option.author = "DRAFTER"
        option.subject = "detail"
        option.keywords = "SmartAssembly example"
        option.launch_viewer = "FALSE"
        option.color_depth = "Gray"
        option.layer_mode = "None"
        option.use_pentable = "TRUE"
        option.pentable_file = "C:\pro_stds\ProStandards\emjac_table.pnt"

        EXPORT_DRW_PDF PDF_DRW option PDF_NAME
        SET_CONFIG_OPTION "system_colors_file" "C:\SIGMAXIM\Library\component_engine\SDI\initial.scl"
    END_FOR
END_IF
```

**PDF Mode 2: Generic with family table (lines 738-764):**
```plaintext
GET_ARRAY_SIZE PDF2 PDF_SIZE
IF PDF_SIZE > 0
    FOR PDF REF ARRAY PDF2
        IF PDF <> "GENERIC"
            GET_REF_NAME PDF PDF_NAME
            RETRIEVE_MDL PDF_NAME + ".prt" PDF_COMP
            RETRIEVE_MDL PDF_NAME + ".drw" PDF_DRW
            REGEN_MDL PDF_DRW FORCE
            REGEN_MDL PDF_DRW FORCE

            ! [PDF_OPTION struct setup as Mode 1]
            EXPORT_DRW_PDF PDF_DRW option PDF_NAME
        END_IF
    END_FOR
END_IF
```

**PDF Mode 3: All instances (lines 766-806):**
```plaintext
GET_ARRAY_SIZE PDF3 PDF_SIZE
IF PDF_SIZE > 0
    FOR PDF REF ARRAY PDF3
        GET_REF_NAME PDF PDF_NAME
        RETRIEVE_MDL PDF_NAME + ".prt" PDF_COMP
        RETRIEVE_MDL PDF_NAME + ".drw" PDF_DRW
        REGEN_MDL PDF_DRW FORCE
        REGEN_MDL PDF_DRW FORCE

        ! Get all family instances
        GET_FAMINSTANCE_NAMES PDF PDF_INST_NAMES
        FOR PDF_INST_NAME REF ARRAY PDF_INST_NAMES
            GET_REF_FAMINSTANCE PDF_COMP &PDF_INST_NAME PDF_INST
            SEARCH_MDL_PARAM PDF_INST "STOCKTYPE" STOCKTYPE
            SEARCH_MDL_PARAM PDF_INST "EMJACNUM" EMJACNUM

            ! Only export instances with 3-digit EMJACNUM
            IF STOCKTYPE == 1 AND strlen(EMJACNUM) == 3
                SEARCH_DRW_VIEWS PDF_DRW "*" 1 PDF_VIEWS
                FOR PDF_VIEW REF ARRAY PDF_VIEWS
                    GET_DRW_VIEW_MDL PDF_VIEW PDF_VIEW_MDL
                    GET_REF_FAMINSTANCE PDF_COMP &PDF_INST_NAME PDF_INST
                    REPLACE_DRW_VIEW_MDL PDF_VIEW PDF_INST

                    ! [PDF_OPTION struct setup]
                    EXPORT_DRW_PDF PDF_DRW option PDF_INST_NAME
                END_FOR
            END_IF
        END_FOR
    END_FOR
END_IF
```

#### 3.3 PDF Option Struct Definition

```plaintext
DECLARE_STRUCT PDF_OPTION option

! Metadata
option.title = "sample drawing"
option.author = "DRAFTER"
option.subject = "detail"
option.keywords = "SmartAssembly example"

! Rendering options
option.launch_viewer = "FALSE"      ! Don't open PDF after export
option.color_depth = "Gray"         ! Grayscale output for printing
option.layer_mode = "None"          ! Flatten all layers
option.use_pentable = "TRUE"        ! Use custom pen table
option.pentable_file = "C:\pro_stds\ProStandards\emjac_table.pnt"
```

---

## STAGE 4: PDF ASSEMBLY & FINALIZATION

### Purpose
Merge component PDFs with master BOM drawing into single deliverable.

### Stage 4 Operations (export_sa.tab lines 807-1511)

#### 4.1 BOM Drawing Creation (lines 807-825)

```plaintext
RETRIEVE_MDL WO_ASSEM.ASM ASSEM
SET_MDL_NAME ASSEM "BOM_" + WO_NUM

CREATE_DRW ASSEM req_template.drw refDrawing
```

**Purpose:** Create master drawing from assembly template

#### 4.2 BOM Data Extraction (lines 826-851)

```plaintext
EXCEL_ACTIVATE_DOCUMENT BOM_DOCUMENT_NAME
EXCEL_ACTIVATE_SHEET SHEET_BY_NAME "LISTING"

EXCEL_ROW = 6
EXCEL_GET_VALUE EXCEL_ROW 1 EXCEL_COMPONENT_NAME

IF EXCEL_COMPONENT_NAME <> ""
    EOF = "FALSE"

    ! Find last data row
    WHILE EOF == "FALSE"
        EXCEL_ROW++
        EXCEL_GET_VALUE EXCEL_ROW 1 EXCEL_COMPONENT_NAME
        IF EXCEL_COMPONENT_NAME <> "" AND EXCEL_COMPONENT_NAME <> "*XX_*"
            EOF = "FALSE"
        ELSE
            EOF = "TRUE"
        END_IF
    END_WHILE

    ! Extract entire range (rows 6 to EXCEL_ROW-1, columns 0-22)
    DECLARE_ARRAY arrayData
    EXCEL_GET_VALUES CELL_BY_INDEX 6 0 CELL_BY_INDEX (EXCEL_ROW-1) 22 arrayData

    ! Flatten to 1D array
    DECLARE_ARRAY ITEMS
    FOR data REF ARRAY arrayData
        GET_ARRAY_ELEM data 2 value
        ADD_ARRAY_ELEM ITEMS value
    END_FOR

    GET_ARRAY_SIZE ITEMS SIZE
```

**Data structure:** 23 columns per item (0-22), multiple items concatenated

#### 4.3 Material Requisition Sheet Pagination (lines 858-1086)

**Initialization:**
```plaintext
DECLARE_VARIABLE INTEGER ITP           ! Items to process
DECLARE_VARIABLE INTEGER ITEM_INDEX    ! Current item
DECLARE_VARIABLE INTEGER MAX_LINES 26  ! Lines per page
DECLARE_VARIABLE INTEGER SHEET_INDEX
DECLARE_VARIABLE INTEGER TOTAL_SHEETS
DECLARE_VARIABLE STRING MAT_NUM = "XXX"
DECLARE_VARIABLE STRING ADDED_LINES = "NO"

ITP = SIZE / 23
ITEM_INDEX = 1
SHEET_INDEX = 0
```

**Processing:**
- Each item takes 23 array elements
- ITP = SIZE/23 = number of items
- MAX_LINES = 26 lines per material sheet
- Material grouping: collect by MAT_NUM column

#### 4.4 Stock Requisition Sheet (lines 1411-1491)

```plaintext
SHEET_INDEX = TOTAL_SHEETS
MAX_LINES = 26

IF ITEM_INDEX <= ITP AND STOCKTYPE == 3
    WHILE ITEM_INDEX <= ITP AND STOCKTYPE == 3
        SHEET_INDEX++
        SHEET = SHEET_INDEX - TOTAL_SHEETS
        LINE_INDEX = 1

        INSERT_DRW_SHEET refDrawing SHEET_INDEX
        SET_DRW_CUR_SHEET refDrawing SHEET_INDEX
        SET_DRW_FORMAT refDrawing SHEET_INDEX "lib:stock_req_format.frm"
        CREATE_DRW_TABLE refDrawing ASSEM SHEET_INDEX 0.4375 6.625 "lib:stock_body.tbl" BODY

        WHILE ITEM_INDEX <= ITP AND LINE_INDEX <= MAX_LINES
            GET_ARRAY_ELEM ITEMS (((ITEM_INDEX-1)*23)+19) EMJACDESC
            SET_DRW_TABLE_TEXT refDrawing BODY LINE_INDEX 2 EMJACDESC

            GET_ARRAY_ELEM ITEMS (((ITEM_INDEX-1)*23)+18) MatNum
            SET_DRW_TABLE_TEXT refDrawing BODY LINE_INDEX 3 MatNum

            GET_ARRAY_ELEM ITEMS (((ITEM_INDEX-1)*23)+3) QTY
            SET_DRW_TABLE_TEXT refDrawing BODY LINE_INDEX 4 itos(QTY)

            LINE_INDEX++
            ITEM_INDEX++
        END_WHILE
    END_WHILE
END_IF
```

#### 4.5 Master PDF Export (lines 1493-1501)

```plaintext
DECLARE_STRUCT PDF_OPTION option
option.title = "sample drawing"
option.author = "DRAFTER"
option.subject = "detail"
option.keywords = "SmartAssembly example"
option.launch_viewer = "FALSE"
option.color_depth = "Gray"
option.layer_mode = "None"

EXPORT_DRW_PDF refDrawing option WO_NUM
```

#### 4.6 Finalization (lines 1504-1511)

```plaintext
SET_CONFIG_OPTION "override_store_back" OSB

SAVE_MDL refDrawing
EXCEL_SAVE_DOCUMENT BOM_DOCUMENT_NAME

END_ASM_DESCR
```

---

## WORKFLOW INTEGRATION POINTS

### Entry Point: export_sa.tab
- **Trigger:** Work order creation with BOM in Excel
- **Input:** `WO_ASSEM.ASM`, Excel BOM workbook
- **Output:** DXF files, PDFs, updated models with parameters

### Drawing Data Flow
```
Model Parameters
    ↓
Excel BOM (LISTING sheet)
    ↓
extract_sa.tab (Stage 1)
    ↓ [UDFs, flats, parameters set]
drawing.tab (Stage 2)
    ↓ [DXF views, material sheets]
export_sa.tab (Stage 3)
    ↓ [PDF generation, mode-based selection]
consolidate.tab [optional dedup]
    ↓
PDF merge script (Stage 4)
    ↓ [iTextSharp, PowerShell, final deliverable]
```

### Array Element Mapping (ITEMS array, 23 columns per item)
```
Index  Column  Name            Type        Example
0      COL0    INDEX           INTEGER     001
1      COL1    DESC            STRING      "Frame_Stile"
2      COL2    STOCKTYPE       INTEGER     1
3      COL3    QTY             INTEGER     2
4      COL4    THICKNESS       DOUBLE      0.075
5      COL5    TYPE            STRING      "GALV"
6      COL6    SHAPE           STRING      "SHEET"
7      COL7    GRADE           INTEGER     50
8      COL8    FINISH          STRING      "001"
9      COL9    SIZE1           DOUBLE      0
10     COL10   SIZE2           DOUBLE      0
11     COL11   WIDTH           DOUBLE      12.5
12     COL12   LENGTH          DOUBLE      96.0
13     COL13   GRAIN           INTEGER     0
14     COL14   PVC             INTEGER     0
15     COL15   DEBUR           INTEGER     0
16     COL16   [MDLTYPE]       STRING      "FORMED"
17     COL17   COMMENTS        STRING      "Welded corners"
18     COL18   EMJACNUM        STRING      "001_WO2024001"
19     COL19   EMJACDESC       STRING      "Frame Assembly"
20     COL20   SHAPE2          STRING      "1*" (material type)
21     COL21   MAT_NUM         STRING      "STL-GALV-50"
22     COL22   MAT_DESC        STRING      "Steel Galvanized 50# Gauge"
```

---

## ERROR HANDLING & VALIDATION

### Stage 1 Validation
```plaintext
! Missing DIM coordinate system
IF CSYS_QTY < 1
    PRINT "THERE IS NO DIM CSYS FOR THIS PART"
    STOP
END_IF

! Missing fixed surface for unbend
IF SURFACE_QTY < 1
    IF REF_INSTANCE DXF_COMP
        GET_REF_GENERIC DXF_COMP GENERIC
        SWITCH_TO_MDL GENERIC
        USER_SELECT SURFACE FIXED
        SET_REF_NAME FIXED "FIXED"
        SAVE_MDL GENERIC
        SWITCH_TO_MDL DXF_COMP
    ELSE
        SWITCH_TO_MDL DXF_COMP
        USER_SELECT SURFACE FIXED
        SET_REF_NAME FIXED "FIXED"
        SAVE_MDL DXF_COMP
    END_IF
END_IF
```

### Error Catching Pattern
```plaintext
BEGIN_CATCH_ERROR
    SEARCH_MDL_PARAM DXF_COMP "BEND_LINES" BEND_LINES
END_CATCH_ERROR

IF ERROR
    BEND_LINES = 0
END_IF
CLEAR_CATCH_ERROR
```

### DXF Export Validation
```plaintext
SET_WORKING_DIRECTORY DXF_DIRECTORY
EXPORT_FILE dxf DXF WO_NUM +"_"+ SINDEX
REPAINT
DELETE_DRW_MDL DXF DXF_COMP  ! Clean up temp drawing
```

---

## KEY CONFIGURATION & CONSTANTS

### System Paths
```plaintext
COLOR FILE:              C:\SIGMAXIM\Library\component_engine\SDI\sa.scl
INITIAL COLOR FILE:      C:\SIGMAXIM\Library\component_engine\SDI\initial.scl
PEN TABLE:               C:\pro_stds\ProStandards\emjac_table.pnt
```

### Drawing Parameters
```plaintext
DENOMINATOR = 16                    ! Fractional denominator for dimensions
SNAP_LINES = 1                      ! Snap to 1/16" grid
DIM_FRACTION_DENOMINATOR = 64       ! Display as 1/64" fractions
DRAWING_TEXT_HEIGHT = 0.08 inches   ! Text size
TEXT_THICKNESS = 0.01 inches        ! Pen width
```

### Template Files
```plaintext
sdi_b_template.drw                  ! Standard SDI drawing template
hmf_b_template.drw                  ! HMF customer variant
material_req_format.frm             ! Material requisition page format
stock_req_format.frm                ! Stock parts requisition format
```

### Table Library Files
```plaintext
heading.tbl                         ! Door/frame specifications
mat_body.tbl                        ! Material requisition body
stock_body.tbl                      ! Stock items body
tags.tbl                            ! Optional tag key-value pairs
Drwhistory.tbl                      ! Drawing revision history
```

---

## SHEETMETAL BEND LOGIC DETAILS

### Bend Property Detection
```plaintext
PROPERTY                   TYPE        MEANING
surface_props.radius       DOUBLE      Inner bend radius (inches)
surface_props.angle        DOUBLE      Bend angle (typically 90)
surface_props.length       DOUBLE      Bend edge length
surface_props.bend_upwards BOOLEAN     Direction (up=TRUE, down=FALSE)
```

### Standard Bend Radii
```plaintext
CONDITION                           RADIUS          UDF
Down 90° (classic)                  0.03 + THICK    DN90
Down 90° (large radius)             THICK * 2       DN90
Up 90° (minimum)                    0.03            UP90
Up 90° (standard)                   THICK           UP90
Non-standard (custom radius/angle)  any other       BND
```

### Galvanized vs Other Materials
- **GALV** materials: Use specialized UDFs (`up90_galv`, `dn90_galv`, `bndother_galv`)
- **Other** materials: Standard UDFs (`up90`, `dn90`, `bndother`)

---

## DIMENSIONING & FORMATTING CONVENTIONS

### Width/Length Formatting
```plaintext
Input:  12.500 (decimal inches)
Process: ftos(12.5, 3) = "012.500"
           strlen("012.500") = 7 ≥ 6, add "0" prefix
Output: "0012.500"

Fraction Conversion (denominator 16):
12.500" → 12 8/16" = 12 1/2"
3.4375" → 3 7/16"
0.1875" → 3/16"
```

### Index Formatting
```plaintext
Index 1    → SINDEX = "001"
Index 10   → SINDEX = "010"
Index 100  → SINDEX = "100"
```

### Finish Code Formatting
```plaintext
Finish "1" → "001"
Finish "2" → "002"
Finish "42" → "042"
```

---

## NOTES & UNRESOLVED QUESTIONS

### Working Assumptions
1. **Work Order Setup:** Assumes `WO_NUM` is pre-defined before script execution
2. **Excel Structure:** BOM spreadsheet has fixed layout (LISTING sheet, header rows 1-5, data starting row 6)
3. **Model Locations:** All referenced `.prt` and `.asm` files are in standard library locations
4. **Drawing Templates:** All `.drw`, `.frm`, `.tbl` files exist in library paths
5. **PDF Metadata:** Color scheme file (sa.scl) is pre-configured for brand compliance

### Outstanding Questions
1. **PDF Merge Strategy:** The document references Stage 4 (PDF Assembly/iTextSharp), but no PowerShell script found. Is this external?
2. **Family Instances:** How are family table instances instantiated before PDF Mode 3 export?
3. **Bend Line Automatic Creation:** Lines 515-606 create bend features but can be commented out (lines 610-623). What determines when this should run?
4. **Material Requisition Grouping:** Line 975-989 merges rows by material number. Is the merge visual only, or does it affect data structure?
5. **DXF_DIRECTORY:** Where is this path set? (referenced at line 646)
6. **Grain Parameter:** What physical property does GRAIN (0/1/2) represent? Anisotropy direction?
7. **SMT_THICKNESS vs THICKNESS:** When is each parameter used? (SMT-specific vs generic)
8. **Flat-Pattern Feature ID:** Why store as "FID:nnnnn" string? (line 190)

### Known Limitations
- **Sheet Limit:** MAX_LINES = 26 (hardware limit of drawing page format?)
- **Material Sheet Capacity:** Each sheet can hold max 26 line items; large BOMs split across multiple sheets
- **Family Instance Support:** Only instances with 3-digit EMJACNUM export in Mode 3 (line 781)
- **Error Recovery:** Missing FIXED surface requires user selection (interactive mode required)

---

## COMPLETE WORKFLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 1: MODEL GENERATION                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [Excel BOM] ──→ [retrieve_mdl] ──→ [COMPONENT ANALYSIS]       │
│       ↓                                     ↓                     │
│   STOCKTYPE=1                    ┌─────────────────┐            │
│   SHAPE                          │  Sheetmetal?    │            │
│   THICKNESS                      │  (PART_SMT)     │            │
│   TYPE, GRADE, FINISH            └─────────────────┘            │
│   PVC, DEBUR, COMMENTS                  ↓ YES                    │
│   EMJACNUM, EMJACDESC            ┌─────────────────┐            │
│                                  │ [CALC_OUTLINE]  │            │
│                                  │ [STATE DETECT]  │            │
│                                  │ FORMED/FLAT     │            │
│                                  └─────────────────┘            │
│                                        ↓                         │
│                        ┌───────────────┴──────────────┐         │
│                        ↓ FORMED                  ↓ FLAT        │
│              ┌──────────────────┐      ┌──────────────────┐    │
│              │ [CREATE_UDF]     │      │ [SET FLAT FLAG]  │    │
│              │ unbend           │      │ in COMMENTS      │    │
│              │ EXPORT_UDF       │      └──────────────────┘    │
│              │                  │                               │
│              │ Opt: BEND_LINES  │                               │
│              │ UP90/DN90/BND    │                               │
│              └──────────────────┘                               │
│                        ↓                                         │
│              ┌──────────────────────────────────────┐           │
│              │ [PARAMETER EXTRACTION]                │           │
│              │ THICKNESS, TYPE, GRADE, FINISH...    │           │
│              │ Format for Excel EMJACNUM/EMJACDESC  │           │
│              └──────────────────────────────────────┘           │
│                        ↓                                         │
│              ┌──────────────────────────────────────┐           │
│              │ [DUPLICATE DETECTION] (consolidate)  │           │
│              │ Compare: mass properties              │           │
│              │ Action: consolidate, hide duplicate   │           │
│              └──────────────────────────────────────┘           │
│                        ↓                                         │
│                  [SAVE MODELS]                                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 2: DRAWING CREATION                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [CREATE_DRW] ──→ [TEMPLATE SELECTION]                          │
│       ↓                ├─ HMF variant                            │
│   refDrawing          └─ SDI standard                            │
│       ↓                                                            │
│  ┌──────────────────────────────────────────────────────┐       │
│  │ [HEADING TABLE]                                      │       │
│  │ Item# | Qty | Hand | Fire | Hdwe | Mfg Locs         │       │
│  │ [Dynamic door/frame columns]                         │       │
│  │ Thickness | Material | Grade | Finish | Construction│       │
│  │ Edges | Core | Top | Bottom | [Sill] | [Grain]      │       │
│  └──────────────────────────────────────────────────────┘       │
│       ↓                                                            │
│  ┌──────────────────────────────────────────────────────┐       │
│  │ [TAGS TABLE] (optional, delim "^")                  │       │
│  │ TAG1 | Value1                                        │       │
│  │ TAG2 | Value2                                        │       │
│  └──────────────────────────────────────────────────────┘       │
│       ↓                                                            │
│  ┌──────────────────────────────────────────────────────┐       │
│  │ [HISTORY TABLE] (revision track)                    │       │
│  │ Rev | Date | Description                             │       │
│  └──────────────────────────────────────────────────────┘       │
│       ↓                                                            │
│  ┌──────────────────────────────────────────────────────┐       │
│  │ [MATERIAL REQUISITION SHEETS] (paginated)           │       │
│  │ ┌─────────────────────────────────────────┐        │       │
│  │ │ Sheet 1: SHAPE=1* (sheet material)      │        │       │
│  │ │ Material | Qty | Width x Length | ...   │        │       │
│  │ │ (MAX_LINES=26, group by MAT_NUM)       │        │       │
│  │ └─────────────────────────────────────────┘        │       │
│  │ ┌─────────────────────────────────────────┐        │       │
│  │ │ Sheet 2: SHAPE=2* (shaped material)     │        │       │
│  │ │ Similar structure, length only          │        │       │
│  │ └─────────────────────────────────────────┘        │       │
│  │ ┌─────────────────────────────────────────┐        │       │
│  │ │ Sheet 3: SHAPE=3* (foam & wood)         │        │       │
│  │ │ Similar structure                       │        │       │
│  │ └─────────────────────────────────────────┘        │       │
│  │ ┌─────────────────────────────────────────┐        │       │
│  │ │ Sheet N: STOCKTYPE=3 (stock parts)      │        │       │
│  │ │ Description | PN | Quantity              │        │       │
│  │ └─────────────────────────────────────────┘        │       │
│  └──────────────────────────────────────────────────────┘       │
│       ↓                                                            │
│  [INSERT_DRW_SHEET] for each page                              │
│  [SET_DRW_FORMAT] for format (.frm)                            │
│  [CREATE_DRW_NOTE] for headers                                 │
│  [SET_DRW_TABLE_TEXT] for data                                 │
│       ↓                                                            │
│  [Sheet numbering: current / total]                             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 3: EXPORT (DXF & PDF Generation)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [For each manufactured component (STOCKTYPE=1)]                │
│       ↓                                                            │
│  [USE_LIBRARY_MDL] lib:dxf_temp ──┐                             │
│       ↓                            ↓                              │
│  [CREATE_DRW_VIEW_GENERAL]   [SET VIEW angle]                   │
│  DISPLAY:                    GRAIN direction:                    │
│  - NO_HIDDEN (outline)       - 0 = natural                       │
│  - TANGENT_EDGE = NONE       - 1 = rotated                       │
│  - Hide layer 03___...       - 2 = alternate                     │
│       ↓                                                            │
│  [EXPORT_FILE] dxf DXF WO_NUM_SINDEX                            │
│  (e.g., "2024001_001.dxf")                                      │
│       ↓                                                            │
│  [REMOVE_FEATURE] FLAT_UDF (if FORMED)                          │
│  Clean up temporary features                                     │
│       ↓                                                            │
│  [Populate PDF arrays]                                           │
│  PDF1/PDF2/PDF3 based on PDF parameter                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                           ↓
         ┌─────────────────┬──────────────────┬────────────────┐
         ↓                 ↓                  ↓                 ↓
    ┌──────────┐   ┌──────────────┐  ┌──────────────┐  ┌──────────┐
    │ PDF1     │   │ PDF2         │  │ PDF3         │  │ MAIN BOM │
    │ Mode 1   │   │ Mode 2       │  │ Mode 3       │  │ Drawing  │
    │ Generic  │   │ Generic +    │  │ All instances│  │          │
    │ Only     │   │ Family Table │  │ (replace)    │  │ Create & │
    └──────────┘   └──────────────┘  └──────────────┘  │ Export   │
         ↓                 ↓                  ↓          └──────────┘
    ┌──────────────────────────────────────────┐           ↓
    │ [For each component in PDF arrays]       │
    │                                           │
    │ [RETRIEVE_MDL] part + drawing             │
    │ [REGEN_MDL] PDF_DRW (2x FORCE)            │
    │ [SET_CONFIG_OPTION] color scheme          │
    │                                           │
    │ [DECLARE_STRUCT PDF_OPTION]               │
    │ option.title = "..."                      │
    │ option.color_depth = "Gray"               │
    │ option.use_pentable = "TRUE"              │
    │ option.pentable_file = "emjac_table.pnt"  │
    │                                           │
    │ [EXPORT_DRW_PDF] PDF_DRW option FILENAME  │
    │                                           │
    │ [Restore color scheme]                    │
    └──────────────────────────────────────────┘
         ↓
    ┌──────────────────────────────────────────────────────┐
    │ PDFs Generated:                                      │
    │ - Component_001.pdf (Mode 1 or 2)                    │
    │ - Component_instance_A.pdf (Mode 3)                  │
    │ - Component_instance_B.pdf (Mode 3)                  │
    │ - WO_NUM.pdf (Master BOM drawing)                    │
    └──────────────────────────────────────────────────────┘
         ↓
└─────────────────────────────────────────────────────────────────┐
│ STAGE 4: PDF ASSEMBLY (External: Merge-PDF_Script.ps1)         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [PowerShell] ──→ [iTextSharp] ──→ [Merge PDFs]                │
│  - Component PDFs (DXF-based)                                    │
│  - BOM master drawing                                            │
│  ↓                                                                │
│  [Final Deliverable]                                             │
│  WO_NUM_Complete.pdf (single merged file)                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## FILE LOCATION REFERENCE

| File/Component | Location | Purpose |
|---|---|---|
| `export_sa.tab` | `C:\Users\waveg\...\SDI\export_sa.tab` | Main orchestrator (1512 lines) |
| `drawing.tab` | `C:\Users\waveg\...\SDI\drawing.tab` | Drawing creation (5419 lines) |
| `parts_list.tab` | `C:\Users\waveg\...\SDI\parts_list.tab` | BOM assembly logic (247 lines) |
| `consolidate.tab` | `C:\Users\waveg\...\SDI\consolidate.tab` | Deduplication (134 lines) |
| Color Scheme | `C:\SIGMAXIM\Library\...\SDI\sa.scl` | PDF branding |
| Pen Table | `C:\pro_stds\ProStandards\emjac_table.pnt` | PDF rendering |
| Templates | Library paths | `.drw`, `.frm`, `.tbl` files |

---

**END OF DOCUMENTATION**
*Complete 4-stage workflow traced and documented from source code.*
