# UDF Creation and Manipulation Reference

## CREATE_UDF Command

Full syntax:
```
CREATE_UDF &udfname MODEL [options] [reference_udf<:out>]
    UDF_CONSTRAINT1
    UDF_CONSTRAINT2
    ...
END_CREATE_UDF
```

### Arguments

| Argument | Description |
|----------|-------------|
| `&udfname` | UDF filename without extension; use `&` for string variable interpolation |
| `MODEL` | Target model (typically `THIS` for current model) |
| `reference_udf` | Optional output reference to access UDF parameters |

### Options

| Option | Description |
|--------|-------------|
| `GROUP` | Keep UDF features as a group |
| `REMOVE_UDF_RELATIONS` | Don't create automatic UDF relations |
| `ADD_EXP_TO_MAP mapExport` | Add exported items to map (STRING type) |
| `ALLOW_RECREATE` | Recreate UDF on modification if refs/target change |
| `NO_AUTO_LAYERS` | Don't process BUW_LAYER_INFO parameters |
| `CONSIDER_NEG_DIM_SIGN` | Keep direction for negative dimension values |
| `DIM_DISPLAY_OPTION option` | NORMAL, READONLY, or BLANK for non-UDF dims |
| `UNIQUE_IDENT "ident"` | Add identifier for modification tracking |

## UDF Constraints

### UDF_REF
Map internal UDF reference to external reference:
```
UDF_REF internal_name external_ref
```

Examples:
```
UDF_REF PLANE1 my_datum_plane
UDF_REF CSYS1 attachment_csys
UDF_REF CURVE1 selected_curve
UDF_REF ATTACH PLACEMENT_CSYS
```

### UDF_DIM
Set UDF dimension value:
```
UDF_DIM internal_dim_name value
```

Examples:
```
UDF_DIM LENGTH 24.5
UDF_DIM WIDTH width_param
UDF_DIM THICKNESS SHELF_THICKNESS
```

### UDF_EXP_PARAM
Export parameter from UDF:
```
UDF_EXP_PARAM param_name
```

### UDF_EXP_REF
Export reference from UDF for post-processing:
```
UDF_EXP_REF output_var FEATURE index
UDF_EXP_REF output_var PLANE index
UDF_EXP_REF output_var CSYS index
UDF_EXP_REF output_var CURVE index
UDF_EXP_REF output_var POINT index
UDF_EXP_REF output_var SURFACE index
```

Index values:
- `0` = Entire UDF group feature
- `1, 2, 3...` = Individual features within UDF (order depends on UDF definition)

## Complete UDF Example

```
CREATE_UDF lib:udfs\\undershelf THIS REMOVE_UDF_RELATIONS GROUP
    UDF_REF SHELF_PLANE BOTTOM_SHELF_
    UDF_REF CTR CTR_
    UDF_REF SHELF_SETBACK BOTTOM_SHELF_SETBACK_
    UDF_REF RIGHT_SHELF RIGHT_SHELF_
    UDF_REF SHELF_REAR SHELF_REAR_
    UDF_REF LEFT_SHELF LEFT_SHELF_
    UDF_REF SHELF_FACE BOTTOM_SHELF_FACE_
    UDF_REF LEFT_IS_WALL LEFT_IS_WALL_
    UDF_REF RIGHT_IS_WALL RIGHT_IS_WALL_
    UDF_EXP_REF FILL FEATURE 1
    UDF_EXP_REF PUB FEATURE 4
    UDF_EXP_REF EXTEND_L FEATURE 8
    UDF_EXP_REF EXTEND_R FEATURE 10
    UDF_EXP_REF SPLASH FEATURE 14
    UDF_EXP_REF STIFF FEATURE 26
    UDF_EXP_REF MEASURE_CRV FEATURE 27
    UDF_EXP_REF PATTERN FEATURE 28
    UDF_EXP_REF UDF FEATURE 0
END_CREATE_UDF
```

## Post-UDF Processing Patterns

### Ungroup and Rename
```
CREATE_UDF lib:udfs\\my_udf THIS REMOVE_UDF_RELATIONS GROUP
    UDF_REF REF1 external_ref
    UDF_EXP_REF UDF FEATURE 0
END_CREATE_UDF
UNGROUP_FEATURES GROUP
SET_REF_NAME UDF "DESCRIPTIVE_NAME"+*
ADD_ARRAY_ELEM FEATURES_TO_GROUP UDF
```

