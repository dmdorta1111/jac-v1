# SmartAssembly Command Reference

## Variable Declaration Commands

### DECLARE_VARIABLE
```
DECLARE_VARIABLE type name [default_value]
```
Types: `INTEGER`, `DOUBLE`, `STRING`, `BOOL`

Examples:
```
DECLARE_VARIABLE STRING UDF_DIR "udfs"
DECLARE_VARIABLE INTEGER DONE 0
DECLARE_VARIABLE DOUBLE THICKNESS 0.075
DECLARE_VARIABLE BOOL CURB_BODY FALSE
```

### DECLARE_REFERENCE
```
DECLARE_REFERENCE name [initial_ref]
```
Declares a reference variable for Creo geometry (surfaces, planes, csys, curves, edges, quilts, features, etc.)

```
DECLARE_REFERENCE SKEL_MDL
DECLARE_REFERENCE GROUP_HEAD
DECLARE_REFERENCE FLANGE_SURFACE
DECLARE_REFERENCE Edge NextEdge    ! Can initialize with existing ref
```

### DECLARE_ARRAY / DECLARE_MAP
```
DECLARE_ARRAY array_name
DECLARE_MAP type map_name    ! type: INTEGER, DOUBLE, STRING
```

### DECLARE_STRUCT
```
DECLARE_STRUCT struct_type variable_name
```
Types: `POINT` (x,y,z), `VECTOR` (x,y,z), `DRAWING_OPTIONS`, `PDF_OPTION`, `COPY_GEOMETRY_OPTION`, `CONTOUR`

```
DECLARE_STRUCT POINT pos
DECLARE_STRUCT VECTOR direction
DECLARE_STRUCT PDF_OPTION option
```

### DECLARE_STOPWATCH
```
DECLARE_STOPWATCH watch_name
```

## Reference Search Commands

### SEARCH_MDL_REF
```
SEARCH_MDL_REF model type "name" ref_out
SEARCH_MDL_REF RECURSIVE model type "name" ref_out
SEARCH_MDL_REF ALLOW_SUPPRESSED model type "name" ref_out
```
Types: `PLANE`, `CSYS`, `CURVE`, `SURFACE`, `POINT`, `AXIS`, `FEATURE`, `COMPONENT`, `ASSEMBLY`, `PART`, `QUILT`, `COMPOSITE_CURVE`, `EDGE`

### SEARCH_MDL_REFS
```
SEARCH_MDL_REFS model type "pattern*" array_out
SEARCH_MDL_REFS RECURSIVE model type "pattern*" array_out
SEARCH_MDL_REFS model FEATURE_PARAM "param_name" array_out
SEARCH_MDL_REFS model FEATURE_PARAM "param_name" WITH_CONTENT type value array_out
SEARCH_MDL_REFS model FEATURE_TYPE "type_name" array_out
SEARCH_MDL_REFS model EDGE_PARAM "param_name" array_out
SEARCH_MDL_REFS model MODEL_PARAM "param_name" WITH_CONTENT type value array_out
SEARCH_MDL_REFS model DIMENSION "dim_name*" array_out
```

Examples:
```
SEARCH_MDL_REFS SKEL_MDL FEATURE "*CURB_SKETCH*" CURB_SKETCHS
SEARCH_MDL_REFS SKEL_MDL FEATURE_PARAM "CURB_GROUP" CURB_GROUP_FEATURES
SEARCH_MDL_REFS SKEL_MDL FEATURE_PARAM "CURB_GROUP" WITH_CONTENT INTEGER CG_NUM CURB_GROUP_FEATURES
SEARCH_MDL_REFS SKEL_MDL FEATURE_TYPE "GEOM_COPY" ARRAY_PUB_GEOMS
SEARCH_MDL_REFS SKEL_MDL EDGE_PARAM "BREAK_EDGE" ARRAY_BREAK_EDGES
SEARCH_MDL_REFS RECURSIVE ASSEM MODEL_PARAM "PDF" WITH_CONTENT INTEGER 1 ASMS
```

