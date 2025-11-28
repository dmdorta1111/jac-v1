# Excel-to-.tab Variable Mapping Analysis Plan

## Executive Summary

This plan outlines comprehensive analysis of 16+ Excel files used in EMJAC Industries' SmartAssembly component library and their mapping to .tab script variables. Analysis covers complete cell-to-variable mapping, EXCEL_* command patterns, data type conversions, and error handling strategies.

**Scope:** 16 Excel files across 8 functional domains
**Deliverable:** Comprehensive markdown report with mapping tables, workflows, and implementation patterns
**Estimated Research Time:** 4-5 hours for complete analysis

---

## Key Analysis Dimensions

### 1. Excel File Inventory & Purpose
- **Specifications_DB.xlsx** - Product specification mapping (Products, Items sheets)
- **Finish_Color_DB.xlsx** - Finish/color configurations (TYPE, FINISH, RGB, APPEARANCE)
- **Project_Items.xlsx** - Sales order item configuration (multiple subtables)
- **Pub_Geom_Feat_Params.xlsx** - Published geometry/feature parameters
- **Dish_Machines.xlsx** - Dish machine integration parameters
- **Table_Pattern_Data.xlsx** - Pattern data for sheet fabrication
- **Create_Published_Geom.xlsx** - Geometry creation parameters
- **Project_20230810.xlsx**, **Project_20230126.xlsx** - Project/sales order templates
- **Model_Comparison.xlsx** - Component comparison utility
- **COST_TEMPLATE.xlsx** - Cost calculation template (multiple locations)
- **UDF_TEMPLATE.xlsx** - User-defined function template
- **Other project files** - As discovered in scan

### 2. Cell-to-Variable Mapping Categories

#### A. Direct Cell Index Access (Most Common)
```
Pattern: EXCEL_GET_VALUE CELL_BY_INDEX row col variable_name
Example: EXCEL_GET_VALUE CELL_BY_INDEX 2 3 ITEM_DESC
```

Key variables identified:
- **Row-based:** ITEM_NUM, ITEM_QTY, ITEM_DESC, ITEM_TYPE, TYPE, STATUS, HISTORY
- **Column indices:** 0-20+ range, specific to sheet structure
- **Data types:** STRING, INTEGER, DOUBLE, BOOL

#### B. Named Cell Access
```
Pattern: EXCEL_GET_VALUE CELL_BY_NAME "A2" variable_name
Example: EXCEL_GET_VALUE CELL_BY_NAME "B2" JOB_NAME
```

Common named cells:
- A2, B2, C2, D2 (Customer, Job Name, SO Num, All Stainless)
- AC1-AC4, AE1-AE3, AG1-AG3 (Text fields)
- AB*, AC* (Dynamic references with row)

#### C. Range-based Access
```
Pattern: EXCEL_GET_STRINGS CELL_BY_INDEX row1 col1 CELL_BY_INDEX row2 col2 array_name
Example: EXCEL_GET_STRINGS CELL_BY_INDEX 1 0 CELL_BY_INDEX 10 5 ARRAY_HEADERS
```

Used for:
- Header extraction (row 1, all columns)
- Column extraction (specific column, all rows)
- Multi-row/multi-column blocks

#### D. String vs Value Access
```
EXCEL_GET_STRING - Retrieves cell as text (includes trailing spaces)
EXCEL_GET_VALUE  - Retrieves cell with type conversion
```

Data type conversion patterns:
- STRING: Direct retrieval, may use strtrunc() for cleanup
- INTEGER/DOUBLE: Retrieved with EXCEL_GET_VALUE, checked via GET_PARAM_TYPE
- Type conversion: itos(), ftos(), stof(), stob()

### 3. EXCEL Command Workflow Patterns

#### Pattern 1: Load → Activate Sheet → Read Range → Close
```
EXCEL_START [INVISIBLE]
EXCEL_CONNECT [INVISIBLE]
EXCEL_LOAD_DOCUMENT {document_ref}
EXCEL_ACTIVATE_SHEET SHEET_BY_NAME "{sheet_name}"
EXCEL_GET_ACTIVE_RANGE ROW_MIN ROW_MAX COL_MIN COL_MAX
[READ OPERATIONS]
EXCEL_CLOSE_DOCUMENT [SAVE_CHANGES YES/NO]
EXCEL_DISCONNECT
```

