# Element Trees: Feature Creation Reference

Element trees are hierarchical data structures used to define and create features programmatically in Creo Parametric TOOLKIT.

## Element Tree Structure

```
PRO_E_FEATURE_TREE (root - compound)
├── PRO_E_FEATURE_TYPE (integer - required)
├── PRO_E_FEATURE_FORM (integer - optional)
├── PRO_E_STD_FEATURE_NAME (wstring - optional)
└── [Feature-specific elements...]
```

## Element Types

| Type | Description | Access Method |
|------|-------------|---------------|
| Single-valued | Integer, double, wstring, selection | ProElementValueSet/Get |
| Multivalued | Array of same-type values | ProElementValuesSet/Get |
| Compound | Container for child elements | ProElementChildrenSet/Get |
| Array | Collection of same-ID elements | ProElementArraySet/Get |

## ProValue and ProValueData

```c
typedef struct pro_value_data {
    ProValueDataType type;
    union {
        int i;           // PRO_VALUE_TYPE_INT
        double d;        // PRO_VALUE_TYPE_DOUBLE
        void *p;         // PRO_VALUE_TYPE_POINTER
        char *s;         // PRO_VALUE_TYPE_STRING
        wchar_t *w;      // PRO_VALUE_TYPE_WSTRING
        ProSelection r;  // PRO_VALUE_TYPE_SELECTION
    } v;
} ProValueData;
```

## Element Path (ProElempath)

Navigate to elements in a tree:
```c
ProElempath path;
ProElempathItem path_items[2];

// Path by element ID
path_items[0].type = PRO_ELEM_PATH_ITEM_TYPE_ID;
path_items[0].path_item.elem_id = PRO_E_DTMPLN_CONSTRAINTS;

// Path by array index
path_items[1].type = PRO_ELEM_PATH_ITEM_TYPE_INDEX;
path_items[1].path_item.elem_index = 0;

ProElempathAlloc(&path);
ProElempathDataSet(path, path_items, 2);

// Use path to access element
ProElement elem;
ProElemtreeElementGet(tree, path, &elem);

ProElempathFree(&path);
```

## Creating a Datum Plane (Example)

### Element Tree Structure
```
PRO_E_FEATURE_TREE
├── PRO_E_FEATURE_TYPE = PRO_FEAT_DATUM
└── PRO_E_DTMPLN_CONSTRAINTS (array)
    └── PRO_E_DTMPLN_CONSTRAINT (compound)
        ├── PRO_E_DTMPLN_CONSTR_TYPE = PRO_DTMPLN_OFFS
        ├── PRO_E_DTMPLN_CONSTR_REF = <selection>
        └── PRO_E_DTMPLN_CONSTR_REF_OFFSET = <double>
```

