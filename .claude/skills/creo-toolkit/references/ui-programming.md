# UI Programming Reference

## Ribbon and Menu Integration

### Adding Menu to Ribbon
```c
#include "ProMenuBar.h"

static wchar_t MSGFILE[] = L"myapp.txt";

int user_initialize()
{
    // Add menu under existing tab
    ProMenubarMenuAdd("MyTools", "MyTools", "Tools",
                      PRO_B_TRUE, MSGFILE);
    
    // Add pushbutton to menu
    ProMenubarmenuPushbuttonAdd("MyTools", "RunAnalysis",
                                "RunAnalysis", "RunAnalysisHelp",
                                NULL, PRO_B_TRUE, RunAnalysisAction, MSGFILE);
    
    // Add submenu
    ProMenubarmenuMenuAdd("MyTools", "Reports", "Reports",
                          NULL, PRO_B_TRUE, MSGFILE);
    
    // Add item to submenu
    ProMenubarmenuPushbuttonAdd("Reports", "GenerateReport",
                                "GenerateReport", "GenerateReportHelp",
                                NULL, PRO_B_TRUE, GenerateReportAction, MSGFILE);
    return 0;
}
```

### Menu Action Function
```c
uiCmdAccessState MyCommandAccess(uiCmdAccessMode mode)
{
    ProMdl model;
    ProMdlType type;
    
    if (ProMdlCurrentGet(&model) != PRO_TK_NO_ERROR)
        return ACCESS_INVISIBLE;
    
    ProMdlTypeGet(model, &type);
    if (type != PRO_MDL_PART)
        return ACCESS_UNAVAILABLE;
    
    return ACCESS_AVAILABLE;
}

int MyCommandAction(uiCmdCmdId command, uiCmdValue *value,
                    void *appdata)
{
    // Perform command
    return 0;
}
```

### Ribbon Definition File (ribbon_def.xml)
```xml
<?xml version="1.0" encoding="utf-8"?>
<RibbonDefinition>
  <Tab name="MyTab" label_key="MY_TAB_LABEL">
    <Group name="MyGroup" label_key="MY_GROUP_LABEL">
      <Command name="MyCommand" 
               label_key="MY_CMD_LABEL"
               help_key="MY_CMD_HELP"
               icon="my_icon_24.png"/>
    </Group>
  </Tab>
</RibbonDefinition>
```

## Dialog Programming

### Basic Dialog
```c
#include "ProUIDialog.h"
#include "ProUIPushbutton.h"
#include "ProUIInputpanel.h"

ProError ShowMyDialog()
{
    ProError status;
    char dialog_name[] = "my_dialog";
    
    // Load dialog from resource file
    status = ProUIDialogCreate(dialog_name, dialog_name);
    if (status != PRO_TK_NO_ERROR)
        return status;
    
    // Set up OK button action
    ProUIPushbuttonActivateActionSet(dialog_name, "OKButton",
                                     OKButtonAction, NULL);
    
    // Set up Cancel button action
    ProUIPushbuttonActivateActionSet(dialog_name, "CancelButton",
                                     CancelButtonAction, NULL);
    
    // Display dialog (modal)
    status = ProUIDialogActivate(dialog_name, NULL);
    
    // Destroy dialog
    ProUIDialogDestroy(dialog_name);
    
    return status;
}
```

### Dialog Resource File (my_dialog.res)
```
(Dialog my_dialog
    (Components
        (Label TitleLabel)
        (InputPanel ValueInput)
        (PushButton OKButton)
        (PushButton CancelButton)
    )
    (Resources
        (TitleLabel.Label "Enter Value:")
        (ValueInput.Columns 20)
        (OKButton.Label "OK")
        (CancelButton.Label "Cancel")
        (.Width 300)
        (.Height 150)
        (.Title "My Dialog")
    )
)
```

### Dialog Button Actions
```c
void OKButtonAction(char* dialog, char* component, ProAppData data)
{
    wchar_t value[PRO_LINE_SIZE];
    
    // Get input value
    ProUIInputpanelValueGet(dialog, "ValueInput", value);
    
    // Process value...
    
    // Close dialog
    ProUIDialogExit(dialog, PRO_TK_NO_ERROR);
}

void CancelButtonAction(char* dialog, char* component, ProAppData data)
{
    ProUIDialogExit(dialog, PRO_TK_USER_ABORT);
}
```

