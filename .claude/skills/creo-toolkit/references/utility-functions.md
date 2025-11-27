# Utility Functions Reference

This reference documents the custom utility functions (`ProUtil*`) found in PTC's Pro/TOOLKIT example code. These are **NOT part of the official Pro/TOOLKIT API** but are helper functions built on top of it.

## Important Note

Functions starting with `ProUtil*` from headers like `UtilMath.h`, `UtilMatrix.h`, `UtilMenu.h`, etc. are **custom utility functions** from PTC's example code. They are not documented in the official Pro/TOOLKIT Function Guide. When using example code, you may need to:

1. Include the source files for these utilities
2. Implement equivalent functionality yourself
3. Use the underlying Pro/TOOLKIT API functions directly

## Math Utilities (UtilMath.h)

### Vector Operations

```c
/* Copy vector */
double *ProUtilVectorCopy(double from[3], double to[3]);

/* Cross product */
double *ProUtilVectorCross(double v1[3], double v2[3], double result[3]);

/* Dot product */
double ProUtilVectorDot(double a[3], double b[3]);

/* Normalize vector */
double *ProUtilVectorNormalize(double input[3], double output[3]);

/* Scale vector */
double *ProUtilVectorScale(double scalar, double vector[3], double result[3]);

/* Vector sum */
double *ProUtilVectorSum(double a[3], double b[3], double sum[3]);

/* Vector difference */
double *ProUtilVectorDiff(double a[3], double b[3], double result[3]);

/* Vector length */
double ProUtilVectorLength(double v[3]);

/* Linear combination: result = scalar_a * vector_a + scalar_b * vector_b */
double *ProUtilVectorsLincom(double scalar_a, double vector_a[3],
                             double scalar_b, double vector_b[3],
                             double result[3]);
```

### Distance Calculations

```c
/* Distance between two points */
double ProUtilPointsDist(double p1[3], double p2[3]);

/* Distance from point to line */
double ProUtilPointLineDist(double point[3], double end1[3], double end2[3]);

/* Distance from point to plane */
double ProUtilPointPlaneDist(double point[3], double origin[3], double normal[3]);
```

### Geometric Calculations

```c
/* Plane-line intersection */
double *ProUtilPlaneLineX(double plane_point[3], double plane_normal[3],
                          double line_point[3], double line_dir[3],
                          double x_point[3]);

/* Build transformation matrix from vectors */
ProError ProUtilVectorsToTransf(double x_vector[3], double y_vector[3],
                                 double z_vector[3], double origin[3],
                                 double transform[4][4]);

/* Extract vectors from transformation matrix */
ProError ProUtilTransfToVectors(double transform[4][4],
                                 double x_vector[3], double y_vector[3],
                                 double z_vector[3], double origin[3]);
```

### Common Constants

```c
#define PI          3.14159265358979323846
#define PID2        1.57079632679489661923   /* PI/2 */
#define TWOPI       (PI + PI)
#define EPSM6       1.0e-6                   /* Tolerance */
#define EPSM10      1.0e-10
```

## Matrix Utilities (UtilMatrix.h)

```c
/* Copy matrix */
void ProUtilMatrixCopy(double input[4][4], double output[4][4]);

/* Transform point by matrix */
void ProUtilPointTrans(double m[4][4], double p[3], double output[3]);

/* Transform vector by matrix (ignores translation) */
void ProUtilVectorTrans(double m[4][4], double v[3], double output[3]);

/* Matrix multiplication */
void ProUtilMatrixProduct(double m1[4][4], double m2[4][4], double output[4][4]);

/* Matrix inversion */
int ProUtilMatrixInvert(double m[4][4], double output[4][4]);
```

## Feature Utilities (UtilFeats.h)

```c
/* Dump feature information to file */
void ProUtilFeatureDump(ProModelitem *feature, FILE *fp);

/* Dump feature element tree to file */
void ProUtilFeatureElementsDump(ProModelitem *feature, FILE *fp);

/* Simplified feature creation wrapper */
ProError ProUtilFeatCreate(ProAsmcomppath *p_comp_path, ProMdl model,
                           ProElement pro_e_feature_tree, ProFeature *feature);
```

