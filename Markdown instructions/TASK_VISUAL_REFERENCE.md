# Task Component - Visual Reference Guide

## 📱 How It Looks in the Chat

### Task Container Layout
```
┌─────────────────────────────────────────┐
│  Message Content                        │
│                                         │
│  [Reasoning Steps - if present]         │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ Task List Section                   ││
│  ├─────────────────────────────────────┤│
│  │ ✓ Task 1: Complete           ▼ │││
│  │ • Item 1                          │││
│  │ • Item 2                          │││
│  │ • Item 3                          │││
│  ├─────────────────────────────────────┤│
│  │ ● Task 2: Active              ▼ │││  ← Auto-expanded
│  │ • Item A                          │││
│  │ • Item B                          │││
│  │ • Item C                          │││
│  ├─────────────────────────────────────┤│
│  │ ○ Task 3: Pending            ► │││
│  └─────────────────────────────────────┘│
│                                         │
│  [File Attachments - if present]        │
│  [Timestamp]                            │
└─────────────────────────────────────────┘
```

## 🎨 Status-Based Styling Reference

### PENDING Status
```
Background: Light gray (bg-slate-200/50)
Text Color: Gray (text-muted-foreground)
Indicator: Empty circle outline
Icon: Border only, no fill
Behavior: Collapsed by default
Click: Expands to show items

Example:
┌─ ○ Setup Database            ►
└─ (Collapsed - click to expand)
```

### ACTIVE Status
```
Background: Light blue (bg-blue-100/50)
Text Color: Blue (text-blue-600)
Indicator: Filled blue dot
Icon: Small filled circle
Behavior: Auto-expands
Click: Can collapse

Example:
┌─ ● Building Components        ▼
├─ • Component A
├─ • Component B
└─ • Component C
(Currently working - auto-expanded)
```

### COMPLETE Status
```
Background: Light green (bg-green-100/50)
Text Color: Green (text-green-600)
Indicator: Green checkmark (✓)
Icon: Checkmark in circle
Behavior: Collapsed by default
Click: Expands to show items

Example:
┌─ ✓ Environment Setup         ►
└─ (Collapsed - click to expand)
```

## 🌙 Dark Mode Colors

### Dark Mode Pending
```
Background: Dark slate (bg-slate-800/50)
Text Color: Light gray (text-muted-foreground)
Indicator: Light border, no fill
```

### Dark Mode Active
```
Background: Dark blue (bg-blue-950/50)
Text Color: Light blue (text-blue-400)
Indicator: Light blue filled dot
```

### Dark Mode Complete
```
Background: Dark green (bg-green-950/50)
Text Color: Light green (text-green-400)
Indicator: Light green checkmark
```

## 📐 Component Measurements

### Task Header
```
Height: 48px (p-2.5 + h-5 indicator)
Padding: 10px (p-2.5)
Border Radius: 8px (rounded-lg)
Gap: 12px between elements
Font Size: 14px (text-sm)
Font Weight: 600 (font-semibold)
```

### Status Indicator
```
Width: 20px (w-5)
Height: 20px (h-5)
Border Radius: 50% (rounded-full)
Border Width: 2px (border-2)
```

### Task Items List
```
Margin Top: 8px (mt-2)
Item Height: Auto
Padding: 8px 0 (py-2)
Gap: 8px (space-y-2)
Bullet: • (text)
Item Font Size: 14px (text-sm)
```

## 🎬 Interactive States

### Default State (Pending)
```
Visual: Collapsed, gray background
Cursor: Pointer
Hover: Opacity reduces to 80%
```

### Hovered State
```
Visual: opacity-80 applied
Cursor: Pointer
Background: Slightly transparent
```

### Expanded State (Active)
```
Visual: Full content visible
Chevron: Rotated 180°
Animation: Smooth slide-in
```

### Collapsed State
```
Visual: Only header visible
Chevron: Pointing down
Animation: Smooth slide-out
```

## 🔄 Animation Details

