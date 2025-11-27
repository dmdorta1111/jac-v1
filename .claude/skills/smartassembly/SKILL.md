---
name: smartassembly
description: >
  Expert-level SmartAssembly scripting language support for SIGMAXIM's Creo
  Parametric automation system. Use when users ask about writing, reviewing,
  or debugging SmartAssembly .tab files, CREATE_UDF or ASSEMBLE commands,
  GUI/table configuration with BEGIN_GUI_DESCR or BEGIN_TAB_DESCR blocks,
  surface-to-sheetmetal workflows, Creo Parametric automation via SmartAssembly,
  INCLUDE patterns and modular script design, error handling with BEGIN_CATCH_ERROR,
  reference and feature manipulation in Creo, Excel integration, drawing automation,
  PDF export, XML feature manipulation, or any PTC Creo automation scripting.
---

# SmartAssembly Scripting Language

SmartAssembly is SIGMAXIM's scripting language for Creo Parametric automation. It uses Creo's native Toolkit API to automate parametric modeling, component assembly, UDF creation, drawing generation, and export workflows.

## Script Structure

Every SmartAssembly script (.tab file) follows this structure:

```
!  © 2023 Company Name
! Optional copyright header

!---------------------------------------------------------------------------------
BEGIN_GUI_DESCR          ! Optional: User interface definition
    ! GUI elements, pictures, user inputs
    ! Conditional logic for dynamic UI
END_GUI_DESCR
!---------------------------------------------------------------------------------

!---------------------------------------------------------------------------------
BEGIN_TAB_DESCR          ! Optional: Table-driven configuration
    BEGIN_TABLE name "Title"
        ! Table definition
    END_TABLE
END_TAB_DESCR
!---------------------------------------------------------------------------------

!---------------------------------------------------------------------------------
BEGIN_ASM_DESCR          ! Required: Main automation logic
    
    !-----------------------------------------------------------------------
    ! Declare all variables / references / arrays
    !-----------------------------------------------------------------------
    ! Variable declarations organized by type
    
    ! Main processing logic
    ! UDF creation, feature operations
    
    WINDOW_ACTIVATE      ! Activate window for user at end
    
END_ASM_DESCR
!---------------------------------------------------------------------------------
```

## Comments

```
! Single line comment
/* Multi-line
   comment block */
```

## Variable Types and Declaration

Always organize declarations by type at script start:

```
!-----------------------------------------------------------------------
! Declare all variables / references / arrays
!-----------------------------------------------------------------------
! Strings
DECLARE_VARIABLE STRING UDF_DIR "udfs"
DECLARE_VARIABLE STRING UDF_NAME
DECLARE_VARIABLE STRING NAME ""

! Integers
DECLARE_VARIABLE INTEGER DONE 0
DECLARE_VARIABLE INTEGER i 0
DECLARE_VARIABLE INTEGER FEAT_COUNT

! Doubles
DECLARE_VARIABLE DOUBLE THICKNESS 0.075
DECLARE_VARIABLE DOUBLE CURRENT_DIST
DECLARE_VARIABLE DOUBLE MIN_DIST 100

! Booleans
DECLARE_VARIABLE BOOL CURB_BODY FALSE
DECLARE_VARIABLE BOOL START_SPACER TRUE

! References (Creo geometry)
DECLARE_REFERENCE SKEL_MDL
DECLARE_REFERENCE GROUP_HEAD
DECLARE_REFERENCE FLANGE_SURFACE

! Arrays
DECLARE_ARRAY FEATURES_TO_GROUP
DECLARE_ARRAY ARRAY_ALL_SURFS
DECLARE_ARRAY ARRAY_DIMS

! Maps
DECLARE_MAP STRING SUBASMS_MAP
DECLARE_MAP INTEGER FIELD_JOINTS_MAP

! Structures
DECLARE_STRUCT POINT pos
DECLARE_STRUCT VECTOR direction
DECLARE_STRUCT PDF_OPTION option
!-----------------------------------------------------------------------
```