## Common UI Components

### Input Panel
```c
// Set value
wchar_t value[PRO_LINE_SIZE];
ProStringToWstring(value, "default");
ProUIInputpanelValueSet(dialog, "MyInput", value);

// Get value
ProUIInputpanelValueGet(dialog, "MyInput", value);

// Enable/disable
ProUIInputpanelEnable(dialog, "MyInput");
ProUIInputpanelDisable(dialog, "MyInput");
```

### Checkbox
```c
// Set checked state
ProUICheckbuttonSet(dialog, "MyCheckbox", PRO_B_TRUE);

// Get checked state
ProBoolean checked;
ProUICheckbuttonIsSet(dialog, "MyCheckbox", &checked);

// Set action
ProUICheckbuttonActivateActionSet(dialog, "MyCheckbox",
                                   CheckboxAction, NULL);
```

### Option Menu (Dropdown)
```c
// Set options
wchar_t* labels[] = {L"Option 1", L"Option 2", L"Option 3"};
wchar_t* names[] = {L"opt1", L"opt2", L"opt3"};
ProUIOptionmenuNamesSet(dialog, "MyOption", 3, names);
ProUIOptionmenuLabelsSet(dialog, "MyOption", 3, labels);

// Set selected
ProUIOptionmenuSelectednamesSet(dialog, "MyOption", 1, &names[0]);

// Get selected
wchar_t** selected;
int count;
ProUIOptionmenuSelectednamesGet(dialog, "MyOption", &count, &selected);
```

### List
```c
// Add items
wchar_t* items[] = {L"Item 1", L"Item 2", L"Item 3"};
wchar_t* names[] = {L"item1", L"item2", L"item3"};
ProUIListNamesSet(dialog, "MyList", 3, names);
ProUIListLabelsSet(dialog, "MyList", 3, items);

// Get selection
wchar_t** selected;
int count;
ProUIListSelectednamesGet(dialog, "MyList", &count, &selected);

// Selection action
ProUIListSelectActionSet(dialog, "MyList", ListSelectAction, NULL);
```

### Table
```c
// Set columns
wchar_t* col_names[] = {L"name", L"value", L"type"};
wchar_t* col_labels[] = {L"Name", L"Value", L"Type"};
ProUITableColumnnamesSet(dialog, "MyTable", 3, col_names);
ProUITableColumnlabelsSet(dialog, "MyTable", 3, col_labels);

// Add rows
wchar_t* row_names[] = {L"row1", L"row2"};
ProUITableRownamesSet(dialog, "MyTable", 2, row_names);

// Set cell value
ProUITableCellLabelSet(dialog, "MyTable", L"row1", L"name", L"Part1");

// Get selected row
wchar_t** selected;
int count;
ProUITableSelectednamesGet(dialog, "MyTable", &count, &selected);
```

### Progress Bar
```c
// Show progress bar
ProUIProgressbarShow(L"Processing...", 0, 100);

for (int i = 0; i <= 100; i += 10)
{
    // Update progress
    ProUIProgressbarIntegerSet(i);
    
    // Check for cancel
    ProBoolean cancelled;
    ProUIProgressbarCancelGet(&cancelled);
    if (cancelled) break;
    
    // Do work...
}

// Hide progress bar
ProUIProgressbarHide();
```

## Message Functions

### Display Message
```c
// Information message
ProMessageDisplay(MSGFILE, "INFO_MSG", "param1", "param2");

// In message file:
// INFO_MSG
// #Processing %0s in %1s mode

// Warning dialog
ProUIMessageDialogDisplay(PROUIDIALOG_WARNING,
                          L"Warning",
                          L"This will delete all features",
                          NULL, NULL, NULL);

// Confirmation dialog
ProUIMessageButton* buttons;
int n_buttons;
ProUIMessageDialogDisplay(PROUIDIALOG_QUESTION,
                          L"Confirm",
                          L"Delete selected feature?",
                          &buttons, &n_buttons,
                          &result);
```

### Get User Input
```c
// String input
wchar_t input[PRO_LINE_SIZE];
ProMessageStringRead(PRO_LINE_SIZE, input);

// Double input
double value;
ProMessageDoubleRead(NULL, &value);

// Integer input
int value;
ProMessageIntegerRead(NULL, &value);
```

