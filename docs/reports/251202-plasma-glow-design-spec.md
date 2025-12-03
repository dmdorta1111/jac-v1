# Surreal Plasma Glow Effect - Design Specification

**Date:** 2025-12-02
**Component:** Prompt Input (AI Elements)
**Status:** Design Specification Complete
**Location:** `components/ai-elements/prompt-input.tsx`

---

## Executive Summary

A sophisticated multi-layered radial gradient effect creates a surreal, inviting visual enhancement behind the prompt input. The plasma glow combines whitish outer layers, vibrant blue middle tones, and glowing red-orange core to establish an alien-like, space-inspired aesthetic that encourages user exploration.

**Design Goals:**
- Invoke a sense of wonder and technological sophistication
- Create visual hierarchy that draws attention to the input
- Maintain premium, polished appearance across all devices
- Support both light and dark modes seamlessly
- Enhance UX without interfering with functionality

---

## Visual Design Specification

### Color Palette Definition

The plasma effect uses a precisely orchestrated color gradient from outside to inside:

| Layer | Position | Color | RGB | Hex | Opacity | Purpose |
|-------|----------|-------|-----|-----|---------|---------|
| **Outer** | 0-30% | Whitish/Pale | 255, 255, 255 | `#ffffff` | 0.15 - 0.25 | Subtle rim |
| **Transition-1** | 30-50% | Light Blue | 200, 230, 255 | `#e8f4ff` | 0.2 - 0.35 | Gradient bridge |
| **Middle** | 50-70% | Vibrant Blue | 59, 130, 246 | `#3b82f6` | 0.25 - 0.4 | Primary blue |
| **Deep Blue** | 70-85% | Deep Saturated Blue | 37, 99, 235 | `#2563eb` | 0.3 - 0.45 | Depth intensifier |
| **Core** | 85-100% | Glowing Red-Orange | 255, 107, 0 | `#ff6b00` | 0.35 - 0.5 | Energy center |

**Key Color References:**
- Whitish outer: Approaches white with strong transparency
- Blue spectrum: Leverages primary blue (`#3b82f6`) from design system
- Red-orange core: Custom range `#ff6b00` - `#ff9500` for plasma effect

### Gradient Structure

```
Radial Gradient (Center → Outward)
├── 0% - #ff6b00 (opacity: 0.4) [Red-Orange Core]
├── 25% - #2563eb (opacity: 0.35) [Deep Blue]
├── 50% - #3b82f6 (opacity: 0.3) [Vibrant Blue]
├── 75% - #e8f4ff (opacity: 0.25) [Light Blue]
└── 100% - #ffffff (opacity: 0.15) [Whitish Outer]
```

### Dimensions & Sizing

**Desktop (1024px+):**
- Width: 500px
- Height: 500px
- Position: Centered behind input
- Blur: 120px - 160px (heavy blur for diffused glow)

**Tablet (768px - 1023px):**
- Width: 400px
- Height: 400px
- Blur: 100px - 140px

**Mobile (375px - 767px):**
- Width: 300px
- Height: 300px
- Blur: 80px - 120px

**Responsive Scaling:** Uses CSS custom properties for dynamic sizing based on viewport.

### Positioning

```
Structure:
├── InputGroup (relative container)
│   ├── PlasmaDot (absolute, positioned behind)
│   │   └── Glow effect with blur filter
│   └── Form content (textarea, buttons)
```