### Complete Code
```c
ProError CreateOffsetDatumPlane(ProSelection offset_surface, 
                                 double offset_dist,
                                 ProFeature* new_feature)
{
    ProElement tree, elem_type, elem_consts, elem_const;
    ProElement elem_const_type, elem_ref, elem_offset;
    ProValue value;
    ProValueData value_data;
    ProSelection model_sel;
    ProModelitem model_item;
    ProAsmcomppath comp_path;
    ProErrorlist errors;
    ProError status;
    
    // Create root element
    ProElementAlloc(PRO_E_FEATURE_TREE, &tree);
    
    // Feature type = Datum Plane
    ProElementAlloc(PRO_E_FEATURE_TYPE, &elem_type);
    value_data.type = PRO_VALUE_TYPE_INT;
    value_data.v.i = PRO_FEAT_DATUM;
    ProValueAlloc(&value);
    ProValueDataSet(value, &value_data);
    ProElementValueSet(elem_type, value);
    ProElemtreeElementAdd(tree, NULL, elem_type);
    
    // Constraints container
    ProElementAlloc(PRO_E_DTMPLN_CONSTRAINTS, &elem_consts);
    ProElemtreeElementAdd(tree, NULL, elem_consts);
    
    // Single constraint
    ProElementAlloc(PRO_E_DTMPLN_CONSTRAINT, &elem_const);
    ProElemtreeElementAdd(elem_consts, NULL, elem_const);
    
    // Constraint type = Offset
    ProElementAlloc(PRO_E_DTMPLN_CONSTR_TYPE, &elem_const_type);
    value_data.type = PRO_VALUE_TYPE_INT;
    value_data.v.i = PRO_DTMPLN_OFFS;
    ProValueAlloc(&value);
    ProValueDataSet(value, &value_data);
    ProElementValueSet(elem_const_type, value);
    ProElemtreeElementAdd(elem_const, NULL, elem_const_type);
    
    // Reference surface
    ProElementAlloc(PRO_E_DTMPLN_CONSTR_REF, &elem_ref);
    value_data.type = PRO_VALUE_TYPE_SELECTION;
    value_data.v.r = offset_surface;
    ProValueAlloc(&value);
    ProValueDataSet(value, &value_data);
    ProElementValueSet(elem_ref, value);
    ProElemtreeElementAdd(elem_const, NULL, elem_ref);
    
    // Offset distance
    ProElementAlloc(PRO_E_DTMPLN_CONSTR_REF_OFFSET, &elem_offset);
    value_data.type = PRO_VALUE_TYPE_DOUBLE;
    value_data.v.d = offset_dist;
    ProValueAlloc(&value);
    ProValueDataSet(value, &value_data);
    ProElementValueSet(elem_offset, value);
    ProElemtreeElementAdd(elem_const, NULL, elem_offset);
    
    // Get model selection from reference
    ProSelectionAsmcomppathGet(offset_surface, &comp_path);
    ProSelectionModelitemGet(offset_surface, &model_item);
    ProMdlToModelitem(model_item.owner, &model_item);
    ProSelectionAlloc(&comp_path, &model_item, &model_sel);
    
    // Create feature
    status = ProFeatureCreate(model_sel, tree, NULL, 0, 
                              new_feature, &errors);
    
    // Cleanup
    ProElementFree(&tree);
    ProSelectionFree(&model_sel);
    
    return status;
}
```

## Feature Creation Options

```c
typedef enum {
    PRO_FEAT_CR_NO_OPTS = 0,
    PRO_FEAT_CR_DEFINE_MISS_ELEMS,    // Prompt user for missing
    PRO_FEAT_CR_INCOMPLETE_FEAT,      // Create incomplete feature
    PRO_FEAT_CR_FIX_MODEL_ON_FAIL     // Prompt user to fix errors
} ProFeatureCreateOptions;
```

## Feature Types (ProFeatType)

Common feature types from ProFeatType.h:
- `PRO_FEAT_DATUM` - Datum plane
- `PRO_FEAT_DATUM_POINT` - Datum point
- `PRO_FEAT_DATUM_AXIS` - Datum axis
- `PRO_FEAT_CSYS` - Coordinate system
- `PRO_FEAT_CURVE` - Datum curve
- `PRO_FEAT_PROTRUSION` - Protrusion (solid add)
- `PRO_FEAT_CUT` - Cut (solid remove)
- `PRO_FEAT_HOLE` - Hole
- `PRO_FEAT_ROUND` - Round
- `PRO_FEAT_CHAMFER` - Chamfer
- `PRO_FEAT_DRAFT` - Draft
- `PRO_FEAT_SHELL` - Shell
- `PRO_FEAT_COMPONENT` - Assembly component

## Header Files for Feature Creation

| Header | Feature Type |
|--------|--------------|
| ProDtmPln.h | Datum plane |
| ProDtmPnt.h | Datum point |
| ProDtmAxis.h | Datum axis |
| ProDtmCsys.h | Coordinate system |
| ProDtmCrv.h | Datum curve |
| ProExtrude.h | Extrude |
| ProRevolve.h | Revolve |
| ProSweep.h | Sweep |
| ProHole.h | Hole |
| ProRound.h | Round |
| ProChamfer.h | Chamfer |
| ProDraft.h | Draft |
| ProShell.h | Shell |
| ProAsmcomp.h | Assembly component |

