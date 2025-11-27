# Common Functions and Patterns Reference

## Application Setup

### Minimal Application
```c
#include "ProToolkit.h"
#include "ProMenuBar.h"

static wchar_t MSGFILE[] = L"myapp.txt";

int user_initialize(int argc, char *argv[], 
                    char *version, char *build,
                    wchar_t err_buff[80])
{
    ProError status;
    
    // Verify wchar_t size
    int proe_wchar_size;
    int my_wchar_size = sizeof(wchar_t);
    if (ProWcharSizeVerify(my_wchar_size, &proe_wchar_size) != PRO_TK_NO_ERROR)
    {
        ProTKSprintf(err_buff, L"wchar_t size mismatch");
        return 1;
    }
    
    // Add menu button
    status = ProMenubarMenuAdd("MyMenu", "MyMenu", "Utilities",
                               PRO_B_TRUE, MSGFILE);
    status = ProMenubarmenuPushbuttonAdd("MyMenu", "MyCommand",
                                         "MyCommand", "MyCommandHelp",
                                         NULL, PRO_B_TRUE, MyCommandAction,
                                         MSGFILE);
    return 0;
}

void user_terminate()
{
    // Cleanup
}
```

### Message File (text/usascii/myapp.txt)
```
MyMenu
#My Menu

MyCommand
#My Command

MyCommandHelp
#Executes my command
```

## Registry File Patterns

### DLL Mode (Production)
```
name MyApplication
startup dll
exec_file C:\MyApp\bin\myapp.dll
text_dir C:\MyApp\text
allow_stop TRUE
end
```

### Spawn Mode (Debug)
```
name MyApplication
startup spawn
exec_file C:\MyApp\bin\myapp.exe
text_dir C:\MyApp\text
allow_stop TRUE
delay_start TRUE
end
```

### Environment Variables in Registry
```
exec_file $MYAPP_HOME/$PRO_MACHINE_TYPE/obj/myapp.dll
text_dir $MYAPP_HOME/text
```

## Feature Collection Pattern

Convert visit function to array collector:
```c
typedef struct {
    ProArray features;
    ProFeattype target_type;
} FeatCollectData;

ProError FeatCollectAction(ProFeature* feature, 
                           ProError status,
                           ProAppData app_data)
{
    FeatCollectData* data = (FeatCollectData*)app_data;
    ProFeattype type;
    
    ProFeatureTypeGet(feature, &type);
    if (type == data->target_type)
    {
        ProArrayObjectAdd(&data->features, PRO_VALUE_UNUSED, 1, feature);
    }
    return PRO_TK_NO_ERROR;
}

ProError CollectFeaturesByType(ProSolid solid, ProFeattype type, 
                               ProFeature** features, int* count)
{
    FeatCollectData data;
    ProError status;
    
    data.target_type = type;
    ProArrayAlloc(0, sizeof(ProFeature), 10, (ProArray*)&data.features);
    
    status = ProSolidFeatVisit(solid, FeatCollectAction, NULL, &data);
    
    ProArraySizeGet(data.features, count);
    *features = (ProFeature*)data.features;
    return PRO_TK_NO_ERROR;
}

// Usage:
// ProFeature* holes;
// int num_holes;
// CollectFeaturesByType(part, PRO_FEAT_HOLE, &holes, &num_holes);
// ... use holes array ...
// ProArrayFree((ProArray*)&holes);
```

## Selection Patterns

### Interactive Selection
```c
ProError SelectSurface(ProSelection* selection)
{
    ProSelection* sel_array;
    int n_sel;
    ProError status;
    
    status = ProSelect("surface", 1, NULL, NULL, NULL, 
                       NULL, &sel_array, &n_sel);
    
    if (status == PRO_TK_NO_ERROR && n_sel > 0)
    {
        ProSelectionCopy(sel_array[0], selection);
        return PRO_TK_NO_ERROR;
    }
    return PRO_TK_USER_ABORT;
}
```

### Selection Options
```c
// Common selection options (first parameter to ProSelect):
"surface"       // Single surface
"edge"          // Single edge
"feature"       // Feature
"part"          // Part
"csys"          // Coordinate system
"datum"         // Any datum
"dtm_pln"       // Datum plane
"dtm_axis"      // Datum axis
"point"         // Datum point
"curve"         // Datum curve
"quilt"         // Quilt
"component"     // Assembly component
"prt_or_asm"    // Part or assembly
```

### Selection with Filter
```c
ProError HoleSurfaceFilter(ProSelection selection, ProAppData app_data)
{
    ProModelitem item;
    ProFeature feature;
    ProFeattype type;
    
    ProSelectionModelitemGet(selection, &item);
    ProGeomitemFeatureGet((ProGeomitem*)&item, &feature);
    ProFeatureTypeGet(&feature, &type);
    
    if (type == PRO_FEAT_HOLE)
        return PRO_TK_NO_ERROR;  // Accept
    return PRO_TK_CONTINUE;      // Reject
}

// Usage
ProSelection* selections;
int n_sel;
ProSelect("surface", 10, NULL, NULL, HoleSurfaceFilter, 
          NULL, &selections, &n_sel);
```