### SEARCH_FEAT_PARAM / SEARCH_REF_PARAM / SEARCH_MDL_PARAM
```
SEARCH_FEAT_PARAM feature "param_name" value_out
SEARCH_FEAT_PARAM feature "param_name" NO_UPDATE value_out
SEARCH_REF_PARAM reference "param_name" value_out
SEARCH_MDL_PARAM model "param_name" NO_UPDATE value_out
```

### SEARCH_DRW_VIEW / SEARCH_DRW_VIEWS
```
SEARCH_DRW_VIEW drawing "pattern*" sheet_num view_out
SEARCH_DRW_VIEWS drawing "pattern*" sheet_num views_array_out
```

## UDF Commands

### CREATE_UDF
```
CREATE_UDF [&]udf_path model [options] [ref_out]
    UDF_REF udf_ref_name model_ref
    UDF_DIM udf_dim_name value
    UDF_EXP_REF exported_name TYPE index
    UDF_EXP_PARAM param_name
END_CREATE_UDF
```
Options: `REMOVE_UDF_RELATIONS`, `ALLOW_RECREATE`, `NO_AUTO_LAYERS`, `GROUP`
`&` prefix allows string variable for path: `&UDF_DIR+&UDF_NAME`

Full Example:
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

### UDF_REF, UDF_DIM, UDF_EXP_REF
```
UDF_REF udf_reference_name model_reference
UDF_REF "udf_reference_name" model_reference  ! Quoted form
UDF_DIM udf_dimension_name value_or_variable
UDF_EXP_REF name TYPE index   ! TYPE: FEATURE, PLANE, CSYS, CURVE, POINT, SURFACE, QUILT
```

## Feature Operations

### Feature State and Removal
```
SET_FEATURE_STATE INDIV_GP_MEMBERS feature SUPPRESSED|RESUMED
REMOVE_FEATURE [INDIV_GP_MEMBERS] [CLIP_ALL] feature
```

### Feature Information
```
GET_FEATURE_TYPE feature type_out
GET_FEATURE_SUBTYPE_NAME feature subtype_out
GET_FEATURE_NAME feature name_out
SET_FEATURE_NAME feature "new_name"
GET_FEATURE_NUMBER feature num_out
GET_FEATURE_DIMS feature dims_array_out
GET_FEATURE_FROM_GEOM geometry feature_out
IS_FAILED feature    ! Returns boolean
```

### Feature Parameters
```
SET_FEAT_PARAM feature "param" value
SEARCH_FEAT_PARAM feature "param" value_out
DELETE_FEAT_PARAM feature "param"
```

### Reference Parameters
```
SET_REF_PARAM reference "param" value
GET_REF_PARAM reference "param" value_out
```

### Dimension Operations
```
GET_DIM_VALUE dim value_out
SET_DIM_VALUE dim value
SET_DIM_SYMBOL dim "symbol_name"
SHOW_DIMS feature
```

## Geometry Extraction

### GET_GEOM_FROM_FEATURE / GET_GEOMS_FROM_FEATURE
```
GET_GEOM_FROM_FEATURE feature TYPE geom_out
GET_GEOMS_FROM_FEATURE feature TYPE array_out
```
Types: `PLANE`, `CSYS`, `CURVE`, `SURFACE`, `POINT`, `QUILT`, `COMPOSITE_CURVE`, `EDGE`

### Curve Operations
```
GET_COMPCURVE_CURVES composite_curve curves_array_out
GET_CURVE_COMPCURVE curve composite_curve_out
GET_REF_VERTEX curve START|END vertex_out
GET_CURVE_AT_POS csys curves_array pos curve_out
GET_CURVES_AT_POS csys curves_array pos curves_array_out
GET_LINE_DATA csys edge line_data_struct_out
GET_LINE_FONT curve font_string_out
GET_CURVE_LENGTH curve start_param end_param length_out
```