**Used in:** Apply_Finish_Colors, Generate_Specifications, Items_Read_Excel

#### Pattern 2: Row Iteration with EOF Detection
```
ROW_MIN++
WHILE ROW_MIN <= ROW_MAX
    EXCEL_GET_VALUE CELL_BY_INDEX ROW_MIN COL VARIABLE
    IF VARIABLE == ""
        BREAK
    END_IF
    [PROCESS ROW]
    ROW_MIN++
END_WHILE
```

**Used in:** Read_Sub_Tables, Items_Excel (row-by-row data extraction)

#### Pattern 3: Buffer Write Operations
```
EXCEL_CLEAR_BUFFER
EXCEL_SET_VALUE_BUFFER row col value
EXCEL_SET_VALUE_BUFFER row col value
[MULTIPLE WRITES]
EXCEL_UPDATE_BUFFER BUFFER_TO_EXCEL
```

**Used in:** Material export, pattern data population

#### Pattern 4: Dynamic Sheet Navigation
```
EXCEL_GET_SHEET_NAMES ARRAY_SHEET_NAMES
FOR EACH_SHEET REF ARRAY ARRAY_SHEET_NAMES
    EXCEL_ACTIVATE_SHEET SHEET_BY_NAME EACH_SHEET
    [PROCESS SHEET]
END_FOR
```

**Used in:** Items_Read_Excel (multi-sheet item processing)

#### Pattern 5: Column Mapping Pattern
```
FOR COL_MIN TO COL_MAX
    EXCEL_GET_VALUE CELL_BY_INDEX 2 COL_MIN HEADER_PARAM
    EXCEL_GET_VALUE CELL_BY_INDEX ROW COL_MIN CELL_VALUE
    ADD_MAP_ELEM TEMP_MAP HEADER_PARAM CELL_VALUE
    COL_MIN++
END_FOR
```

**Used in:** Items_Excel (column-header based mapping)

### 4. Data Type Conversion Patterns

**String Handling:**
```
CELL_VALUE = mkupper(strreplace(CELL_VALUE,".","_",TRUE))
CELL_VALUE = strtrunc(CELL_VALUE)
CELL_VALUE = strreplace(CELL_VALUE,"''","\"",TRUE)
```

**Type Detection & Conversion:**
```
GET_PARAM_TYPE CELL_VALUE CELL_VALUE_TYPE
IF CELL_VALUE_TYPE == INTEGER
    CELL_VALUE = itos(CELL_VALUE)
ELSE_IF CELL_VALUE_TYPE == DOUBLE
    CELL_VALUE = ftos(CELL_VALUE)
END_IF
```

**Type Inference:**
```
IF strfind(ATTRIBUTE_VALUE, "TRUE") <> -1 OR strfind(ATTRIBUTE_VALUE, "FALSE") <> -1
    ATTRIBUTE_VALUE = stob(ATTRIBUTE_VALUE)
ELSE_IF strfind(ATTRIBUTE_VALUE, ".") <> -1 AND strfind(ATTRIBUTE_VALUE, ".prt") == -1
    ATTRIBUTE_VALUE = stof(ATTRIBUTE_VALUE)
END_IF
```

**Delimited String Splitting:**
```
SPLIT_STRING source_string array_name split_char "|"
SPLIT_STRING PROD_ITEMS ARRAY_PROD_ITEMS SPLIT_CHAR "|"
```

### 5. Error Handling Patterns

**Soft Error Catching:**
```
CLEAR_CATCH_ERROR
BEGIN_CATCH_ERROR
    [EXCEL OPERATION OR MODEL SEARCH]
END_CATCH_ERROR

IF ERROR
    [FALLBACK LOGIC]
ELSE
    [PROCESS RESULT]
END_IF
```

**Used for:**
- Missing sheets or cells
- Invalid document references
- Model parameter searches

**Excel Operation Errors:**
- Document not found (EXCEL_LOAD_DOCUMENT fails)
- Sheet not found (EXCEL_ACTIVATE_SHEET)
- Cell access out of range
- File format mismatches (.xlsx vs .xls)