## Control Structures

### Conditional Statements
```
IF condition
    ! code
ELSE_IF other_condition
    ! code
ELSE
    ! code
END_IF

! Multiple conditions
IF STOCKTYPE == 1 AND stof(THICKNESS) < 1.0
    ! code
END_IF

IF NOT REF_VALID SURF1 OR NOT REF_VALID SURF2
    ! code
END_IF
```

### Loop Structures
```
! For loop over array
FOR item REF ARRAY my_array
    ! code using item
    BREAK      ! exit loop
    CONTINUE   ! next iteration
END_FOR

! For loop over map
FOR ELEM REF MAP my_map
    key = ELEM.key
    value = ELEM.value
END_FOR

! While loop with counter
i = 1
WHILE i <= NUM_FEATS
    GET_GROUP_FEATURE GROUP_HEAD i CURRENT_FEAT
    i++
END_WHILE

! Infinite loop with explicit break
WHILE "A" <> "B"
    ! Processing
    IF condition
        BREAK
    END_IF
END_WHILE
```

## GUI Development Patterns

### Main GUI with Checkboxes
```
BEGIN_GUI_DESCR
    CHECKBOX_PARAM INTEGER MAIN_DONE "Y/N"
    
    IF MAIN_DONE == 0
        ! Radio button for material selection
        RADIOBUTTON_PARAM INTEGER CURB_MATERIAL "Galv" "All SS"
        
        ! Conditional checkbox visibility (mutually exclusive options)
        IF NOT OPTION_B AND NOT OPTION_C
            CHECKBOX_PARAM BOOL OPTION_A "#1"
            
            IF OPTION_A
                USER_INPUT_PARAM DOUBLE THICKNESS REQUIRED
                USER_SELECT_MULTIPLE COMPOSITE_CURVE -1 CURB_CURVES FILTER_GEOM FILTER_ARRAY
            END_IF
        END_IF
        
        IF NOT OPTION_A AND NOT OPTION_C
            CHECKBOX_PARAM BOOL OPTION_B "#2"
        END_IF
    ELSE
        ! Reset all when done
        OPTION_A = FALSE
        OPTION_B = FALSE
        OPTION_C = FALSE
    END_IF
END_GUI_DESCR
```

### Optional User Selection with Delete
```
BEGIN_GUI_DESCR
    CHECKBOX_PARAM INTEGER DONE "Y/N"
    
    IF DONE == 0
        ! Show delete option only if items exist
        IF NOT ARRAY_EMPTY ARRAY_EXISTING_ITEMS
            USER_SELECT_MULTIPLE_OPTIONAL FEATURE_PARAM "ITEM_PARAM" -1 ITEMS_TO_DELETE
        END_IF
        
        ! Show add inputs only if not deleting
        IF ARRAY_EMPTY ITEMS_TO_DELETE
            USER_SELECT EDGE DRIVING_EDGE FILTER_GEOM ARRAY_EDGES
            USER_INPUT_PARAM DOUBLE OFFSET TOOLTIP "Offset distance from edge"
        END_IF
    END_IF
END_GUI_DESCR
```

### Placeholder/Spacer Pattern
```
! Use impossible condition to create visual spacing in GUI
IF "A" == "B"
    CHECKBOX_PARAM INTEGER BLANK_TEMP ""
END_IF
```

## UDF Creation Patterns

### Standard UDF with Dynamic Path
```
UDF_NAME = "curb_stringer_recess_l"

CREATE_UDF "lib:"+&UDF_DIR+"\\"+&UDF_NAME SKEL_MDL REMOVE_UDF_RELATIONS UDF_GROUP
    UDF_REF "DRIVING_EDGE" DRIVING_EDGE
    UDF_REF "BACK_EDGE" SECOND_EDGE
    UDF_REF "TOP_FLANGE_SURFACE" FLANGE_SURFACE
    UDF_REF "FLOOR_PLN" SUB_FLOOR_PLN
    
    UDF_EXP_REF GROUP_HEAD FEATURE 0
    UDF_EXP_REF ROUND_FEAT FEATURE 6
    UDF_EXP_REF EXTRUDE_CUT FEATURE 7
END_CREATE_UDF
UNGROUP_FEATURES UDF_GROUP
```

