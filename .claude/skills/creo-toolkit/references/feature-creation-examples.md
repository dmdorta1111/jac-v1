# Feature Creation Examples Reference

This reference provides comprehensive examples of feature creation using Pro/TOOLKIT element trees, derived from PTC's official example code.

## Standard Feature Creation Pattern

All feature creation follows this consistent pattern:

```c
ProError CreateFeatureExample()
{
    ProElement feat_elemtree;
    ProElement elem_feattype;
    ProMdl model;
    ProModelitem model_item;
    ProSelection model_selection;
    ProFeature created_feature;
    ProErrorlist errors;
    ProFeatureCreateOptions *options = NULL;
    ProError status;

    /* 1. Allocate root element */
    status = ProElementAlloc(PRO_E_FEATURE_TREE, &feat_elemtree);

    /* 2. Add feature type */
    status = ProElementAlloc(PRO_E_FEATURE_TYPE, &elem_feattype);
    status = ProElementIntegerSet(elem_feattype, PRO_FEAT_xxx);
    status = ProElemtreeElementAdd(feat_elemtree, NULL, elem_feattype);

    /* 3. Add feature-specific elements... */

    /* 4. Get current model and create selection */
    status = ProMdlCurrentGet(&model);
    status = ProMdlToModelitem(model, &model_item);
    status = ProSelectionAlloc(NULL, &model_item, &model_selection);

    /* 5. Set creation options */
    status = ProArrayAlloc(1, sizeof(ProFeatureCreateOptions), 1, (ProArray*)&options);
    options[0] = PRO_FEAT_CR_DEFINE_MISS_ELEMS;

    /* 6. Create the feature */
    status = ProFeatureWithoptionsCreate(model_selection, feat_elemtree,
        options, PRO_REGEN_NO_FLAGS, &created_feature, &errors);

    /* 7. Cleanup */
    status = ProArrayFree((ProArray*)&options);
    status = ProElementFree(&feat_elemtree);
    status = ProSelectionFree(&model_selection);

    return status;
}
```

## Hole Feature Creation

Element tree structure for a straight linear hole:

```
PRO_E_FEATURE_TREE
├── PRO_E_FEATURE_TYPE = PRO_FEAT_HOLE
├── PRO_E_FEATURE_FORM = PRO_HLE_TYPE_STRAIGHT
├── PRO_E_HLE_COM
│   ├── PRO_E_HLE_TYPE_NEW = PRO_HLE_NEW_TYPE_STRAIGHT
│   ├── PRO_E_DIAMETER = <double>
│   └── PRO_E_HOLE_STD_DEPTH
│       ├── PRO_E_HOLE_DEPTH_TO
│       │   └── PRO_E_HOLE_DEPTH_TO_TYPE = PRO_HLE_STRGHT_THRU_ALL_DEPTH
│       └── PRO_E_HOLE_DEPTH_FROM
│           └── PRO_E_HOLE_DEPTH_FROM_TYPE = PRO_HLE_STRGHT_NONE_DEPTH
└── PRO_E_HLE_PLACEMENT
    ├── PRO_E_HLE_PRIM_REF = <reference to placement surface>
    ├── PRO_E_HLE_PL_TYPE = PRO_HLE_PL_TYPE_LIN
    ├── PRO_E_HLE_DIM_REF1 = <first dimension reference>
    ├── PRO_E_HLE_DIM_DIST1 = <distance from ref1>
    ├── PRO_E_HLE_DIM_REF2 = <second dimension reference>
    └── PRO_E_HLE_DIM_DIST2 = <distance from ref2>
```

### Complete Hole Example

