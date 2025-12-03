# Plasma Glow Effect - Code Reference

**Quick API & Code Examples**

---

## Component API

### PlasmaDot

```tsx
import { PlasmaDot } from "@/components/ai-elements/plasma-dot";

// Basic usage (recommended)
<PlasmaDot />

// With custom className
<PlasmaDot className="custom-class" />

// With custom className and props
<PlasmaDot className="custom-class" data-testid="plasma-glow" />
```

### Props

```typescript
type PlasmaDotProps = HTMLAttributes<HTMLDivElement>;

// Extends standard HTML div attributes:
className?: string;
style?: CSSProperties;
data-*?: any;
aria-*?: any;
id?: string;
ref?: ForwardedRef<HTMLDivElement>;
// ... all standard HTMLDivElement props
```

### CSS Variables

```css
/* Available in any scope */
var(--plasma-core)      /* #ff6b00 */
var(--plasma-orange)    /* #ff9500 */
var(--plasma-deep-blue) /* #2563eb */
var(--plasma-blue)      /* #3b82f6 */
var(--plasma-light-blue)/* #e8f4ff */
var(--plasma-white)     /* #ffffff */
```

---

## Complete Integration Example

### Single File Integration

```tsx
// File: components/ai-elements/prompt-input.tsx
"use client";

import { PlasmaDot } from "@/components/ai-elements/plasma-dot";
import { InputGroup } from "@/components/ui/input-group";
// ... other imports

export const PromptInput = ({ ... }: PromptInputProps) => {
  // ... existing code

  const inner = (
    <>
      <span aria-hidden="true" className="hidden" ref={anchorRef} />
      <input {...fileInputProps} />
      <form
        className={cn("w-full", className)}
        onSubmit={handleSubmit}
        {...props}
      >
        <InputGroup className="relative overflow-hidden">
          <PlasmaDot />
          {children}
        </InputGroup>
      </form>
    </>
  );

  return usingProvider ? (
    inner
  ) : (
    <LocalAttachmentsContext.Provider value={ctx}>
      {inner}
    </LocalAttachmentsContext.Provider>
  );
};
```

---

## CSS Variables Definition

### Location: `app/globals.css`

```css
:root {
  /* Plasma Glow Effect Colors */
  --plasma-core: #ff6b00;
  --plasma-orange: #ff9500;
  --plasma-deep-blue: #2563eb;
  --plasma-blue: #3b82f6;
  --plasma-light-blue: #e8f4ff;
  --plasma-white: #ffffff;
}

@theme inline {
  --color-plasma-core: var(--plasma-core);
  --color-plasma-orange: var(--plasma-orange);
  --color-plasma-deep-blue: var(--plasma-deep-blue);
  --color-plasma-blue: var(--plasma-blue);
  --color-plasma-light-blue: var(--plasma-light-blue);
  --color-plasma-white: var(--plasma-white);
}
```

---

## Animation Keyframes

### Pulse Animation

```css
@keyframes plasma-pulse {
  0%, 100% {
    opacity: 0.35;
    filter: blur(120px);
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.5;
    filter: blur(140px);
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes plasma-pulse-dark {
  0%, 100% {
    opacity: 0.45;
    filter: blur(120px);
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.6;
    filter: blur(140px);
    transform: translate(-50%, -50%) scale(1.1);
  }
}
```

### Float Animation

```css
@keyframes plasma-float {
  0%, 100% {
    transform: translate(-50%, -50%) translateY(0px);
  }
  50% {
    transform: translate(-50%, -50%) translateY(-20px);
  }
}

@keyframes plasma-float-tablet {
  0%, 100% {
    transform: translate(-50%, -50%) translateY(0px);
  }
  50% {
    transform: translate(-50%, -50%) translateY(-15px);
  }
}

@keyframes plasma-float-mobile {
  0%, 100% {
    transform: translate(-50%, -50%) translateY(0px);
  }
  50% {
    transform: translate(-50%, -50%) translateY(-10px);
  }
}
```

### Utility Classes

