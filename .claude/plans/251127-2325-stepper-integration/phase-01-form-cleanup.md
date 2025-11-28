# Phase 01: Form helperText Cleanup

## Context

- **Parent Plan:** [plan.md](./plan.md)
- **Dependencies:** None

## Overview

| Field | Value |
|-------|-------|
| Date | 2025-11-27 |
| Description | Remove helperText properties from project-header form |
| Priority | High |
| Implementation Status | Pending |
| Review Status | Pending |

## Key Insights

- helperText in form fields duplicates the label text (e.g., "Sales Order Number" label + "Sales Order Number" helperText)
- DynamicFormRenderer likely displays helperText below inputs, causing redundancy
- Labels alone provide sufficient context for users

## Requirements

1. Remove `"helperText": "Sales Order Number"` from SO_NUM field
2. Remove `"helperText": "Job Name"` from JOB_NAME field
3. Remove `"helperText": "Sub Job Name"` from SUB_JOB_NAME field
4. Remove `"helperText": "Customer Name"` from CUSTOMER_NAME field
5. Maintain valid JSON structure

## Related Code Files

| File | Lines | Purpose |
|------|-------|---------|
| `folder-creation-data/project-header.md` | 1-65 | JSON form specification |

## Implementation Steps

1. Open `folder-creation-data/project-header.md`
2. Locate each field object in the `fields` array
3. Delete the `"helperText"` property from each field:
   - Line 20: Remove `"helperText": "Sales Order Number"`
   - Line 32: Remove `"helperText": "Job Name"`
   - Line 44: Remove `"helperText": "Sub Job Name"`
   - Line 55: Remove `"helperText": "Customer Name"`
4. Validate JSON syntax

## Todo List

- [ ] Remove helperText from SO_NUM field
- [ ] Remove helperText from JOB_NAME field
- [ ] Remove helperText from SUB_JOB_NAME field
- [ ] Remove helperText from CUSTOMER_NAME field
- [ ] Verify JSON validity

## Success Criteria

- Form spec contains no helperText properties
- JSON remains valid and parseable
- Form renders correctly without helper text display

## Risk Assessment

- **Risk:** Low - Simple property removal
- **Mitigation:** Validate JSON after changes

## Security Considerations

None - cosmetic change only

## Next Steps

Proceed to [Phase 02: Header Alignment](./phase-02-header-alignment.md)