```c
ProError ProDemoHoleCreate()
{
    ProError status;
    ProElement feat_elemtree, elem_feattype, elem_featform;
    ProElement elem_hle_com, elem_hle_type_new, elem_diameter;
    ProElement elem_hole_std_depth, elem_hole_depth_to, elem_hole_depth_to_type;
    ProElement elem_hole_depth_from, elem_hole_depth_from_type;
    ProElement elem_hle_placement, elem_hle_prim_ref, elem_hle_pl_type;
    ProElement elem_hle_dim_ref1, elem_hle_dim_dist1;
    ProElement elem_hle_dim_ref2, elem_hle_dim_dist2;
    ProSelection *p_selection;
    int n_selection;
    ProReference reference;
    ProMdl model;
    ProModelitem model_item;
    ProSelection model_selection;
    ProFeature created_feature;
    ProErrorlist errors;
    ProFeatureCreateOptions *options = NULL;

    /* Root element */
    status = ProElementAlloc(PRO_E_FEATURE_TREE, &feat_elemtree);

    /* Feature type = HOLE */
    status = ProElementAlloc(PRO_E_FEATURE_TYPE, &elem_feattype);
    status = ProElementIntegerSet(elem_feattype, PRO_FEAT_HOLE);
    status = ProElemtreeElementAdd(feat_elemtree, NULL, elem_feattype);

    /* Feature form = STRAIGHT */
    status = ProElementAlloc(PRO_E_FEATURE_FORM, &elem_featform);
    status = ProElementIntegerSet(elem_featform, PRO_HLE_TYPE_STRAIGHT);
    status = ProElemtreeElementAdd(feat_elemtree, NULL, elem_featform);

    /* Common hole information container */
    status = ProElementAlloc(PRO_E_HLE_COM, &elem_hle_com);
    status = ProElemtreeElementAdd(feat_elemtree, NULL, elem_hle_com);

    /* Hole type */
    status = ProElementAlloc(PRO_E_HLE_TYPE_NEW, &elem_hle_type_new);
    status = ProElementIntegerSet(elem_hle_type_new, PRO_HLE_NEW_TYPE_STRAIGHT);
    status = ProElemtreeElementAdd(elem_hle_com, NULL, elem_hle_type_new);

    /* Diameter */
    status = ProElementAlloc(PRO_E_DIAMETER, &elem_diameter);
    status = ProElementDoubleSet(elem_diameter, 10.0);
    status = ProElemtreeElementAdd(elem_hle_com, NULL, elem_diameter);

    /* Standard depth container */
    status = ProElementAlloc(PRO_E_HOLE_STD_DEPTH, &elem_hole_std_depth);
    status = ProElemtreeElementAdd(elem_hle_com, NULL, elem_hole_std_depth);

    /* Depth TO */
    status = ProElementAlloc(PRO_E_HOLE_DEPTH_TO, &elem_hole_depth_to);
    status = ProElemtreeElementAdd(elem_hole_std_depth, NULL, elem_hole_depth_to);

    status = ProElementAlloc(PRO_E_HOLE_DEPTH_TO_TYPE, &elem_hole_depth_to_type);
    status = ProElementIntegerSet(elem_hole_depth_to_type, PRO_HLE_STRGHT_THRU_ALL_DEPTH);
    status = ProElemtreeElementAdd(elem_hole_depth_to, NULL, elem_hole_depth_to_type);

    /* Depth FROM */
    status = ProElementAlloc(PRO_E_HOLE_DEPTH_FROM, &elem_hole_depth_from);
    status = ProElemtreeElementAdd(elem_hole_std_depth, NULL, elem_hole_depth_from);

    status = ProElementAlloc(PRO_E_HOLE_DEPTH_FROM_TYPE, &elem_hole_depth_from_type);
    status = ProElementIntegerSet(elem_hole_depth_from_type, PRO_HLE_STRGHT_NONE_DEPTH);
    status = ProElemtreeElementAdd(elem_hole_depth_from, NULL, elem_hole_depth_from_type);

    /* Placement container */
    status = ProElementAlloc(PRO_E_HLE_PLACEMENT, &elem_hle_placement);
    status = ProElemtreeElementAdd(feat_elemtree, NULL, elem_hle_placement);

    /* Primary reference (placement surface) */
    status = ProElementAlloc(PRO_E_HLE_PRIM_REF, &elem_hle_prim_ref);
    status = ProSelect("datum,surface", 1, NULL, NULL, NULL, NULL,
                       &p_selection, &n_selection);
    if (n_selection <= 0) return PRO_TK_USER_ABORT;
    status = ProSelectionToReference(p_selection[0], &reference);
    status = ProElementReferenceSet(elem_hle_prim_ref, reference);
    status = ProElemtreeElementAdd(elem_hle_placement, NULL, elem_hle_prim_ref);

    /* Placement type = LINEAR */
    status = ProElementAlloc(PRO_E_HLE_PL_TYPE, &elem_hle_pl_type);
    status = ProElementIntegerSet(elem_hle_pl_type, PRO_HLE_PL_TYPE_LIN);
    status = ProElemtreeElementAdd(elem_hle_placement, NULL, elem_hle_pl_type);

    /* First dimension reference */
    status = ProElementAlloc(PRO_E_HLE_DIM_REF1, &elem_hle_dim_ref1);
    status = ProSelect("datum,surface,edge", 1, NULL, NULL, NULL, NULL,
                       &p_selection, &n_selection);
    if (n_selection <= 0) return PRO_TK_USER_ABORT;
    status = ProSelectionToReference(p_selection[0], &reference);
    status = ProElementReferenceSet(elem_hle_dim_ref1, reference);
    status = ProElemtreeElementAdd(elem_hle_placement, NULL, elem_hle_dim_ref1);

    /* First dimension distance */
    status = ProElementAlloc(PRO_E_HLE_DIM_DIST1, &elem_hle_dim_dist1);
    status = ProElementDoubleSet(elem_hle_dim_dist1, 50.0);
    status = ProElemtreeElementAdd(elem_hle_placement, NULL, elem_hle_dim_dist1);

    /* Second dimension reference */
    status = ProElementAlloc(PRO_E_HLE_DIM_REF2, &elem_hle_dim_ref2);
    status = ProSelect("datum,surface,edge", 1, NULL, NULL, NULL, NULL,
                       &p_selection, &n_selection);
    if (n_selection <= 0) return PRO_TK_USER_ABORT;
    status = ProSelectionToReference(p_selection[0], &reference);
    status = ProElementReferenceSet(elem_hle_dim_ref2, reference);
    status = ProElemtreeElementAdd(elem_hle_placement, NULL, elem_hle_dim_ref2);

    /* Second dimension distance */
    status = ProElementAlloc(PRO_E_HLE_DIM_DIST2, &elem_hle_dim_dist2);
    status = ProElementDoubleSet(elem_hle_dim_dist2, 75.0);
    status = ProElemtreeElementAdd(elem_hle_placement, NULL, elem_hle_dim_dist2);

    /* Create the feature */
    status = ProMdlCurrentGet(&model);
    status = ProMdlToModelitem(model, &model_item);
    status = ProSelectionAlloc(NULL, &model_item, &model_selection);

    status = ProArrayAlloc(1, sizeof(ProFeatureCreateOptions), 1, (ProArray*)&options);
    options[0] = PRO_FEAT_CR_DEFINE_MISS_ELEMS;

    status = ProFeatureWithoptionsCreate(model_selection, feat_elemtree,
        options, PRO_REGEN_NO_FLAGS, &created_feature, &errors);

    /* Cleanup */
    status = ProArrayFree((ProArray*)&options);
    status = ProElementFree(&feat_elemtree);
    status = ProSelectionFree(&model_selection);

    return status;
}
```