### Surface/Quilt Operations
```
GET_SURFACE_QUILT surface quilt_out
GET_QUILT_SURFACES quilt surfaces_array_out
GET_SURFACE_AT_POS csys surfaces_array pos surface_out
GET_SURFACES_AT_POS csys surfaces_array pos surfaces_array_out
GET_SURFACE_TYPE surface type_out    ! Returns "PLANE", "TORUS", "CYLINDER", etc.
GET_SURFACE_NORM csys surface pos_out vec_out
GET_SURFACE_CONTOUR surface EXTERNAL|INTERNAL contour_struct_out
GET_SURFACE_CONTOURS surface EXTERNAL|INTERNAL contours_array_out
```

### Edge Operations
```
GET_EDGE_TYPE edge type_out    ! Returns "LINE", "ARC", etc.
GET_EDGE_SURFACES edge surf1_out surf2_out
GET_EDGE_AT_POS csys edges_array pos edge_out
GET_EDGES_AT_POS csys edges_array pos edges_array_out
```

## Vector and Point Operations

### Vector Operations
```
GET_CSYS_VECTOR csys csys_ref axis_name vec_out    ! axis_name: "X", "Y", "Z"
VECTOR_FROM_POINTS point1 point2 vec_out
VECTOR_NORMALIZE vec
```

### Position and Measurement
```
GET_REF_POS csys reference pos_struct_out    ! csys can be NULL
MEASURE_DISTANCE [options] ref1 ref2 distance_out
MEASURE_LENGTH curve length_out
MEASURE_AREA surface area_out
MEASURE_ANGLE ref1 ref2 angle_out
CALC_CURVE_EXTREMES csys curve point dir pnt_min_out pnt_max_out
CALC_OUTLINE [options] csys reference outline_struct_out
GET_MASS_PROPERTIES component csys props_struct_out
```

Options for MEASURE_DISTANCE:
```
MEASURE_DISTANCE ENABLE_CHECKBOX1 FALSE ENABLE_CHECKBOX2 FALSE ref1 ref2 dist_out
```

## Group Operations

### Creating and Managing Groups
```
GROUP_FEATURES features_array group_out
UNGROUP_FEATURES group
GET_GROUP_HEAD [TOPLEVEL] feature group_head_out
GET_GROUP_FEATURE group index feature_out
GET_GROUP_FEATURE_NUM group count_out
```

## Array Operations

```
ADD_ARRAY_ELEM array element
INSERT_ARRAY_ELEM array index element
DELETE_ARRAY_ELEM array index
CLEAR_ARRAY array
GET_ARRAY_SIZE array size_out
GET_ARRAY_ELEM array index elem_out
FIND_ARRAY_ELEM array element index_out    ! Returns -1 if not found
ARRAY_EMPTY array   ! Returns boolean for IF condition
```

## Map Operations

```
ADD_MAP_ELEM map key value
DELETE_MAP_ELEM map key
GET_MAP_ELEM map key value_out
GET_MAP_SIZE map size_out
CLEAR_MAP map
```

Iteration:
```
FOR ELEM REF MAP my_map
    key = ELEM.key
    value = ELEM.value
END_FOR
```

## Model Operations

### Model Info and Parameters
```
GET_MDL_NAME model name_out
GET_MDL_TYPE model type_out    ! PART, ASSEMBLY
GET_MDL_SUBTYPE model subtype_out    ! PART_SHEETMETAL, etc.
SET_MDL_PARAM model "param" value [NO_REGEN]
SEARCH_MDL_PARAM model "param" [NO_UPDATE] value_out
CREATE_MDL_PARAM model "param" type default_value
```

### Model State
```
REGEN_MDL model [FORCE]
SAVE_MDL model
RETRIEVE_MDL "name" model_out
COPY_REF source destination
COPY_MDL source_mdl "new_name" new_mdl_out
SWITCH_TO_MDL model
ERASE_NOT_DISPLAYED
```

### Reference Operations
```
GET_REF_NAME reference name_out
SET_REF_NAME reference "new_name"    ! Use +* for auto-increment
GET_REF_ID reference id_out
GET_REF_PARENT reference parent_out
GET_REF_GENERIC reference generic_out
REF_VALID reference    ! Returns boolean for IF condition
REF_EQUAL ref1 ref2    ! Returns boolean
REF_INSTANCE reference ! Returns boolean - checks if instance
INVALIDATE_REF reference
INVALIDATE_PARAM variable
PARAM_VALID variable   ! Returns boolean
```

