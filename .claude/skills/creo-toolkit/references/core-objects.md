# Core Objects Reference

## Object Hierarchy

```
ProMdl (Model - abstract)
├── ProSolid (Part or Assembly)
│   ├── ProPart
│   └── ProAssembly
├── ProDrawing
├── ProMfg (Manufacturing)
└── ProSection (2D Section)

ProModelitem (Generic database item)
├── ProGeomitem (Geometric items)
│   ├── ProSurface
│   ├── ProEdge
│   ├── ProCurve
│   ├── ProAxis
│   ├── ProCsys
│   ├── ProPoint
│   └── ProQuilt
├── ProFeature
├── ProDimension
├── ProParameter
├── ProLayer
└── ProNote
```

## ProMdl - Model Object

Base type for all models (opaque handle):
```c
typedef void* ProMdl;
```

### Key Functions
```c
// Identification
ProMdlMdlnameGet(model, name);           // Get model name
ProMdlTypeGet(model, &type);             // Get model type
ProMdlExtensionGet(model, extension);    // Get file extension
ProMdlIdGet(model, &id);                 // Get session ID

// Session operations
ProMdlCurrentGet(&model);                // Get active model
ProSessionMdlList(type, &models);        // List models in session
ProMdlnameInit(name, type, &model);      // Get handle by name

// File operations
ProMdlnameRetrieve(name, type, &model);  // Open model
ProMdlSave(model);                       // Save model
ProMdlErase(model);                      // Erase from session
ProMdlEraseAll(model);                   // Erase with dependencies
ProMdlnameCopy(model, new_name);         // Save As
ProMdlnameRename(model, new_name);       // Rename
ProMdlDelete(model);                     // Delete from disk

// Display
ProMdlDisplay(model);                    // Display in window
ProMdlWindowGet(model, &window);         // Get window ID
```

### Model Types (ProMdlType)
```c
PRO_MDL_PART        // Part
PRO_MDL_ASSEMBLY    // Assembly
PRO_MDL_DRAWING     // Drawing
PRO_MDL_3DSECTION   // 3D Section
PRO_MDL_2DSECTION   // 2D Section
PRO_MDL_LAYOUT      // Layout
PRO_MDL_MFG         // Manufacturing
```

## ProSolid - Parts and Assemblies

Instance of ProMdl for geometric models:
```c
typedef struct sld_part* ProSolid;
```

### Key Functions
```c
// Creation
ProSolidMdlnameCreate(name, type, &solid);

// Feature operations
ProSolidFeatVisit(solid, action, filter, data);
ProSolidFeatstatusGet(solid, &feat_ids, &statuses, &count);
ProSolidFeatstatusSet(solid, feat_ids, statuses, count);

// Geometry access
ProSolidSurfaceVisit(solid, action, filter, data);
ProSolidQuiltVisit(solid, action, filter, data);
ProSolidAxisVisit(solid, action, filter, data);
ProSolidCsysVisit(solid, action, filter, data);

// Regeneration
ProSolidRegenerate(solid, PRO_REGEN_NO_FLAGS);
ProSolidRegenerationstatusGet(solid, &regen_status);

// Outline
ProSolidOutlineCompute(solid, outline);  // Accurate
ProSolidOutlineGet(solid, outline);      // Stored (fast)

// Mass properties
ProSolidMassPropertyGet(solid, NULL, &mass_prop);

// Display
ProSolidDisplay(solid);
```

## ProFeature - Feature Object

DHandle for features:
```c
typedef struct pro_model_item {
    ProType type;    // PRO_FEATURE
    int id;          // Feature ID
    ProMdl owner;    // Owning solid
} ProFeature;
```