## Datum Axis Feature Creation

Element tree structure:

```
PRO_E_FEATURE_TREE
├── PRO_E_FEATURE_TYPE = PRO_FEAT_DATUM_AXIS
├── PRO_E_STD_FEATURE_NAME = <name>
└── PRO_E_DTMAXIS_CONSTRAINTS (array)
    ├── PRO_E_DTMAXIS_CONSTRAINT
    │   ├── PRO_E_DTMAXIS_CONSTR_TYPE = PRO_DTMAXIS_CONSTR_TYPE_THRU
    │   └── PRO_E_DTMAXIS_CONSTR_REF = <reference>
    └── PRO_E_DTMAXIS_CONSTRAINT
        ├── PRO_E_DTMAXIS_CONSTR_TYPE = PRO_DTMAXIS_CONSTR_TYPE_THRU
        └── PRO_E_DTMAXIS_CONSTR_REF = <reference>
```

### Datum Axis Example

```c
ProError ProDemoDatumAxisCreate()
{
    ProError status;
    ProElement pro_e_feature_tree, pro_e_feature_type, pro_e_std_feature_name;
    ProElement pro_e_dtmaxis_constraints, pro_e_dtmaxis_constraint;
    ProElement pro_e_dtmaxis_constr_type, pro_e_dtmaxis_constr_ref;
    ProReference reference;
    ProSelection *p_select;
    int n_select;
    ProName wide_string;
    ProMdl model;
    ProModelitem model_item;
    ProSelection model_sel;
    ProFeature feature;
    ProErrorlist errors;
    ProFeatureCreateOptions *opts = NULL;

    /* Root element */
    status = ProElementAlloc(PRO_E_FEATURE_TREE, &pro_e_feature_tree);

    /* Feature type */
    status = ProElementAlloc(PRO_E_FEATURE_TYPE, &pro_e_feature_type);
    status = ProElementIntegerSet(pro_e_feature_type, PRO_FEAT_DATUM_AXIS);
    status = ProElemtreeElementAdd(pro_e_feature_tree, NULL, pro_e_feature_type);

    /* Feature name (optional) */
    status = ProElementAlloc(PRO_E_STD_FEATURE_NAME, &pro_e_std_feature_name);
    ProStringToWstring(wide_string, "MY_AXIS_1");
    status = ProElementWstringSet(pro_e_std_feature_name, wide_string);
    status = ProElemtreeElementAdd(pro_e_feature_tree, NULL, pro_e_std_feature_name);

    /* Constraints container */
    status = ProElementAlloc(PRO_E_DTMAXIS_CONSTRAINTS, &pro_e_dtmaxis_constraints);
    status = ProElemtreeElementAdd(pro_e_feature_tree, NULL, pro_e_dtmaxis_constraints);

    /* First constraint - select first surface */
    status = ProElementAlloc(PRO_E_DTMAXIS_CONSTRAINT, &pro_e_dtmaxis_constraint);
    status = ProElemtreeElementAdd(pro_e_dtmaxis_constraints, NULL, pro_e_dtmaxis_constraint);

    status = ProElementAlloc(PRO_E_DTMAXIS_CONSTR_TYPE, &pro_e_dtmaxis_constr_type);
    status = ProElementIntegerSet(pro_e_dtmaxis_constr_type, PRO_DTMAXIS_CONSTR_TYPE_THRU);
    status = ProElemtreeElementAdd(pro_e_dtmaxis_constraint, NULL, pro_e_dtmaxis_constr_type);

    status = ProSelect("datum,surface,sldface,qltface", 1, NULL, NULL, NULL, NULL,
                       &p_select, &n_select);
    if (n_select <= 0) return PRO_TK_USER_ABORT;
    status = ProElementAlloc(PRO_E_DTMAXIS_CONSTR_REF, &pro_e_dtmaxis_constr_ref);
    status = ProSelectionToReference(p_select[0], &reference);
    status = ProElementReferenceSet(pro_e_dtmaxis_constr_ref, reference);
    status = ProElemtreeElementAdd(pro_e_dtmaxis_constraint, NULL, pro_e_dtmaxis_constr_ref);

    /* Second constraint - select second surface */
    status = ProElementAlloc(PRO_E_DTMAXIS_CONSTRAINT, &pro_e_dtmaxis_constraint);
    status = ProElemtreeElementAdd(pro_e_dtmaxis_constraints, NULL, pro_e_dtmaxis_constraint);

    status = ProElementAlloc(PRO_E_DTMAXIS_CONSTR_TYPE, &pro_e_dtmaxis_constr_type);
    status = ProElementIntegerSet(pro_e_dtmaxis_constr_type, PRO_DTMAXIS_CONSTR_TYPE_THRU);
    status = ProElemtreeElementAdd(pro_e_dtmaxis_constraint, NULL, pro_e_dtmaxis_constr_type);

    status = ProSelect("datum,surface,sldface,qltface", 1, NULL, NULL, NULL, NULL,
                       &p_select, &n_select);
    if (n_select <= 0) return PRO_TK_USER_ABORT;
    status = ProElementAlloc(PRO_E_DTMAXIS_CONSTR_REF, &pro_e_dtmaxis_constr_ref);
    status = ProSelectionToReference(p_select[0], &reference);
    status = ProElementReferenceSet(pro_e_dtmaxis_constr_ref, reference);
    status = ProElemtreeElementAdd(pro_e_dtmaxis_constraint, NULL, pro_e_dtmaxis_constr_ref);

    /* Create feature */
    status = ProMdlCurrentGet(&model);
    status = ProMdlToModelitem(model, &model_item);
    status = ProSelectionAlloc(NULL, &model_item, &model_sel);

    status = ProArrayAlloc(1, sizeof(ProFeatureCreateOptions), 1, (ProArray*)&opts);
    opts[0] = PRO_FEAT_CR_DEFINE_MISS_ELEMS;

    status = ProFeatureWithoptionsCreate(model_sel, pro_e_feature_tree,
        opts, PRO_REGEN_NO_FLAGS, &feature, &errors);

    /* Cleanup */
    status = ProArrayFree((ProArray*)&opts);
    status = ProElementFree(&pro_e_feature_tree);

    return status;
}
```

