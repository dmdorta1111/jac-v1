# Company-Specific SmartAssembly Patterns

This reference documents patterns derived from the company's SmartAssembly codebase for commercial refrigeration equipment (counters, cabinets, sections) and curb/structural fabrication.

## Design Philosophy: Surface-to-Sheetmetal Workflow

The engineering approach uses lightweight surface models with coordinate systems, then converts to sheet metal at export:

1. **SKEL Models**: Skeleton parts containing curves, planes, and coordinate systems defining geometry
2. **UDF Placement**: UDFs attach to skeleton geometry creating surface representations
3. **Population**: Converts surface geometry to sheet metal parts

## Main Controller Script Pattern

A main controller script that manages multiple sub-operations with a GUI-driven workflow:

```
!  © 2023 Company Name

!---------------------------------------------------------------------------------
BEGIN_GUI_DESCR ! Main Application Section

CHECKBOX_PARAM INTEGER MAIN_DONE "Y/N"

IF MAIN_DONE == 0
    ! Radio Button for global options
    RADIOBUTTON_PARAM INTEGER MATERIAL_TYPE "Galv" "All SS"

    ! Visual spacer using impossible condition
    IF "A" == "B"
        CHECKBOX_PARAM INTEGER BLANK_TEMP ""
    END_IF

    ! Mutually exclusive operation checkboxes
    IF NOT OPTION_B AND NOT OPTION_C AND NOT OPTION_D
        CHECKBOX_PARAM BOOL OPTION_A "#1"
        
        IF OPTION_A
            USER_INPUT_PARAM DOUBLE THICKNESS REQUIRED
            USER_SELECT_MULTIPLE COMPOSITE_CURVE -1 CURVES FILTER_GEOM FILTER_ARRAY
        END_IF
    END_IF

    IF NOT OPTION_A AND NOT OPTION_C AND NOT OPTION_D
        CHECKBOX_PARAM BOOL OPTION_B "#2"
    END_IF

    IF NOT OPTION_A AND NOT OPTION_B AND NOT OPTION_D
        CHECKBOX_PARAM BOOL OPTION_C "#3"
    END_IF
    
    ! Continue pattern for additional options...
    
ELSE
    ! Reset all when done
    OPTION_A = FALSE
    OPTION_B = FALSE
    OPTION_C = FALSE
    OPTION_D = FALSE
END_IF

END_GUI_DESCR
!---------------------------------------------------------------------------------

!---------------------------------------------------------------------------------
BEGIN_ASM_DESCR ! Main Application Section

!-----------------------------------------------------------------------
! Declare all variables / references / arrays
!-----------------------------------------------------------------------
! Strings
DECLARE_VARIABLE STRING UDF_DIR "udfs"
DECLARE_VARIABLE STRING UDF_NAME

! Integers
DECLARE_VARIABLE INTEGER MAIN_DONE 0
DECLARE_VARIABLE INTEGER MATERIAL_TYPE 100
DECLARE_VARIABLE INTEGER i 0
DECLARE_VARIABLE INTEGER FEAT_COUNT

! Doubles
DECLARE_VARIABLE DOUBLE THICKNESS 0.075

! Booleans
DECLARE_VARIABLE BOOL OPTION_A FALSE
DECLARE_VARIABLE BOOL OPTION_B FALSE
DECLARE_VARIABLE BOOL OPTION_C FALSE
DECLARE_VARIABLE BOOL OPTION_D FALSE

! References
DECLARE_REFERENCE SKEL_MDL
DECLARE_REFERENCE GROUP_HEAD

! Arrays
DECLARE_ARRAY FEATURES_TO_GROUP
DECLARE_ARRAY FILTER_ARRAY
!-----------------------------------------------------------------------

! Copy the reference to the model on screen
COPY_REF THIS SKEL_MDL

! Search for key references
SEARCH_MDL_REF SKEL_MDL PLANE "BASE_BOTTOM*" BASE_BOTTOM
SEARCH_MDL_REF SKEL_MDL PLANE "SUB_FLOOR" SUB_FLOOR_PLN
SEARCH_MDL_REF SKEL_MDL CSYS "DEF_CSYS" DEFAULT_CSYS

! Check for model parameters
CLEAR_CATCH_ERROR
BEGIN_CATCH_ERROR
    SEARCH_MDL_PARAM SKEL_MDL "ALL_SS" NO_UPDATE ALL_SS
    SEARCH_MDL_PARAM SKEL_MDL "THICKNESS" NO_UPDATE THICKNESS
END_CATCH_ERROR

IF NOT PARAM_VALID THICKNESS
    THICKNESS = 0.0750
END_IF

IF PARAM_VALID ALL_SS
    MATERIAL_TYPE = ALL_SS
END_IF

! Main processing loop
WHILE MAIN_DONE == 0
    ! Reset for each pass
    OPTION_A = FALSE
    OPTION_B = FALSE
    OPTION_C = FALSE
    
    !-----------------------------------------------------------------------
    ! Launch the GUI
    !-----------------------------------------------------------------------
    CLEAR_GUI_CANCELLED
    CONFIG_ELEM CONTINUE_ON_CANCEL
    !-----------------------------------------------------------------------

    ! Validate required selections
    IF MATERIAL_TYPE <> 0 AND MATERIAL_TYPE <> 1
        MESSAGE_BOX IMAGE lib:Images\Attention.gif "You Must Select A Material!"
        CONTINUE
    END_IF

    ! Update model parameter
    SET_MDL_PARAM SKEL_MDL "ALL_SS" MATERIAL_TYPE NO_REGEN

    ! Route to appropriate modules
    IF OPTION_A
        INCLUDE lib:Module_A.tab
    END_IF

    IF OPTION_B
        INCLUDE lib:Module_B.tab
    END_IF

    IF OPTION_C
        INCLUDE lib:Module_C.tab
    END_IF
END_WHILE

! Final cleanup
SAVE_LAYER_STATUS SKEL_MDL
WINDOW_ACTIVATE

END_ASM_DESCR 
!---------------------------------------------------------------------------------
```