```css
.animate-plasma-pulse {
  animation: plasma-pulse 4s ease-in-out infinite;
}

.dark .animate-plasma-pulse {
  animation: plasma-pulse-dark 4s ease-in-out infinite;
}

.animate-plasma-float {
  animation: plasma-float 6s ease-in-out infinite;
}

.animate-plasma-pulse-float {
  animation: plasma-pulse 4s ease-in-out infinite,
             plasma-float 6s ease-in-out infinite;
}

.dark .animate-plasma-pulse-float {
  animation: plasma-pulse-dark 4s ease-in-out infinite,
             plasma-float 6s ease-in-out infinite;
}

/* Responsive breakpoints */
@media (min-width: 768px) and (max-width: 1023px) {
  .animate-plasma-float {
    animation: plasma-float-tablet 6s ease-in-out infinite;
  }

  .animate-plasma-pulse-float {
    animation: plasma-pulse 4s ease-in-out infinite,
               plasma-float-tablet 6s ease-in-out infinite;
  }

  .dark .animate-plasma-pulse-float {
    animation: plasma-pulse-dark 4s ease-in-out infinite,
               plasma-float-tablet 6s ease-in-out infinite;
  }
}

@media (max-width: 767px) {
  .animate-plasma-float {
    animation: plasma-float-mobile 6s ease-in-out infinite;
  }

  .animate-plasma-pulse-float {
    animation: plasma-pulse 4s ease-in-out infinite,
               plasma-float-mobile 6s ease-in-out infinite;
  }

  .dark .animate-plasma-pulse-float {
    animation: plasma-pulse-dark 4s ease-in-out infinite,
               plasma-float-mobile 6s ease-in-out infinite;
  }
}
```

### Prefers Reduced Motion

```css
@media (prefers-reduced-motion: prefer-reduced) {
  .animate-plasma-pulse,
  .animate-plasma-float,
  .animate-plasma-pulse-float {
    animation: none !important;
  }
}
```

---

## Component Code

### File: `components/ai-elements/plasma-dot.tsx`

```tsx
"use client";

import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export type PlasmaDotProps = HTMLAttributes<HTMLDivElement>;

export const PlasmaDot = ({ className, ...props }: PlasmaDotProps) => {
  return (
    <div
      className={cn(
        // Positioning & Layout
        "pointer-events-none absolute inset-x-1/2 inset-y-1/2",
        "aspect-square -translate-x-1/2 -translate-y-1/2",

        // Responsive Sizing
        "w-[280px]",
        "sm:w-[300px]",
        "md:w-[350px]",
        "lg:w-[400px]",
        "xl:w-[500px]",

        // Shape & Blur
        "rounded-full",
        "blur-[80px] sm:blur-[100px] md:blur-[110px] lg:blur-[140px] xl:blur-[160px]",

        // Gradient Definition
        "bg-gradient-to-br from-plasma-core via-plasma-deep-blue to-plasma-light-blue",

        // Opacity & Dark Mode
        "opacity-35 dark:opacity-45",

        // Animations
        "hidden xs:block animate-plasma-pulse",
        "lg:animate-plasma-pulse-float",

        className
      )}
      {...props}
    />
  );
};
```

---

## Tailwind Config (If Using)

### Optional: `tailwind.config.ts`

```typescript
// Note: This is optional—colors work via CSS variables
export default {
  theme: {
    extend: {
      colors: {
        'plasma-core': 'var(--plasma-core)',
        'plasma-orange': 'var(--plasma-orange)',
        'plasma-deep-blue': 'var(--plasma-deep-blue)',
        'plasma-blue': 'var(--plasma-blue)',
        'plasma-light-blue': 'var(--plasma-light-blue)',
        'plasma-white': 'var(--plasma-white)',
      },
      backdropBlur: {
        'plasma': '120px',
      },
      animation: {
        'plasma-pulse': 'plasma-pulse 4s ease-in-out infinite',
        'plasma-pulse-dark': 'plasma-pulse-dark 4s ease-in-out infinite',
        'plasma-float': 'plasma-float 6s ease-in-out infinite',
        'plasma-float-tablet': 'plasma-float-tablet 6s ease-in-out infinite',
        'plasma-float-mobile': 'plasma-float-mobile 6s ease-in-out infinite',
        'plasma-pulse-float': 'plasma-pulse 4s ease-in-out infinite, plasma-float 6s ease-in-out infinite',
      },
      keyframes: {
        'plasma-pulse': {
          '0%, 100%': {
            opacity: '0.35',
            filter: 'blur(120px)',
            transform: 'translate(-50%, -50%) scale(1)',
          },
          '50%': {
            opacity: '0.5',
            filter: 'blur(140px)',
            transform: 'translate(-50%, -50%) scale(1.1)',
          },
        },
        'plasma-pulse-dark': {
          '0%, 100%': {
            opacity: '0.45',
            filter: 'blur(120px)',
            transform: 'translate(-50%, -50%) scale(1)',
          },
          '50%': {
            opacity: '0.6',
            filter: 'blur(140px)',
            transform: 'translate(-50%, -50%) scale(1.1)',
          },
        },
        'plasma-float': {
          '0%, 100%': {
            transform: 'translate(-50%, -50%) translateY(0px)',
          },
          '50%': {
            transform: 'translate(-50%, -50%) translateY(-20px)',
          },
        },
        'plasma-float-tablet': {
          '0%, 100%': {
            transform: 'translate(-50%, -50%) translateY(0px)',
          },
          '50%': {
            transform: 'translate(-50%, -50%) translateY(-15px)',
          },
        },
        'plasma-float-mobile': {
          '0%, 100%': {
            transform: 'translate(-50%, -50%) translateY(0px)',
          },
          '50%': {
            transform: 'translate(-50%, -50%) translateY(-10px)',
          },
        },
      },
    },
  },
};
```

