# Phase 01: Script Implementation

## Context
- Parent: [plan.md](./plan.md)
- Skill: smartassembly
- Docs: `.claude/skills/smartassembly/SKILL.md`, `references/json-commands.md`

## Overview
| Field | Value |
|-------|-------|
| Date | 2025-11-28 |
| Description | Implement json_variable_creation.tab script |
| Priority | High |
| Implementation Status | Pending |
| Review Status | Pending |

## Key Insights
1. SmartAssembly has no true recursion - must unroll 5 levels manually
2. JSON pointer paths use `/` prefix (e.g., `/fieldName`, `/obj/nested`)
3. FILE_WRITE_LINE adds newline automatically
4. JSON_GET_TYPE returns: STRING, INTEGER, DOUBLE, BOOL, NULL, ARRAY, OBJECT
5. String values need quotes in DECLARE_VARIABLE; numbers/bools don't

## Requirements
1. Detect all `*.json` files in working directory
2. Parse each JSON file up to 5 levels deep
3. Generate temp.tab with DECLARE_VARIABLE for each primitive field
4. Format: `DECLARE_VARIABLE {TYPE} {NAME} {VALUE}`
5. Wrap output in BEGIN_ASM_DESCR / END_ASM_DESCR

## Architecture

### Script Flow
```
1. GET_WORKING_DIRECTORY → WORK_DIR
2. READ_DIRECTORY WORK_DIR "*.json" → JSON_FILES array
3. FOR each JSON_FILE:
   a. JSON_LOAD_DOCUMENT JSON_FILE → JSONDoc
   b. FILE_OPEN WORK_DIR+"\temp.tab" "w" → TEMP_FILE
   c. FILE_WRITE_LINE "BEGIN_ASM_DESCR"
   d. Traverse Level 0 (root members)
      └── Traverse Level 1
          └── Traverse Level 2
              └── Traverse Level 3
                  └── Traverse Level 4
   e. FILE_WRITE_LINE "END_ASM_DESCR"
   f. FILE_CLOSE TEMP_FILE
```

### Type Mapping Logic
```
JSON Type    → SmartAssembly Type → Value Format
STRING       → STRING             → "value"
INTEGER      → INTEGER            → 42
DOUBLE       → DOUBLE             → 19.99
BOOL         → INTEGER            → 1 (TRUE) or 0 (FALSE)
OBJECT       → (recurse)          → N/A
ARRAY        → (recurse elements) → N/A
NULL         → (skip)             → N/A
```

### Variable Name Extraction
From JSON path `/root/nested/fieldName` extract last segment `fieldName`:
- Use `strlastfind(path, "/")` to get last `/` position
- Use `strright(path, len-pos-1)` to extract name

## Related Code Files
- Output: `SmartAssembly/json_variable_creation.tab` (NEW)
- Reference: `.claude/skills/smartassembly/SKILL.md`
- Reference: `.claude/skills/smartassembly/references/json-commands.md`
- Reference: `SmartAssembly/chm-extracted/CMD_FILE_OPEN.htm`
- Reference: `SmartAssembly/chm-extracted/CMD_FILE_WRITE_LINE.htm`
- Reference: `SmartAssembly/chm-extracted/CMD_READ_DIRECTORY.htm`

## Implementation Steps

### Step 1: Script Header & Variable Declarations
```smartassembly
! JSON Variable Creation Script
! Detects JSON files, parses 5 levels, generates temp.tab with DECLARE_VARIABLE

BEGIN_ASM_DESCR

!-----------------------------------------------------------------------
! Variable Declarations
!-----------------------------------------------------------------------
! Strings
DECLARE_VARIABLE STRING WORK_DIR ""
DECLARE_VARIABLE STRING JSON_FILE ""
DECLARE_VARIABLE STRING FIELD_NAME ""
DECLARE_VARIABLE STRING FIELD_TYPE ""
DECLARE_VARIABLE STRING FIELD_VALUE ""
DECLARE_VARIABLE STRING OUTPUT_LINE ""
DECLARE_VARIABLE STRING SA_TYPE ""

! Integers
DECLARE_VARIABLE INTEGER POS 0
DECLARE_VARIABLE INTEGER LEN 0

! Arrays
DECLARE_ARRAY JSON_FILES
DECLARE_ARRAY MEMBERS_L0
DECLARE_ARRAY MEMBERS_L1
DECLARE_ARRAY MEMBERS_L2
DECLARE_ARRAY MEMBERS_L3
DECLARE_ARRAY MEMBERS_L4
DECLARE_ARRAY ARRAY_ELEMS

! File handle (implicit via FILE_OPEN)
! JSON document handle (implicit via JSON_LOAD_DOCUMENT)
```