## Datum Point Features

### Offset Point from CSYS

Element tree structure:

```
PRO_E_FEATURE_TREE
├── PRO_E_FEATURE_TYPE = PRO_FEAT_DATUM_POINT
├── PRO_E_DPOINT_TYPE = PRO_DPOINT_TYPE_OFFSET_CSYS
├── PRO_E_DPOINT_OFST_CSYS_TYPE = PRO_DTMPNT_OFFCSYS_CARTESIAN
├── PRO_E_DPOINT_OFST_CSYS_REF = <csys reference>
├── PRO_E_DPOINT_OFST_CSYS_WITH_DIMS = PRO_B_TRUE
└── PRO_E_DPOINT_OFST_CSYS_PNTS_ARRAY
    └── PRO_E_DPOINT_OFST_CSYS_PNT
        ├── PRO_E_DPOINT_OFST_CSYS_PNT_NAME = <name>
        ├── PRO_E_DPOINT_OFST_CSYS_DIR1_VAL = <X offset>
        ├── PRO_E_DPOINT_OFST_CSYS_DIR2_VAL = <Y offset>
        └── PRO_E_DPOINT_OFST_CSYS_DIR3_VAL = <Z offset>
```

### Field Point on Curve/Surface

Element tree structure:

```
PRO_E_FEATURE_TREE
├── PRO_E_FEATURE_TYPE = PRO_FEAT_DATUM_POINT
├── PRO_E_DPOINT_TYPE = PRO_DPOINT_TYPE_FIELD
├── PRO_E_STD_FEATURE_NAME = <name>
└── PRO_E_DPOINT_FIELD_REF = <curve or surface reference>
```