---

## Usage Examples

### Example 1: Basic Integration

```tsx
import { PlasmaDot } from "@/components/ai-elements/plasma-dot";
import { InputGroup } from "@/components/ui/input-group";
import { PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { PromptInputSubmit } from "@/components/ai-elements/prompt-input";

export function MyForm() {
  return (
    <InputGroup className="relative overflow-hidden">
      <PlasmaDot />
      <PromptInputTextarea placeholder="Ask me anything..." />
      <PromptInputSubmit />
    </InputGroup>
  );
}
```

### Example 2: Custom Styling

```tsx
<PlasmaDot
  className="
    opacity-50 dark:opacity-60    // Increased opacity
    xl:w-[600px] xl:blur-[180px]  // Larger on desktop
    w-[250px] sm:w-[280px]        // Smaller on mobile
  "
/>
```

### Example 3: Conditional Animation

```tsx
// Disable float on mobile (performance)
<PlasmaDot
  className={cn(
    "animate-plasma-pulse",
    "lg:animate-plasma-pulse-float"  // Only on desktop
  )}
/>

// Or disable animation completely
<PlasmaDot className="animate-plasma-pulse" />
```

### Example 4: Custom Gradient

```tsx
<PlasmaDot
  style={{
    backgroundImage: `radial-gradient(
      circle,
      #a855f7 0%,
      #7c3aed 25%,
      #3b82f6 50%,
      #dbeafe 75%,
      #f3f4f6 100%
    )`
  }}
/>
```

---

## CSS Customization Examples

### Change Core Color

```css
/* In your custom CSS file */
:root {
  --plasma-core: #a855f7 !important;  /* Purple instead of orange */
}
```

### Adjust Animation Speed

```css
/* Faster pulse */
.animate-plasma-pulse {
  animation: plasma-pulse 3s ease-in-out infinite !important;
}

/* Slower float */
@keyframes plasma-float {
  50% {
    transform: translate(-50%, -50%) translateY(-10px);  /* Reduced from 20px */
  }
}
```

### Increase Blur

```css
/* More blur effect */
.plasma-blurry {
  filter: blur(200px) !important;
  opacity: 0.3 !important;  /* Reduce opacity for blur visibility */
}
```

---

## Testing Code Snippets

### Unit Test Example (Jest + React Testing Library)

```typescript
import { render, screen } from "@testing-library/react";
import { PlasmaDot } from "@/components/ai-elements/plasma-dot";

describe("PlasmaDot", () => {
  it("renders without crashing", () => {
    const { container } = render(<PlasmaDot />);
    expect(container.querySelector("div")).toBeInTheDocument();
  });

  it("has correct classes applied", () => {
    const { container } = render(<PlasmaDot />);
    const element = container.querySelector("div");
    expect(element).toHaveClass("animate-plasma-pulse");
    expect(element).toHaveClass("pointer-events-none");
  });

  it("accepts custom className", () => {
    const { container } = render(
      <PlasmaDot className="custom-test-class" />
    );
    const element = container.querySelector("div");
    expect(element).toHaveClass("custom-test-class");
  });

  it("has pointer-events-none to prevent interactions", () => {
    const { container } = render(<PlasmaDot />);
    const element = container.querySelector("div");
    expect(element).toHaveClass("pointer-events-none");
  });
});
```

