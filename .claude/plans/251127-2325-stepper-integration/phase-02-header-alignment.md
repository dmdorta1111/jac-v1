# Phase 02: Header Desktop Metadata Alignment

## Context

- **Parent Plan:** [plan.md](./plan.md)
- **Dependencies:** None (can run parallel with Phase 01)

## Overview

| Field | Value |
|-------|-------|
| Date | 2025-11-27 |
| Description | Left-align desktop metadata with increased spacing |
| Priority | High |
| Implementation Status | Pending |
| Review Status | Pending |

## Key Insights

- Current: metadata uses `flex-1 max-w-3xl ml-4` with `mx-4` dot separators
- Items appear center-ish due to flex distribution
- Need explicit left alignment and wider separator margins

## Requirements

1. Metadata container starts from left side on desktop
2. Increase spacing between SO, Job, Customer sections
3. Maintain responsive behavior (hidden on mobile, shown on lg+)
4. Keep existing truncate behavior for long values

## Architecture

```
Current:  [Menu]   ....SO • Job • Customer....   [Theme][Logo]
Desired:  [Menu] SO    •    Job    •    Customer   [Theme][Logo]
                 ^-- left aligned   ^-- more spacing
```

## Related Code Files

| File | Lines | Purpose |
|------|-------|---------|
| `components/header.tsx` | 47-83 | Desktop metadata section |

## Implementation Steps

1. Open `components/header.tsx`
2. Line 48: Add `justify-start` to ensure left alignment
3. Lines 59, 70: Change `mx-4` to `mx-8` for dot separators (increased spacing)
4. Verify flex-1 doesn't push content to center

### Code Changes

**Before (line 48):**
```tsx
<div className="hidden lg:flex items-center gap-0 flex-1 max-w-3xl ml-4">
```

**After:**
```tsx
<div className="hidden lg:flex items-center justify-start gap-0 flex-1 max-w-3xl ml-4">
```

**Before (lines 59, 70):**
```tsx
<span className="mx-4 text-muted-foreground">•</span>
```

**After:**
```tsx
<span className="mx-8 text-muted-foreground">•</span>
```

## Todo List

- [ ] Add justify-start to metadata container
- [ ] Increase mx-4 to mx-8 on first dot separator
- [ ] Increase mx-4 to mx-8 on second dot separator
- [ ] Visual verification on desktop viewport

## Success Criteria

- Metadata starts from left edge (after ml-4 offset)
- Visible spacing increase between sections
- No layout breaking on various screen sizes
- Mobile view unchanged

## Risk Assessment

- **Risk:** Low - CSS-only changes
- **Mitigation:** Test on multiple viewport sizes

## Security Considerations

None - styling change only

## Next Steps

Proceed to [Phase 03: Stepper Integration](./phase-03-stepper-integration.md)