### Pre-populate Selection Buffer
```c
ProError PreselectFeature(ProFeature* feature)
{
    ProSelection sel;
    ProModelitem item;
    
    item.type = PRO_FEATURE;
    item.id = feature->id;
    item.owner = feature->owner;
    
    ProSelectionAlloc(NULL, &item, &sel);
    ProSelbufferSelectionAdd(sel);
    ProSelectionFree(&sel);
    
    return PRO_TK_NO_ERROR;
}
```

## Geometry Evaluation

### Surface Area Calculation
```c
ProError GetTotalSurfaceArea(ProSolid solid, double* total_area)
{
    *total_area = 0.0;
    
    ProSolidSurfaceVisit(solid,
        // Visit action
        [](ProSurface surface, ProError status, ProAppData data) -> ProError {
            double area;
            double* total = (double*)data;
            ProSurfaceAreaEval(surface, &area);
            *total += area;
            return PRO_TK_NO_ERROR;
        },
        NULL, total_area);
    
    return PRO_TK_NO_ERROR;
}
```

### Point on Surface Evaluation
```c
ProError EvaluateSurfacePoint(ProSurface surface, 
                               double u, double v,
                               Pro3dPnt xyz,
                               ProVector normal)
{
    ProUvParam uv;
    ProVector du, dv;
    
    uv[0] = u;
    uv[1] = v;
    
    ProSurfaceXyzdataEval(surface, uv, xyz, du, dv, 
                          NULL, NULL, NULL);
    
    // Calculate normal as cross product of du and dv
    normal[0] = du[1]*dv[2] - du[2]*dv[1];
    normal[1] = du[2]*dv[0] - du[0]*dv[2];
    normal[2] = du[0]*dv[1] - du[1]*dv[0];
    
    // Normalize
    double len = sqrt(normal[0]*normal[0] + 
                      normal[1]*normal[1] + 
                      normal[2]*normal[2]);
    if (len > 0) {
        normal[0] /= len;
        normal[1] /= len;
        normal[2] /= len;
    }
    
    return PRO_TK_NO_ERROR;
}
```

### Edge Length
```c
ProError GetTotalEdgeLength(ProFeature* feature, double* total_length)
{
    *total_length = 0.0;
    
    ProFeatureGeomitemVisit(feature, PRO_EDGE,
        [](ProGeomitem* item, ProError status, ProAppData data) -> ProError {
            ProEdge edge;
            double length;
            double* total = (double*)data;
            
            ProGeomitemToEdge(item, &edge);
            ProEdgeLengthEval(edge, &length);
            *total += length;
            return PRO_TK_NO_ERROR;
        },
        NULL, total_length);
    
    return PRO_TK_NO_ERROR;
}
```

## Parameter Operations

### Read Parameter Value
```c
ProError GetDoubleParameter(ProMdl model, const char* param_name, 
                            double* value)
{
    ProParameter param;
    ProParamvalue pval;
    ProModelitem model_item;
    wchar_t wname[PRO_NAME_SIZE];
    
    ProMdlToModelitem(model, &model_item);
    ProStringToWstring(wname, (char*)param_name);
    
    ProError status = ProParameterInit(&model_item, wname, &param);
    if (status != PRO_TK_NO_ERROR)
        return status;
    
    status = ProParameterValueGet(&param, &pval);
    if (status != PRO_TK_NO_ERROR)
        return status;
    
    if (pval.type == PRO_PARAM_DOUBLE)
        *value = pval.value.dval;
    else
        return PRO_TK_BAD_INPUTS;
    
    return PRO_TK_NO_ERROR;
}
```

### Create/Set Parameter
```c
ProError SetStringParameter(ProMdl model, const char* param_name,
                            const char* value)
{
    ProParameter param;
    ProParamvalue pval;
    ProModelitem model_item;
    wchar_t wname[PRO_NAME_SIZE];
    
    ProMdlToModelitem(model, &model_item);
    ProStringToWstring(wname, (char*)param_name);
    
    pval.type = PRO_PARAM_STRING;
    ProStringToWstring(pval.value.sval, (char*)value);
    
    // Try to get existing parameter
    ProError status = ProParameterInit(&model_item, wname, &param);
    if (status == PRO_TK_E_NOT_FOUND)
    {
        // Create new parameter
        status = ProParameterCreate(&model_item, wname, &pval, &param);
    }
    else if (status == PRO_TK_NO_ERROR)
    {
        // Update existing
        status = ProParameterValueSet(&param, &pval);
    }
    
    return status;
}
```

