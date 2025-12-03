# Tailwind V4 Design System - Migration Reference

**Purpose:** Quick reference guide for the Tailwind V4 modernization effort

---

## Color Token Mapping

### Neutral Colors (Replacement for Zinc)

| Old (zinc) | New (neutral) | CSS Variable | Usage |
|-----------|--------------|--------------|-------|
| `zinc-50` | `neutral-50` | `--neutral-50: #fafafa` | Very light backgrounds |
| `zinc-100` | `neutral-100` | `--neutral-100: #f5f5f5` | Light surfaces |
| `zinc-200` | `neutral-200` | `--neutral-200: #e5e5e5` | Borders, dividers |
| `zinc-300` | `neutral-300` | `--neutral-300: #d4d4d4` | Subtle borders |
| `zinc-400` | `neutral-400` | `--neutral-400: #a3a3a3` | Secondary text |
| `zinc-500` | `neutral-500` | `--neutral-500: #737373` | Muted text |
| `zinc-600` | `neutral-600` | `--neutral-600: #525252` | Text |
| `zinc-700` | `neutral-700` | `--neutral-700: #404040` | Text, darker elements |
| `zinc-800` | `neutral-800` | `--neutral-800: #262626` | Dark surfaces |
| `zinc-900` | `neutral-900` | `--neutral-900: #171717` | Dark mode backgrounds |
| `zinc-950` | `neutral-950` | `--neutral-950: #0a0a0a` | Darkest |

**Find & Replace String:**
- Find: `zinc-(\d+)`
- Replace: `neutral-$1`
- In VS Code: Use regex mode (click the `.*` button)

---

## Layout Dimension Tokens

| Token | Value | Usage | Replace |
|-------|-------|-------|---------|
| `--header-height` | `4rem` (16px × 4) | Navigation header height | `h-16` |
| `--nav-height` | `3rem` | Sidebar nav height | `h-12` |
| `--footer-height` | `3rem` | Footer height | `h-12` |
| `--sidebar-width` | `16rem` | Sidebar width | `w-64` |

### Height Calculation Examples

**Replace these patterns:**

```tsx
// OLD: Hardcoded rem values
<div className="h-[calc(100dvh-4rem)]">
<div className="h-[calc(100vh-7.5rem)]">

// NEW: CSS variables
<div style={{ height: "calc(100dvh - var(--header-height))" }}>
<div style={{ height: "calc(100vh - var(--header-height) - var(--footer-height))" }}>

// Or use arbitrary Tailwind (if preferred):
<div className="[height:calc(100dvh-var(--header-height))]">
```

**Why?**
- Single source of truth: Change `--header-height` once, all calculations update
- Maintains design coherence
- Enables future responsive header heights

---

## Semantic Color Tokens

These are high-level color meanings, not specific colors:

| Token | Value | Purpose | Usage |
|-------|-------|---------|-------|
| `--color-surface-neutral` | `var(--neutral-50)` | Default backgrounds | Cards, panels |
| `--color-surface-neutral-hover` | `var(--neutral-100)` | Hover state | Interactive areas |
| `--color-border-neutral` | `var(--neutral-200)` | Borders, dividers | All borders |
| `--color-text-muted` | `var(--neutral-500)` | Secondary text | Help text, labels |
| `--color-success` | `#10b981` | Success states | Checkmarks, confirmations |
| `--color-warning` | `#f59e0b` | Warning states | Alerts |
| `--color-error` | `#ef4444` | Error states | Errors, destructive |

---

## Inline Style to Tailwind Conversion

### Padding

| Old Style | New Class | Value |
|-----------|-----------|-------|
| `style={{ padding: '1.5rem' }}` | `p-6` | 1.5rem |
| `style={{ paddingBottom: '1rem' }}` | `pb-4` | 1rem |
| `style={{ padding: '1rem' }}` | `p-4` | 1rem |

### Spacing Map (Tailwind Default)

```
0 = 0
1 = 0.25rem
2 = 0.5rem
3 = 0.75rem
4 = 1rem
5 = 1.25rem
6 = 1.5rem
7 = 1.75rem
8 = 2rem
```

---

## Component-Specific Changes

### `components/DynamicFormRenderer.tsx`

**Lines to fix:**

| Line | Old | New | Reason |
|------|-----|-----|--------|
| 581 | `data-[state=checked]:bg-zinc-700` | `data-[state=checked]:bg-neutral-700` | Zinc→Neutral |
| 620 | `text-zinc-700 dark:text-zinc-400` | `text-neutral-700 dark:text-neutral-400` | Zinc→Neutral |
| 657 | `*:first:bg-zinc-200` | `*:first:bg-neutral-200` | Zinc→Neutral |
| 916 | `style={{ padding: '1.5rem' }}` | Remove style, keep `p-6` | Conflict removal |
| 918 | `style={{ padding: '1.5rem', paddingBottom: '1rem' }}` | Use `p-6 pb-4` | DRY principle |
| 933 | `style={{ padding: '1.5rem' }}` | Remove style, use `p-6` | Simplify |

---

### `components/header.tsx`

**Lines to fix:**

```tsx
// Line 21 - BEFORE
from-zinc-100/80 to-zinc-400/80 dark:from-zinc-800 dark:to-[#0a0a0a]

// Line 21 - AFTER
from-neutral-100/80 to-neutral-400/80 dark:from-neutral-800 dark:to-neutral-950
```

---

### `components/ClaudeChat.tsx`

**Lines to fix:**

```tsx
// Line 1926 - BEFORE
bg-zinc-200/95 dark:bg-zinc-900/95

// Line 1926 - AFTER
bg-neutral-200/95 dark:bg-neutral-900/95

// Lines 1929-1930 - BEFORE
from-zinc-500/20 via-zinc-400/20 to-zinc-600/20

// Lines 1929-1930 - AFTER
from-neutral-500/20 via-neutral-400/20 to-neutral-600/20
```

