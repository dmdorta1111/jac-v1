# Layers, Relations, Parameters, and Materials Reference

This reference covers operations for layers, relations, parameters, and materials based on PTC's example code.

## Layer Operations

### Creating a Layer

```c
#include <ProToolkit.h>
#include <ProLayer.h>
#include <ProObjects.h>

ProError CreateLayer(ProMdl model, const char *layer_name)
{
    ProLayer layer;
    ProError status;

    layer.owner = model;
    ProStringToWstring(layer.layer_name, (char*)layer_name);

    status = ProLayerCreate(&layer);
    return status;
}
```

### Adding Items to a Layer

```c
ProError AddItemToLayer(ProLayer *layer, ProModelitem *item)
{
    ProLayerItem layer_item;
    ProError status;

    layer_item.type = item->type;
    layer_item.id = item->id;

    status = ProLayerItemAdd(layer, &layer_item);
    return status;
}
```

### Getting Layer Names

```c
ProError ListLayers(ProMdl model)
{
    ProName *layer_names;
    int n_layers;
    int i;
    ProError status;
    char name_str[PRO_NAME_SIZE];

    status = ProMdlLayerNamesGet(model, &layer_names, &n_layers);
    if (status != PRO_TK_NO_ERROR)
        return status;

    for (i = 0; i < n_layers; i++)
    {
        ProWstringToString(name_str, layer_names[i]);
        ProTKPrintf("Layer %d: %s\n", i, name_str);
    }

    return PRO_TK_NO_ERROR;
}
```

### Layer Display Status

```c
ProError SetLayerDisplayStatus(ProMdl model, const char *layer_name,
                                ProLayerDisplay status_val)
{
    ProLayer layer;
    ProError status;

    layer.owner = model;
    ProStringToWstring(layer.layer_name, (char*)layer_name);

    status = ProLayerDisplaystatusSet(&layer, status_val);
    ProWindowRepaint(-1);

    return status;
}

/* Display status values:
   PRO_LAYER_TYPE_DISPLAY - Show layer contents
   PRO_LAYER_TYPE_BLANK   - Hide layer contents
   PRO_LAYER_TYPE_NORMAL  - Normal display
*/
```

### Scanning All Layers

```c
ProError ScanLayers(ProMdl model)
{
    ProName *layer_names;
    ProLayer *layers;
    ProLayerDisplay *display_status;
    int n_layers;
    int i;
    ProError status;

    status = ProMdlLayerNamesGet(model, &layer_names, &n_layers);
    if (status != PRO_TK_NO_ERROR)
        return status;

    /* Allocate arrays */
    display_status = (ProLayerDisplay*)calloc(n_layers, sizeof(ProLayerDisplay));
    layers = (ProLayer*)calloc(n_layers, sizeof(ProLayer));

    /* Initialize layer structs and get display status */
    for (i = 0; i < n_layers; i++)
    {
        layers[i].owner = model;
        ProWstringCopy(layer_names[i], layers[i].layer_name, PRO_VALUE_UNUSED);
        ProLayerDisplaystatusGet(&layers[i], &display_status[i]);
    }

    /* Process each layer... */

    /* Cleanup */
    free(display_status);
    free(layers);

    return PRO_TK_NO_ERROR;
}
```

## Relation Operations

### Getting Relations from a Model Item

```c
#include <ProRelSet.h>

ProError GetRelations(ProModelitem *item, ProWstring **relations)
{
    ProRelset relset;
    ProError status;

    /* Convert model item to relation set */
    status = ProModelitemToRelset(item, &relset);
    if (status != PRO_TK_NO_ERROR)
        return status;

    /* Allocate array for relations */
    status = ProArrayAlloc(0, sizeof(ProWstring), 1, (ProArray*)relations);

    /* Get relations */
    status = ProRelsetRelationsGet(&relset, relations);

    return status;
}
```

### Setting Relations

```c
ProError SetRelations(ProModelitem *item, ProWstring *relations, int count)
{
    ProRelset relset;
    ProError status;

    status = ProModelitemToRelset(item, &relset);
    if (status != PRO_TK_NO_ERROR)
        return status;

    status = ProRelsetRelationsSet(&relset, relations, count);
    if (status != PRO_TK_NO_ERROR)
        return status;

    /* Regenerate to apply */
    status = ProRelsetRegenerate(&relset);

    return status;
}
```

### Editing Relations via File