**Positioning Details:**
- `position: absolute`
- `inset: 50% 50% auto auto` (center horizontally)
- `transform: translate(-50%, -50%)` (perfect center)
- `pointer-events: none` (doesn't interfere with interactions)
- `z-index: -1` (sits behind input)
- High `z-stacking` to ensure visibility but doesn't cover input

### Layering Order (z-index)

```
5   [Top] Submit button, action buttons
4   Input text and controls
3   InputGroup background
2   PlasmaDot (glow container)
1   Background surfaces
0   Page background
```

---

## Animation & Motion

### Primary Animation: Pulsing Glow

**Name:** `plasma-pulse`
**Duration:** 4s (slow, meditative)
**Timing:** `ease-in-out`
**Iteration:** `infinite`

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
```

**Effect:** Gentle breathing motion that invites interaction without distraction

### Secondary Animation: Float Effect (Optional)

**Name:** `plasma-float`
**Duration:** 6s
**Timing:** `ease-in-out`
**Iteration:** `infinite`

```css
@keyframes plasma-float {
  0%, 100% {
    transform: translate(-50%, -50%) translateY(0px);
  }
  50% {
    transform: translate(-50%, -50%) translateY(-20px);
  }
}
```

**Effect:** Subtle vertical movement for ethereal quality

### Animation Application

**Desktop:** Both pulse + float combined
**Tablet/Mobile:** Pulse only (float creates jank on smaller devices)

---

## Responsive Behavior

### Breakpoint Strategy

**xs (320px - 374px):**
- Glow size: 280px
- Blur: 80px
- Opacity: 0.3 (reduced to avoid overwhelming small screens)
- Animation: Pulse only, 0.3 scale instead of 0.1

**sm (375px - 639px):**
- Glow size: 300px
- Blur: 100px
- Opacity: 0.35
- Animation: Pulse + subtle float (3px y-translate)

**md (640px - 767px):**
- Glow size: 350px
- Blur: 110px
- Opacity: 0.35
- Animation: Pulse + float (10px y-translate)

**lg (768px - 1023px):**
- Glow size: 400px
- Blur: 140px
- Opacity: 0.4
- Animation: Pulse + float (15px y-translate)

**xl (1024px+):**
- Glow size: 500px
- Blur: 160px
- Opacity: 0.45
- Animation: Pulse + float (20px y-translate)

### Dark Mode Considerations

**Light Mode:**
- Slightly reduced opacity (0.3-0.4) to avoid overwhelming
- Glow effect still visible against light background
- Blue tones may appear brighter

**Dark Mode:**
- Full opacity (0.4-0.5) for visibility against dark bg
- Glow effect dramatically more prominent
- Creates striking, immersive effect

---

## Implementation Architecture

### Component Structure

```tsx
export const PlasmaDot = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "pointer-events-none absolute inset-x-1/2 inset-y-1/2",
      "aspect-square w-[500px] -translate-x-1/2 -translate-y-1/2",
      "rounded-full blur-[160px]",
      "bg-gradient-to-br from-plasma-core via-plasma-deep-blue to-plasma-outer",
      "opacity-40 dark:opacity-50",
      "animate-plasma-pulse dark:animate-plasma-pulse-dark",
      "hidden lg:block", // Hide on smaller devices
      className
    )}
    {...props}
  />
);
```

### CSS Variable Tokens

```css
/* In app/globals.css */
:root {
  --plasma-core: #ff6b00;
  --plasma-orange: #ff9500;
  --plasma-deep-blue: #2563eb;
  --plasma-blue: #3b82f6;
  --plasma-light-blue: #e8f4ff;
  --plasma-white: #ffffff;
}

@theme inline {
  --color-plasma-core: var(--plasma-core);
  --color-plasma-deep-blue: var(--plasma-deep-blue);
  --color-plasma-blue: var(--plasma-blue);
  --color-plasma-light-blue: var(--plasma-light-blue);
  --color-plasma-white: var(--plasma-white);
}
```

### Tailwind Configuration

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      'plasma-core': 'var(--plasma-core)',
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
    },
  },
}
```

---

## Integration Points

### Where to Add

**File:** `components/ai-elements/prompt-input.tsx`
**Parent Container:** `InputGroup` wrapper (line ~757)

**Integration Pattern:**
```tsx
<InputGroup className="overflow-hidden relative">
  {/* Add PlasmaDot component here */}
  <PlasmaDot />
  {/* Existing content */}
  {children}
</InputGroup>
```

### Wrapping Strategy

The glow element wraps inside the form's InputGroup to:
1. Sit behind all interactive elements
2. Scope blur effect to form area
3. Maintain z-index hierarchy
4. Allow InputGroup to handle overflow cleanly

---

## Light & Dark Mode Strategy

### Light Mode
- Outer whitish glow creates subtle luminescence
- Blue and red tones visible but not overwhelming
- Overall effect: Ethereal, gentle tech aesthetic
- Opacity: 0.35-0.4

### Dark Mode
- Same colors but appear more vibrant against dark bg
- Red-orange core pops significantly
- Blue creates deeper, more immersive effect
- Opacity: 0.45-0.5 for increased presence

**Key Insight:** No color changes needed—alpha opacity variation handles both modes automatically.

---

## Animation Performance Considerations

### GPU Optimization
- Uses CSS keyframes (GPU-accelerated)
- Only animates `opacity`, `filter`, `transform` (performant properties)
- `will-change: opacity, filter` hint for browser
- Blur effect uses `backdrop-filter` for efficiency

### Mobile Optimization
- Animation disabled on xs/sm devices (reduces jank)
- Reduced blur and scale values on mobile
- Float effect only on md+ breakpoints
- Lower opacity on smaller screens reduces rendering load

### Best Practices
- Animation timing: 4s is slow enough to feel premium
- Ease curves: `ease-in-out` prevents jarring motion
- Filter performance: Heavy blur (120-160px) but on static element
- No paint thrashing: Only transform/filter animated

---