---

### `components/LeftSideBar.tsx`

**Multiple lines - all zinc→neutral:**

```tsx
// Line 145
bg-zinc-200/95 dark:bg-zinc-900/95
→ bg-neutral-200/95 dark:bg-neutral-900/95

// Line 154
hover:border-zinc-400/50
→ hover:border-neutral-400/50

// Line 225
bg-zinc-500/10
→ bg-neutral-500/10

// Height calculations (if present)
h-[calc(100dvh-4rem)]
→ style={{ height: "calc(100dvh - var(--header-height))" }}
```

---

## Validation Checklist

### After Zinc→Neutral Migration

Run in terminal to verify:

```bash
# Should return 0 (no more zinc colors)
grep -r "zinc-" components/ app/ --include="*.tsx" --include="*.ts" | grep -v "node_modules" | wc -l

# Should return 0 (no more hardcoded padding in styles)
grep -r 'style={{.*padding' components/ app/ --include="*.tsx" | grep -v "node_modules" | wc -l

# Should show new neutral colors working
grep -r "neutral-" components/ app/ --include="*.tsx" | wc -l
```

### After Build

```bash
npm run build          # Must succeed
npm run lint           # Must pass
npm run dev            # Verify visually in light/dark mode
```

---

## Git Workflow

```bash
# Start fresh branch
git checkout -b feat/tailwind-v4-modernization

# Stage Phase 1 (config + globals)
git add app/globals.css tailwind.config.ts
git commit -m "feat: Add neutral color palette and layout tokens to design system"

# Stage Phase 2.1 (zinc migration)
git add components/
git commit -m "refactor: Replace zinc colors with neutral design tokens"

# Stage Phase 2.2-2.4 (inline styles + heights)
git add components/DynamicFormRenderer.tsx
git commit -m "refactor: Remove inline padding styles, replace height calculations"

# Final review
git push origin feat/tailwind-v4-modernization

# Create PR with detailed description
```

---

## Common Mistakes to Avoid

| Mistake | Issue | Solution |
|---------|-------|----------|
| Using both `zinc-` and `neutral-` | Inconsistency | Complete the migration, don't mix |
| Keeping inline `style` attributes | Defeats DRY principle | Remove all `style={{...}}` padding |
| Hardcoding new hex colors | Creates new debt | Use CSS variables |
| Forgetting dark mode variants | Light mode OK, dark mode broken | Test both modes |
| Wrong spacing token values | UI shifts | Reference the Tailwind spacing scale |
| Forgetting CSS variable in `@theme` | Token defined but not available to Tailwind | Update both CSS and @theme directive |

---

## Quick Reference: Arbitrary Value Consolidation

### Current Arbitrary Values in Use

```tsx
// Widths
max-w-[500px]      → CSS var --input-width-large
w-[500px]          → CSS var --input-width-standard
max-w-[90%]        → CSS var --max-width-responsive-90
max-w-[95%]        → CSS var --max-width-responsive-95

// Heights
max-h-[500px]      → CSS var --input-max-height
max-h-[22rem]      → CSS var --modal-max-height
h-[calc(...)]      → CSS var --layout-height-*
```

**Add to `app/globals.css`:**
```css
:root {
  --input-width-large: 500px;
  --input-width-standard: 400px;
  --input-max-height: 500px;
  --modal-max-height: 22rem;
  --max-width-responsive-90: 90%;
  --max-width-responsive-95: 95%;
}
```

**Use in components:**
```tsx
<input style={{ maxWidth: "var(--input-width-large)" }} />
// OR
<input className="max-w-[var(--input-width-large)]" />
```

---

## Animation & Keyframe Update

### Current Issue

```css
/* app/globals.css lines 453-460 */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(113, 113, 122, 0.3);  /* ← HARDCODED */
  }
  50% {
    box-shadow: 0 0 40px rgba(113, 113, 122, 0.6);  /* ← HARDCODED */
  }
}
```

### Solution

Add CSS variable for glow color:

```css
:root {
  --glow-color-opacity-light: rgba(109, 110, 112, 0.3);
  --glow-color-opacity-dark: rgba(109, 110, 112, 0.6);
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px var(--glow-color-opacity-light); }
  50% { box-shadow: 0 0 40px var(--glow-color-opacity-dark); }
}
```

Or use primary color directly (more flexible):

```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px var(--primary) / 0.3; }
  50% { box-shadow: 0 0 40px var(--primary) / 0.6; }
}
```

---

## Verification Commands

```bash
# Check for remaining zinc references
grep -rn "zinc-[0-9]" components/ app/ | grep -v node_modules

# Check for remaining inline padding styles
grep -rn 'style={{.*padding' components/ app/ | grep -v node_modules

# Verify neutral class usage
grep -rn "neutral-[0-9]" components/ app/ | wc -l

# Check CSS variable definitions
grep -c "^  --neutral-\|^  --color-\|^  --.*-height" app/globals.css

# List all Tailwind classes used
grep -rho "class=['\"][^'\"]*['\"]" components/ app/ | sort -u
```

---

## Support & Questions

**Key Files to Review:**
1. `app/globals.css` - All CSS variables defined here
2. `tailwind.config.ts` - Tailwind configuration with @theme
3. `plans/tailwind-v4-modernization-plan.md` - Complete implementation plan

**Before Starting:**
- Read the full modernization plan
- Backup current state: `git commit -m "backup: current state before tailwind v4 migration"`
- Ensure build passes: `npm run build`
- Test locally: `npm run dev`

---

**Last Updated:** 2025-12-02