## Sub-Module Pattern with Delete Option

Pattern for modules that can add/delete features:

```
BEGIN_GUI_DESCR

    GLOBAL_PICTURE lib:Images\Module_Background.gif

    ! If existing items, offer delete option
    IF NOT ARRAY_EMPTY ARRAY_EXISTING_ITEMS
        USER_SELECT_MULTIPLE_OPTIONAL FEATURE_PARAM "ITEM_PARAM" -1 ITEMS_TO_DELETE
    END_IF

    ! Only show add options if not deleting
    IF ARRAY_EMPTY ITEMS_TO_DELETE
        USER_SELECT EDGE DRIVING_EDGE FILTER_GEOM ARRAY_VALID_EDGES
        USER_SELECT EDGE SECOND_EDGE FILTER_GEOM ARRAY_VALID_EDGES
    END_IF

END_GUI_DESCR

BEGIN_ASM_DESCR
ENABLE_DATA_CAPTURE_MODE FALSE
    
!-----------------------------------------------------------------------
! Declare module-specific variables
!-----------------------------------------------------------------------
DECLARE_VARIABLE INTEGER DIM_INDEX
DECLARE_VARIABLE DOUBLE MIN_DIST 6.0

DECLARE_ARRAY ARRAY_EXISTING_ITEMS
DECLARE_ARRAY ITEMS_TO_DELETE
DECLARE_ARRAY ARRAY_VALID_EDGES
!-----------------------------------------------------------------------

! Search for existing items
CLEAR_ARRAY ARRAY_EXISTING_ITEMS
SEARCH_MDL_REFS SKEL_MDL FEATURE_PARAM "ITEM_PARAM" ARRAY_EXISTING_ITEMS

! Build filter array for edge selection
CLEAR_ARRAY ARRAY_VALID_EDGES
SEARCH_MDL_REFS SKEL_MDL SURFACE "*TOP_SURFACE*" ARRAY_TOP_SURFS

FOR TOP_SURF REF ARRAY ARRAY_TOP_SURFS
    GET_SURFACE_CONTOURS TOP_SURF EXTERNAL TOP_SURF_CONTOURS
    
    FOR EACH_CONTOUR REF ARRAY TOP_SURF_CONTOURS
        FOR EACH_EDGE REF ARRAY EACH_CONTOUR.array_edges
            ADD_ARRAY_ELEM ARRAY_VALID_EDGES EACH_EDGE
        END_FOR
    END_FOR
END_FOR

!-----------------------------------------------------------------------
! Launch the GUI
!-----------------------------------------------------------------------
CONFIG_ELEM CONTINUE_ON_CANCEL
!-----------------------------------------------------------------------

! Handle deletions first
IF NOT ARRAY_EMPTY ITEMS_TO_DELETE
    FOR EACH_ITEM REF ARRAY ITEMS_TO_DELETE
        GET_GROUP_HEAD TOPLEVEL EACH_ITEM ITEM_GROUP
        
        CLEAR_CATCH_ERROR
        BEGIN_CATCH_ERROR
            REMOVE_FEATURE ITEM_GROUP
        END_CATCH_ERROR
    END_FOR
    REPAINT
END_IF

! Handle additions
WHILE REF_VALID DRIVING_EDGE AND REF_VALID SECOND_EDGE
    
    ! Create UDF based on conditions
    CLEAR_CATCH_ERROR
    BEGIN_CATCH_ERROR
        UDF_NAME = "item_type_a"
        CREATE_UDF "lib:"+&UDF_DIR+"\\"+&UDF_NAME SKEL_MDL REMOVE_UDF_RELATIONS UDF_GROUP
            UDF_REF "DRIVING_EDGE" DRIVING_EDGE
            UDF_REF "SECOND_EDGE" SECOND_EDGE
            UDF_EXP_REF GROUP_HEAD FEATURE 0
        END_CREATE_UDF
        UNGROUP_FEATURES UDF_GROUP
    END_CATCH_ERROR

    IF NOT ERROR
        SET_REF_NAME GROUP_HEAD "ITEM_"+*
        
        ! Set tracking parameter for future searches
        SET_FEAT_PARAM GROUP_HEAD "ITEM_PARAM" TRUE
        
        ! Call shared utility
        INCLUDE lib:Set_Group_Params.tab
        
        REGEN_MDL SKEL_MDL
        REPAINT
    END_IF
    
    ! Prompt for next selection
    INVALIDATE_REF DRIVING_EDGE
    INVALIDATE_REF SECOND_EDGE
    
    CLEAR_CATCH_ERROR
    BEGIN_CATCH_ERROR
        USER_SELECT EDGE DRIVING_EDGE FILTER_GEOM ARRAY_VALID_EDGES
    END_CATCH_ERROR

    IF NOT REF_VALID DRIVING_EDGE
        BREAK
    END_IF

    CLEAR_CATCH_ERROR
    BEGIN_CATCH_ERROR
        USER_SELECT EDGE SECOND_EDGE FILTER_GEOM ARRAY_VALID_EDGES
    END_CATCH_ERROR
END_WHILE

END_ASM_DESCR
```

