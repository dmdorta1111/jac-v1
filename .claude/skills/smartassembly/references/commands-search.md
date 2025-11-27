# Search and Reference Operations Reference

## Model Reference Search

### SEARCH_MDL_REF
Find single reference in model:
```
SEARCH_MDL_REF model type "pattern" output_ref
SEARCH_MDL_REF RECURSIVE model type "pattern" output_ref
```

### SEARCH_MDL_REFS
Find multiple references:
```
SEARCH_MDL_REFS model type "pattern" output_array
SEARCH_MDL_REFS RECURSIVE model type "pattern" output_array
```

### Reference Types

| Type | Description |
|------|-------------|
| `COMPONENT` | Assembled component |
| `ASSEMBLY` | Assembly model |
| `PART` | Part model |
| `FEATURE` | Any feature |
| `PLANE` | Datum plane |
| `CSYS` | Coordinate system |
| `AXIS` | Datum axis |
| `POINT` | Datum point |
| `CURVE` | Datum curve |
| `SURFACE` | Surface |
| `EDGE` | Edge reference |
| `QUILT` | Quilt (surface collection) |
| `COMPOSITE_CURVE` | Composite curve |
| `FEATURE_PARAM "param_name"` | Features with specific parameter |
| `FEATURE_TYPE "type_name"` | Features of specific type |

### Pattern Wildcards
- `*` - Match any characters
- Use `"*"` to match all
- Patterns are case-sensitive

### Examples
```
! Find specific coordinate system
SEARCH_MDL_REF THIS CSYS "ACS0" csys_ref

! Find all components recursively
SEARCH_MDL_REFS RECURSIVE ASSEM COMPONENT "*" all_comps

! Find skeleton models
SEARCH_MDL_REFS RECURSIVE ASSEM COMPONENT "*SKEL*" skels

! Find features with SUB_COMP parameter
SEARCH_MDL_REFS SKEL FEATURE_PARAM "SUB_COMP" features

! Find specific feature type
SEARCH_MDL_REFS THIS FEATURE_TYPE "GROUP_HEAD" groups

! Find all planes matching pattern
SEARCH_MDL_REFS THIS PLANE "BASE_*" base_planes
```

## Parameter Search

### Model Parameters
```
SEARCH_MDL_PARAM model "param_name" output_var
SEARCH_MDL_PARAM_NAMES model "pattern" output_array
```

### Feature Parameters
```
SEARCH_FEAT_PARAM feature "param_name" output_var
SEARCH_FEAT_PARAM feature "param_name" NO_UPDATE output_var
SEARCH_FEAT_PARAM_NAMES feature "pattern" output_array
```

### Reference Parameters
```
SEARCH_REF_PARAM reference "param_name" output_var
```

### Examples
```
! Get ITEM_NUM from assembly
SEARCH_MDL_PARAM ASSEM "ITEM_NUM" ITEM_NUM

! Get section type from front curve feature
SEARCH_REF_PARAM FRONT_CURVE "SECTION_TYPE" SECTION_TYPE

! Get all parameter names from feature
SEARCH_FEAT_PARAM_NAMES FEAT "*" param_names_array

! Check for specific parameter (NO_UPDATE prevents regen)
SEARCH_FEAT_PARAM TARGET_GROUP "TARGET_ASM" NO_UPDATE TARGET_NAME
```

## Get Operations

### Reference Information
```
GET_REF_NAME reference name_var
GET_REF_ID reference id_var
GET_REF_PARENT reference parent_ref
GET_REF_POS csys reference pos_struct   ! Returns .x, .y, .z
```

### Feature Information
```
GET_FEATURE_NAME feature name_var
GET_FEATURE_TYPE feature type_var
GET_FEATURE_NUMBER feature number_var
GET_FEATURE_DIMS feature dims_array
```

### Model Information
```
GET_MDL_NAME model name_var
GET_MDL_TYPE model type_var    ! "PART" or "ASSEMBLY"
```

### Group Operations
```
GET_GROUP_HEAD feature group_head_ref
GET_GROUP_HEAD ALLOW_SELF FALSE feature group_head_ref
GET_GROUP_FEATURE group_head index feature_ref
GET_GROUP_FEATURE_NUM group_head count_var
```

### Array Operations
```
GET_ARRAY_SIZE array size_var
GET_ARRAY_ELEM array index output_ref
FIND_ARRAY_ELEM array "search_value" index_var  ! Returns -1 if not found
```

