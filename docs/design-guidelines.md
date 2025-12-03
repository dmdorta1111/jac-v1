# Design Guidelines

**Last Updated:** 2025-12-02
**Project:** JAC-V1 Dynamic Form System

## Design System Philosophy

JAC-V1 uses a **token-based design system** built on Tailwind CSS V4, providing a single source of truth for all visual design decisions. Every color, dimension, and spacing value is defined as a CSS variable and consumed through Tailwind utilities.

### Core Principles

1. **Single Source of Truth** - Design tokens defined once in `app/globals.css`, used everywhere
2. **Zero Hardcoded Values** - No hex colors or magic numbers in component code
3. **Semantic Over Literal** - Use meaning-based tokens (e.g., `error`) not colors (e.g., `red-500`)
4. **Maintainability First** - Change a token once, updates propagate automatically
5. **Future-Proof** - Easy to rebrand, theme, or extend the design system

---

## Color System

### Neutral Palette

**Usage:** All grayscale UI elements (backgrounds, text, borders, surfaces)

| Token | Value | Light Mode Usage | Dark Mode Usage |
|-------|-------|------------------|-----------------|
| `neutral-50` | `#fafafa` | Very light backgrounds | - |
| `neutral-100` | `#f5f5f5` | Light surfaces, hover states | - |
| `neutral-200` | `#e5e5e5` | Borders, dividers | - |
| `neutral-300` | `#d4d4d4` | Subtle borders | - |
| `neutral-400` | `#a3a3a3` | Secondary text | - |
| `neutral-500` | `#737373` | Muted text | - |
| `neutral-600` | `#525252` | Body text | - |
| `neutral-700` | `#404040` | Emphasis text | Light text |
| `neutral-800` | `#262626` | - | Dark surfaces |
| `neutral-900` | `#171717` | - | Darker backgrounds |
| `neutral-950` | `#0a0a0a` | - | Darkest backgrounds |

**Examples:**
```tsx
// Backgrounds
<div className="bg-neutral-50 dark:bg-neutral-900">

// Text
<p className="text-neutral-600 dark:text-neutral-400">
<h1 className="text-neutral-900 dark:text-neutral-50">

// Borders
<div className="border border-neutral-200 dark:border-neutral-800">
```

### Semantic Colors

**Usage:** Convey meaning and intent, not just visual appearance

| Token | Value | CSS Variable | Usage | Examples |
|-------|-------|--------------|-------|----------|
| Success | `#10b981` | `--color-success` | Confirmations, completed states | Checkmarks, success messages |
| Warning | `#f59e0b` | `--color-warning` | Caution, alerts | Warning banners, attention |
| Error | `#ef4444` | `--color-error` | Errors, destructive actions | Validation errors, delete |

**Examples:**
```tsx
// Use semantic variants
<Button variant="destructive">Delete</Button>  // Uses error color
<Badge variant="success">Completed</Badge>
<Alert variant="warning">Please review</Alert>

// Direct usage (when variants not available)
<div className="text-error">Error message</div>
<div className="bg-success/10 text-success">Success state</div>
```

### Surface Colors

**Usage:** Background surfaces with semantic meaning

| Token | Value | Usage |
|-------|-------|-------|
| `surface-neutral` | `var(--neutral-50)` | Default card/panel backgrounds |
| `surface-neutral-hover` | `var(--neutral-100)` | Hover state for interactive surfaces |
| `border-neutral` | `var(--neutral-200)` | All borders and dividers |
| `text-muted` | `var(--neutral-500)` | Secondary text, help text |
| `text-muted-foreground` | `var(--neutral-600)` | Foreground text on muted backgrounds |

**Examples:**
```tsx
<Card className="bg-surface-neutral hover:bg-surface-neutral-hover">
<div className="border-border-neutral">
<p className="text-text-muted">Optional field</p>
```

---

## Layout & Spacing

### Layout Dimensions

**Standard Layout Tokens:**

| Token | Value | Usage | Component |
|-------|-------|-------|-----------|
| `--header-height` | `4rem` (64px) | Main navigation header | `components/header.tsx` |
| `--nav-height` | `3rem` (48px) | Secondary navigation | Navigation components |
| `--footer-height` | `3rem` (48px) | Page footer | `components/footer.tsx` |
| `--sidebar-width` | `16rem` (256px) | Sidebar panels | `components/LeftSideBar.tsx` |

**Responsive Layout Heights:**

| Token | Value | Usage |
|-------|-------|-------|
| `--layout-height-mobile` | `calc(100dvh - var(--header-height))` | Mobile viewport (uses dvh for better mobile support) |
| `--layout-height-desktop` | `calc(100vh - var(--header-height))` | Desktop viewport |

**Examples:**
```tsx
// Header using standard height
<header className="h-[var(--header-height)]">

// Full-height layout
<main style={{ height: "var(--layout-height-mobile)" }}>
<main className="lg:h-[var(--layout-height-desktop)]">

// Calculated heights
<div style={{ height: "calc(100vh - var(--header-height) - var(--footer-height))" }}>
```