## Shared Utility Module Pattern

Small reusable modules called via INCLUDE:

```
!  © 2023 Company Name
! Curb_Set_Feat_Group_Num.tab
! Sets CURB_GROUP parameter on all relevant features within a group

!---------------------------------------------------------------------------------
BEGIN_ASM_DESCR ! Main Application Section

! This module expects inherited variables:
!   - GROUP_HEAD: The group to process
!   - CURB_NUM: The group number to assign

! Get the number of features in the GROUP_HEAD
GET_GROUP_FEATURE_NUM GROUP_HEAD NUM_FEATS

! Process through all features
FEAT_COUNT = 1
WHILE FEAT_COUNT <= NUM_FEATS
    GET_GROUP_FEATURE GROUP_HEAD FEAT_COUNT CURRENT_FEAT
    
    GET_FEATURE_TYPE CURRENT_FEAT CURRENT_FEAT_TYPE

    IF CURRENT_FEAT_TYPE == "GEOM_COPY"
        SET_FEAT_PARAM CURRENT_FEAT "CURB_GROUP" CURB_NUM
    END_IF

    ! Check for MDL parameter
    CLEAR_CATCH_ERROR
    BEGIN_CATCH_ERROR
        SEARCH_FEAT_PARAM CURRENT_FEAT "MDL" MDL_FEAT
    END_CATCH_ERROR

    IF NOT ERROR
        SET_FEAT_PARAM CURRENT_FEAT "CURB_GROUP" CURB_NUM
    END_IF

    FEAT_COUNT++
END_WHILE

END_ASM_DESCR 
!---------------------------------------------------------------------------------
```

## Vector-Based Surface Analysis Pattern

Finding surfaces/edges based on orientation relative to a reference plane:

```
! Get normal direction of reference plane
GET_SURFACE_NORM NULL SUB_FLOOR_PLN SB_POS SB_VEC
VECTOR_NORMALIZE SB_VEC

! Separate surfaces by orientation
CLEAR_ARRAY HORIZONTAL_SURFS
CLEAR_ARRAY VERTICAL_SURFS

FOR EACH_SURF REF ARRAY ALL_SURFACES
    GET_SURFACE_NORM NULL EACH_SURF EACH_SURF_POS EACH_SURF_VEC
    VECTOR_NORMALIZE EACH_SURF_VEC
    
    ! Check if parallel to floor (horizontal)
    IF abs(EACH_SURF_VEC.x) == abs(SB_VEC.x) AND abs(EACH_SURF_VEC.y) == abs(SB_VEC.y) AND abs(EACH_SURF_VEC.z) == abs(SB_VEC.z)
        ADD_ARRAY_ELEM HORIZONTAL_SURFS EACH_SURF
    ELSE
        ADD_ARRAY_ELEM VERTICAL_SURFS EACH_SURF
    END_IF
END_FOR

! Find closest horizontal surface to floor
CURRENT_DIST = 1000000000
FOR EACH_SURF REF ARRAY HORIZONTAL_SURFS
    MEASURE_DISTANCE SUB_FLOOR_PLN EACH_SURF SURF_DIST
    
    IF SURF_DIST < CURRENT_DIST
        CURRENT_DIST = SURF_DIST
        COPY_REF EACH_SURF BOTTOM_SURFACE
    END_IF
END_FOR

! Find furthest horizontal surface from floor (top)
CURRENT_DIST = 0
FOR EACH_SURF REF ARRAY HORIZONTAL_SURFS
    MEASURE_DISTANCE SUB_FLOOR_PLN EACH_SURF SURF_DIST
    
    IF SURF_DIST > CURRENT_DIST
        CURRENT_DIST = SURF_DIST
        COPY_REF EACH_SURF TOP_SURFACE
    END_IF
END_FOR
```

## Edge Contour Processing Pattern

Processing edges from surface contours with direction analysis:

```
! Get surface contour
GET_SURFACE_CONTOUR SURF EXTERNAL SURF_CONTOUR

! Classify edges by direction
CURRENT_DIST = 1000000000
CLEAR_ARRAY VERTICAL_EDGES

FOR EACH_EDGE REF ARRAY SURF_CONTOUR.array_edges
    GET_EDGE_TYPE EACH_EDGE EDGE_TYPE
    
    IF EDGE_TYPE <> "LINE"
        CONTINUE
    END_IF
    
    ! Get line direction vector
    GET_LINE_DATA NULL EACH_EDGE LINE_DATA
    VECTOR_FROM_POINTS LINE_DATA.pnt_from LINE_DATA.pnt_to LINE_VEC
    VECTOR_NORMALIZE LINE_VEC

    ! Check if vertical (parallel to floor normal)
    IF abs(LINE_VEC.x) == abs(SB_VEC.x) AND abs(LINE_VEC.y) == abs(SB_VEC.y) AND abs(LINE_VEC.z) == abs(SB_VEC.z)
        ADD_ARRAY_ELEM VERTICAL_EDGES EACH_EDGE
    ELSE
        ! Horizontal edge - track closest to floor
        MEASURE_DISTANCE SUB_FLOOR_PLN EACH_EDGE EDGE_DIST
        
        IF EDGE_DIST < CURRENT_DIST
            CURRENT_DIST = EDGE_DIST
            COPY_REF EACH_EDGE BOTTOM_EDGE
        END_IF
    END_IF
END_FOR
```

## Field Joint Detection Pattern (Opposing Surfaces)

Finding pairs of surfaces facing opposite directions at close distance:

```
DECLARE_MAP INTEGER FIELD_JOINTS_MAP
DECLARE_ARRAY TRACKED_SURFACES

COUNT = 1
FOR SURF1 REF ARRAY POTENTIAL_SURFS
    ! Skip already processed surfaces
    FIND_ARRAY_ELEM TRACKED_SURFACES SURF1 SURF1_INDEX
    IF SURF1_INDEX <> -1
        CONTINUE
    END_IF
    
    GET_SURFACE_NORM DEFAULT_CSYS SURF1 SURF1_POS SURF1_VEC
    VECTOR_NORMALIZE SURF1_VEC

    FOR SURF2 REF ARRAY POTENTIAL_SURFS
        IF REF_EQUAL SURF1 SURF2
            CONTINUE
        END_IF

        FIND_ARRAY_ELEM TRACKED_SURFACES SURF2 SURF2_INDEX
        IF SURF2_INDEX <> -1
            CONTINUE
        END_IF

        GET_SURFACE_NORM DEFAULT_CSYS SURF2 SURF2_POS SURF2_VEC
        VECTOR_NORMALIZE SURF2_VEC

        ! Check if surfaces face opposite directions
        IF SURF1_VEC.x == -1*SURF2_VEC.x AND SURF1_VEC.y == -1*SURF2_VEC.y AND SURF1_VEC.z == -1*SURF2_VEC.z
            MEASURE_DISTANCE SURF1 SURF2 DIST
            
            IF DIST <= 0.1
                ! Found field joint pair
                CLEAR_ARRAY TEMP_ARRAY
                ADD_ARRAY_ELEM TEMP_ARRAY SURF1
                ADD_ARRAY_ELEM TEMP_ARRAY SURF2

                ADD_MAP_ELEM FIELD_JOINTS_MAP COUNT TEMP_ARRAY
                COUNT++

                ADD_ARRAY_ELEM TRACKED_SURFACES SURF1
                ADD_ARRAY_ELEM TRACKED_SURFACES SURF2

                BREAK
            END_IF
        END_IF
    END_FOR
END_FOR

! Process field joints
FOR ELEM REF MAP FIELD_JOINTS_MAP
    CLEAR_ARRAY JOINT_SURFS
    JOINT_SURFS = ELEM.value

    GET_ARRAY_ELEM JOINT_SURFS 0 SURF_ONE
    GET_ARRAY_ELEM JOINT_SURFS 1 SURF_TWO

    ! Create field joint features...
END_FOR
```

## Edge Chain Traversal Pattern

Walking along connected edges in a contour:

```
! Get first edge from internal contour
GET_SURFACE_CONTOUR FLOOR_SURFACE INTERNAL contour
FOR Edge REF ARRAY contour.array_edges
    COPY_REF Edge FirstEdge
    BREAK
END_FOR

GET_REF_ID FirstEdge FirstEdgeID
DECLARE_REFERENCE Edge FirstEdge
GET_REF_ID Edge EdgeID
GET_EDGE_TYPE Edge EdgeType

! Get all edges for position lookup
SEARCH_MDL_REFS SKEL_MDL EDGE "*" allEdges

EOF = 0
WHILE EOF == 0
    EOF = 1
    
    ! Process current edge based on type
    IF EdgeType == "LINE"
        MEASURE_LENGTH Edge LEN
        IF LEN > 5
            ! Create feature at edge...
        END_IF
    END_IF
    
    IF EdgeType == "ARC"
        ! Handle arc edge...
    END_IF
    
    ! Get endpoint position
    GET_REF_VERTEX Edge END EdgeEnd
    GET_REF_POS NULL EdgeEnd pos

    ! Find connected edge
    CLEAR_ARRAY EdgesAtPos
    GET_EDGES_AT_POS NULL allEdges pos EdgesAtPos
    
    FOR PosEdge REF ARRAY EdgesAtPos
        GET_REF_ID PosEdge PosEdgeID
        IF PosEdgeID <> EdgeID
            IF PosEdgeID <> FirstEdgeID
                EOF = 0
            END_IF
            DECLARE_REFERENCE NextEdge PosEdge
            BREAK
        END_IF
    END_FOR
    
    ! Process transition between edges
    GET_EDGE_TYPE NextEdge NextEdgeType
    
    IF NextEdgeType == "LINE" AND EdgeType == "LINE"
        ! Create corner feature (csys, miter, notch, etc.)
    END_IF
    
    ! Move to next edge
    INVALIDATE_REF Edge
    DECLARE_REFERENCE Edge NextEdge
    INVALIDATE_REF NextEdge
    GET_REF_ID Edge EdgeID
    EdgeType = NextEdgeType
END_WHILE
```

## Excel-Driven Export Pattern

Processing models based on Excel data:

```
!-----------------------------------------------------------------------
! Get Excel Document or Activate if already loaded
!-----------------------------------------------------------------------
CLEAR_CATCH_ERROR
BEGIN_CATCH_ERROR
    EXCEL_ACTIVATE_DOCUMENT BOM_DOCUMENT_NAME
END_CATCH_ERROR

IF ERROR
    IF NOT EXCEL_CONNECTED
        EXCEL_START !INVISIBLE
    END_IF
    
    CLEAR_CATCH_ERROR
    BEGIN_CATCH_ERROR
        EXCEL_LOAD_DOCUMENT DXF_DIRECTORY+"\\"+BOM_DOCUMENT_NAME
    END_CATCH_ERROR
    
    EXCEL_TO_FOREGROUND
END_IF

EXCEL_ACTIVATE_DOCUMENT BOM_DOCUMENT_NAME
EXCEL_ACTIVATE_SHEET SHEET_BY_NAME "LISTING"

! Process rows
EXCEL_ROW = 6
EXCEL_GET_VALUE EXCEL_ROW 1 COMPONENT_NAME
EXCEL_GET_VALUE EXCEL_ROW 2 STOCKTYPE

IF COMPONENT_NAME == "" OR STOCKTYPE == 99
    EOF = "TRUE"
ELSE
    EOF = "FALSE"
END_IF

WHILE EOF == "FALSE"
    INVALIDATE_PARAM THICKNESS
    EXCEL_GET_VALUE EXCEL_ROW 2 STOCKTYPE
    EXCEL_GET_VALUE EXCEL_ROW 4 THICKNESS
    
    IF STOCKTYPE == 1 AND stof(THICKNESS) < 1.0
        EXCEL_GET_VALUE EXCEL_ROW 0 INDEX
        EXCEL_GET_VALUE EXCEL_ROW 5 TYPE
        EXCEL_GET_VALUE EXCEL_ROW 13 GRAIN
        
        ! Format index with leading zeros
        SINDEX = itos(INDEX)
        IF strlen(SINDEX) == 1
            SINDEX = "00"+SINDEX
        ELSE_IF strlen(SINDEX) == 2
            SINDEX = "0"+SINDEX
        END_IF
        
        EXCEL_GET_VALUE EXCEL_ROW 1 EXCEL_COMPONENT_NAME
        COMPONENT_NAME = EXCEL_COMPONENT_NAME+".prt"
        
        RETRIEVE_MDL COMPONENT_NAME DXF_COMP
        
        ! Process component...
        
        ! Write results back
        EXCEL_SET_VALUE EXCEL_ROW 20 RESULT_CODE
    END_IF
    
    EXCEL_ROW++
    EXCEL_GET_VALUE EXCEL_ROW 1 COMPONENT_NAME
    EXCEL_GET_VALUE EXCEL_ROW 2 STOCKTYPE
    
    IF COMPONENT_NAME == "" OR STOCKTYPE == 3 OR STOCKTYPE == 99
        BREAK
    END_IF
END_WHILE

! Save and close
SET_WORKING_DIRECTORY DXF_DIRECTORY
EXCEL_ACTIVATE_DOCUMENT BOM_DOCUMENT_NAME
EXCEL_SAVE_DOCUMENT DXF_DIRECTORY+"\\"+BOM_DOCUMENT_NAME+EXCEL_EXT
EXCEL_CLOSE_DOCUMENT
EXCEL_DISCONNECT
```

## Drawing Automation Pattern

Creating technical drawings with views and annotations:

```
! Retrieve template drawing
USE_LIBRARY_MDL lib:dxf_temp DRAWING dxf

! Get orientation options
VIEW = GRAIN  ! or specific view name

! Create drawing view
CREATE_DRW_VIEW_GENERAL dxf DXF_COMP VIEW 1 60 36 0 dxfView
SET_DRW_VIEW_TANGENT_EDGE_DISPLAY dxfView NONE
SET_DRW_VIEW_DISPLAY dxfView NO_HIDDEN
REPAINT

! Export DXF
SET_WORKING_DIRECTORY DXF_DIRECTORY
EXPORT_FILE dxf DXF SO_NUM+"-"+WO_NUM+"_"+SINDEX

! Cleanup
GET_DRW_MDL dxf DXF_MDL
DELETE_DRW_MDL dxf DXF_MDL
DELETE_FILE "*.log*"
SET_WORKING_DIRECTORY PROJECT_DIRECTORY
```

## PDF Export with Options Pattern

