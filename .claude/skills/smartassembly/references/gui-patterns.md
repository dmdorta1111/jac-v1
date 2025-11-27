# SmartAssembly GUI and Table Patterns

## GUI Block Structure

```
BEGIN_GUI_DESCR
    ! Background and images
    GLOBAL_PICTURE lib:Images\\background.gif
    SUB_PICTURE lib:Images\\detail.gif X Y

    ! User inputs and controls
    ! ... 

    ! Conditional content based on selections
    IF condition
        SUB_PICTURE lib:Images\\variant.gif X Y
        USER_INPUT_PARAM DOUBLE specific_value ON_PICTURE X Y
    END_IF
END_GUI_DESCR
```

## Image Commands

### GLOBAL_PICTURE
```
GLOBAL_PICTURE path
```
Sets the main background image for the configuration dialog.

### SUB_PICTURE
```
SUB_PICTURE path X Y
```
Places an image at coordinates X, Y (from top-left of dialog).

### Dynamic Images Based on Selection
```
IF SELECTION_TYPE == 1
    SUB_PICTURE lib:Images\\type1.gif 300 100
ELSE_IF SELECTION_TYPE == 2
    SUB_PICTURE lib:Images\\type2.gif 300 100
END_IF
```

## User Input Elements

### USER_INPUT_PARAM
```
USER_INPUT_PARAM type name [REQUIRED] [ON_PICTURE X Y]
```
- `type`: `INTEGER`, `DOUBLE`, `STRING`
- `REQUIRED`: Forces user to enter value
- `ON_PICTURE X Y`: Position on dialog

### SHOW_PARAM
```
SHOW_PARAM type name [ON_PICTURE X Y]
```
Display-only parameter (calculated or derived values).

### USER_SELECT
```
USER_SELECT type name [FILTER_REF array] [ON_PICTURE X Y]
USER_SELECT_OPTIONAL type name [ON_PICTURE X Y]
USER_SELECT_MULTIPLE type count array_out [FILTER_FEAT array]
```
- `type`: `PLANE`, `CSYS`, `CURVE`, `SURFACE`, `FEATURE`, `COMPONENT`, `DIMENSION`
- `count`: Maximum selections (-1 for unlimited)
- `FILTER_REF`: Restrict to references in array
- `FILTER_FEAT`: Restrict features to those in array

### Checkboxes
```
CHECKBOX_PARAM INTEGER name "label" [ON_PICTURE X Y]
```
Creates boolean (0/1) checkbox. Common pattern: `"Y/N"` label.

### Radio Buttons
```
RADIOBUTTON_PARAM INTEGER name "opt0" "opt1" "opt2" ... [ON_PICTURE X Y]
```
Returns 0-based index of selected option.

## Measurement in GUI

```
BEGIN_GUI_DESCR
    USER_SELECT CURVE my_curve
    MEASURE_LENGTH my_curve curve_length
    SHOW_PARAM DOUBLE curve_length ON_PICTURE 100 200

    USER_SELECT PLANE plane1
    USER_SELECT PLANE plane2
    MEASURE_DISTANCE plane1 plane2 distance
    SHOW_PARAM DOUBLE distance ON_PICTURE 100 220
END_GUI_DESCR
```

## Conditional GUI Elements

GUI elements can be conditional based on previous selections:

```
RADIOBUTTON_PARAM INTEGER SECTION_TYPE "OPEN" "AMBIENT" "REFRIGERATED"

IF SECTION_TYPE == 1    ! AMBIENT
    CHECKBOX_PARAM INTEGER SHELF_BOTTOM "Y/N"
    IF SHELF_BOTTOM == 1
        USER_INPUT_PARAM DOUBLE SHELF_HEIGHT REQUIRED
    END_IF
END_IF

IF SECTION_TYPE == 2    ! REFRIGERATED
    USER_INPUT_PARAM DOUBLE INSULATION_THICKNESS REQUIRED
END_IF
```

## CONFIG_ELEM

```
CONFIG_ELEM [width height]
```
Launches the configuration dialog. Must appear after all GUI elements are defined.
- Without dimensions: Uses default size
- With dimensions: Sets dialog size in pixels

## Table Configuration Block

### Basic Table Structure
```
BEGIN_TAB_DESCR

BEGIN_TABLE table_name "Display Title"
TABLE_OPTION options...
column_headers...
column_types...
data_row_1
data_row_2
...
END_TABLE

END_TAB_DESCR
```

### TABLE_OPTION Values
- `FILTER_COLUMN n` - Filter rows by column n matching current values
- `TABLE_HEIGHT n` - Maximum visible rows
- `DEPEND_ON_INPUT` - Table depends on prior inputs
- `INVALIDATE_ON_UNSELECT` - Clear selection when unselected
- `SHOW_AUTOSEL` - Automatically show when selected

### Column Headers
```
SEL_STRING  PARAM1      PARAM2      STABLE
```
- `SEL_STRING`: Selection column (user picks row by this value)
- Parameter names for each column
- `STABLE`: Next table to show (chained tables)

### Column Types
```
STRING      INTEGER     DOUBLE      SUBTABLE
```
Must match header count exactly.

### Data Rows
```
"Option A"  1           12.5        NEXT_TABLE
"Option B"  2           NO_VALUE    NO_VALUE
```
- `NO_VALUE`: No value (null/empty)
- Table name: Links to subtable for chaining

## Table Chaining Pattern

Tables can chain to show progressive drill-down:

```
BEGIN_TAB_DESCR

BEGIN_TABLE STYLE "Select Style"
TABLE_OPTION INVALIDATE_ON_UNSELECT
SEL_STRING  STYLE_CODE  STABLE
STRING      INTEGER     SUBTABLE
Standard    1           MATERIAL_
Premium     2           MATERIAL_
END_TABLE

BEGIN_TABLE MATERIAL_ "Select Material"
TABLE_OPTION INVALIDATE_ON_UNSELECT DEPEND_ON_INPUT
SEL_STRING  STYLE_CODE  MAT_TYPE    STABLE
STRING      INTEGER     INTEGER     SUBTABLE
Steel       1           1           SIZE_
Aluminum    1           2           SIZE_
Steel       2           1           SIZE_
Stainless   2           3           SIZE_
END_TABLE

BEGIN_TABLE SIZE_ "Select Size"
TABLE_OPTION INVALIDATE_ON_UNSELECT DEPEND_ON_INPUT
SEL_STRING  MAT_TYPE    WIDTH       LENGTH
STRING      INTEGER     DOUBLE      DOUBLE
Small       1           10.0        20.0
Medium      1           15.0        30.0
Large       1           20.0        40.0
Small       2           12.0        24.0
Large       2           24.0        48.0
END_TABLE

END_TAB_DESCR
```

## Dynamic Image Selection Pattern

Combine tables with dynamic images:

```
BEGIN_GUI_DESCR
    IF DOOR_TYPE == 1
        SUB_PICTURE lib:Images\\hinged_door.gif 100 100
    ELSE_IF DOOR_TYPE == 2
        SUB_PICTURE lib:Images\\sliding_door.gif 100 100
    ELSE_IF DOOR_TYPE == 3
        SUB_PICTURE lib:Images\\access_panel.gif 100 100
    END_IF

    IF DOOR_CONFIG == 1
        SUB_PICTURE lib:Images\\left_hand.gif 300 100
    ELSE_IF DOOR_CONFIG == 2
        SUB_PICTURE lib:Images\\right_hand.gif 300 100
    END_IF
END_GUI_DESCR
```

## Complete Example: Product Configurator

```
BEGIN_GUI_DESCR
    GLOBAL_PICTURE lib:Images\\product_background.gif

    ! Section type selection
    RADIOBUTTON_PARAM INTEGER SECTION_TYPE "OPEN" "AMBIENT" "REFRIGERATED" ON_PICTURE 50 50

    ! Dynamic image based on type
    IF SECTION_TYPE == 0
        SUB_PICTURE lib:Images\\open_section.gif 300 100
    ELSE_IF SECTION_TYPE == 1
        SUB_PICTURE lib:Images\\ambient_section.gif 300 100
    ELSE_IF SECTION_TYPE == 2
        SUB_PICTURE lib:Images\\refrig_section.gif 300 100
    END_IF

    ! Required inputs
    USER_INPUT_PARAM STRING SECTION_ID REQUIRED ON_PICTURE 50 100
    USER_SELECT CURVE FRONT_CURVE ON_PICTURE 50 130
    MEASURE_LENGTH FRONT_CURVE SECTION_LENGTH
    SHOW_PARAM DOUBLE SECTION_LENGTH ON_PICTURE 200 130

    ! Conditional options
    IF SECTION_TYPE == 1 OR SECTION_TYPE == 2
        CHECKBOX_PARAM INTEGER HAS_SHELVES "Y/N" ON_PICTURE 50 160
        IF HAS_SHELVES == 1
            USER_INPUT_PARAM INTEGER SHELF_QTY REQUIRED ON_PICTURE 200 160
        END_IF
    END_IF

    IF SECTION_TYPE == 2
        CHECKBOX_PARAM INTEGER HAS_COMPRESSOR "Y/N" ON_PICTURE 50 190
    END_IF
END_GUI_DESCR

BEGIN_TAB_DESCR
BEGIN_TABLE OPENING_CONFIG "Opening Configuration"
TABLE_OPTION FILTER_COLUMN 0 TABLE_HEIGHT 6 DEPEND_ON_INPUT INVALIDATE_ON_UNSELECT
SEL_STRING  SECTION_TYPE    OPENING_TYPE    WIDTH       UDF_NAME
STRING      INTEGER         INTEGER         DOUBLE      STRING
LH Door     1               1               18.750      door_lh
RH Door     1               2               18.750      door_rh
Drawers     1               3               23.000      drawer_set
Sliding     2               4               26.750      sliding_door
END_TABLE
END_TAB_DESCR

BEGIN_ASM_DESCR
    ! Variable declarations
    DECLARE_VARIABLE INTEGER SECTION_TYPE 1
    DECLARE_VARIABLE STRING SECTION_ID
    DECLARE_VARIABLE INTEGER HAS_SHELVES 0
    DECLARE_VARIABLE INTEGER SHELF_QTY 1
    DECLARE_VARIABLE INTEGER HAS_COMPRESSOR 0
    DECLARE_VARIABLE DOUBLE SECTION_LENGTH
    
    DECLARE_REFERENCE FRONT_CURVE
    DECLARE_ARRAY FEATURES_TO_GROUP

    ! Launch GUI
    CONFIG_ELEM 800 600

    ! Processing logic follows...
END_ASM_DESCR
```

## GUI Positioning Tips

1. **Coordinate system**: X increases right, Y increases down from top-left
2. **Typical dialog sizes**: 800-1400 width, 600-1000 height
3. **Element spacing**: ~25-30 pixels between rows
4. **Label alignment**: Keep related elements in columns
5. **Image placement**: Use SUB_PICTURE for diagrams near related inputs
