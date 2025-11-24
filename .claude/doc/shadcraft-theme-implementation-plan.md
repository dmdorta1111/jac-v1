# ShadCraft Theme Implementation Plan

## Overview

This document provides a detailed implementation plan for applying the ShadCraft grey theme across the JAC application, replacing all hardcoded blue color classes with neutral grey tones while maintaining the existing CSS variable design system.

## Status: READY FOR IMPLEMENTATION

---

## Files Requiring Changes

### Priority 1 - Main Components
1. `app/page.tsx` - 3 changes (background decorative elements)
2. `components/ClaudeChat.tsx` - 15+ changes (chat interface styling)
3. `components/footer.tsx` - 8 changes (icons, text, decorative lines)
4. `components/DynamicFormRenderer.tsx` - 12+ changes (form styling)

### Priority 2 - Global Styles
5. `app/globals.css` - 2 changes (glow effect animations)

### No Changes Needed
- `components/header.tsx` - Already uses CSS variables
- `components/leftsidebar.tsx` - Already uses CSS variables
- All `components/ui/*.tsx` - Already use CSS variables

---

## Summary of Changes

### Color Mapping
| From | To |
|------|-----|
| `blue-400` | `zinc-400` |
| `blue-500` | `zinc-500` |
| `blue-600` | `zinc-600` |
| `blue-200` | `zinc-200` |
| `blue-50` | `zinc-50` or `secondary` |
| `blue-100` | `zinc-100` or `accent` |
| `blue-950` | `zinc-900` or `secondary` |

### CSS Variable Usage
| Hardcoded | CSS Variable |
|-----------|--------------|
| `text-slate-700` | `text-foreground` |
| `text-slate-600` | `text-muted-foreground` |
| `bg-white` | `bg-background` |
| `bg-slate-100` | `bg-card` or `bg-secondary` |
| `border-slate-200` | `border-border` |

---

## Implementation Instructions

### Step 1: Update app/page.tsx
Replace background decorative element colors from blue to zinc.

### Step 2: Update components/ClaudeChat.tsx
This is the largest change. Update:
- Input glow effect gradient
- Suggestion button hover states
- User/bot avatar colors
- Message bubble backgrounds
- Task status indicators
- Typing indicator dots
- Timestamp colors

### Step 3: Update components/footer.tsx
- Change sparkle icon color
- Update decorative gradient lines
- Replace hardcoded text colors with CSS variables

### Step 4: Update components/DynamicFormRenderer.tsx
- Remove custom button colors (use default primary)
- Replace all slate colors with CSS variables
- Update form container styling

### Step 5: Update app/globals.css
- Change glow effect gradient colors
- Update pulse-glow animation colors

---

## Testing Checklist

After implementation:
- [ ] Light mode appearance looks correct
- [ ] Dark mode appearance looks correct
- [ ] All hover states work
- [ ] All focus states work
- [ ] Message bubbles have proper padding
- [ ] Suggestion buttons are readable
- [ ] No blue colors remain (except --primary for CTAs)

---

## Reference

Full implementation details with exact code changes are in:
`C:\Users\waveg\VsCode Projects\jac-v1\.claude\sessions\context_session.md`

---

## Created By
shadcn-ui-designer sub-agent
Date: 2025-11-23