### Key Functions
```c
// Initialization
ProFeatureInit(solid, feat_id, &feature);

// Inquiry
ProFeatureTypeGet(&feature, &feat_type);
ProFeatureStatusGet(&feature, &status);
ProFeatureNameGet(&feature, name);
ProFeatureGeomitemVisit(&feature, type, action, filter, data);

// Manipulation
ProFeatureDelete(&feature, NULL, 0);
ProFeatureSuppress(solid, &feat_ids, 1, NULL, 0);
ProFeatureResume(solid, &feat_ids, 1, NULL, 0);
ProFeatureReorder(&feature, PRO_REGEN_BEFORE, &ref_feat);

// Parents and children
ProFeatureParentsGet(&feature, &parents);
ProFeatureChildrenGet(&feature, &children);

// Element tree access
ProFeatureElemtreeExtract(&feature, NULL, opts, &tree);
ProFeatureRedefine(NULL, &feature, tree, NULL, 0, &errors);
```

### Feature Status Flags
```c
PRO_FEAT_ACTIVE      // Normal state
PRO_FEAT_INACTIVE    // Suppressed
PRO_FEAT_FAILED      // Regeneration failed
PRO_FEAT_UNREGENERATED // Needs regeneration
```

## ProSurface - Surface Object

Opaque handle for solid surfaces:
```c
typedef struct geom* ProSurface;
```

### Key Functions
```c
// Initialization
ProSurfaceInit(owner, surf_id, &surface);
ProSurfaceIdGet(surface, &id);

// Properties
ProSurfaceTypeGet(surface, &type);
ProSurfaceAreaEval(surface, &area);
ProSurfaceSideGet(surface, &side);

// Geometry
ProSurfaceContourVisit(surface, action, filter, data);
ProSurfaceEdgeVisit(surface, action, filter, data);
ProSurfaceDataGet(surface, &surf_data);

// Evaluation
ProSurfaceXyzdataEval(surface, uv_point, xyz, du, dv, 
                      duu, duv, dvv);
ProSurfaceParamEval(surface, xyz_point, &uv);
ProSurfacePrincipalCrvEval(surface, uv, k1, d1, k2, d2);
```

### Surface Types (ProSrftype)
```c
PRO_SRF_PLANE       // Planar
PRO_SRF_CYL         // Cylindrical
PRO_SRF_CONE        // Conical
PRO_SRF_SPH         // Spherical
PRO_SRF_TOR         // Torus
PRO_SRF_NURBS       // NURBS
PRO_SRF_FILLET      // Fillet
PRO_SRF_REV         // Revolved
PRO_SRF_TABCYL      // Tabulated cylinder
PRO_SRF_BLEND       // Blended
```

## ProEdge - Edge Object

```c
typedef struct curve_header* ProEdge;
```

### Key Functions
```c
ProEdgeInit(owner, edge_id, &edge);
ProEdgeIdGet(edge, &id);
ProEdgeLengthEval(edge, &length);
ProEdgeTypeGet(edge, &type);
ProEdgeDirGet(edge, &direction);
ProEdgeVertexdataGet(edge, &edges_array, &surfaces_array);
ProEdgeNeighborsGet(edge, &neighbor_edges);
ProEdgeXyzdataEval(edge, t_param, xyz, d1, d2);
ProEdgeParamEval(edge, xyz_point, &t_param);
```

## ProAxis - Axis Object

```c
typedef struct entity* ProAxis;
```

### Key Functions
```c
ProAxisInit(owner, axis_id, &axis);
ProAxisIdGet(axis, &id);
ProAxisGeomGet(axis, &geom_data);
ProAxisPointGet(axis, point);
ProAxisVectorGet(axis, vector);
```

## ProCsys - Coordinate System

```c
typedef struct entity* ProCsys;
```

### Key Functions
```c
ProCsysInit(owner, csys_id, &csys);
ProCsysIdGet(csys, &id);
ProCsysDataGet(csys, &origin, x_axis, y_axis, z_axis);
ProCsysTypeGet(csys, &type);
ProCsysMatrixGet(csys, matrix, NULL);
```

## ProQuilt - Quilt Object

Collection of surfaces (surface body):
```c
typedef struct quilt* ProQuilt;
```

### Key Functions
```c
ProQuiltInit(owner, quilt_id, &quilt);
ProQuiltIdGet(quilt, &id);
ProQuiltSurfaceVisit(quilt, action, filter, data);
ProQuiltOuterContourGet(quilt, &contour);
```