### Modify Exported Features
```
CREATE_UDF &UDF_DIR+mullion_11 THIS REMOVE_UDF_RELATIONS GROUP
    UDF_REF REFPLANE REFPLANE
    ! ... other refs
    UDF_EXP_REF UDF FEATURE 0
    UDF_EXP_REF RH_SHELF_PREP1 FEATURE 13
    UDF_EXP_REF LH_SHELF_PREP1 FEATURE 33
END_CREATE_UDF

! Suppress/resume features based on conditions
IF SHELF_MIDDLE_R == 1 AND MIDDLE_SHELF_CONSTRUCTION_R == 0
    SET_FEATURE_STATE INDIV_GP_MEMBERS RH_SHELF_PREP1 SUPPRESSED
ELSE
    SET_FEATURE_STATE INDIV_GP_MEMBERS RH_SHELF_PREP1 RESUMED
END_IF
```

### Set Parameters on Exported Features
```
CREATE_UDF &UDF_DIR+&UDF_1B THIS GROUP
    UDF_REF CURVE3 CURVE3
    UDF_REF CURVE2 CURVE2
    UDF_REF CURVE0 CURVE0
    UDF_EXP_REF UDFREF FEATURE 0
END_CREATE_UDF

IF UDF_1B == "ref_pan_slides*"
    SET_FEAT_PARAM UDFREF "PAN_SLIDE_CTRS" PAN_SLIDE_CTRS
END_IF
```

### Modify Dimensions After Creation
```
CREATE_UDF lib:udfs\\adjustable_shelf THIS REMOVE_UDF_RELATIONS GROUP
    UDF_REF SHELF_PLANE SKEL_PLANE
    UDF_DIM SHELF_LOC SHELF_LOC1
    UDF_EXP_REF FILL FEATURE 1
    UDF_EXP_REF UDF FEATURE 0
END_CREATE_UDF

! Get and modify dimensions
CLEAR_ARRAY DIMS
GET_FEATURE_DIMS FILL DIMS
GET_ARRAY_ELEM DIMS 0 Dim
SET_DIM_VALUE Dim SETBACK
```

### Remove Features Conditionally
```
IF UNDERSHELF_REAR_OFFSET < 0.75
    REMOVE_FEATURE INDIV_GP_MEMBERS SPLASH
END_IF

IF CRV_LENGTH <= SPACE
    REMOVE_FEATURE INDIV_GP_MEMBERS STIFF
END_IF
```

## Dynamic UDF Path Construction

Use string variables with `&` prefix:
```
MULLION_UDF = "lib:udfs\\mullion_"+itos(SECTION_TYPE_L)+itos(SECTION_TYPE_R)
CREATE_UDF &MULLION_UDF THIS REMOVE_UDF_RELATIONS GROUP
    ! constraints
END_CREATE_UDF
```

## Layer Control

UDFs can include layer information via BUW_LAYER_INFO parameter:
```
! In UDF definition, feature has BUW_LAYER_INFO string parameter
! SmartAssembly will automatically place feature on specified layer
! Use NO_AUTO_LAYERS option to disable this behavior
```

Use SET_ON_LAYER for exported references:
```
SET_ON_LAYER exported_ref "LAYER_NAME"
```

## UDF Modification with UNIQUE_IDENT

Track UDFs for later modification:
```
CREATE_UDF lib:udfs\\bracket THIS UNIQUE_IDENT "BRACKET_001"
    ! constraints
END_CREATE_UDF

! Later, can identify and modify this specific UDF instance
```

## Measurement UDFs

Pattern for creating measurement features:
```
CREATE_UDF lib:udfs\\measure_distance_feature THIS UDF
    UDF_REF TEST_CURVE REF_CURVE
    UDF_REF BACK_CURVE SKETCH_CURVE
    UDF_EXP_REF DISTANCE_FEATURE FEATURE 0
END_CREATE_UDF

SEARCH_FEAT_PARAM DISTANCE_FEATURE "DISTANCE" DIST
REMOVE_FEATURE UDF  ! Clean up measurement feature after use
```