### Input Dimensions

**Form Field Standards:**

| Token | Value | Usage |
|-------|-------|-------|
| `--input-width-standard` | `400px` | Default text inputs, selects |
| `--input-width-large` | `500px` | Textareas, wide selects |
| `--input-max-height-standard` | `500px` | Maximum height for scrollable inputs |

**Examples:**
```tsx
<Input className="w-[var(--input-width-standard)]" />
<Textarea className="max-w-[var(--input-width-large)] max-h-[var(--input-max-height-standard)]" />
<Select className="w-[var(--input-width-standard)]" />
```

### Spacing Scale

**Use Tailwind's default spacing scale for consistency:**

```
p-0  = 0
p-1  = 0.25rem (4px)
p-2  = 0.5rem (8px)
p-3  = 0.75rem (12px)
p-4  = 1rem (16px)
p-5  = 1.25rem (20px)
p-6  = 1.5rem (24px)
p-8  = 2rem (32px)
p-10 = 2.5rem (40px)
p-12 = 3rem (48px)
```

**Examples:**
```tsx
// Consistent padding
<Card className="p-6">  // 24px padding
<Section className="p-8">  // 32px padding

// Consistent spacing
<div className="space-y-4">  // 16px vertical spacing
<div className="gap-6">  // 24px gap
```

---

## Typography

### Text Hierarchy

| Purpose | Tailwind Classes | Usage |
|---------|-----------------|--------|
| Headings | `text-neutral-900 dark:text-neutral-50` | Main headings |
| Body | `text-neutral-700 dark:text-neutral-300` | Primary content |
| Secondary | `text-neutral-600 dark:text-neutral-400` | Supporting text |
| Muted | `text-neutral-500 dark:text-neutral-500` | Help text, labels |
| Error | `text-error` | Validation errors |
| Success | `text-success` | Success messages |

**Examples:**
```tsx
<h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
<p className="text-neutral-700 dark:text-neutral-300">
<span className="text-sm text-neutral-500">Optional</span>
<p className="text-error">Field is required</p>
```

---

## Component Design Patterns

### Cards & Surfaces

**Standard Card Pattern:**
```tsx
<Card className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
  <CardHeader className="border-b border-neutral-200 dark:border-neutral-800">
    <CardTitle className="text-neutral-900 dark:text-neutral-50">
  </CardHeader>
  <CardContent className="p-6">
    {/* content */}
  </CardContent>
</Card>
```

### Buttons

**Button Variants:**
```tsx
// Primary (default)
<Button>Submit</Button>

// Destructive (error color)
<Button variant="destructive">Delete</Button>

// Ghost (transparent)
<Button variant="ghost">Cancel</Button>

// Outline (bordered)
<Button variant="outline">Edit</Button>
```

### Form Fields

**Standard Form Pattern:**
```tsx
<FormField>
  <Label className="text-neutral-700 dark:text-neutral-300">
    Field Name
  </Label>
  <Input
    className="w-[var(--input-width-standard)] border-neutral-200 dark:border-neutral-800"
  />
  <FormDescription className="text-neutral-500">
    Optional help text
  </FormDescription>
  <FormError className="text-error">
    Validation error message
  </FormError>
</FormField>
```

---

## Dark Mode Support

### Design Principles

1. **Always Define Both Modes** - Every color must have light and dark variants
2. **Test Both Modes** - Verify visual hierarchy in both themes
3. **Maintain Contrast** - Ensure WCAG AA compliance in both modes
4. **Use Dark Mode Utilities** - Tailwind's `dark:` prefix for all color classes

### Common Patterns

```tsx
// Backgrounds
className="bg-neutral-50 dark:bg-neutral-900"

// Text
className="text-neutral-700 dark:text-neutral-300"

// Borders
className="border-neutral-200 dark:border-neutral-800"

// Surfaces
className="bg-surface-neutral hover:bg-surface-neutral-hover"
```

---

## Animation & Transitions

### Animation Tokens

**Rule:** Use CSS variables with `color-mix()` for color-based animations

**Example:**
```css
/* In app/globals.css */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px color-mix(in srgb, var(--primary) 30%, transparent);
  }
  50% {
    box-shadow: 0 0 40px color-mix(in srgb, var(--primary) 60%, transparent);
  }
}
```

**Usage:**
```tsx
<div className="animate-pulse-glow">
```

### Standard Transitions

**Hover States:**
```tsx
// Background transitions
className="transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"

// Border transitions
className="transition-all hover:border-neutral-400"

// Scale transitions
className="transition-transform hover:scale-105"
```

---

## Accessibility

### Color Contrast

- **WCAG AA Compliance:** Minimum contrast ratio of 4.5:1 for normal text
- **Text Hierarchy:** Use `neutral-700+` for body text in light mode
- **Interactive Elements:** Minimum contrast ratio of 3:1 for UI components

