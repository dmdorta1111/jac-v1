# GUI Element Specifications Reference

## BEGIN_GUI_DESCR Block

The GUI block defines the user interface that appears before script execution. Elements are displayed in order of definition.

## User Input Parameters

### USER_INPUT_PARAM
Text entry field for user input:
```
USER_INPUT_PARAM type name [REQUIRED] [ON_PICTURE x y]
```

Types: `INTEGER`, `DOUBLE`, `STRING`

```
USER_INPUT_PARAM DOUBLE WIDTH REQUIRED
USER_INPUT_PARAM STRING DESCRIPTION
USER_INPUT_PARAM INTEGER COUNT ON_PICTURE 100 50
USER_INPUT_PARAM DOUBLE HEIGHT REQUIRED ON_PICTURE 200 100
```

### SHOW_PARAM
Display-only parameter (read-only):
```
SHOW_PARAM type name [ON_PICTURE x y]
```

```
SHOW_PARAM DOUBLE CALCULATED_LENGTH ON_PICTURE 150 200
SHOW_PARAM INTEGER TOTAL_COUNT
SHOW_PARAM STRING STATUS ON_PICTURE 50 300
```

## Selection Controls

### USER_SELECT
Single reference selection:
```
USER_SELECT type name [ON_PICTURE x y] [FILTER_REF filter_array]
```

Types: `PLANE`, `CURVE`, `CSYS`, `FEATURE`, `COMPONENT`, `SURFACE`, `AXIS`, `POINT`, `EDGE`, `QUILT`

```
USER_SELECT PLANE BASE_TOP ON_PICTURE 100 50
USER_SELECT CURVE FRONT_CURVE
USER_SELECT CSYS ATTACH_CSYS
USER_SELECT FEATURE SECTION_SKEL
USER_SELECT CURVE MY_CURVE FILTER_REF valid_curves_array
```

### USER_SELECT_OPTIONAL
Optional single selection (can skip):
```
USER_SELECT_OPTIONAL type name [ON_PICTURE x y]
```

```
USER_SELECT_OPTIONAL PLANE ALT_BASE_TOP
USER_SELECT_OPTIONAL CSYS OVERRIDE_CSYS
```

### USER_SELECT_MULTIPLE
Multi-select with optional limit:
```
USER_SELECT_MULTIPLE type limit array [FILTER_REF filter] [FILTER_FEAT feat_filter]
```

Limit: `-1` = unlimited, positive number = max count

```
USER_SELECT_MULTIPLE COMPONENT -1 SELECTED_COMPS
USER_SELECT_MULTIPLE FEATURE 5 SELECTED_FEATS
USER_SELECT_MULTIPLE COMPONENT 1 SKELS
USER_SELECT_MULTIPLE FEATURE_TYPE "GROUP_HEAD" -1 GROUPS FILTER_FEAT allFeats
```

## Checkbox and Radio Button Controls

### CHECKBOX_PARAM
Boolean toggle (0/1):
```
CHECKBOX_PARAM INTEGER name ["label"] [ON_PICTURE x y]
```

```
CHECKBOX_PARAM INTEGER ALL_SS "Y/N"
CHECKBOX_PARAM INTEGER LIGHTS "Y/N" ON_PICTURE 20 130
CHECKBOX_PARAM INTEGER ENABLE_FEATURE
CHECKBOX_PARAM INTEGER DONE
```

### RADIOBUTTON_PARAM
Mutually exclusive options (0-indexed):
```
RADIOBUTTON_PARAM INTEGER name "Option0" "Option1" "Option2" ... [ON_PICTURE x y]
```

```
RADIOBUTTON_PARAM INTEGER REFRIGERANT_ "134A" "404" ON_PICTURE 20 40

RADIOBUTTON_PARAM INTEGER SECTION_TYPE "0 = OPEN" \
                                       "1 = AMBIENT" \
                                       "2 = REFRIGERATED" \
                                       "3 = SLIDING DOORS" \
                                       "4 = ACCESS"

RADIOBUTTON_PARAM INTEGER FRONT_LEG "NONE" "BF" "FLANGED BF" "SQ W-BF"
```

## Image Display

### GLOBAL_PICTURE
Background image for entire GUI:
```
GLOBAL_PICTURE path
```

```
GLOBAL_PICTURE lib:Images\\background.gif
GLOBAL_PICTURE GIF_DIR+ReferatorTemplate.gif
```

### SUB_PICTURE
Overlay image at position:
```
SUB_PICTURE path x y
```

```
SUB_PICTURE lib:Images\\detail.gif 200 100
SUB_PICTURE GIF_DIR+iso_perf.gif 200 0
SUB_PICTURE GIF_DIR+elev_ref_mullion_1.gif 250 ELEVY-10
```

## Measurements

### MEASURE_LENGTH
Get curve length:
```
MEASURE_LENGTH curve output_var
```

```
USER_SELECT CURVE FRONT_CURVE
MEASURE_LENGTH FRONT_CURVE FRONT_CURVE_LENGTH
SHOW_PARAM DOUBLE FRONT_CURVE_LENGTH ON_PICTURE 35 630
```

### MEASURE_DISTANCE
Get distance between references:
```
MEASURE_DISTANCE ref1 ref2 output_var
```