```
! Process multiple sheets
GET_DRW_SHEET_NUM refDrawing numberSheets

i = 1
WHILE i <= numberSheets
    SET_DRW_CUR_SHEET refDrawing i

    ! Create sheet-specific notes
    CREATE_DRW_NOTE refDrawing 0.5 10.5 "QTY ("+itos(QTY)+")" HEIGHT .375 HORIZONTAL LEFT refNote
    CREATE_DRW_NOTE refDrawing 8.5 10.5 NAME HEIGHT .375 HORIZONTAL CENTER refNote
    CREATE_DRW_NOTE refDrawing 15.0 1.0 "Sheet "+itos(i)+" of "+itos(numberSheets) HEIGHT .1875 HORIZONTAL LEFT refNote

    ! Define PDF options
    DECLARE_STRUCT PDF_OPTION option
    option.sheets = "CURRENT"
    option.title = "Drawing Title"
    option.author = "DRAFTER"
    option.launch_viewer = "FALSE"
    option.color_depth = "gray"
    option.layer_mode = "None"
    option.use_pentable = "TRUE"

    ! Build unique filename
    PDF_NAME = strreplace(DRW_NUM, ".", "_", TRUE)
    
    IF numberSheets > 1
        ! Add letter suffix for multi-sheet
        NEXT_LETTER = strmid(ALPHABET, i-1, 1)
        PDF_NAME += NEXT_LETTER
    END_IF

    ! Export
    EXPORT_DRW_PDF refDrawing option DIRECTORY+\+PDF_NAME
    
    i++
END_WHILE
```

## Processing Box for Long Operations

```
PROCESSING_BOX_START "Processing Edges...Please Wait!"

GET_ARRAY_SIZE EDGES_TO_PROCESS NUM_EDGES

EDGE_COUNT = 1
FOR EACH_EDGE REF ARRAY EDGES_TO_PROCESS
    PROCESSING_BOX_SET_STATE (EDGE_COUNT/NUM_EDGES)*100

    ! Perform edge processing...
    GET_EDGE_TYPE EACH_EDGE EDGE_TYPE
    
    IF EDGE_TYPE <> LINE
        EDGE_COUNT++
        CONTINUE
    END_IF

    MEASURE_LENGTH EACH_EDGE EDGE_LEN
    
    IF EDGE_LEN < 4
        EDGE_COUNT++
        CONTINUE
    END_IF

    ! Process valid edge...
    
    EDGE_COUNT++
END_FOR

PROCESSING_BOX_END
```

## Interactive CSYS Direction Correction

```
! Create CSYS feature
CREATE_UDF lib:udfs\asm_csys SKEL_MDL UDF_GROUP
    UDF_REF "EDGE" DRIVING_EDGE
    UDF_REF "SURFACE" DRIVING_SURFACE
    UDF_EXP_REF ASM_CSYS FEATURE 1
END_CREATE_UDF
HIDE ASM_CSYS
UNGROUP_FEATURES UDF_GROUP

! Interactive correction loop
DECLARE_ARRAY arrayButtons
ADD_ARRAY_ELEM arrayButtons "KEEP"
ADD_ARRAY_ELEM arrayButtons "FLIP X"
ADD_ARRAY_ELEM arrayButtons "FLIP Z"

WHILE "A" <> "B"
    REPAINT
    HIGHLIGHT_REF ASM_CSYS

    MESSAGE_BOX_EX SCREEN_LOCATION BOTTOM_CENTER QUESTION "CORRECT CSYS DIRECTION?" "What should we do" arrayButtons paramChoice

    IF paramChoice == 1
        BREAK
    ELSE
        COPY_REF ASM_CSYS PLACE
        INCLUDE lib:..\\Flip_Csys_Direction.tab
    END_IF
END_WHILE
```

## Stopwatch for Performance Monitoring

```
DECLARE_STOPWATCH total_watch
START_STOPWATCH total_watch

! ... main processing ...

STOP_STOPWATCH total_watch
GET_STOPWATCH_TIME total_watch time

PRINT "----------------------------------------------------------------"
PRINT "Application Processing Times"
PRINT "----------------------------------------------------------------"
FOR PROCESSING_TIME REF ARRAY ARRAY_PROCESSING_TIME
    PRINT "%" PROCESSING_TIME
END_FOR
PRINT "----------------------------------------------------------------"
PRINT "Total Processing Time: %" time
```

## Reference Cleanup Pattern

Always invalidate and clear before reuse:

```
WHILE condition
    ! Clear/invalidate before reuse
    CLEAR_ARRAY arrayCurves
    CLEAR_ARRAY EdgesAtPos
    INVALIDATE_REF CURVE1
    INVALIDATE_REF PNT1
    INVALIDATE_REF PNT2
    INVALIDATE_PARAM TEMPX
    
    ! ... processing ...
END_WHILE
```
