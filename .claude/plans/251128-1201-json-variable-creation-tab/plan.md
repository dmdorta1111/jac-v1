# JSON Variable Creation SmartAssembly Script

## Overview
Create `json_variable_creation.tab` that detects JSON files in working directory, traverses 5 levels deep, and generates `temp.tab` with DECLARE_VARIABLE statements.

## Status
| Phase | Description | Status | Progress |
|-------|-------------|--------|----------|
| 01 | Script Implementation | Pending | 0% |

## Architecture Summary
```
json_variable_creation.tab
├── BEGIN_ASM_DESCR
├── Variable Declarations
├── Get Working Directory
├── Read Directory for *.json
├── FOR each JSON file:
│   ├── Load JSON Document
│   ├── FILE_OPEN temp.tab "w"
│   ├── Write BEGIN_ASM_DESCR
│   ├── Traverse 5 levels (nested loops)
│   │   └── Write DECLARE_VARIABLE lines
│   ├── Write END_ASM_DESCR
│   └── FILE_CLOSE
└── END_ASM_DESCR
```

## Key Technical Decisions
1. **No INCLUDE/recursion** - SmartAssembly lacks true recursion; use 5 nested traversal blocks
2. **Type mapping**: STRING→STRING, INTEGER→INTEGER, DOUBLE→DOUBLE, BOOL→INTEGER
3. **Path extraction**: Use string functions to extract field name from JSON path
4. **Error handling**: Wrap JSON ops in BEGIN_CATCH_ERROR

## Implementation Phases
- [Phase 01: Script Implementation](./phase-01-script-implementation.md)

## Output Files
- `json_variable_creation.tab` - Main script
- `temp.tab` - Generated output with variable declarations

## Dependencies
- SmartAssembly JSON commands (external data license)
- File handling commands (FILE_OPEN, FILE_WRITE_LINE, FILE_CLOSE)

## References
- SmartAssembly SKILL.md
- json-commands.md reference
- chm-extracted/CMD_FILE_*.htm docs