```c
ProError EditRelationsViaFile(ProModelitem *item)
{
    ProRelset relset;
    ProWstring *rels_original;
    ProWstring *rels_edited;
    ProPath rels_file;
    int count;
    ProError status;

    status = ProModelitemToRelset(item, &relset);
    if (status != PRO_TK_NO_ERROR)
        return status;

    /* Get current relations */
    status = ProArrayAlloc(0, sizeof(ProWstring), 1, (ProArray*)&rels_original);
    status = ProRelsetRelationsGet(&relset, &rels_original);

    /* Write to file */
    ProStringToWstring(rels_file, "rels_edit.txt");
    /* ProUtilWstringArrayToFile(rels_original, rels_file); */

    /* Open file for editing */
    status = ProFileEdit(rels_file);

    /* Read edited relations */
    status = ProArrayAlloc(0, sizeof(ProWstring), 1, (ProArray*)&rels_edited);
    /* ProUtilFileToWstringArray(rels_file, &rels_edited); */

    /* Apply new relations */
    status = ProArraySizeGet(rels_edited, &count);
    status = ProRelsetRelationsSet(&relset, rels_edited, count);

    /* Regenerate */
    status = ProRelsetRegenerate(&relset);
    if (status != PRO_TK_NO_ERROR)
    {
        /* Restore original on failure */
        ProArraySizeGet(rels_original, &count);
        ProRelsetRelationsSet(&relset, rels_original, count);
        ProRelsetRegenerate(&relset);
    }

    /* Cleanup */
    ProArrayFree((ProArray*)&rels_original);
    ProArrayFree((ProArray*)&rels_edited);

    return status;
}
```

### Custom Relation Functions

Register external functions for use in relations:

```c
#include <ProRelSet.h>
#include <ProParamval.h>

static double stored_value_a = 0.0;
static double stored_value_b = 0.0;

/* Write function - for LHS of relations */
ProError MyRelSetFunction(ProRelset *relset, ProMdl mdl,
                          char *func_name, ProParamvalue *args,
                          ProParamvalue *input, ProAppData data)
{
    if (input->type != PRO_PARAM_DOUBLE)
        return PRO_TK_GENERAL_ERROR;

    if (strcmp(func_name, "my_set_a") == 0)
    {
        stored_value_a = input->value.d_val;
        return PRO_TK_NO_ERROR;
    }
    if (strcmp(func_name, "my_set_b") == 0)
    {
        stored_value_b = input->value.d_val;
        return PRO_TK_NO_ERROR;
    }

    return PRO_TK_GENERAL_ERROR;
}

/* Read function - for RHS of relations */
ProError MyRelGetFunction(ProRelset *relset, ProMdl mdl,
                          char *func_name, ProParamvalue *args,
                          ProAppData data, ProParamvalue *result)
{
    double x = args[0].value.d_val;

    result->type = PRO_PARAM_DOUBLE;
    result->value.d_val = stored_value_a * x + stored_value_b;

    return PRO_TK_NO_ERROR;
}

/* Register functions */
ProError RegisterRelationFunctions()
{
    ProRelfuncArg *args_array;
    ProError status;

    /* Register set functions (no arguments needed) */
    status = ProRelationFunctionRegister("my_set_a", NULL,
        NULL, MyRelSetFunction, NULL, PRO_B_TRUE, NULL);

    status = ProRelationFunctionRegister("my_set_b", NULL,
        NULL, MyRelSetFunction, NULL, PRO_B_TRUE, NULL);

    /* Register get function with one double argument */
    ProArrayAlloc(1, sizeof(ProRelfuncArg), 1, (ProArray*)&args_array);
    args_array[0].type = PRO_PARAM_DOUBLE;
    args_array[0].attributes = PRO_RELF_ATTR_NONE;

    status = ProRelationFunctionRegister("my_calc", args_array,
        MyRelGetFunction, NULL, NULL, PRO_B_FALSE, NULL);

    return PRO_TK_NO_ERROR;
}
```

## Parameter Operations

### Creating Parameters