## Feature Inquiry

Extract element tree from existing feature:
```c
ProElement tree;
ProFeature feature;

// Extract tree (use PRO_FEAT_EXTRACT_NO_OPTS)
ProFeatureElemtreeExtract(&feature, NULL, 
                          PRO_FEAT_EXTRACT_NO_OPTS, &tree);

// Visit elements
ProElemtreeElementVisit(tree, NULL, MyElemAction, MyElemFilter, &data);

// Get specific element value
ProElempath path;
// ... setup path ...
ProElement elem;
ProElemtreeElementGet(tree, path, &elem);

ProValue value;
ProElementValueGet(elem, &value);

ProValueData value_data;
ProValueDataGet(value, &value_data);

// Free tree
ProFeatureElemtreeFree(&tree);
```

## Feature Redefine

Modify existing feature:
```c
// 1. Extract element tree
ProFeatureElemtreeExtract(&feature, NULL, 
                          PRO_FEAT_EXTRACT_NO_OPTS, &tree);

// 2. Modify elements
ProElempath path;
// ... setup path to element ...
ProElement elem;
ProElemtreeElementGet(tree, path, &elem);

// Set new value
ProValueData new_data;
new_data.type = PRO_VALUE_TYPE_DOUBLE;
new_data.v.d = 25.0;
ProValue new_value;
ProValueAlloc(&new_value);
ProValueDataSet(new_value, &new_data);
ProElementValueSet(elem, new_value);

// 3. Redefine feature
ProFeatureRedefine(NULL, &feature, tree, NULL, 0, &errors);

// 4. Cleanup
ProFeatureElemtreeFree(&tree);
```

## XML Representation

Export element tree to XML:
```c
ProFeatureElemtreeExtract(&feature, NULL, 
                          PRO_FEAT_EXTRACT_NO_OPTS, &tree);
ProElemtreeWrite(tree, PRO_ELEMTREE_XML, L"feature.xml");
```

Create element tree from XML:
```c
ProElement tree;
ProXMLError* errors;
ProElemtreeFromXMLCreate(L"feature.xml", &tree, &errors);
```

## Element Diagnostics

Check for element problems:
```c
ProElemdiagnostic* diagnostics;
ProElementDiagnosticsCollect(elem, &diagnostics);

int size;
ProArraySizeGet(diagnostics, &size);

for (int i = 0; i < size; i++) {
    ProElemdiagSeverity severity;
    ProElemdiagnosticSeverityGet(diagnostics[i], &severity);
    
    wchar_t* message;
    ProElemdiagnosticMessageGet(diagnostics[i], &message);
    // Use message...
}

ProElemdiagnosticProarrayFree(diagnostics);
```

## Preferred Element Access Functions

Use type-specific functions (recommended over ProValueData):
```c
// Integer
int int_val;
ProElementIntegerGet(elem, &int_val);
ProElementIntegerSet(elem, 42);

// Double
double dbl_val;
ProElementDoubleGet(elem, &dbl_val);
ProElementDoubleSet(elem, 25.5);

// Wide string
wchar_t* wstr;
ProElementWstringGet(elem, NULL, &wstr);
ProWstringFree(wstr);
ProElementWstringSet(elem, L"MyName");

// Reference (selection)
ProReference ref;
ProElementReferenceGet(elem, &ref);
ProElementReferenceSet(elem, ref);

// Multiple references
ProReference* refs;
ProElementReferencesGet(elem, &refs);
ProElementReferencesSet(elem, refs);
ProReferencearrayFree(refs);

// Boolean
ProBoolean bool_val;
ProElementBooleanGet(elem, &bool_val);
ProElementBooleanSet(elem, PRO_B_TRUE);

// Transform matrix
ProMatrix transform;
ProElementTransformGet(elem, transform);
ProElementTransformSet(elem, transform);
```