### UDF with Error Handling and Fallback
```
CLEAR_CATCH_ERROR
BEGIN_CATCH_ERROR
    UDF_NAME = "curb_knuckle_l"
    CREATE_UDF "lib:"+&UDF_DIR+"\\"+&UDF_NAME SKEL_MDL REMOVE_UDF_RELATIONS UDF_GROUP
        UDF_REF "BREAK_EDGE" BREAK_EDGE
        UDF_REF "BREAK_SURF" BREAK_SURF
        UDF_EXP_REF GROUP_HEAD FEATURE 0
    END_CREATE_UDF
    UNGROUP_FEATURES UDF_GROUP
    SET_REF_NAME GROUP_HEAD "KNUCKLE_L_"+*
END_CATCH_ERROR

! Try alternate UDF if first fails
IF ERROR
    CLEAR_CATCH_ERROR
    BEGIN_CATCH_ERROR
        UDF_NAME = "curb_knuckle_r"
        CREATE_UDF "lib:"+&UDF_DIR+"\\"+&UDF_NAME SKEL_MDL REMOVE_UDF_RELATIONS UDF_GROUP
            UDF_REF "BREAK_EDGE" BREAK_EDGE
            UDF_REF "BREAK_SURF" BREAK_SURF
            UDF_EXP_REF GROUP_HEAD FEATURE 0
        END_CREATE_UDF
        UNGROUP_FEATURES UDF_GROUP
        SET_REF_NAME GROUP_HEAD "KNUCKLE_R_"+*
    END_CATCH_ERROR
END_IF
```

### Post-UDF Dimension Manipulation
```
CREATE_UDF lib:udfs\component SKEL_MDL UDF_GROUP
    UDF_EXP_REF EXTRUDE_FEAT FEATURE 4
END_CREATE_UDF
UNGROUP_FEATURES UDF_GROUP

! Get and modify dimensions after creation
CLEAR_ARRAY ARRAY_DIMS
GET_FEATURE_DIMS EXTRUDE_FEAT ARRAY_DIMS

DIM_COUNT = 0
FOR EACH_DIM REF ARRAY ARRAY_DIMS
    GET_DIM_VALUE EACH_DIM value
    
    IF abs(value) == 1.875
        SPACER_OFFSET_COUNT = DIM_COUNT
    END_IF
    
    DIM_COUNT++
END_FOR

GET_ARRAY_ELEM ARRAY_DIMS SPACER_OFFSET_COUNT CURRENT_OFFSET_DIM
SET_DIM_VALUE CURRENT_OFFSET_DIM NEW_VALUE
SET_DIM_SYMBOL CURRENT_OFFSET_DIM "UNIQUE_SYMBOL_"+itos(NUM)
```

## Surface and Edge Analysis Patterns

### Vector Direction Analysis
```
! Get normal direction of reference plane
GET_SURFACE_NORM NULL SUB_FLOOR_PLN SB_POS SB_VEC
VECTOR_NORMALIZE SB_VEC

! Compare surface/edge direction to reference
FOR EACH_EDGE REF ARRAY CONTOUR.array_edges
    GET_LINE_DATA NULL EACH_EDGE LINE_DATA
    VECTOR_FROM_POINTS LINE_DATA.pnt_from LINE_DATA.pnt_to LINE_VEC
    VECTOR_NORMALIZE LINE_VEC
    
    ! Check if edge is parallel to reference plane normal (vertical)
    IF abs(LINE_VEC.x) == abs(SB_VEC.x) AND abs(LINE_VEC.y) == abs(SB_VEC.y) AND abs(LINE_VEC.z) == abs(SB_VEC.z)
        ADD_ARRAY_ELEM VERTICAL_EDGES EACH_EDGE
    ELSE
        ! Horizontal edge - find closest to floor
        MEASURE_DISTANCE SUB_FLOOR_PLN EACH_EDGE EDGE_DIST
        IF EDGE_DIST < CURRENT_DIST
            CURRENT_DIST = EDGE_DIST
            COPY_REF EACH_EDGE BOTTOM_EDGE
        END_IF
    END_IF
END_FOR
```