### Focus States

**Standard Focus Pattern:**
```tsx
className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
```

### Semantic HTML

- Use semantic elements (`<button>`, `<nav>`, `<main>`, etc.)
- Add ARIA labels where needed
- Ensure keyboard navigation works

---

## Responsive Design

### Breakpoints

**Tailwind Default Breakpoints:**
```
sm: 640px   // Small devices (tablets)
md: 768px   // Medium devices (landscape tablets)
lg: 1024px  // Large devices (laptops)
xl: 1280px  // Extra large devices (desktops)
2xl: 1536px // 2X extra large devices (large desktops)
```

### Responsive Patterns

**Mobile-First Approach:**
```tsx
// Default: Mobile
// md: Tablet
// lg: Desktop
<div className="p-4 md:p-6 lg:p-8">
<div className="text-sm md:text-base lg:text-lg">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

### Responsive Container Pattern (Fixed Width with Centering)

**Use Case:** When you need a container that scales responsively and stays centered.

**Pattern:**
```tsx
<div className="mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8 max-w-full sm:max-w-[90%] md:max-w-[85%] lg:max-w-[70%]">
  {/* Content */}
</div>
```

**Breakdown:**
- `mx-auto` - Centers container horizontally
- `w-full` - Base width is full viewport
- `px-3 sm:px-4 md:px-6 lg:px-8` - Progressive horizontal padding
- `max-w-full` - Mobile: No width constraint (100%)
- `sm:max-w-[90%]` - Small screens: 90% of viewport
- `md:max-w-[85%]` - Medium screens: 85% of viewport
- `lg:max-w-[70%]` - Large screens: 70% of viewport

**Why This Works:**
- Always applies max-width at ALL breakpoints (no gaps)
- Padding scales with width for visual harmony
- Mobile-first: starts with full width + padding
- Progressive enhancement: constraints tighten as screen grows
- Consistent centering: mx-auto works at any width

**Examples:**
```tsx
// Chat input area (fixed)
<div className="mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8 max-w-full sm:max-w-[90%] md:max-w-[85%] lg:max-w-[70%]">

// Modal content
<div className="mx-auto w-full px-4 md:px-8 max-w-full sm:max-w-[95%] md:max-w-[80%] lg:max-w-[60%]">

// Card grid
<div className="mx-auto w-full px-3 sm:px-4 md:px-6 max-w-full sm:max-w-[92%] md:max-w-[90%] lg:max-w-[85%]">
```

---

## Updating the Design System

### Adding New Tokens

**Step-by-Step Process:**

1. **Define CSS Variable** (`app/globals.css`)
```css
:root {
  --new-token-name: value;
}
```

2. **Add to @theme Directive** (`app/globals.css`)
```css
@theme inline {
  --color-new-token: var(--new-token-name);
}
```

3. **Extend Tailwind Config** (`tailwind.config.ts`)
```typescript
theme: {
  extend: {
    colors: {
      'new-token': 'var(--new-token-name)',
    },
  },
}
```

4. **Document in Design Guidelines** (this file)
5. **Update Code Standards** (`docs/code-standards.md`)

### Changing Existing Tokens

**Impact Analysis:**
1. Grep for usage: `grep -r "token-name" components/ app/`
2. Test in both light and dark modes
3. Verify contrast ratios
4. Update documentation

---

## Tools & Verification

### Verification Commands

```bash
# Check for deprecated zinc classes
grep -r "zinc-" components/ app/ --include="*.tsx" | grep -v node_modules

# Check for hardcoded colors
grep -r "#[0-9a-fA-F]\{6\}" components/ app/ --include="*.tsx"

# Check for inline styles (should be minimal)
grep -r "style={{" components/ app/ --include="*.tsx"

# Verify build passes
npm run build

# Type check
npx tsc --noEmit
```

### Design Token Audit

Run periodic audits to ensure consistency:
1. Review all CSS variables in `app/globals.css`
2. Check for unused tokens
3. Verify semantic token mappings
4. Test dark mode thoroughly
5. Measure bundle size impact

---

## References

**Key Files:**
- `app/globals.css` - All CSS variable definitions
- `tailwind.config.ts` - Tailwind theme configuration
- `docs/code-standards.md` - Code standards including design tokens
- `docs/tailwind-v4-migration-reference.md` - Migration guide and quick reference

**Design System Status:**
- ✅ 100% token-based styling
- ✅ Zero hardcoded colors
- ✅ Zero inline padding styles
- ✅ Complete neutral palette (11 shades)
- ✅ Semantic color system
- ✅ Layout dimension system
- ✅ Dark mode support

---

**Maintainer Notes:**
- Design system is production-ready and scalable
- All changes to design tokens should be documented
- Test both light and dark modes after any token changes
- Run verification commands before committing
- Keep this document synchronized with `app/globals.css`