## Dashboard (Feature Definition UI)

### Basic Dashboard Setup
```c
#include "ProUIDashboard.h"

ProError CreateDashboard()
{
    ProUIDashboard dashboard;
    
    ProUIDashboardCreate("my_feature", &dashboard);
    
    // Add page
    ProUIDashboardPageAdd(dashboard, "MainPage", "main_page");
    
    // Add components to page
    ProUIDashboardInputpanelAdd(dashboard, "MainPage", "ValueInput",
                                "Enter value:", NULL);
    
    // Set OK action
    ProUIDashboardOkActionSet(dashboard, DashboardOKAction, NULL);
    
    // Activate
    ProUIDashboardActivate(dashboard);
    
    return PRO_TK_NO_ERROR;
}
```

## Graphics Display

### Highlight Geometry
```c
ProError HighlightFeature(ProFeature* feature)
{
    ProSelection sel;
    ProModelitem item;
    
    item.type = PRO_FEATURE;
    item.id = feature->id;
    item.owner = feature->owner;
    
    ProSelectionAlloc(NULL, &item, &sel);
    ProSelectionHighlight(sel, PRO_COLOR_HIGHLITE);
    ProSelectionFree(&sel);
    
    return PRO_TK_NO_ERROR;
}

// Unhighlight
ProSelectionUnhighlight(sel);
```

### Draw Temporary Graphics
```c
ProError DrawLine(Pro3dPnt start, Pro3dPnt end)
{
    ProGraphicsLineAttrSet(PRO_GRAPHICS_SOLID_LINE, 2);
    ProGraphicsLine(start, end);
    return PRO_TK_NO_ERROR;
}

ProError DrawPoint(Pro3dPnt point)
{
    ProGraphicsMarkerAttrSet(PRO_MARKER_CIRCLE, 5);
    ProGraphicsMarker(point);
    return PRO_TK_NO_ERROR;
}

ProError DrawText(Pro3dPnt location, wchar_t* text)
{
    ProGraphicsTextAttrSet(PRO_FONT_DEFAULT, 12);
    ProGraphicsText(location, text);
    return PRO_TK_NO_ERROR;
}

// Clear all temporary graphics
ProGraphicsClear();
```

### Display List (Persistent Graphics)
```c
ProError CreateDisplayList(Pro3dPnt* points, int count)
{
    ProDisplist displist;
    
    ProDisplistCreate(&displist);
    ProDisplistStart(displist);
    
    ProGraphicsLineAttrSet(PRO_GRAPHICS_SOLID_LINE, 2);
    
    for (int i = 0; i < count - 1; i++)
    {
        ProGraphicsLine(points[i], points[i+1]);
    }
    
    ProDisplistEnd();
    ProDisplistDisplay(displist);
    
    return PRO_TK_NO_ERROR;
}

// Delete display list
ProDisplistDelete(&displist);
```

## Mouse Input

### Get Mouse Click
```c
ProError GetMousePoint(Pro3dPnt point)
{
    ProSelection* sels;
    int n_sel;
    
    ProError status = ProSelect("any_edge,any_srf", 1, NULL, NULL,
                                NULL, NULL, &sels, &n_sel);
    
    if (status == PRO_TK_NO_ERROR && n_sel > 0)
    {
        ProSelectionPoint3dGet(sels[0], point);
    }
    
    return status;
}
```

### Mouse Position Tracking
```c
ProError OnMouseMotion(ProAppData data, ProDrawAction draw_action,
                       ProMouseButton buttons, ProPoint3d location)
{
    // Update preview based on mouse position
    return PRO_TK_NO_ERROR;
}

// Register
ProMouseTrack(PRO_MOUSE_MOTION, OnMouseMotion, NULL);
```

## Window Management

### Get Current Window
```c
int window_id;
ProWindowCurrentGet(&window_id);
```

### Repaint Window
```c
ProWindowRepaint(window_id);
```

### Refresh All Windows
```c
ProWindowRefresh(PRO_VALUE_UNUSED);
```

### Set View
```c
// Standard views
ProViewDefault(window_id);       // Default orientation
ProViewStore(window_id, "MyView"); // Save current view

// Matrix-based orientation
ProMatrix view_matrix;
// ... set up matrix ...
ProViewMatrixSet(window_id, view_matrix);
```