### Surface Contour Processing
```
! Get external contour
GET_SURFACE_CONTOUR SURF EXTERNAL SURF_CONTOUR

! Process edges in contour
FOR EACH_EDGE REF ARRAY SURF_CONTOUR.array_edges
    GET_REF_VERTEX EACH_EDGE START START_PNT
    GET_REF_VERTEX EACH_EDGE END END_PNT
    
    GET_REF_POS NULL START_PNT START_POS
    GET_REF_POS NULL END_POS END_POS
    
    VECTOR_FROM_POINTS START_POS END_POS EDGE_VEC
    VECTOR_NORMALIZE EDGE_VEC
END_FOR
```

### Finding Opposing Surfaces (Field Joint Pattern)
```
FOR POTENTIAL_FJS1 REF ARRAY POTENTIAL_FIELD_SURFS
    GET_SURFACE_NORM DEFAULT_CSYS POTENTIAL_FJS1 FJS1_POS FJS1_VEC
    VECTOR_NORMALIZE FJS1_VEC
    
    FOR POTENTIAL_FJS2 REF ARRAY POTENTIAL_FIELD_SURFS
        IF REF_EQUAL POTENTIAL_FJS1 POTENTIAL_FJS2
            CONTINUE
        END_IF
        
        GET_SURFACE_NORM DEFAULT_CSYS POTENTIAL_FJS2 FJS2_POS FJS2_VEC
        VECTOR_NORMALIZE FJS2_VEC
        
        ! Check if surfaces face opposite directions
        IF FJS1_VEC.x == -1*FJS2_VEC.x AND FJS1_VEC.y == -1*FJS2_VEC.y AND FJS1_VEC.z == -1*FJS2_VEC.z
            MEASURE_DISTANCE POTENTIAL_FJS1 POTENTIAL_FJS2 DIST
            
            IF DIST <= 0.1
                ! Found matching field joint surfaces
            END_IF
        END_IF
    END_FOR
END_FOR
```

## Feature Group Iteration Pattern

```
! Get group info
GET_GROUP_FEATURE_NUM GROUP_HEAD NUM_FEATS
GET_GROUP_HEAD GROUP_HEAD HEAD

! Iterate through group features
FEAT_COUNT = 1
WHILE FEAT_COUNT <= NUM_FEATS
    GET_GROUP_FEATURE GROUP_HEAD FEAT_COUNT CURRENT_FEAT
    
    ! Get feature properties
    GET_FEATURE_TYPE CURRENT_FEAT CURRENT_FEAT_TYPE
    GET_FEATURE_SUBTYPE_NAME CURRENT_FEAT CURRENT_FEAT_SUBTYPE
    GET_FEATURE_NAME CURRENT_FEAT CURRENT_FEAT_NAME
    
    IF CURRENT_FEAT_TYPE == "GEOM_COPY"
        SET_FEAT_PARAM CURRENT_FEAT "CURB_GROUP" CURB_NUM
    END_IF
    
    IF CURRENT_FEAT_SUBTYPE == "*SWEEP*"
        SET_FEAT_PARAM CURRENT_FEAT "STRINGER" TRUE
    END_IF
    
    ! Check for failed features
    IF IS_FAILED CURRENT_FEAT
        ! Handle failure
        BREAK
    END_IF
    
    FEAT_COUNT++
END_WHILE
```

## Feature Parameter Tracking Pattern

