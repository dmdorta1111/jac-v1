# Assembly and Constraint Commands Reference

## ASSEMBLE Command

Full syntax:
```
ASSEMBLE model [target] [MECHANISM mechanismType] [FREEZE_FAILED freeze] [MEASURECOPY measurecopy]
    [relation line] UDF_ref<:in> param1<:out> param2<:out> ...
    CONSTRAINT1
    CONSTRAINT2
    ...
    CONSTRAINT_SET1
    CONSTRAINT_SET2
    ...
END_ASSEMBLE
```

### Arguments
- **model** - Model to assemble (string or reference)
- **target** - Target assembly (defaults to THIS)
- **MECHANISM** - Optional mechanism type declaration
- **FREEZE_FAILED** - Boolean, freeze component if constraints fail
- **MEASURECOPY** - Boolean for relation line usage

### Examples

Basic assembly with CSYS:
```
ASSEMBLE part_name ASSEMBLY_TARGET
    CSYS ATTACH_CSYS COMP_CSYS
END_ASSEMBLE
```

Assembly with multiple constraints:
```
ASSEMBLE "bracket.prt" THIS
    MATE DTM_TOP COMP_TOP
    ALIGN DTM_FRONT COMP_FRONT
    ALIGN DTM_RIGHT COMP_RIGHT
END_ASSEMBLE
```

Assembly with component reference output:
```
ASSEMBLE model THIS
    CSYS PLACE ATTACH
END_ASSEMBLE
! COMP_FEAT now contains reference to assembled component
```

## Constraint Types

### Basic Constraints

| Constraint | Description |
|------------|-------------|
| `ALIGN ref_asm ref_comp` | Align references coincident |
| `ALIGN_FLIP ref_asm ref_comp` | Align, use MATE if fails |
| `ALIGN_OFF offset ref_asm ref_comp` | Align with offset distance |
| `ALIGN_OFF_FLIP offset ref_asm ref_comp` | Align offset, MATE_OFF if fails |
| `MATE ref_asm ref_comp` | Mate references coincident |
| `MATE_FLIP ref_asm ref_comp` | Mate, use ALIGN if fails |
| `MATE_OFF offset ref_asm ref_comp` | Mate with offset |
| `MATE_OFF_FLIP offset ref_asm ref_comp` | Mate offset, ALIGN_OFF if fails |
| `CSYS csys_asm csys_comp` | Coordinate system alignment |
| `ORIENT ref_asm ref_comp` | Orient references |
| `ORIENT_FLIP ref_asm ref_comp` | Orient, flip if fails |
| `INSERT ref_asm ref_comp` | Insert surface into another |
| `TANGENT ref_asm ref_comp` | Tangent constraint |
| `PACKAGED` | No placement constraints |

### Angle Constraints

| Constraint | Description |
|------------|-------------|
| `ALIGN_ANGLE_OFF angle ref_asm ref_comp` | Align with angle rotation |
| `MATE_ANGLE_OFF angle ref_asm ref_comp` | Mate with angle |

### Creo Parametric New Constraints

| Constraint | Description |
|------------|-------------|
| `CENTERED csys_asm csys_comp` | Center two coordinate systems |
| `LINE_NORMAL ref_asm ref_comp` | Edge/axis normal orientation |
| `LINE_COPLANAR ref_asm ref_comp` | Edge/axis coplanar |
| `LINE_PARALLEL ref_asm ref_comp` | Edge/axis parallel |
| `LINE_OFF offset ref_asm ref_comp` | Edge/axis aligned with offset |
| `LINE_ANGLE_OFF offset ref_asm ref_comp` | Coplanar with angle |
| `PNT_OFF ref_asm ref_comp` | Align points with offset |
| `PNT_ON_LINE_OFF offset ref_asm ref_comp` | Point on line with offset |
| `PNT_ON_SRF_OFF offset ref_asm ref_comp` | Point on surface with offset |
| `INSERT_NORMAL ref_asm ref_comp` | Insert surface normal |
| `INSERT_PARALLEL ref_asm ref_comp` | Insert surface parallel |
| `EDGE_ON_SRF_OFF offset ref_asm ref_comp` | Edge on surface with offset |
| `EDGE_ON_SRF_ANGLE_OFF offset ref_asm ref_comp` | Edge on surface with angle |
| `EDGE_ON_SRF_NORMAL ref_asm ref_comp` | Edge normal to surface |
| `EDGE_ON_SRF_PARALLEL ref_asm ref_comp` | Edge parallel to surface |
| `SRF_NORMAL ref_asm ref_comp` | Surface normal to another |

### Constraint Options

| Option | Description |
|--------|-------------|
| `ACTIVE active` | Set constraint active/inactive (BOOL) |
| `JAS_CONSTRAINT` | Define as mechanism constraint |

### Notes
- Only one FLIP constraint is used (last specified takes precedence)
- If no constraints specified, user is prompted interactively
- Use `PACKAGED` to avoid user prompt when no constraints needed

## Component Operations

### Feature State Control
```
SET_FEATURE_STATE feat_ref SUPPRESSED
SET_FEATURE_STATE feat_ref RESUMED
SET_FEATURE_STATE INDIV_GP_MEMBERS feat SUPPRESSED  ! Within group
```

### Grouping Features
```
GROUP_FEATURES array_of_features output_group
UNGROUP_FEATURES group_ref
GET_GROUP_HEAD feat group_head_ref
GET_GROUP_HEAD ALLOW_SELF FALSE feat group_head_ref
GET_GROUP_FEATURE group_head index feat_ref
GET_GROUP_FEATURE_NUM group_head count_var
```

### Reordering
```
REORDER_FEATURES feat_to_move AFTER target_feat
REORDER_FEATURES feat_to_move BEFORE target_feat
```

## Model Retrieval

### USE_LIBRARY_MDL
Retrieve template from library:
```
USE_LIBRARY_MDL "path\\template_name" type output_ref
```
Types: `prt`, `asm`, `drw`

### RETRIEVE_MDL
Retrieve existing model:
```
RETRIEVE_MDL "model_name.prt" output_ref
RETRIEVE_MDL model_name_string output_ref
```

### COPY_MDL
```
COPY_MDL source_ref "new_name" output_ref
```

## Model Operations

### Regeneration
```
REGEN_MDL model_ref
REGEN_MDL model_ref FORCE      ! Force full regeneration
```

### Save Operations
```
SAVE_MDL model_ref
SAVE_LAYER_STATUS model_ref
```

### Erase Operations
```
ERASE_NOT_DISPLAYED            ! Erase models not in window
```

## Interference Checking

### FOR Loop with Interference
```
FOR ref REF INTERF_MDL model [SOLID_ONLY]
    ! Process interfering models
END_FOR

FOR ref REF INTERF_BODY body_ref [SOLID_ONLY]
    ! Process models interfering with body
END_FOR

FOR ref REF INTERF_SURF surface_ref
    ! Process models interfering with surface
END_FOR

FOR ref REF INTERF_QUILT quilt_ref
    ! Process models interfering with quilt
END_FOR
```

### Related Parameters
- `BUW_INTERF_CHECK` - Exclude components from collision detection
- `BUW_INTERF_LEVEL` - Interference level control