## Accessibility Compliance

### Prefers Reduced Motion
For users with motion sensitivity:
```css
@media (prefers-reduced-motion: prefer-reduced) {
  .animate-plasma-pulse {
    animation: none;
    opacity: 0.4;
  }
}
```

### Contrast & Visibility
- Glow doesn't obscure input text
- Input remains fully readable in all modes
- Focus states remain visible on input elements
- No interaction interference (pointer-events: none)

### Keyboard Navigation
- Tab order unaffected
- Focus rings visible on interactive elements
- Form submission accessible via keyboard

---

## Design Rationale & Psychology

### Color Choice Justification

**Whitish Outer Layer:**
- Represents clarity and purity
- Creates soft, approachable aesthetic
- Frames the glow without harsh edges

**Vibrant Blue Middle:**
- Psychological associations: Trust, intelligence, technology
- Primary blue aligns with design system
- Familiar yet energetic

**Red-Orange Core:**
- Invokes: Energy, passion, innovation
- Plasma appearance references sci-fi/space
- Draws eye to input without distraction

### Emotional Journey
1. **First Glance:** Surreal, inviting glow catches attention
2. **Hover/Focus:** Pulse animation signals responsiveness
3. **Interaction:** Glow reinforces the input's importance
4. **Engagement:** Float effect creates immersive feeling

---

## Iterative Testing & Refinement

### Phase 1: Visual Validation
- [ ] Screenshot desktop, tablet, mobile
- [ ] Compare light and dark modes
- [ ] Verify glow intensity across devices
- [ ] Check blur effect quality

### Phase 2: Animation Testing
- [ ] Verify pulse timing feels natural
- [ ] Check for jank on mobile devices
- [ ] Test with prefers-reduced-motion
- [ ] Measure performance (FPS, CPU usage)

### Phase 3: Interaction Testing
- [ ] Confirm input remains fully functional
- [ ] Verify z-index stacking correct
- [ ] Test keyboard navigation
- [ ] Test mouse hover/focus states

### Phase 4: Cross-Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (especially backdrop-filter)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

---

## Success Criteria

1. **Visual Quality:**
   - Glow effect visible and aesthetically pleasing on all devices
   - Color gradients smooth and natural
   - No harsh edges or artifacts
   - Blur effect smooth (no pixelation)

2. **Responsiveness:**
   - Scales appropriately from 320px to 2560px
   - Animation smooth on 60fps displays
   - No jank or layout thrashing

3. **Functionality:**
   - Input remains fully interactive
   - No z-index conflicts
   - Form submission works perfectly
   - All buttons/actions accessible

4. **Accessibility:**
   - Motion animations respect prefers-reduced-motion
   - Contrast ratios maintained
   - Keyboard navigation unaffected
   - Screen reader compatibility

5. **Performance:**
   - Load time unaffected
   - GPU utilization efficient
   - No memory leaks from animations
   - Smooth 60fps animation on target devices

---

## Future Enhancements

### Phase 2 Possibilities
- Interactive glow following mouse cursor (3D space effect)
- Dynamic color shifting based on user activity
- Particle system overlaying the glow
- Shader-based effects for WebGL implementation
- Sound design synchronized with animation

### Advanced Iterations
- Three.js integration for full 3D plasma effect
- Physics-based animation with forces
- Real-time shader generation
- ML-driven color adaptation

---

## Technical Dependencies

- **Tailwind CSS v4:** For gradient, blur, and animation utilities
- **shadcn/ui:** InputGroup component structure
- **React 19:** Component composition
- **CSS3 Features:** Radial gradients, backdrop-filter, keyframe animations
- **CSS Custom Properties:** Dynamic token management

---

## File References

**Primary Implementation Files:**
- `components/ai-elements/prompt-input.tsx` - Integration point
- `app/globals.css` - CSS variables and @keyframes definitions
- `tailwind.config.ts` - Theme extensions
- `docs/design-guidelines.md` - Design system documentation

**Related Documentation:**
- `docs/code-standards.md` - Component patterns
- `docs/codebase-summary.md` - Architecture reference

---

## Deliverables Checklist

- [x] Design specification document (this file)
- [ ] PlasmaDot component implementation
- [ ] CSS variables added to globals.css
- [ ] Tailwind config extensions
- [ ] Animation keyframes defined
- [ ] Responsive behavior tested
- [ ] Dark mode verified
- [ ] Performance optimized
- [ ] Accessibility compliance verified
- [ ] Cross-browser testing completed
- [ ] Documentation updated
- [ ] Design guidelines updated with plasma effect patterns

---

**Document Status:** Ready for Implementation
**Next Step:** Create PlasmaDot component and integrate into prompt-input.tsx