```
! Set tracking parameters for later identification
SET_FEAT_PARAM CURB_QUILT "CURB" CURB_NUM
SET_FEAT_PARAM GROUP_HEAD "CURB_GROUP" CURB_NUM
SET_FEAT_PARAM SWEEP_FEAT "STRINGER" TRUE

! Search by parameter later
SEARCH_MDL_REFS SKEL_MDL FEATURE_PARAM "CURB_GROUP" CURB_GROUP_FEATURES
SEARCH_MDL_REFS SKEL_MDL FEATURE_PARAM "STRINGER" ARRAY_STRINGERS

! Search with specific value
SEARCH_MDL_REFS SKEL_MDL FEATURE_PARAM "CURB_GROUP" WITH_CONTENT INTEGER CG_NUM CURB_GROUP_FEATURES
```

## Reference Parameter Pattern

```
! Set reference parameter on geometry (edges, surfaces)
SET_REF_PARAM EACH_EDGE "BREAK_EDGE" "BREAK_EDGE"

! Search by reference parameter
SEARCH_MDL_REFS SKEL_MDL EDGE_PARAM "BREAK_EDGE" ARRAY_BREAK_EDGES
```

## Excel Integration Pattern

```
! Start Excel if not connected
IF NOT EXCEL_CONNECTED
    EXCEL_START !INVISIBLE
END_IF

! Load document
CLEAR_CATCH_ERROR
BEGIN_CATCH_ERROR
    EXCEL_LOAD_DOCUMENT DXF_DIRECTORY+"\\"+BOM_DOCUMENT_NAME
END_CATCH_ERROR

EXCEL_TO_FOREGROUND
EXCEL_ACTIVATE_DOCUMENT BOM_DOCUMENT_NAME
EXCEL_ACTIVATE_SHEET SHEET_BY_NAME "LISTING"

! Read/write cells
EXCEL_GET_VALUE EXCEL_ROW 1 EXCEL_COMPONENT_NAME
EXCEL_GET_VALUE EXCEL_ROW 2 STOCKTYPE
EXCEL_SET_VALUE EXCEL_ROW 20 ASM_CODE

! Process rows until empty
EXCEL_ROW = 6
WHILE EOF == "FALSE"
    EXCEL_GET_VALUE EXCEL_ROW 1 COMPONENT_NAME
    
    IF COMPONENT_NAME == ""
        BREAK
    END_IF
    
    ! Process row...
    
    EXCEL_ROW++
END_WHILE

! Save and close
EXCEL_SAVE_DOCUMENT DXF_DIRECTORY+"\\"+BOM_DOCUMENT_NAME+EXCEL_EXT
EXCEL_CLOSE_DOCUMENT
EXCEL_DISCONNECT
```

## XML Feature Manipulation Pattern

```
! Read feature XML for modification
GET_WORKING_DIRECTORY WORKING_DIR
GET_REF_NAME SKEL_MDL NAME
NAME = NAME + ".prt"

! Clean up old files
BEGIN_CATCH_ERROR
    DELETE_FILE WORKING_DIR+\+"existing.xml"
    DELETE_FILE WORKING_DIR+\+"modified.xml"
END_CATCH_ERROR
CLEAR_CATCH_ERROR

! Read current feature XML
READ_FEATURE_XML REMOVE_FEAT WORKING_DIR+\+"existing.xml"
WAIT_FOR_FILE WORKING_DIR+\+"existing.xml" TIMEOUT 10.0

! Open files for modification
FILE_OPEN WORKING_DIR+\+"existing.xml" "r" EXISTING_XML
FILE_OPEN WORKING_DIR+\+"modified.xml" "w" NEW_XML

! Process XML line by line
WHILE NOT FILE_END EXISTING_XML
    FILE_READ_LINE EXISTING_XML eachLINE
    FILE_WRITE_LINE NEW_XML eachLINE
    
    ! Insert additional XML at specific location
    IF strfind(eachLINE, "</PRO_XML_SRFCOLL_REF>") > -1
        FOR eachID REF ARRAY ID_NUMBERS
            FILE_WRITE_LINE NEW_XML "              <PRO_XML_SRFCOLL_REF type=\"compound\">"
            FILE_WRITE_LINE NEW_XML "                <PRO_XML_REFERENCE_ID type=\"id\">"+itos(eachID)+"</PRO_XML_REFERENCE_ID>"
            FILE_WRITE_LINE NEW_XML "              </PRO_XML_SRFCOLL_REF>"
        END_FOR
    END_IF
END_WHILE

FILE_CLOSE EXISTING_XML
FILE_CLOSE NEW_XML

! Apply modified XML to feature
MODIFY_FEATURE_XML REMOVE_FEAT WORKING_DIR+\+"modified.xml"

! Cleanup
DELETE_FILE WORKING_DIR+\+"existing.xml"
DELETE_FILE WORKING_DIR+\+"modified.xml"
```