```
USER_SELECT PLANE BASE_BOTTOM ON_PICTURE 1450 425
USER_SELECT PLANE BASE_TOP ON_PICTURE 1450 400
MEASURE_DISTANCE BASE_BOTTOM BASE_TOP BODY_HEIGHT
SHOW_PARAM DOUBLE BODY_HEIGHT ON_PICTURE 10 520
```

## Conditional GUI Elements

GUI elements can be conditionally displayed:
```
IF SECTION_TYPE == 1 OR SECTION_TYPE == 4
    RADIOBUTTON_PARAM INTEGER SHELF_BOTTOM "0 = NONE" "1 = FIXED" "2 = REMOVABLE"
END_IF

IF DOORS == 1 AND SECTION_TYPE <> 0
    CHECKBOX_PARAM INTEGER HEATED "Y/N"
ELSE
    HEATED = 0
END_IF

IF USE_OPENING == 1
    USER_INPUT_PARAM DOUBLE FRONT_OPENING_HEIGHT ON_PICTURE 170 555
END_IF
```

## Dynamic Image Display

Change images based on selections:
```
IF MULLION_TYPE_1 == 0
    SUB_PICTURE GIF_DIR+elev_ref_mullion_0.gif 250 ELEVY-10
ELSE_IF MULLION_TYPE_1 == 1
    SUB_PICTURE GIF_DIR+elev_ref_mullion_1.gif 250 ELEVY-10
ELSE_IF MULLION_TYPE_1 == 2
    SUB_PICTURE GIF_DIR+elev_ref_mullion_2.gif 250 ELEVY-10
END_IF
```

## Calculations in GUI

Perform calculations that update displayed values:
```
IS_APRON = (APRON+1.1875)-(WRAPPER_RECESS+LINER_TOP)
SHOW_PARAM DOUBLE IS_APRON ON_PICTURE 170 490

FRONT_1 = OPENING_1_LENGTH + OVERLAP_1L + OVERLAP_1R
SHOW_PARAM DOUBLE FRONT_1 ON_PICTURE 400 DIMY + 10

OA_LENGTH = LEFT_INSULATION + LINER_MULLION_1_LENGTH + OPENING_1_LENGTH + RIGHT_INSULATION
SHOW_PARAM DOUBLE OA_LENGTH ON_PICTURE 35 645
```

## GUI Position Variables

Use variables for flexible positioning:
```
DECLARE_VARIABLE INTEGER PLANY 196
DECLARE_VARIABLE INTEGER ELEVY 435
DECLARE_VARIABLE INTEGER DIMY 635

SHOW_PARAM DOUBLE LENGTH ON_PICTURE 258 DIMY-5
SUB_PICTURE GIF_DIR+EVAP1 250 PLANY
RADIOBUTTON_PARAM INTEGER TYPE "A" "B" ON_PICTURE 255 DIMY + 40
```

## CONFIG_ELEM Command

Display GUI and wait for user input (in BEGIN_ASM_DESCR):
```
CONFIG_ELEM
```

Can be called multiple times for multi-stage input:
```
! First configuration
CONFIG_ELEM

! Process first selections, then show more options
IF SECTION_TYPE == 2
    INCLUDE lib:RefrigeratedBase.tab
END_IF
```

## GUI in WHILE Loop

For repeated user input:
```
DONE = 0
WHILE DONE == 0
    CONFIG_ELEM
    
    IF DONE == 0
        ! Process user selections
        ! ...
    END_IF
END_WHILE
```

## Message Boxes

Display messages during GUI or execution:
```
MESSAGE_BOX "Title" "Message text"
MESSAGE_BOX IMAGE lib:Images\\icon.gif "Message with image"
MESSAGE_BOX IMAGE lib:Images\\Attention.gif "Warning message!\n\nAction required."
```

## Special GUI Separators

Visual separators (decorative):
```
IF SEPERATOR <> 0
    CHECKBOX_PARAM INTEGER ----------------
END_IF
```

## Complete GUI Example

```
BEGIN_GUI_DESCR
    ! Background and reference images
    GLOBAL_PICTURE lib:Images\\BackGroundB.gif
    
    ! Required selections
    USER_SELECT CURVE FRONT_CURVE FILTER_REF FRONT_CRVS
    MEASURE_LENGTH FRONT_CURVE FRONT_CURVE_LENGTH
    SHOW_PARAM DOUBLE FRONT_CURVE_LENGTH
    
    ! Optional selections
    USER_SELECT_OPTIONAL PLANE ALT_BASE_TOP
    
    ! Configuration options
    USER_INPUT_PARAM DOUBLE BODY_THICKNESS
    CHECKBOX_PARAM INTEGER SECTION_SKEL_ONLY "Y/N"
    CHECKBOX_PARAM INTEGER ALL_SS "Y/N"
    
    ! Section type selection with visual indicator
    RADIOBUTTON_PARAM INTEGER SECTION_TYPE "OPEN" "AMBIENT" "REFRIGERATED"
    
    ! Conditional options based on section type
    IF SECTION_TYPE == 1 OR SECTION_TYPE == 2
        CHECKBOX_PARAM INTEGER BACKWALL "Y/N"
        IF BACKWALL == 1
            SUB_PICTURE lib:Images\\BackWall.gif 975 100
        END_IF
    END_IF
    
    ! Display calculated values
    SHOW_PARAM DOUBLE CALCULATED_LENGTH ON_PICTURE 400 200
    
END_GUI_DESCR
```