### Step 2: Get Working Directory & Find JSON Files
```smartassembly
!-----------------------------------------------------------------------
! Get working directory and find JSON files
!-----------------------------------------------------------------------
GET_WORKING_DIRECTORY WORK_DIR
READ_DIRECTORY WORK_DIR "*.json" JSON_FILES

IF ARRAY_EMPTY JSON_FILES
    MESSAGE_BOX "No JSON files found in working directory"
    RETURN
END_IF
```

### Step 3: Main Processing Loop
```smartassembly
!-----------------------------------------------------------------------
! Process each JSON file
!-----------------------------------------------------------------------
FOR JSON_FILE REF ARRAY JSON_FILES

    CLEAR_CATCH_ERROR
    BEGIN_CATCH_ERROR
        JSON_LOAD_DOCUMENT WORK_DIR+"\"+JSON_FILE JSONDoc
    END_CATCH_ERROR

    IF ERROR
        CONTINUE  ! Skip invalid JSON files
    END_IF

    ! Open temp.tab for writing
    FILE_OPEN WORK_DIR+"\temp.tab" "w" TEMP_FILE
    FILE_WRITE_LINE TEMP_FILE "BEGIN_ASM_DESCR"
    FILE_WRITE_LINE TEMP_FILE ""
    FILE_WRITE_LINE TEMP_FILE "!-----------------------------------------------------------------------"
    FILE_WRITE_LINE TEMP_FILE "! Auto-generated from: "+JSON_FILE
    FILE_WRITE_LINE TEMP_FILE "!-----------------------------------------------------------------------"
    FILE_WRITE_LINE TEMP_FILE ""
```

### Step 4: Level 0 Traversal (Root)
```smartassembly
    !-------------------------------------------------------------------
    ! Level 0: Root object members
    !-------------------------------------------------------------------
    CLEAR_CATCH_ERROR
    BEGIN_CATCH_ERROR
        JSON_GET_OBJECT_MEMBERS JSONDoc "" MEMBERS_L0
    END_CATCH_ERROR

    IF NOT ERROR AND NOT ARRAY_EMPTY MEMBERS_L0
        FOR PATH_L0 REF ARRAY MEMBERS_L0
            JSON_GET_TYPE JSONDoc PATH_L0 FIELD_TYPE

            IF FIELD_TYPE == "STRING" OR FIELD_TYPE == "INTEGER" OR FIELD_TYPE == "DOUBLE" OR FIELD_TYPE == "BOOL"
                ! Extract field name from path
                LEN = strlen(PATH_L0)
                POS = strlastfind(PATH_L0, "/")
                FIELD_NAME = strright(PATH_L0, LEN - POS - 1)

                ! Get value and map type
                JSON_GET_VALUE JSONDoc PATH_L0 FIELD_VALUE

                IF FIELD_TYPE == "STRING"
                    SA_TYPE = "STRING"
                    OUTPUT_LINE = "DECLARE_VARIABLE STRING "+FIELD_NAME+" \""+FIELD_VALUE+"\""
                ELSE_IF FIELD_TYPE == "INTEGER"
                    SA_TYPE = "INTEGER"
                    OUTPUT_LINE = "DECLARE_VARIABLE INTEGER "+FIELD_NAME+" "+FIELD_VALUE
                ELSE_IF FIELD_TYPE == "DOUBLE"
                    SA_TYPE = "DOUBLE"
                    OUTPUT_LINE = "DECLARE_VARIABLE DOUBLE "+FIELD_NAME+" "+FIELD_VALUE
                ELSE_IF FIELD_TYPE == "BOOL"
                    SA_TYPE = "INTEGER"
                    IF FIELD_VALUE == "TRUE" OR FIELD_VALUE == "true"
                        OUTPUT_LINE = "DECLARE_VARIABLE INTEGER "+FIELD_NAME+" 1"
                    ELSE
                        OUTPUT_LINE = "DECLARE_VARIABLE INTEGER "+FIELD_NAME+" 0"
                    END_IF
                END_IF

                FILE_WRITE_LINE TEMP_FILE OUTPUT_LINE
```