## Drawing Automation Pattern

```
! Retrieve template drawing
USE_LIBRARY_MDL lib:dxf_temp DRAWING dxf

! Create drawing view
CREATE_DRW_VIEW_GENERAL dxf DXF_COMP VIEW SCALE X_POS Y_POS ANGLE dxfView
SET_DRW_VIEW_TANGENT_EDGE_DISPLAY dxfView NONE
SET_DRW_VIEW_DISPLAY dxfView NO_HIDDEN

! Create notes
CREATE_DRW_NOTE refDrawing X Y "Text" HEIGHT 0.375 HORIZONTAL LEFT refNote

! Process multiple sheets
GET_DRW_SHEET_NUM refDrawing numberSheets
i = 1
WHILE i <= numberSheets
    SET_DRW_CUR_SHEET refDrawing i
    
    ! Process sheet...
    
    i++
END_WHILE

! Export PDF with options
DECLARE_STRUCT PDF_OPTION option
option.sheets = "CURRENT"
option.color_depth = "gray"
option.use_pentable = "TRUE"
option.launch_viewer = "FALSE"

EXPORT_DRW_PDF refDrawing option DIRECTORY+\+PDF_NAME

! Cleanup
GET_DRW_MDL dxf DXF_MDL
DELETE_DRW_MDL dxf DXF_MDL
DELETE_FILE "*.log*"
```

## Processing Box (Progress Indicator) Pattern

```
PROCESSING_BOX_START "Identifying Break Edges...Please Wait!"

GET_ARRAY_SIZE EDGES_TO_PROCESS NUM_EDGES

EDGE_COUNT = 1
FOR EACH_EDGE REF ARRAY EDGES_TO_PROCESS
    PROCESSING_BOX_SET_STATE (EDGE_COUNT/NUM_EDGES)*100
    
    ! Processing logic...
    
    EDGE_COUNT++
END_FOR

PROCESSING_BOX_END
```

## Message Box Patterns

```
! Simple message
MESSAGE_BOX IMAGE lib:Images\Attention.gif "No 'CURB_SKETCH' found!\n\nPlease select curves."

! Message box with buttons
DECLARE_ARRAY arrayButtons
ADD_ARRAY_ELEM arrayButtons "KEEP"
ADD_ARRAY_ELEM arrayButtons "FLIP X"
ADD_ARRAY_ELEM arrayButtons "FLIP Z"

MESSAGE_BOX_EX SCREEN_LOCATION BOTTOM_CENTER QUESTION "CORRECT CSYS DIRECTION?" "What should we do" arrayButtons paramChoice

IF paramChoice == 1
    ! User chose "KEEP"
ELSE_IF paramChoice == 2
    ! User chose "FLIP X"
END_IF
```

## INCLUDE Module Pattern

### Main Script Calling Modules
```
! Conditional includes based on user selection
IF STRINGERS
    INCLUDE lib:Curb_Stringers.tab
END_IF

IF FIELD_JOINTS
    INCLUDE lib:Curb_Field_Joints.tab
END_IF

! Shared utility include
INCLUDE lib:Curb_Set_Feat_Group_Num.tab

! Path relative include
INCLUDE lib:..\\Flip_Csys_Direction.tab
```