## Display Operations

```
HIDE reference
UNHIDE reference
HIGHLIGHT_REF reference
REPAINT
DISPLAY_DATUM PLANES|AXES|POINTS|CSYS TRUE|FALSE
DISPLAY_ANNOTATIONS TRUE|FALSE
SET_COLOR reference R G B
```

## User Interface Commands

### Input Commands
```
USER_INPUT_PARAM type name [REQUIRED] [MIN_VALUE n] [WIDTH n] [TOOLTIP "text"] [ON_PICTURE X Y]
USER_SELECT type name [FILTER_REF filter_array] [FILTER_GEOM filter_array] [ON_PICTURE X Y]
USER_SELECT_OPTIONAL type name [ON_PICTURE X Y]
USER_SELECT_MULTIPLE type count array_out [FILTER_FEAT filter_array] [FILTER_GEOM filter_array]
USER_SELECT_MULTIPLE_OPTIONAL type count array_out
USER_SELECT_MULTIPLE_OPTIONAL FEATURE_PARAM "param" count array_out
```

### Display Commands
```
SHOW_PARAM type name [ON_PICTURE X Y]
CHECKBOX_PARAM type name ["label"] [TOOLTIP "text"] [ON_PICTURE X Y]
RADIOBUTTON_PARAM type name "opt1" "opt2" ... [ON_PICTURE X Y]
```

### Dialog
```
CONFIG_ELEM [width height] [CONTINUE_ON_CANCEL]
CLEAR_GUI_CANCELLED
GUI_CANCELLED    ! Boolean check if user cancelled
MESSAGE_BOX [IMAGE path] "message"
MESSAGE_BOX_EX SCREEN_LOCATION position type "title" "message" buttons_array choice_out
```

## Processing Box (Progress)

```
PROCESSING_BOX_START "Message"
PROCESSING_BOX_SET_STATE percentage
PROCESSING_BOX_END
```

## Error Handling

```
BEGIN_CATCH_ERROR [FIX_FAIL_UDF]
    ! Code that might fail
END_CATCH_ERROR

IF ERROR
    CLEAR_CATCH_ERROR
    ! Handle error
END_IF

IF NOT ERROR
    ! Success path
END_IF

CLEAR_CATCH_ERROR
```

## Flow Control

### EXIT / STOP
```
EXIT       ! Exit script entirely
STOP       ! Pause execution (for debugging)
BREAK      ! Exit current loop
CONTINUE   ! Next loop iteration
```

### INCLUDE
```
INCLUDE path:filename.tab
INCLUDE lib:..\\Other_Module.tab
```
Paths: `lib:`, `working_dir:`, `wtpub:`, `wtws:`

## Output

```
PRINT "message" [var1] [var2]    ! % as placeholder
PRINT "Position: % ; %" pos.x pos.y
CLEAR_MESSAGE_AREA
```

## File Operations

```
CHOOSE_FILE "filter" path_out
COPY_FILE "source" "dest"
DELETE_FILE "path"
FILE_EXISTS "path"    ! Returns boolean
CREATE_DIRECTORY "path"
FILE_OPEN "path" "r"|"w" file_handle
FILE_READ_LINE file_handle line_out
FILE_WRITE_LINE file_handle "text"
FILE_CLOSE file_handle
FILE_END file_handle    ! Returns boolean
WAIT_FOR_FILE "path" TIMEOUT seconds
GET_WORKING_DIRECTORY path_out
SET_WORKING_DIRECTORY "path"
PURGE "path"
```

## XML Feature Operations

```
READ_FEATURE_XML feature "output_file.xml"
MODIFY_FEATURE_XML feature "input_file.xml"
```

## Sketch Operations

```
SKETCH_USE_EDGE model sketch_id curves_array
GET_REF_ID sketch sketch_id_out
```

## Stopwatch (Performance)

```
DECLARE_STOPWATCH watch
START_STOPWATCH watch
STOP_STOPWATCH watch
GET_STOPWATCH_TIME watch time_out
```

## Drawing Commands