## Chamfer Feature Creation

Element tree structure using edge collection:

```
PRO_E_FEATURE_TREE
├── PRO_E_FEATURE_TYPE = PRO_FEAT_CHAMFER
├── PRO_E_STD_FEATURE_NAME = <name> (optional)
├── PRO_E_RNDCH_SETS
│   └── PRO_E_RNDCH_SET
│       ├── PRO_E_RNDCH_DIMENSIONAL_SCHEMA = PRO_CHM_D_X_D
│       ├── PRO_E_RNDCH_CHAMFER_SHAPE = PRO_CHM_OFFSET_SURFACE
│       ├── PRO_E_RNDCH_REFERENCES
│       │   └── PRO_E_STD_CURVE_COLLECTION_APPL = <curve collection>
│       └── PRO_E_RNDCH_RADII
│           └── PRO_E_RNDCH_RADIUS
│               └── PRO_E_RNDCH_LEG1
│                   ├── PRO_E_RNDCH_LEG_TYPE = PRO_ROUND_RADIUS_TYPE_VALUE
│                   └── PRO_E_RNDCH_LEG_VALUE = <chamfer size>
└── PRO_E_RNDCH_ATTACH_TYPE = PRO_ROUND_ATTACHED
```

### Curve Collection Pattern

```c
ProError CreateCurveCollection(ProSelection edge_sel, ProCollection *collection)
{
    ProCrvcollinstr instr;
    ProReference reference;
    ProError status;

    status = ProCrvcollectionAlloc(collection);
    status = ProCrvcollinstrAlloc(PRO_CURVCOLL_ADD_ONE_INSTR, &instr);
    status = ProSelectionToReference(edge_sel, &reference);
    status = ProCrvcollinstrReferenceAdd(instr, reference);
    status = ProCrvcollectionInstructionAdd(*collection, instr);

    /* Optional: add tangent chain */
    status = ProCrvcollinstrAlloc(PRO_CURVCOLL_ADD_TANGENT_INSTR, &instr);
    status = ProCrvcollectionInstructionAdd(*collection, instr);

    return PRO_TK_NO_ERROR;
}

/* Usage in element tree */
ProCollection collection;
CreateCurveCollection(edge_selection, &collection);
status = ProElementAlloc(PRO_E_STD_CURVE_COLLECTION_APPL, &elem_collection);
status = ProElementCollectionSet(elem_collection, collection);
status = ProElemtreeElementAdd(parent_elem, NULL, elem_collection);
```

## Remove Surface Feature

Element tree structure:

```
PRO_E_FEATURE_TREE
├── PRO_E_FEATURE_TYPE = PRO_FEAT_RM_SURF
├── PRO_E_RM_SURF_REF_TYPE = PRO_RM_SURF_SRF_REF
├── PRO_E_RM_SURF_ATTACH_TYPE = FM_RM_SURF_ATTACH_SAME
└── PRO_E_RM_SURF_SRF_REFS
    ├── PRO_E_STD_SURF_COLLECTION_APPL = <surface collection>
    └── PRO_E_STD_EXCL_CNTRS
```

