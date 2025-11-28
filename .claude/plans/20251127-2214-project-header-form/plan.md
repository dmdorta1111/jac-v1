# Project Header Form Implementation Plan

**Project:** JAC-V1 | **Plan ID:** 20251127-2214-project-header-form
**Created:** 2025-11-27 | **Status:** Ready for Implementation

## Overview

Implement reusable form template system with project header form displayed in chat after sales order folder creation. Update header component to display project metadata (SO_NUM, JOB_NAME, CUSTOMER_NAME).

## Context Files

- **Research Reports:**
  - [Form Templates Pattern](./research/researcher-01-form-templates.md)
  - [Chat Form Integration](./research/researcher-02-chat-form-integration.md)
- **Source Data:** `folder-creation-data/project-header.md`
- **Components:** `components/ClaudeChat.tsx`, `components/DynamicFormRenderer.tsx`, `components/header.tsx`
- **APIs:** `app/api/create-project-folder/route.ts`, `app/api/generate-project-doc/route.ts`

## Implementation Phases

| Phase | Description | Priority | Status | Dependencies |
|-------|-------------|----------|--------|--------------|
| [01](./phase-01-template-infrastructure.md) | Template Infrastructure | High | Pending | None |
| [02](./phase-02-chat-form-integration.md) | Chat Integration Updates | High | Pending | Phase 01 |
| [03](./phase-03-api-enhancement.md) | API Enhancement | High | Pending | Phase 02 |
| [04](./phase-04-header-update.md) | Header Component Update | Medium | Pending | Phase 03 |

## Technical Approach

**Pattern:** Hybrid static/runtime form template system
- Static imports for core templates (fast)
- Runtime loading for extensibility
- In-memory caching for performance
- Manifest-based discovery

**Flow:**
1. User enters sales order → folder created
2. Success triggers form display in chat bubble
3. Static project-header template loaded
4. User fills form → submit saves to project root
5. Header component updates with metadata

## Key Decisions

1. **Template Storage:** `/public/form-templates/` for JSON files
2. **Loader Pattern:** Hybrid (static imports + runtime fetch with cache)
3. **API Target:** Save project-header.md in `project-docs/{PRODUCT}/{SO_NUM}/`
4. **Header State:** Context API for cross-component data sharing
5. **Build Script:** Parse markdown → JSON at build time

## Success Criteria

- [ ] Form templates stored in `/public/form-templates/`
- [ ] project-header form loads without Claude API call
- [ ] Form displays after folder creation success
- [ ] Submission saves to correct project folder
- [ ] Header displays SO_NUM, JOB_NAME, CUSTOMER_NAME
- [ ] No duplicate form generation on same project
- [ ] Build script generates JSON from markdown

## Risk Mitigation

**Risk:** Form displays before folder creation completes
**Mitigation:** Track folder creation state in WelcomeScreen, pass to chat init

**Risk:** API saves to wrong folder path
**Mitigation:** Pass productType + salesOrderNumber to generate-project-doc API

**Risk:** Template cache stale after rebuild
**Mitigation:** Manifest includes MD5 hash for cache invalidation

## Next Steps

Start with Phase 01 to establish template infrastructure, then proceed sequentially through phases.