```c
#include <ProParameter.h>

ProError CreateDoubleParameter(ProMdl model, const char *name, double value)
{
    ProModelitem model_item;
    ProParameter param;
    ProParamvalue pval;
    wchar_t wname[PRO_NAME_SIZE];
    ProError status;

    ProMdlToModelitem(model, &model_item);
    ProStringToWstring(wname, (char*)name);

    pval.type = PRO_PARAM_DOUBLE;
    pval.value.d_val = value;

    status = ProParameterCreate(&model_item, wname, &pval, &param);
    return status;
}

ProError CreateStringParameter(ProMdl model, const char *name, const char *value)
{
    ProModelitem model_item;
    ProParameter param;
    ProParamvalue pval;
    wchar_t wname[PRO_NAME_SIZE];
    ProError status;

    ProMdlToModelitem(model, &model_item);
    ProStringToWstring(wname, (char*)name);

    pval.type = PRO_PARAM_STRING;
    ProStringToWstring(pval.value.s_val, (char*)value);

    status = ProParameterCreate(&model_item, wname, &pval, &param);
    return status;
}
```

### Getting/Setting Parameter Values

```c
ProError GetParameterValue(ProMdl model, const char *name, ProParamvalue *value)
{
    ProModelitem model_item;
    ProParameter param;
    wchar_t wname[PRO_NAME_SIZE];
    ProError status;

    ProMdlToModelitem(model, &model_item);
    ProStringToWstring(wname, (char*)name);

    status = ProParameterInit(&model_item, wname, &param);
    if (status != PRO_TK_NO_ERROR)
        return status;

    status = ProParameterValueGet(&param, value);
    return status;
}

ProError SetParameterValue(ProMdl model, const char *name, ProParamvalue *value)
{
    ProModelitem model_item;
    ProParameter param;
    wchar_t wname[PRO_NAME_SIZE];
    ProError status;

    ProMdlToModelitem(model, &model_item);
    ProStringToWstring(wname, (char*)name);

    status = ProParameterInit(&model_item, wname, &param);
    if (status == PRO_TK_E_NOT_FOUND)
    {
        /* Create if doesn't exist */
        status = ProParameterCreate(&model_item, wname, value, &param);
    }
    else if (status == PRO_TK_NO_ERROR)
    {
        status = ProParameterValueSet(&param, value);
    }

    return status;
}
```

### Parameters with Units

```c
ProError CreateParameterWithUnits(ProModelitem *owner, const char *name,
                                   double value, const char *unit_name)
{
    ProParameter param;
    ProParamvalue pval;
    ProUnititem unit;
    wchar_t wname[PRO_NAME_SIZE];
    ProError status;

    ProStringToWstring(wname, (char*)name);
    ProStringToWstring(unit.name, (char*)unit_name);

    pval.type = PRO_PARAM_DOUBLE;
    pval.value.d_val = value;

    status = ProParameterWithUnitsCreate(owner, wname, &pval, &unit, &param);
    return status;
}
```

### Feature Label Parameter

```c
ProError LabelFeature(ProFeature *feature, const char *param_name, 
                      const char *label_value)
{
    ProModelitem model_item;
    ProParameter param;
    ProParamvalue value;
    wchar_t wname[PRO_NAME_SIZE];
    ProError status;

    model_item.type = PRO_FEATURE;
    model_item.id = feature->id;
    model_item.owner = feature->owner;

    ProStringToWstring(wname, (char*)param_name);

    value.type = PRO_PARAM_STRING;
    ProStringToWstring(value.value.s_val, (char*)label_value);

    /* Check if parameter exists */
    status = ProParameterInit(&model_item, wname, &param);

    if (status == PRO_TK_E_NOT_FOUND)
    {
        status = ProParameterWithUnitsCreate(&model_item, wname, &value, 
                                             NULL, &param);
    }
    else
    {
        status = ProParameterValueWithUnitsSet(&param, &value, NULL);
    }

    return status;
}
```

## Material Operations

### Reading Material from File

```c
#include <ProMaterial.h>

ProError ReadMaterialFile(ProPart part, const wchar_t *material_name)
{
    ProError status;

    status = ProMaterialfileRead(part, (wchar_t*)material_name);
    return status;
}
```

### Getting Material Properties

```c
ProError GetMaterialProperties(ProPart part, const wchar_t *material_name)
{
    ProMaterialItem material_item;
    ProParamvalue mtl_type, mtl_density;
    ProUnititem units;
    ProPath unit_expression;
    ProError status;

    /* Initialize material item */
    status = ProModelitemByNameInit(part, PRO_RP_MATERIAL, 
                                    (wchar_t*)material_name, &material_item);
    if (status != PRO_TK_NO_ERROR)
        return status;

    /* Get material type */
    status = ProMaterialPropertyGet(&material_item, PRO_MATPROP_TYPE,
                                    &mtl_type, &units);

    /* Get density */
    status = ProMaterialPropertyGet(&material_item, PRO_MATPROP_MASS_DENSITY,
                                    &mtl_density, &units);

    /* Get unit expression for display */
    status = ProUnitExpressionGet(&units, unit_expression);

    ProTKPrintf("Material density: %f %ws\n", 
                mtl_density.value.d_val, unit_expression);

    return PRO_TK_NO_ERROR;
}
```