### 6. Variable Declaration Patterns

**Excel Session Variables:**
```
DECLARE_VARIABLE STRING SPECIFICATIONS_DB "Specifications_DB.xlsx"
DECLARE_VARIABLE INTEGER EXCEL_ROW
DECLARE_VARIABLE STRING EXCEL_COMPONENT_NAME
DECLARE_VARIABLE STRING EXCEL_EXT ".xlsx"
```

**Data Storage Structures:**
```
DECLARE_ARRAY ARRAY_EXCEL_PRODUCTS
DECLARE_ARRAY ARRAY_EXCEL_HEADERS
DECLARE_ARRAY ARRAY_EXCEL_ITEMS
DECLARE_MAP STRING ITEMS_VIA_EXCEL_MAP
DECLARE_MAP STRING APPEARANCE_MAP
```

**Row/Column Management:**
```
DECLARE_VARIABLE INTEGER ROW_MIN, ROW_MAX
DECLARE_VARIABLE INTEGER COL_MIN, COL_MAX
DECLARE_VARIABLE INTEGER EXCEL_ROW
DECLARE_VARIABLE INTEGER EXCEL_COLUMN
```

---

## Analysis Research Tasks

### Task 1: Complete File Inventory (1 hour)
**Objective:** Document all 16+ Excel files and their purpose

Steps:
1. List all .xlsx files in SmartAssembly directory tree
2. Document sheet names for each file
3. Identify primary use case (.tab files that reference each)
4. Create inventory table with file size, sheet count, usage frequency

**Deliverable:** Excel File Inventory table with columns:
- Filename
- Location
- Sheet Names
- Primary .tab References
- Purpose/Description
- Row Count (approx)
- Column Count (approx)

### Task 2: Sheet-by-Sheet Mapping (1.5 hours)
**Objective:** Map headers and columns to .tab variables for each sheet

Steps:
1. For each unique sheet name (Products, Items, ITEMS_TABLE, etc.):
   - Identify standard columns/headers
   - Find .tab files that reference this sheet
   - Extract variable names from EXCEL_GET_VALUE calls
   - Document data types expected

2. Create mapping for:
   - Direct column index → variable mappings
   - Named cell references
   - Calculated/derived columns
   - Optional vs required columns

**Deliverable:** Sheet Mapping tables (one per unique sheet type)

### Task 3: EXCEL Command Pattern Documentation (1 hour)
**Objective:** Document all EXCEL_* command usage patterns

Steps:
1. Extract all unique EXCEL command sequences
2. Categorize by operation type (load, read, write, close)
3. Document syntax and parameters
4. Identify command dependencies

**Deliverable:** EXCEL Command Reference with:
- Command name
- Syntax
- Parameters & types
- Return values
- Usage examples from codebase

### Task 4: Data Type & Conversion Mapping (1 hour)
**Objective:** Document data type handling and conversions

Steps:
1. Identify all data type conversions in .tab files
2. Map Excel cell formats → .tab variable types
3. Document string manipulation patterns
4. Document type inference heuristics

**Deliverable:** Data Type Conversion table with:
- Excel Format
- .tab Variable Type
- Conversion Function
- Example Usage

### Task 5: Error Handling & Edge Cases (30 min)
**Objective:** Document error handling patterns

Steps:
1. Identify all error catching blocks
2. Document failure modes
3. Extract error recovery patterns
4. List edge cases observed

**Deliverable:** Error Handling Guide with:
- Error Type
- Detection Pattern
- Recovery Strategy
- Prevention Tips

---

## Detailed Research Questions to Answer

### File Structure Questions
1. What is the complete list of sheet names across all Excel files?
2. Which sheets appear in multiple files (reusable templates)?
3. What is the maximum number of rows and columns per sheet?
4. Are headers always in row 1? Or dynamic?
5. Are there hidden rows or columns affecting active range?

### Variable Mapping Questions
1. Which .tab variables map to which Excel cells?
2. What is the naming convention for arrays vs scalars?
3. Are there any computed/derived variables from Excel?
4. Which variables are required vs optional?
5. What validation is applied to cell values?