### Step 5: Levels 1-4 Traversal (Nested in Level 0 loop)
```smartassembly
            ELSE_IF FIELD_TYPE == "OBJECT"
                ! Level 1
                CLEAR_ARRAY MEMBERS_L1
                JSON_GET_OBJECT_MEMBERS JSONDoc PATH_L0 MEMBERS_L1

                FOR PATH_L1 REF ARRAY MEMBERS_L1
                    JSON_GET_TYPE JSONDoc PATH_L1 FIELD_TYPE

                    IF FIELD_TYPE == "STRING" OR FIELD_TYPE == "INTEGER" OR FIELD_TYPE == "DOUBLE" OR FIELD_TYPE == "BOOL"
                        ! Write DECLARE_VARIABLE (same pattern as L0)
                        LEN = strlen(PATH_L1)
                        POS = strlastfind(PATH_L1, "/")
                        FIELD_NAME = strright(PATH_L1, LEN - POS - 1)
                        JSON_GET_VALUE JSONDoc PATH_L1 FIELD_VALUE
                        ! ... type mapping and FILE_WRITE_LINE

                    ELSE_IF FIELD_TYPE == "OBJECT"
                        ! Level 2 (same pattern, nested)
                        ! ... continue nesting to Level 4
                    END_IF
                END_FOR

            ELSE_IF FIELD_TYPE == "ARRAY"
                ! Handle array elements
                CLEAR_ARRAY ARRAY_ELEMS
                JSON_GET_ARRAY_ELEMS JSONDoc PATH_L0 ARRAY_ELEMS

                FOR ELEM_PATH REF ARRAY ARRAY_ELEMS
                    JSON_GET_TYPE JSONDoc ELEM_PATH FIELD_TYPE
                    ! Process array element (primitive or object)
                END_FOR
            END_IF
```

### Step 6: Close Files & End Script
```smartassembly
        END_FOR  ! End Level 0 loop
    END_IF

    FILE_WRITE_LINE TEMP_FILE ""
    FILE_WRITE_LINE TEMP_FILE "END_ASM_DESCR"
    FILE_CLOSE TEMP_FILE

END_FOR  ! End JSON_FILES loop

MESSAGE_BOX "temp.tab generated successfully"

END_ASM_DESCR
```

## Todo List
- [ ] Create json_variable_creation.tab file
- [ ] Implement variable declarations section
- [ ] Implement directory reading logic
- [ ] Implement Level 0 traversal with type detection
- [ ] Implement Level 1-4 nested traversal (unrolled)
- [ ] Implement array element handling
- [ ] Add error handling throughout
- [ ] Test with sample JSON file

## Success Criteria
1. Script compiles without errors in SmartAssembly
2. Detects *.json files in working directory
3. Generates valid temp.tab file
4. temp.tab contains correct DECLARE_VARIABLE syntax
5. Handles nested objects up to 5 levels
6. Handles arrays with primitive/object elements
7. Gracefully skips invalid JSON files

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| No recursion in SA | High | Unroll 5 levels manually |
| Large JSON files | Medium | May generate many variables |
| Special chars in values | Medium | Quote escaping may be needed |
| Empty JSON files | Low | Check ARRAY_EMPTY |

## Security Considerations
- No external network calls
- File operations limited to working directory
- No user input beyond file selection

## Next Steps
1. Implement full script with all 5 levels unrolled
2. Test with various JSON structures
3. Verify output format matches expected DECLARE_VARIABLE syntax