### Geometry Extraction
```
GET_GEOM_FROM_FEATURE feature PLANE output_plane
GET_GEOM_FROM_FEATURE feature CSYS output_csys
GET_GEOM_FROM_FEATURE feature CURVE output_curve
GET_GEOMS_FROM_FEATURE feature CURVE output_array
GET_GEOMS_FROM_FEATURE feature POINT output_array
GET_GEOMS_FROM_FEATURE feature CSYS output_array
```

### Curve Operations
```
GET_COMPCURVE_CURVES composite_curve output_array
GET_REF_VERTEX curve START output_vertex
GET_REF_VERTEX curve END output_vertex
GET_CURVE_AT_POS csys curve_array pos output_curve
GET_CURVES_AT_POS csys curve_array pos output_array
GET_CURVE_COMPCURVE curve composite_curve_ref
```

## Set Operations

### Reference Names
```
SET_REF_NAME reference "new_name"
SET_REF_NAME reference "prefix_"+*     ! +* adds unique suffix
SET_REF_NAME reference name_var+*
```

### Model Names and Parameters
```
SET_MDL_NAME model "new_name"
SET_MDL_NAME model name_var+"_"+*
SET_MDL_PARAM model "PARAM_NAME" value
SET_MDL_PARAM model "PARAM_NAME" value NO_REGEN
```

### Feature Parameters
```
SET_FEAT_PARAM feature "PARAM_NAME" value
SET_REF_PARAM reference "PARAM_NAME" value
```

### Dimensions
```
SET_DIM_VALUE dimension_ref value
```

## Array Operations

```
DECLARE_ARRAY my_array
CLEAR_ARRAY my_array
ADD_ARRAY_ELEM my_array element
GET_ARRAY_SIZE my_array size_var
GET_ARRAY_ELEM my_array index output_ref
FIND_ARRAY_ELEM my_array "value" index_var
DELETE_ARRAY_ELEM my_array index
ARRAY_EMPTY my_array                    ! Boolean check
```

## Map Operations

```
DECLARE_MAP STRING my_map              ! or INTEGER, DOUBLE
CLEAR_MAP my_map
ADD_MAP_ELEM my_map "key" value
GET_MAP_ELEM map "key" output_var
GET_MAP_SIZE map size_var
DELETE_MAP_ELEM map "key"

! Iterate map (sorted order)
FOR ELEM REF MAP my_map
    ! ELEM.key = key
    ! ELEM.value = value
END_FOR
```

## Reference Validation and Invalidation

```
REF_VALID reference              ! Boolean check
PARAM_VALID param_var            ! Boolean check
INVALIDATE_REF reference         ! Clear reference
INVALIDATE_PARAM param_var       ! Clear parameter
COPY_REF source_ref dest_ref     ! Copy reference
```

## Common Search Patterns

### Safe Reference Search with Fallback
```
CLEAR_CATCH_ERROR
BEGIN_CATCH_ERROR
    SEARCH_MDL_REF model CSYS "ACS0" csys_ref
    IF ERROR
        SEARCH_MDL_REF model CSYS "ATTACH" csys_ref
        IF ERROR
            SEARCH_MDL_REF model CSYS "*" csys_ref
            CLEAR_CATCH_ERROR
        END_IF
    END_IF
END_CATCH_ERROR
```

### Iterate Features in Group
```
GET_GROUP_FEATURE_NUM group_head num
i = 1
WHILE i <= num
    GET_GROUP_FEATURE group_head i feat
    GET_REF_NAME feat name
    
    IF name == "TARGET_PATTERN*"
        GET_GEOM_FROM_FEATURE feat PLANE geom
        ! process geometry
        BREAK
    END_IF
    i++
END_WHILE
```

### Find Features by Position
```
! Get position from reference
GET_REF_POS NULL csys_ref pos

! Find curve at that position
GET_CURVE_AT_POS NULL curve_array pos matched_curve

! Or find all curves at position
GET_CURVES_AT_POS NULL curve_array pos matched_curves
```

### Collect References with Parameter Filter
```
SEARCH_MDL_REFS model FEATURE_PARAM "MDL" features_with_mdl

FOR feat REF ARRAY features_with_mdl
    GET_FEATURE_TYPE feat type
    IF type == "GROUP_HEAD"
        SEARCH_FEAT_PARAM feat "MDL" mdl_value
        ! process based on MDL value
    END_IF
END_FOR
```