### ProUtilFeatCreate Implementation Pattern

```c
ProError ProUtilFeatCreate(ProAsmcomppath *p_comp_path, ProMdl model,
                           ProElement elemtree, ProFeature *feature)
{
    ProError status;
    ProModelitem model_item;
    ProSelection model_sel;
    ProErrorlist errors;
    ProFeatureCreateOptions *opts = NULL;

    status = ProMdlToModelitem(model, &model_item);
    status = ProSelectionAlloc(p_comp_path, &model_item, &model_sel);

    status = ProArrayAlloc(1, sizeof(ProFeatureCreateOptions), 1, (ProArray*)&opts);
    opts[0] = PRO_FEAT_CR_DEFINE_MISS_ELEMS;

    status = ProFeatureWithoptionsCreate(model_sel, elemtree,
        opts, PRO_REGEN_NO_FLAGS, feature, &errors);

    ProArrayFree((ProArray*)&opts);
    ProSelectionFree(&model_sel);

    return status;
}
```

## Menu Utilities (UtilMenu.h)

### Menu Button Structure

```c
typedef struct util_menu_buttons {
    ProMenubuttonName button;
    int value;
    int special_flag;
} ProUtilMenuButtons;

/* Special flags */
#define TEST_CALL_PRO_MENU_DELETE       1<<0
#define TEST_CALL_PRO_MENU_HOLD         1<<1
#define TEST_CALL_PRO_MENU_ACTIVATE     1<<2
#define TEST_CALL_PRO_MENU_DEACTIVATE   1<<3
#define TEST_CALL_PRO_MENU_HIGHLIGHT    1<<4
#define TEST_CALL_PRO_MENU_UNHIGHLIGHT  1<<5
#define TEST_CALL_PRO_MENUBUTTON_DELETE 1<<6
```

### Menu Functions

```c
/* Generic menu action handlers */
int ProUtilAssign(ProAppData data, int value);
int ProUtilMenuKill(ProAppData data, int value);

/* Menu button control */
ProError ProUtilMenubuttonHighlight(char *menu, char *menubutton, int enable);
ProError ProUtilMenubuttonActivate(char *menu, char *menubutton, int enable);

/* Create menu and get integer selection */
ProError ProUtilMenuIntValueSelect(ProUtilMenuButtons *buttons_array,
                                    int *output_value);

/* Dynamic menu string management */
ProError ProUtilMenuStringsAlloc(wchar_t ***w_ptr);
ProError ProUtilMenuStringsStrAdd(wchar_t ***w_ptr, char *str);
ProError ProUtilMenuStringsWstrAdd(wchar_t ***w_ptr, wchar_t *w_str);
ProError ProUtilMenuStringsFree(wchar_t ***w_ptr);
ProError ProUtilMenuStringsIntValueSelect(char *menu_name, wchar_t **w_ptr,
                                          int *output_value);
```

## Message Utilities (UtilMessage.h)

```c
/* Printf-style message display */
void ProUtilMsgPrint(const char *ftype, const char *format, ...);

/* Get integer input with range checking */
int ProUtilIntGet(int range[2], int *def, int *input);

/* Get double input with range checking */
int ProUtilDoubleGet(double range[2], double *def, double *input);

/* Get string input */
int ProUtilStringGet(wchar_t *input, wchar_t *def, int max_length);

/* Yes/No prompt */
int ProUtilYesnoGet(char *def);
```

## File Utilities (UtilFiles.h)

```c
/* Generate output file pointer */
FILE *ProUtilGenFilePtr(ProMdl p_obj, char *filext, char *filename, char *permission);

/* Get ProType from string */
ProType ProUtilGetProType(char *type_str);

/* Confirm valid name and type */
int ProUtilConfirmNameType(char *input_name, char *name, ProType *type);

/* Get model type string */
char *ProUtilGetMdlTypeStr(ProMdlType mdltype);

/* Open file selection dialog */
ProError ProUtilFileOpen(char *extension, char *file_name);
```

## Geometry Utilities (UtilGeom.h)