### Data Type Questions
1. How are numeric values stored in Excel (formulas vs values)?
2. What encoding is used for special characters?
3. How are dates/times handled in .tab scripts?
4. What happens if cell contains wrong data type?
5. Are there implicit vs explicit type conversions?

### Performance Questions
1. What is the typical read/write volume (rows per file)?
2. Are there performance optimizations (buffering, etc)?
3. What is the impact of INVISIBLE mode on performance?
4. Are there known bottlenecks in Excel operations?

### Integration Questions
1. How are Excel files deployed/updated?
2. What is the file extension handling (.xls vs .xlsx)?
3. Are there version-specific compatibility issues?
4. How are relative vs absolute paths handled?
5. What is the deployment configuration for file locations?

---

## Deliverable Structure

### Final Report: `YYMMDD-Excel_to_Tab_Variable_Mapping.md`

**Sections:**
1. Executive Summary
2. Excel File Inventory (with table)
3. Sheet Structure Documentation
4. Cell-to-Variable Mapping Tables (by sheet)
5. EXCEL_* Command Reference
6. Data Type Conversion Guide
7. Error Handling Patterns
8. Workflow Examples
9. Implementation Checklist
10. Appendices (glossary, code snippets, decision trees)

**Success Criteria:**
- All 16+ Excel files documented with sheet names
- All unique sheet types have complete mapping tables
- All EXCEL_* commands documented with examples
- All data type conversions explained
- Error handling patterns extracted
- Workflow decision trees provided
- Actionable implementation guidance included

---

## Resource References

**Key .tab Files to Analyze:**
- `/g/SmartAssembly/Library_New/SA_PROD_L/component_engine/EMJAC/Apply_Finish_Colors.tab`
- `/g/SmartAssembly/Library_New/SA_PROD_L/component_engine/EMJAC/Generate_Specifications.tab`
- `/g/SmartAssembly/Library_New/SA_PROD_L/component_engine/EMJAC/Items_Excel.tab`
- `/g/SmartAssembly/Library_New/SA_PROD_L/component_engine/EMJAC/Items_Read_Excel.tab`
- `/g/SmartAssembly/Library_New/SA_PROD_L/component_engine/EMJAC/Read_Sub_Tables.tab`
- `/g/SmartAssembly/Library_New/SA_PROD_L/component_engine/EMJAC/consolidate_*.tab`
- `/g/SmartAssembly/Library_New/SA_PROD_L/component_engine/EMJAC/export_*.tab`

**Key Excel Files to Analyze:**
- All .xlsx files in `/g/SmartAssembly/Library_New/SA_PROD_L/component_engine/EMJAC/`
- All .xlsx files in `/g/SmartAssembly/Library_New/SA_PROD_L/component_engine/EMJAC/Project_Items/Excel/`
- All .xlsx files in `/g/SmartAssembly/Library_New/SA_PROD_L/component_engine/EMJAC/Utilities/Excel/`
- All .xlsx files in `/g/SmartAssembly/Library_New/SA_PROD_L/component_engine/EMJAC/Wall_Panels/Process_WallPanels/Excel/`
- All .xlsx files in `/g/SmartAssembly/Library_New/SA_PROD_L/component_engine/EMJAC/Process/Excel/`

---

## Timeline & Effort Estimation

| Task | Duration | Owner |
|------|----------|-------|
| File Inventory | 1 hour | Claude Research |
| Sheet Mapping | 1.5 hours | Claude Research |
| Command Documentation | 1 hour | Claude Research |
| Data Type Guide | 1 hour | Claude Research |
| Error Handling | 30 min | Claude Research |
| Report Assembly | 1 hour | Claude Code |
| **TOTAL** | **6 hours** | |

---

## Next Steps

1. **Immediate:** Run complete file inventory scan
2. **Phase 1:** Extract sheet names and basic structure
3. **Phase 2:** Map columns to variables for each sheet type
4. **Phase 3:** Document all EXCEL_* command patterns
5. **Phase 4:** Create comprehensive mappings and reference guide
6. **Final:** Assemble comprehensive markdown report with decision trees and implementation examples

**Plan Status:** Ready for execution ✓