### E2E Test Example (Playwright)

```typescript
import { test, expect } from "@playwright/test";

test("plasma glow effect is visible and animated", async ({
  page,
}) => {
  await page.goto("/");

  // Check element exists
  const plasmaDot = page.locator('[class*="animate-plasma-pulse"]');
  await expect(plasmaDot).toBeVisible();

  // Check animation is running
  const opacity = await plasmaDot.evaluate((el) => {
    return window
      .getComputedStyle(el)
      .getPropertyValue("opacity");
  });
  expect(opacity).toBeDefined();

  // Check position is centered
  const styles = await plasmaDot.evaluate((el) => {
    const style = window.getComputedStyle(el);
    return {
      position: style.position,
      transform: style.transform,
    };
  });
  expect(styles.position).toBe("absolute");
  expect(styles.transform).toContain("translate");
});
```

---

## Responsive Behavior Reference

### HTML/CSS Media Queries

```css
/* All breakpoints covered in PlasmaDot */

/* xs: 320px+ */
.w-[280px]
.blur-[80px]

/* sm: 640px+ */
.sm:w-[300px]
.sm:blur-[100px]

/* md: 768px+ */
.md:w-[350px]
.md:blur-[110px]

/* lg: 1024px+ */
.lg:w-[400px]
.lg:blur-[140px]
.lg:animate-plasma-pulse-float

/* xl: 1280px+ */
.xl:w-[500px]
.xl:blur-[160px]
```

---

## Performance Optimization Tips

### Best Practices

```tsx
// ✅ DO: Use PlasmaDot as shown
<InputGroup className="relative overflow-hidden">
  <PlasmaDot />
  {children}
</InputGroup>

// ❌ DON'T: Duplicate PlasmaDot
<InputGroup className="relative">
  <PlasmaDot />
  <PlasmaDot />  // Bad! Creates performance issues
  {children}
</InputGroup>

// ❌ DON'T: Remove pointer-events-none
<PlasmaDot className="pointer-events-auto" />  // Breaks input!

// ❌ DON'T: Change position properties
<PlasmaDot className="relative" />  // Breaks centering!

// ✅ DO: Customize only safe properties
<PlasmaDot className="opacity-50 xl:w-[600px]" />  // OK
```

---

## Debugging

### Check Animation Status

```javascript
// In browser console
const plasma = document.querySelector('[class*="animate-plasma"]');
console.log(
  'Animation name:',
  getComputedStyle(plasma).animationName
);
console.log(
  'Animation duration:',
  getComputedStyle(plasma).animationDuration
);
```

### Verify Colors

```javascript
// Check gradient is applied
const plasma = document.querySelector('[class*="from-plasma"]');
console.log(
  'Background:',
  getComputedStyle(plasma).background
);
```

### Check Responsive Sizes

```javascript
// Check current size
const plasma = document.querySelector('[class*="aspect-square"]');
const rect = plasma.getBoundingClientRect();
console.log(`Current size: ${rect.width}x${rect.height}px`);
console.log(`Current position: ${rect.x}, ${rect.y}`);
```

---

## Common Issues & Solutions

### Animation Not Visible

```javascript
// Check if element exists
const plasma = document.querySelector('[class*="animate-plasma"]');
console.log('Element exists:', !!plasma);
console.log('Is visible:', plasma?.offsetParent !== null);
console.log('Opacity:', getComputedStyle(plasma).opacity);
```

### Glow Not Centered

```javascript
// Check positioning
const plasma = document.querySelector('[class*="absolute"]');
console.log(
  'Transform:',
  getComputedStyle(plasma).transform
);
// Should show: matrix(..., -50%, -50%)
```

### Dark Mode Not Working

```javascript
// Check dark class on html
console.log('Dark mode enabled:', document.documentElement.classList.contains('dark'));
console.log(
  'Opacity in dark:',
  getComputedStyle(plasma).opacity
);  // Should be > 0.35
```

---

## Summary

- **Component:** `PlasmaDot` from `components/ai-elements/plasma-dot.tsx`
- **Colors:** CSS variables in `app/globals.css` (--plasma-*)
- **Animations:** Keyframes in `app/globals.css` (plasma-pulse, plasma-float)
- **Utilities:** Classes in `app/globals.css` (.animate-plasma-*)
- **Integration:** Drop into InputGroup with `className="relative overflow-hidden"`

That's all you need to implement the surreal plasma glow effect!