### Module Script Structure
```
! Module that expects inherited variables
BEGIN_ASM_DESCR

!-----------------------------------------------------------------------
! Declare module-specific variables only
!-----------------------------------------------------------------------
DECLARE_VARIABLE INTEGER DIM_INDEX
DECLARE_ARRAY MODULE_ARRAY
!-----------------------------------------------------------------------

! Use inherited variables from parent (SKEL_MDL, GROUP_HEAD, CURB_NUM, etc.)
GET_GROUP_FEATURE_NUM GROUP_HEAD NUM_FEATS

FEAT_COUNT = 1
WHILE FEAT_COUNT <= NUM_FEATS
    GET_GROUP_FEATURE GROUP_HEAD FEAT_COUNT CURRENT_FEAT
    
    ! Process using inherited context...
    
    FEAT_COUNT++
END_WHILE

END_ASM_DESCR
```

## Error Handling Patterns

### Standard Error Handling
```
CLEAR_CATCH_ERROR
BEGIN_CATCH_ERROR
    SEARCH_MDL_REF THIS CSYS "ACS0" ref
END_CATCH_ERROR

IF ERROR
    CLEAR_CATCH_ERROR
    ! Alternative code or error message
END_IF

IF NOT ERROR
    ! Success path
END_IF
```

### Fix Failed UDF Pattern
```
CLEAR_CATCH_ERROR
BEGIN_CATCH_ERROR FIX_FAIL_UDF
    CREATE_UDF lib:udfs\component SKEL_MDL UDF_GROUP
        UDF_REF "EDGE" EDGE
        UDF_REF "SURFACE" SURF
    END_CREATE_UDF
END_CATCH_ERROR
```

### PARAM_VALID Check
```
CLEAR_CATCH_ERROR
BEGIN_CATCH_ERROR
    SEARCH_MDL_PARAM SKEL_MDL "ALL_SS" NO_UPDATE ALL_SS
    SEARCH_MDL_PARAM SKEL_MDL "THICKNESS" NO_UPDATE THICKNESS
END_CATCH_ERROR

IF NOT PARAM_VALID THICKNESS
    THICKNESS = 0.0750
END_IF

IF PARAM_VALID ALL_SS
    CURB_MATERIAL = ALL_SS
END_IF
```

## Stopwatch / Performance Monitoring

```
DECLARE_STOPWATCH total_watch
START_STOPWATCH total_watch

! ... processing ...

STOP_STOPWATCH total_watch
GET_STOPWATCH_TIME total_watch time
PRINT "Total Processing Time: %" time
```

## Reference Files

For detailed information, see:
- **references/commands.md** - Complete command reference
- **references/commands-search.md** - Search command details
- **references/commands-udf.md** - UDF command details
- **references/commands-assembly.md** - Assembly command details
- **references/commands-gui.md** - GUI command details
- **references/gui-patterns.md** - GUI and table configuration patterns
- **references/company-patterns.md** - Company-specific patterns and workflows

## Best Practices

1. **Organize declarations by type** at script start with clear section headers
2. **Use descriptive variable names** that indicate purpose (ARRAY_EXISTING_SPACERS, BOTTOM_EDGE)
3. **Always UNGROUP_FEATURES after CREATE_UDF** for proper naming and access
4. **Use wildcard suffix (+\*)** in SET_REF_NAME for unique names
5. **Wrap searches in BEGIN_CATCH_ERROR** for robust error handling
6. **Clear arrays before reuse** with CLEAR_ARRAY
7. **Use INVALIDATE_REF** before reusing reference variables
8. **Group related features** at section end for organization
9. **Use CONFIG_ELEM CONTINUE_ON_CANCEL** for GUI that allows cancellation
10. **Track features with parameters** for later searching (SET_FEAT_PARAM)
11. **Use vector comparison** for direction-based geometry analysis
12. **Include WINDOW_ACTIVATE** at end of scripts for user focus
13. **Use PROCESSING_BOX** for long operations
14. **Clear CATCH_ERROR before reuse** to avoid false positives
15. **Use modular INCLUDE files** for shared functionality