## Dimension Operations

### Modify Dimension Value
```c
ProError SetDimensionValue(ProFeature* feature, int dim_id, double value)
{
    ProDimension dim;
    ProError status;
    
    ProDimensionInit(feature->owner, dim_id, &dim);
    status = ProDimensionValueSet(&dim, value);
    
    if (status == PRO_TK_NO_ERROR)
    {
        // Regenerate to apply change
        ProSolidRegenerate((ProSolid)feature->owner, PRO_REGEN_NO_FLAGS);
    }
    
    return status;
}
```

### Find Dimension by Symbol
```c
typedef struct {
    wchar_t* target_symbol;
    ProDimension* result;
    ProBoolean found;
} DimSearchData;

ProError DimSearchAction(ProDimension* dim, ProError status, ProAppData data)
{
    DimSearchData* search = (DimSearchData*)data;
    wchar_t symbol[PRO_NAME_SIZE];
    
    ProDimensionSymbolGet(dim, symbol);
    if (wcscmp(symbol, search->target_symbol) == 0)
    {
        *(search->result) = *dim;
        search->found = PRO_B_TRUE;
        return PRO_TK_USER_ABORT;  // Stop searching
    }
    return PRO_TK_NO_ERROR;
}

ProError FindDimensionBySymbol(ProSolid solid, const wchar_t* symbol,
                                ProDimension* dimension)
{
    DimSearchData data;
    data.target_symbol = (wchar_t*)symbol;
    data.result = dimension;
    data.found = PRO_B_FALSE;
    
    ProSolidDimensionVisit(solid, DimSearchAction, NULL, &data);
    
    return data.found ? PRO_TK_NO_ERROR : PRO_TK_E_NOT_FOUND;
}
```

## Assembly Operations

### Traverse Assembly Components
```c
ProError TraverseAssembly(ProAssembly assembly, int level)
{
    ProAsmcomp* components;
    int count;
    ProError status;
    
    status = ProArrayAlloc(0, sizeof(ProAsmcomp), 10, (ProArray*)&components);
    
    // Collect components
    ProSolidFeatVisit((ProSolid)assembly,
        [](ProFeature* feat, ProError s, ProAppData data) -> ProError {
            ProFeattype type;
            ProFeatureTypeGet(feat, &type);
            if (type == PRO_FEAT_COMPONENT)
            {
                ProArrayObjectAdd(data, PRO_VALUE_UNUSED, 1, feat);
            }
            return PRO_TK_NO_ERROR;
        },
        NULL, &components);
    
    ProArraySizeGet((ProArray)components, &count);
    
    for (int i = 0; i < count; i++)
    {
        ProMdl comp_model;
        ProName name;
        ProMdlType type;
        
        ProAsmcompMdlGet(&components[i], &comp_model);
        ProMdlMdlnameGet(comp_model, name);
        ProMdlTypeGet(comp_model, &type);
        
        // Print with indentation
        for (int j = 0; j < level; j++) printf("  ");
        wprintf(L"%s\n", name);
        
        // Recurse into subassemblies
        if (type == PRO_MDL_ASSEMBLY)
        {
            TraverseAssembly((ProAssembly)comp_model, level + 1);
        }
    }
    
    ProArrayFree((ProArray*)&components);
    return PRO_TK_NO_ERROR;
}
```

### Get Component Transform
```c
ProError GetComponentTransform(ProAssembly top_asm, 
                                ProIdTable comp_path, int path_size,
                                ProMatrix transform)
{
    ProAsmcomppath asm_path;
    
    ProAsmcomppathInit((ProSolid)top_asm, comp_path, path_size, &asm_path);
    ProAsmcomppathTrfGet(&asm_path, PRO_B_TRUE, transform);
    
    return PRO_TK_NO_ERROR;
}
```

## File Operations

### Export to STEP
```c
ProError ExportToSTEP(ProSolid solid, const char* filename)
{
    ProPath output_path;
    ProOutputStepData step_data;
    
    ProStringToWstring(output_path, (char*)filename);
    
    ProOutputStepDataInit(&step_data);
    step_data.out_type = PRO_STEP_AP214;
    step_data.configuration = PRO_STEP_PROD_DEF_SHAPE;
    
    return Pro3dExportToStep((ProSolid)solid, output_path, &step_data);
}
```

### Export to IGES
```c
ProError ExportToIGES(ProSolid solid, const char* filename)
{
    ProPath output_path;
    ProOutputIgesData iges_data;
    
    ProStringToWstring(output_path, (char*)filename);
    ProOutputIgesDataInit(&iges_data);
    
    return Pro3dExportToIges(solid, output_path, &iges_data);
}
```

## Notification Callbacks