## ProSelection - Geometry Reference

Complete reference with assembly context:
```c
typedef struct pro_selection* ProSelection;
```

### Key Functions
```c
// Creation
ProSelectionAlloc(&comp_path, &modelitem, &selection);

// Access
ProSelectionModelitemGet(selection, &modelitem);
ProSelectionAsmcomppathGet(selection, &comp_path);
ProSelectionPoint3dGet(selection, point);
ProSelectionSurfaceUvpntGet(selection, &uv);

// Conversion
ProSelectionToReference(selection, &reference);
ProReferenceToSelection(reference, &selection);

// Interactive
ProSelect(option, max_count, sel_filter, instr, NULL, 
          &selections, &n_sel);

// Cleanup
ProSelectionFree(&selection);
```

## ProAsmcomppath - Assembly Component Path

Path to component in assembly:
```c
typedef struct pro_assembly_path {
    ProMdl owner;           // Top assembly
    ProIdTable comp_id_table; // Array of component IDs
    int table_num;          // Number of IDs in path
} ProAsmcomppath;
```

### Key Functions
```c
ProAsmcomppathInit(assembly, comp_id_table, depth, &path);
ProAsmcomppathMdlGet(&path, &component_model);
ProAsmcomppathTrfGet(&path, PRO_B_TRUE, transform);
```

## ProModelitem - Generic Item

DHandle for any item in model:
```c
typedef struct pro_model_item {
    ProType type;
    int id;
    ProMdl owner;
} ProModelitem;
```

### Key Functions
```c
ProModelitemInit(model, type, id, &item);
ProModelitemByNameInit(model, type, name, &item);
ProModelitemMdlGet(&item, &model);
ProModelitemNameGet(&item, name);
ProModelitemNameSet(&item, name);
```

## ProParameter - Model Parameters

```c
typedef struct pro_model_item ProParameter;
```

### Key Functions
```c
// Access
ProParameterInit(&owner_item, name, &param);
ProParameterVisit(&owner_item, NULL, action, filter, data);

// Values
ProParameterValueGet(&param, &value);
ProParameterValueSet(&param, &value);
ProParameterValueWithUnitsGet(&param, &value, &unit);

// Creation/deletion
ProParameterCreate(&owner_item, name, &value, &param);
ProParameterDelete(&param);
```

### ProParamvalue Structure
```c
typedef struct pro_param_value {
    ProParamvalueType type;  // PRO_PARAM_STRING/DOUBLE/INTEGER/BOOLEAN/NOTE
    union {
        wchar_t sval[PRO_LINE_SIZE];
        double dval;
        int ival;
        ProBoolean bval;
    } value;
} ProParamvalue;
```

## ProDimension - Dimensions

```c
typedef struct pro_model_item ProDimension;
```

### Key Functions
```c
ProDimensionInit(owner, dim_id, &dimension);
ProDimensionValueGet(&dimension, &value);
ProDimensionValueSet(&dimension, value);
ProDimensionSymbolGet(&dimension, symbol);
ProDimensionToleranceGet(&dimension, &tol_type, tol_value);
```

## ProLayer - Layers

```c
typedef struct pro_model_item ProLayer;
```

### Key Functions
```c
ProMdlLayerGet(model, name, &layer);
ProMdlLayerVisit(model, action, filter, data);
ProLayerCreate(model, name, &layer);
ProLayerDelete(&layer);
ProLayerItemAdd(&layer, &layer_item);
ProLayerItemRemove(&layer, &layer_item);
ProLayerDisplaystatusGet(&layer, &status);
ProLayerDisplaystatusSet(&layer, status);
```

## ProNote - Notes

```c
typedef struct pro_model_item ProNote;
```

### Key Functions
```c
ProNoteTextGet(&note, &text_lines);
ProNoteTextSet(&note, text_lines);
ProSolidNoteCreate(solid, lines, &note);
ProSolidNoteDelete(solid, &note);
ProSolidNoteVisit(solid, action, filter, data);
```