### Assigning Material to Part

```c
ProError AssignMaterial(ProPart part, const wchar_t *material_name)
{
    ProMaterial material;
    ProError status;

    material.part = part;
    ProWstringCopy((wchar_t*)material_name, material.matl_name, PRO_VALUE_UNUSED);

    status = ProMaterialCurrentSet(&material);
    return status;
}
```

### Creating Material Programmatically

```c
ProError CreateNonlinearMaterial(ProMdl mdl, const char *name)
{
    ProMaterialItem mat_item;
    ProMaterial material;
    ProParamvalue value;
    ProName wname;
    ProError status;

    ProStringToWstring(wname, (char*)name);

    /* Create the material */
    status = ProMaterialCreate(mdl, wname, NULL, &material);
    if (status != PRO_TK_NO_ERROR)
        return status;

    /* Get material item handle */
    status = ProModelitemByNameInit(mdl, PRO_RP_MATERIAL, wname, &mat_item);

    /* Set material type */
    value.type = PRO_PARAM_INTEGER;
    value.value.i_val = PRO_MATERIAL_TYPE_STRUCTURAL_ISOTROPIC |
                        PRO_MATERIAL_TYPE_THERMAL_ISOTROPIC;
    status = ProMaterialPropertySet(&mat_item, PRO_MATPROP_TYPE, &value, NULL);

    /* Set density */
    value.type = PRO_PARAM_DOUBLE;
    value.value.d_val = 7850.0;  /* kg/m^3 */
    status = ProMaterialPropertySet(&mat_item, PRO_MATPROP_MASS_DENSITY, 
                                    &value, NULL);

    /* Set description */
    value.type = PRO_PARAM_STRING;
    ProStringToWstring(value.value.s_val, "Custom Steel Material");
    status = ProMaterialPropertySet(&mat_item, PRO_MATPROP_MATERIAL_DESCRIPTION,
                                    &value, NULL);

    /* Set other properties as needed... */

    return PRO_TK_NO_ERROR;
}
```

### Setting Material Properties

Helper functions for different property types:

```c
ProError SetMaterialIntProperty(ProMaterialItem *mat_item,
                                ProMaterialPropertyType type, int value)
{
    ProParamvalue pval;
    pval.type = PRO_PARAM_INTEGER;
    pval.value.i_val = value;
    return ProMaterialPropertySet(mat_item, type, &pval, NULL);
}

ProError SetMaterialDoubleProperty(ProMaterialItem *mat_item,
                                   ProMaterialPropertyType type, double value)
{
    ProParamvalue pval;
    ProParamvalue old_val;
    ProUnititem units;
    ProError status;

    pval.type = PRO_PARAM_DOUBLE;
    pval.value.d_val = value;

    /* Try to preserve existing units */
    status = ProMaterialPropertyGet(mat_item, type, &old_val, &units);
    if (status == PRO_TK_E_NOT_FOUND)
        return ProMaterialPropertySet(mat_item, type, &pval, NULL);
    else
        return ProMaterialPropertySet(mat_item, type, &pval, &units);
}

ProError SetMaterialStringProperty(ProMaterialItem *mat_item,
                                   ProMaterialPropertyType type, 
                                   const wchar_t *value)
{
    ProParamvalue pval;
    pval.type = PRO_PARAM_STRING;
    ProWstringCopy((wchar_t*)value, pval.value.s_val, PRO_VALUE_UNUSED);
    return ProMaterialPropertySet(mat_item, type, &pval, NULL);
}

ProError SetMaterialBoolProperty(ProMaterialItem *mat_item,
                                 ProMaterialPropertyType type, ProBoolean value)
{
    ProParamvalue pval;
    pval.type = PRO_PARAM_BOOLEAN;
    pval.value.l_val = value;
    return ProMaterialPropertySet(mat_item, type, &pval, NULL);
}
```

### Material Property Types

Common material property types from `ProMaterial.h`:

```c
/* Basic properties */
PRO_MATPROP_TYPE                      /* Material type (integer) */
PRO_MATPROP_MATERIAL_DESCRIPTION      /* Description (string) */
PRO_MATPROP_MASS_DENSITY              /* Density (double) */

/* Thermal properties */
PRO_MATPROP_THERMAL_EXPANSION_COEFFICIENT
PRO_MATPROP_SPECIFIC_HEAT
PRO_MATPROP_THERMAL_CONDUCTIVITY

/* Mechanical properties */
PRO_MATPROP_TENSILE_YIELD_STRESS
PRO_MATPROP_FAILURE_CRITERION_TYPE
PRO_MATPROP_FATIGUE_TYPE

/* Nonlinear model properties */
PRO_MATPROP_MODEL                     /* Model type string */
PRO_MATPROP_SUB_TYPE                  /* Sub-type string */
PRO_MATPROP_MODEL_DEF_BY_TESTS        /* Boolean */
PRO_MATPROP_MODEL_COEF_C01            /* Polynomial coefficients */
PRO_MATPROP_MODEL_COEF_C10
PRO_MATPROP_MODEL_COEF_C20
PRO_MATPROP_MODEL_COEF_D1

/* Visual properties */
PRO_MATPROP_XHATCH_FILE               /* Cross-hatch pattern file */
```

### Material Type Constants

```c
/* Material structural types */
PRO_MATERIAL_TYPE_STRUCTURAL_ISOTROPIC
PRO_MATERIAL_TYPE_STRUCTURAL_ORTHOTROPIC
PRO_MATERIAL_TYPE_STRUCTURAL_TRANSVERSE_ISOTROPIC

/* Material thermal types */
PRO_MATERIAL_TYPE_THERMAL_ISOTROPIC
PRO_MATERIAL_TYPE_THERMAL_ORTHOTROPIC

/* Combine with bitwise OR */
int combined_type = PRO_MATERIAL_TYPE_STRUCTURAL_ISOTROPIC |
                    PRO_MATERIAL_TYPE_THERMAL_ISOTROPIC;

/* Model types (strings) */
PRO_MATERIAL_MODEL_POLYNOMIAL
PRO_MATERIAL_SUB_TYPE_HYPERELASTIC

/* Failure criterion types */
PRO_MATERIAL_FAILURE_DISTORTION_ENERGY

/* Fatigue types */
PRO_MATERIAL_FATIGUE_TYPE_NONE
```

## Mass Properties

### Getting Part Mass Properties

```c
#include <ProSolid.h>
#include <ProMdlUnits.h>

ProError GetPartMassProperties(ProPart part)
{
    ProMassProperty mass_props;
    ProUnitsystem unit_system;
    ProUnitsystemType sys_type;
    ProUnititem mass_unit;
    double density;
    ProError status;

    /* Check if density is set */
    status = ProPartDensityGet(part, &density);
    if (status != PRO_TK_NO_ERROR)
    {
        ProTKPrintf("Part has no density assigned\n");
        return status;
    }

    /* Get mass properties using default csys */
    status = ProSolidMassPropertyGet(part, NULL, &mass_props);
    if (status != PRO_TK_NO_ERROR)
        return status;

    /* Get unit system */
    status = ProMdlPrincipalunitsystemGet(part, &unit_system);
    ProUnitsystemTypeGet(&unit_system, &sys_type);

    if (sys_type == PRO_UNITSYSTEM_MLT)
    {
        ProUnitsystemUnitGet(&unit_system, PRO_UNITTYPE_MASS, &mass_unit);
        ProTKPrintf("Mass: %f %ws\n", mass_props.mass, mass_unit.name);
    }
    else
    {
        /* Force/Length/Time system - calculate equivalent mass units */
        ProUnititem force_unit, time_unit, length_unit;
        ProUnitsystemUnitGet(&unit_system, PRO_UNITTYPE_FORCE, &force_unit);
        ProUnitsystemUnitGet(&unit_system, PRO_UNITTYPE_TIME, &time_unit);
        ProUnitsystemUnitGet(&unit_system, PRO_UNITTYPE_LENGTH, &length_unit);
        
        ProTKPrintf("Mass: %f %ws*%ws^2/%ws\n", mass_props.mass,
                    force_unit.name, time_unit.name, length_unit.name);
    }

    /* Other mass properties */
    ProTKPrintf("Volume: %f\n", mass_props.volume);
    ProTKPrintf("Surface area: %f\n", mass_props.surface_area);
    ProTKPrintf("Center of gravity: (%f, %f, %f)\n",
                mass_props.center_of_gravity[0],
                mass_props.center_of_gravity[1],
                mass_props.center_of_gravity[2]);

    return PRO_TK_NO_ERROR;
}
```