### Chevron Rotation
```
Class: group-data-[state=open]:rotate-180
Duration: Inherits from Collapsible
Direction: 180° rotation on open
Smooth: CSS transition applied
```

### Content Animation
```
Type: Slide + Fade
Direction: Vertical slide
Duration: Smooth transition
Start: Top of content
Easing: CSS default
```

## 📊 Layout Hierarchy

### Message Bubble
```
├─ Message Component
│  ├─ MessageContent
│  │  ├─ Chain of Thought (if reasoning exists)
│  │  ├─ Task List Section (if tasks exist)
│  │  │  ├─ Task 1
│  │  │  ├─ Task 2
│  │  │  └─ Task 3
│  │  ├─ Message Text
│  │  ├─ File Attachments (if files exist)
│  │  └─ Timestamp
```

## 🧩 Component Structure

```tsx
// Full Task Component Hierarchy
<Task>                           {/* Container */}
  <TaskTrigger>                  {/* Clickable Header */}
    <div>
      <StatusIndicator />        {/* Circle with icon */}
      <TaskTitle />              {/* Task name */}
      <ChevronIcon />            {/* Expand/collapse arrow */}
    </div>
  </TaskTrigger>
  <TaskContent>                  {/* Expandable area */}
    <TaskItem>Item 1</TaskItem>
    <TaskItem>Item 2</TaskItem>
    <TaskItem>Item 3</TaskItem>
  </TaskContent>
</Task>
```

## 🎨 Color Palette Reference

### Status Colors (Light Mode)
```
Pending:
  - Background: #e2e8f0 (50% opacity)
  - Text: #9ca3af
  - Border: #9ca3af

Active:
  - Background: #dbeafe (50% opacity)
  - Text: #2563eb
  - Border/Fill: #2563eb

Complete:
  - Background: #dcfce7 (50% opacity)
  - Text: #16a34a
  - Border/Fill: #16a34a
```

### Status Colors (Dark Mode)
```
Pending:
  - Background: #1e293b (50% opacity)
  - Text: #9ca3af
  - Border: #4b5563

Active:
  - Background: #082f49 (50% opacity)
  - Text: #60a5fa
  - Border/Fill: #60a5fa

Complete:
  - Background: #064e3b (50% opacity)
  - Text: #4ade80
  - Border/Fill: #4ade80
```

## 📝 Typography

```
Task Title:
  - Font Size: 14px (text-sm)
  - Font Weight: 600 (font-semibold)
  - Line Height: Normal

Task Items:
  - Font Size: 14px (text-sm)
  - Font Weight: 400 (normal)
  - Line Height: Normal
  - Color: Inherits from TaskItem (muted-foreground)

Bullet Point:
  - Character: •
  - Font Size: 12px (text-xs)
  - Font Weight: 600 (font-semibold)
  - Color: Muted foreground
```

## 🎯 Spacing Reference

```
Task Container: space-y-3 (12px gap between tasks)
Item Container: space-y-2 (8px gap between items)
Header Padding: p-2.5 (10px all sides)
Header Gap: gap-3 (12px between elements)
Left Border: pl-4 (16px left padding)
Top Margin: mt-4 (16px)
Bottom Margin: mb-4 (16px)
```

## 📱 Responsive Behavior

### Mobile (< 640px)
```
Width: Full container width
Font Size: Same as desktop (no reduction)
Padding: Maintains readability
Stacking: Single column
```

### Tablet (640px - 1024px)
```
Width: 90-95% of container
Font Size: Same
Padding: Comfortable spacing
Stacking: Single column
```

### Desktop (> 1024px)
```
Width: 75% max (max-w-[75%])
Font Size: Standard (text-sm)
Padding: Generous
Stacking: Single column (tasks flow vertically)
```

## 🚀 Performance Notes

- Tasks only render if array exists and has items
- Only bot messages can have tasks (!isUser check)
- Collapsible state managed by component library
- No animations on initial load, only on interaction
- Optimized for scrolling in message list

---

**Last Updated**: November 22, 2025  
**Component Version**: 1.0  
**Figma Design**: N/A (Tailwind CSS based)
