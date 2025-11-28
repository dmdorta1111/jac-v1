# Project Folder Creation Buttons - Implementation Plan

**Date:** 2025-11-27
**Status:** Ready for Implementation
**Priority:** Medium
**Complexity:** Low-Medium

## Overview

Replace `Suggestions` component in ClaudeChat.tsx with shadcn `Button` components. Each button triggers a `Dialog` popup for sales order number input. On submission, API creates project folder structure in the corresponding product folder.

## Scope

- Replace suggestion chips with interactive buttons
- Add dialog popup for sales order input
- Create API endpoint for folder creation
- Handle success/error states

## Phases

| Phase | Name | Status | File |
|-------|------|--------|------|
| 01 | API Endpoint Creation | Pending | [phase-01-api-endpoint.md](./phase-01-api-endpoint.md) |
| 02 | UI Components Update | Pending | [phase-02-ui-components.md](./phase-02-ui-components.md) |

## Architecture

```
User clicks Button → Dialog opens → User enters SO# → Submit
                                                        ↓
                                    POST /api/create-project-folder
                                                        ↓
                              Creates: project-docs/{PRODUCT}/{SO#}/
                                       ├── Customer Drawings/
                                       └── ProE Models/
```

## Product Mapping

| Button Label | Folder Path |
|-------------|-------------|
| SDI | `project-docs/SDI/{salesOrder}/` |
| EMJAC | `project-docs/EMJAC/{salesOrder}/` |
| Harmonic | `project-docs/HARMONIC/{salesOrder}/` |

## Files Affected

1. `components/ClaudeChat.tsx` - UI changes
2. `app/api/create-project-folder/route.ts` - New API endpoint

## Dependencies

- `@/components/ui/button` - Already exists
- `@/components/ui/dialog` - Already exists
- `@/components/ui/input` - Already exists
- `fs/promises` - Node.js built-in

## Success Criteria

- [ ] Buttons render in place of suggestions
- [ ] Button press animation works
- [ ] Dialog opens on button click
- [ ] Sales order input validates
- [ ] API creates folder structure correctly
- [ ] Subfolders created: "Customer Drawings", "ProE Models"
- [ ] Success/error feedback shown to user