### Surface Mesh Callback

```c
typedef int (*ProUtilMeshAct)(ProSurface *surface, double uv[2],
                              int start, ProAppData app_data);

/* Mesh surface with action at each point */
int ProUtilSurfaceMesh(ProSurface *surface, double resolution,
                       int nlines[2], ProUtilMeshAct action,
                       ProAppData app_data);
```

### Distance Calculations

```c
/* Minimum distance from point to geometry */
int ProUtilPointMindist(ProVector point, ProSelection *item,
                        double *distance, double *closest);

/* Dump geometry item information */
int ProUtilGeomitemDump(FILE *fp, ProSelection *item);
```

## Collection Utilities (UtilCollectDtmpnt.h)

```c
/* Collect all datum points from solid */
ProError ProUtilCollectSolidDtmPnts(ProSolid solid, ProSelection **pp_sel,
                                     int *p_n_pnts);

/* Free selection array */
ProError ProUtilSelectionArrayFree(ProSelection **pp_sel);
```

## Element Tree Utilities

### Adding Elements with Value

```c
/* Utility to add element with integer value */
ProError ProUtilElemtreeElementAdd(ProElement parent, ProElemId elem_id,
                                   int value_type, void *value)
{
    ProElement elem;
    ProValueData value_data;
    ProValue pvalue;
    ProError status;

    status = ProElementAlloc(elem_id, &elem);

    switch (value_type) {
        case ELEM_VALUE_TYPE_INT:
            value_data.type = PRO_VALUE_TYPE_INT;
            value_data.v.i = *(int*)value;
            break;
        case ELEM_VALUE_TYPE_DOUBLE:
            value_data.type = PRO_VALUE_TYPE_DOUBLE;
            value_data.v.d = *(double*)value;
            break;
        case ELEM_VALUE_TYPE_COLLECTION:
            status = ProElementCollectionSet(elem, (ProCollection)value);
            status = ProElemtreeElementAdd(parent, NULL, elem);
            return status;
        /* ... other types ... */
    }

    status = ProValueAlloc(&pvalue);
    status = ProValueDataSet(pvalue, &value_data);
    status = ProElementValueSet(elem, pvalue);
    status = ProElemtreeElementAdd(parent, NULL, elem);

    return status;
}
```

## Color Constants (UtilColor.h)

```c
#define YELLOW       PRO_COLOR_LETTER
#define RED          PRO_COLOR_HIGHLITE
#define WHITE        PRO_COLOR_DRAWING
#define DARK_BLUE    PRO_COLOR_BACKGROUND
#define MEDIUM_GREY  PRO_COLOR_HALF_TONE
#define MEDIUM_BLUE  PRO_COLOR_EDGE_HIGHLIGHT
#define LIGHT_GREY   PRO_COLOR_DIMMED
#define MAGENTA      PRO_COLOR_ERROR
#define CYAN         PRO_COLOR_WARNING
```

## Error Checking Macro (TestError.h)

Standard error checking pattern used in examples:

```c
#define ERROR_CHECK(func, call, status) \
    if (status != PRO_TK_NO_ERROR) { \
        ProTKPrintf("%s: %s returned %d\n", func, call, status); \
    }

/* Usage */
status = ProMdlCurrentGet(&model);
ERROR_CHECK("MyFunction", "ProMdlCurrentGet", status);
```

## Implementing Your Own Utilities

If you need functionality from these utilities, you can either:

1. **Include the source files** from PTC's protoolkit examples directory
2. **Implement equivalent functions** using the official API

### Example: Vector Cross Product

```c
void MyVectorCross(double v1[3], double v2[3], double result[3])
{
    result[0] = v1[1] * v2[2] - v1[2] * v2[1];
    result[1] = v1[2] * v2[0] - v1[0] * v2[2];
    result[2] = v1[0] * v2[1] - v1[1] * v2[0];
}
```

### Example: Matrix Inversion

For matrix operations, consider using a math library or implementing based on standard linear algebra algorithms. The Pro/TOOLKIT API also provides some transformation utilities through `ProAsmcomppath` functions.