### Surface Collection Pattern

```c
ProError CreateSurfaceCollection(ProSelection *surface_sels, int num_sels,
                                  ProCollection *collection)
{
    ProSrfcollinstr instr;
    ProReference reference;
    ProSrfcollref instr_ref;
    ProError status;
    int i;

    status = ProSrfcollectionAlloc(collection);
    status = ProSrfcollinstrAlloc(1, PRO_B_TRUE, &instr);
    status = ProSrfcollinstrIncludeSet(instr, 1);

    for (i = 0; i < num_sels; i++)
    {
        status = ProSelectionToReference(surface_sels[i], &reference);
        status = ProSrfcollrefAlloc(PRO_SURFCOLL_REF_SINGLE, reference, &instr_ref);
        status = ProSrfcollinstrReferenceAdd(instr, instr_ref);
    }

    status = ProSrfcollectionInstructionAdd(*collection, instr);

    return PRO_TK_NO_ERROR;
}
```

## Reference Handling

Converting selections to element tree references:

```c
/* Convert ProSelection to ProReference for element trees */
ProReference reference;
ProSelection selection;

/* From interactive selection */
status = ProSelect("surface", 1, NULL, NULL, NULL, NULL, &sel_array, &n_sel);
status = ProSelectionToReference(sel_array[0], &reference);

/* Set reference in element */
status = ProElementAlloc(PRO_E_xxx_REF, &elem_ref);
status = ProElementReferenceSet(elem_ref, reference);
status = ProElemtreeElementAdd(parent, NULL, elem_ref);
```

## Error Checking Macro

Standard logging macro used in examples:

```c
#define LOG_STATUS(func_name, status) \
    ProTKPrintf("Status for %s is = %d\n", func_name, status); \
    if (status != PRO_TK_NO_ERROR) { \
        /* Handle error */ \
    }
```

## Common Headers for Feature Creation

```c
#include <ProToolkit.h>
#include <ProFeature.h>
#include <ProElemId.h>
#include <ProElement.h>
#include <ProFeatType.h>
#include <ProFeatForm.h>
#include <ProSelection.h>
#include <ProModelitem.h>

/* Feature-specific headers */
#include <ProHole.h>        /* For hole features */
#include <ProDtmAxis.h>     /* For datum axis */
#include <ProDtmPnt.h>      /* For datum points */
#include <ProRound.h>       /* For rounds */
#include <ProChamfer.h>     /* For chamfers */
#include <ProRemoveSurf.h>  /* For remove surface */
#include <ProExtrude.h>     /* For extrusions */
#include <ProRevolve.h>     /* For revolves */
#include <ProSweep.h>       /* For sweeps */

/* Collection headers */
#include <ProCrvcollection.h>  /* Curve collections */
#include <ProSrfcollection.h>  /* Surface collections */
```

## Feature Creation Options

```c
typedef enum {
    PRO_FEAT_CR_NO_OPTS = 0,
    PRO_FEAT_CR_DEFINE_MISS_ELEMS,    /* Prompt for missing elements */
    PRO_FEAT_CR_INCOMPLETE_FEAT,      /* Allow incomplete feature */
    PRO_FEAT_CR_FIX_MODEL_ON_FAIL     /* Prompt to fix on failure */
} ProFeatureCreateOptions;

/* Recommended usage */
ProFeatureCreateOptions *opts;
ProArrayAlloc(1, sizeof(ProFeatureCreateOptions), 1, (ProArray*)&opts);
opts[0] = PRO_FEAT_CR_DEFINE_MISS_ELEMS;

/* For multiple options */
ProArrayAlloc(2, sizeof(ProFeatureCreateOptions), 1, (ProArray*)&opts);
opts[0] = PRO_FEAT_CR_DEFINE_MISS_ELEMS;
opts[1] = PRO_FEAT_CR_FIX_MODEL_ON_FAIL;
```

## ProElementDecimalsSet for Dimension Precision

```c
/* Set decimal places for double values */
status = ProElementAlloc(PRO_E_xxx_VALUE, &elem);
status = ProElementDecimalsSet(elem, 4);  /* 4 decimal places */
status = ProElementDoubleSet(elem, 100.0000);
```