### Model Save Notification
```c
ProError OnModelSave(ProMdl model, ProAppData data)
{
    ProName name;
    ProMdlMdlnameGet(model, name);
    wprintf(L"Model saved: %s\n", name);
    return PRO_TK_NO_ERROR;
}

// In user_initialize:
ProNotificationSet(PRO_MDL_SAVE, (ProFunction)OnModelSave);
```

### Feature Create Notification
```c
ProError OnFeatureCreate(ProFeature* feature, int action, ProAppData data)
{
    if (action == PRO_FEATURE_CREATE_POST)
    {
        ProFeattype type;
        ProFeatureTypeGet(feature, &type);
        printf("Feature created: type=%d, id=%d\n", type, feature->id);
    }
    return PRO_TK_NO_ERROR;
}

// In user_initialize:
ProNotificationSet(PRO_FEATURE_CREATE, (ProFunction)OnFeatureCreate);
```

## Error Handling Utilities

### Status to String
```c
const char* ProErrorToString(ProError status)
{
    switch (status)
    {
        case PRO_TK_NO_ERROR:        return "NO_ERROR";
        case PRO_TK_GENERAL_ERROR:   return "GENERAL_ERROR";
        case PRO_TK_BAD_INPUTS:      return "BAD_INPUTS";
        case PRO_TK_USER_ABORT:      return "USER_ABORT";
        case PRO_TK_E_NOT_FOUND:     return "NOT_FOUND";
        case PRO_TK_E_FOUND:         return "FOUND";
        case PRO_TK_LINE_TOO_LONG:   return "LINE_TOO_LONG";
        case PRO_TK_CONTINUE:        return "CONTINUE";
        case PRO_TK_BAD_CONTEXT:     return "BAD_CONTEXT";
        case PRO_TK_NOT_IMPLEMENTED: return "NOT_IMPLEMENTED";
        case PRO_TK_OUT_OF_MEMORY:   return "OUT_OF_MEMORY";
        case PRO_TK_COMM_ERROR:      return "COMM_ERROR";
        case PRO_TK_NO_CHANGE:       return "NO_CHANGE";
        case PRO_TK_SUPP_PARENTS:    return "SUPP_PARENTS";
        case PRO_TK_PICK_ABOVE:      return "PICK_ABOVE";
        case PRO_TK_INVALID_FILE:    return "INVALID_FILE";
        case PRO_TK_CANT_WRITE:      return "CANT_WRITE";
        case PRO_TK_INVALID_TYPE:    return "INVALID_TYPE";
        case PRO_TK_INVALID_PTR:     return "INVALID_PTR";
        case PRO_TK_UNAV_SEC:        return "UNAV_SEC";
        case PRO_TK_INVALID_MATRIX:  return "INVALID_MATRIX";
        case PRO_TK_INVALID_NAME:    return "INVALID_NAME";
        case PRO_TK_NOT_EXIST:       return "NOT_EXIST";
        case PRO_TK_CANT_OPEN:       return "CANT_OPEN";
        case PRO_TK_ABORT:           return "ABORT";
        case PRO_TK_NOT_VALID:       return "NOT_VALID";
        case PRO_TK_INVALID_ITEM:    return "INVALID_ITEM";
        case PRO_TK_MSG_NOT_FOUND:   return "MSG_NOT_FOUND";
        case PRO_TK_MSG_NO_TRANS:    return "MSG_NO_TRANS";
        case PRO_TK_MSG_FMT_ERROR:   return "MSG_FMT_ERROR";
        case PRO_TK_MSG_USER_QUIT:   return "MSG_USER_QUIT";
        case PRO_TK_MSG_TOO_LONG:    return "MSG_TOO_LONG";
        case PRO_TK_CANT_ACCESS:     return "CANT_ACCESS";
        case PRO_TK_OBSOLETE_FUNC:   return "OBSOLETE_FUNC";
        case PRO_TK_NO_LICENSE:      return "NO_LICENSE";
        case PRO_TK_BSPL_UNSUITABLE: return "BSPL_UNSUITABLE";
        case PRO_TK_MULTIBODY_UNSUPPORTED: return "MULTIBODY_UNSUPPORTED";
        default:                     return "UNKNOWN";
    }
}
```

### Checked Call Macro
```c
#define PRO_CHECK(call) \
    do { \
        ProError _status = (call); \
        if (_status != PRO_TK_NO_ERROR) { \
            printf("Error %s at %s:%d\n", \
                   ProErrorToString(_status), __FILE__, __LINE__); \
            return _status; \
        } \
    } while(0)

// Usage:
ProError MyFunction()
{
    PRO_CHECK(ProMdlCurrentGet(&model));
    PRO_CHECK(ProSolidRegenerate(model, PRO_REGEN_NO_FLAGS));
    return PRO_TK_NO_ERROR;
}
```