### View Operations
```
CREATE_DRW_VIEW_GENERAL drawing model view_name scale x y angle view_out
GET_DRW_VIEW_NAME view name_out
GET_DRW_VIEW_ORIENTATION view orientation_out
SET_DRW_VIEW_TANGENT_EDGE_DISPLAY view NONE|DIMMED|SOLID
SET_DRW_VIEW_DISPLAY view NO_HIDDEN|HIDDEN_LINE|WIREFRAME
GET_DRW_VIEW_REF_POS view reference pos_out
GET_DRW_SCALE drawing view_num view scale_out
```

### Sheet Operations
```
GET_DRW_SHEET_NUM drawing num_sheets_out
SET_DRW_CUR_SHEET drawing sheet_num
```

### Note Operations
```
CREATE_DRW_NOTE drawing x y "text" HEIGHT h HORIZONTAL|VERTICAL LEFT|CENTER|RIGHT note_out
CREATE_DRW_VIEW_NOTE view x y "text" HEIGHT h ANGLE angle WITH_LEADER attach_ref note_out
GET_DRW_NOTE_TEXT note text_out
DELETE_NOTE note
READ_DRW_NOTE_EX note options_struct_out
MODIFY_DRW_NOTE_EX note options_struct
```

### Model Operations
```
GET_DRW_MDL drawing model_out
DELETE_DRW_MDL drawing model
USE_LIBRARY_MDL lib:template_name DRAWING drawing_ref
```

### Export
```
EXPORT_FILE drawing type "filename"
EXPORT_DRW_PDF drawing options_struct "filename"
```

## Excel Integration

```
EXCEL_CONNECTED    ! Boolean
EXCEL_START [INVISIBLE]
EXCEL_DISCONNECT
EXCEL_TO_FOREGROUND

EXCEL_LOAD_DOCUMENT "path"
EXCEL_SAVE_DOCUMENT "path"
EXCEL_CLOSE_DOCUMENT
EXCEL_ACTIVATE_DOCUMENT "document_name"
EXCEL_ACTIVATE_SHEET SHEET_BY_NAME "sheet_name"

EXCEL_GET_VALUE row col value_out
EXCEL_SET_VALUE row col value
EXCEL_RUN_MACRO "macro_name" args_array
```

## Configuration Options

```
SET_CONFIG_OPTION "option_name" "value"
GET_ENVIRONMENT_VARIABLE "VAR_NAME" value_out
```

## String Functions

```
itos(integer)         ! Integer to string
dtos(double)          ! Double to string
ftos(double,decimals) ! Float to string with precision
stoi(string)          ! String to integer
stod(string)          ! String to double
stof(string)          ! String to float
strlen(string)        ! String length
substr(str,start,len) ! Substring
strmid(str,start,len) ! Substring (alternate)
strleft(str,len)      ! Left substring
strright(str,len)     ! Right substring
toupper(string)       ! Uppercase
tolower(string)       ! Lowercase
strfind(str,substr)   ! Find substring, returns -1 if not found
strreplace(str,old,new,all) ! Replace substring
SPLIT_STRING str array SPLIT_CHAR "delimiter"
```

## Math Functions

```
round(value, decimals)
abs(value)
sqrt(value)
sin(angle), cos(angle), tan(angle)
pow(base, exp)
```

## Miscellaneous Commands

```
GET_TAB_NAME tab_name_out
GET_TAB_LINE_NUM line_num_out
RESOLVE_PATH "lib:path" full_path_out
WINDOW_ACTIVATE
WINDOW_CLOSE
GET_NAMED_ORIENTATIONS model "pattern*" array_out
SET_LAYER_STATUS model "layer_name" BLANK|DISPLAY
SAVE_LAYER_STATUS model
REMOVE_RELATIONS model
SET_RELATIONS_UNIT_SENSITIVE model TRUE|FALSE
ENABLE_DATA_CAPTURE_MODE TRUE|FALSE
ENABLE_CONT_REF_CHECKING_MODE TRUE|FALSE
CREATE_REF_PATTERN feature
GET_PATTERN feature pattern_out
CALC_FRACTION REDUCE TRUE|FALSE value denominator fraction_struct_out
```
