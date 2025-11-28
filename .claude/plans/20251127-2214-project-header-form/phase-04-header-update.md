# Phase 04: Header Component Update with Project Metadata

**Plan:** [20251127-2214-project-header-form](./plan.md) | **Phase:** 04/04
**Status:** Pending | **Priority:** Medium | **Date:** 2025-11-27

## Context

**Parent Plan:** [plan.md](./plan.md)
**Dependencies:** [Phase 03 - API Enhancement](./phase-03-api-enhancement.md)
**Next Phase:** None (final phase)

## Overview

Update header component to display three h1 elements showing Sales Order Number (SO_NUM), Job Name (JOB_NAME), and Customer Name (CUSTOMER_NAME). Elements positioned left-to-right with progressive margins toward center. State managed via Context API for cross-component access.

## Key Insights from Research

**Current header (lines 16-58):**
- Mobile menu toggle (left side)
- Theme toggle + EMJAC logo (right side)
- No project metadata display

**Requirements:**
- Three h1 elements: SO_NUM, JOB_NAME, CUSTOMER_NAME
- Left alignment with progressive margins toward middle
- State shared between ClaudeChat and Header components

## Requirements

### Functional
1. Display SO_NUM, JOB_NAME, CUSTOMER_NAME in header
2. Left-to-right layout with progressive spacing
3. Update when project header form submitted
4. Hide metadata when no active project
5. Responsive design (collapse on mobile)

### Non-Functional
- Context updates: <50ms
- No layout shift when metadata appears
- Accessible labels for screen readers
- Text truncation for long names

## Architecture

### State Management (Context API)
```
[ProjectContext]
├── Provider wraps entire app
├── State: { SO_NUM, JOB_NAME, CUSTOMER_NAME }
├── Updated by: ClaudeChat after form submission
└── Consumed by: Header component
```

### Component Structure
```
Header
├── Mobile Menu Toggle (left)
├── Project Metadata (center-left) ← NEW
│   ├── h1: SO_NUM
│   ├── h1: JOB_NAME
│   └── h1: CUSTOMER_NAME
└── Theme Toggle + Logo (right)
```

### Layout Flow
```
[Mobile Toggle] [SO_NUM] ····· [JOB_NAME] ········· [CUSTOMER_NAME] ················ [Theme] [EMJAC]
    (0px)        (16px)          (32px)              (48px)                           (auto)
```

## Related Code Files

**Files to create:**
- `components/providers/project-context.tsx` (new Context provider)

**Files to modify:**
- `components/header.tsx` (lines 16-58)
- `components/ClaudeChat.tsx` (import and use context)
- `app/layout.tsx` (wrap with ProjectProvider)

**Files to reference:**
- `components/providers/theme-provider.tsx` (similar context pattern)
- `components/providers/sidebar-provider.tsx` (state management pattern)

## Implementation Steps

### Step 1: Create Project Context Provider
**File:** `components/providers/project-context.tsx`

```typescript
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ProjectMetadata {
  SO_NUM: string;
  JOB_NAME: string;
  CUSTOMER_NAME: string;
}

interface ProjectContextType {
  metadata: ProjectMetadata | null;
  setMetadata: (metadata: ProjectMetadata | null) => void;
  clearMetadata: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [metadata, setMetadata] = useState<ProjectMetadata | null>(null);

  const clearMetadata = () => setMetadata(null);

  return (
    <ProjectContext.Provider value={{ metadata, setMetadata, clearMetadata }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
```

### Step 2: Wrap App with Provider
**File:** `app/layout.tsx`

Find the providers section and add ProjectProvider:
```typescript
import { ProjectProvider } from '@/components/providers/project-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SidebarProvider>
            <ProjectProvider>  {/* ADD THIS */}
              {children}
            </ProjectProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Step 3: Update ClaudeChat to Set Context
**File:** `components/ClaudeChat.tsx`

Add import at top:
```typescript
import { useProject } from '@/components/providers/project-context';
```

Use context in component (after state declarations):
```typescript
export function ClaudeChat() {
  // ... existing state ...
  const { setMetadata } = useProject();

  // ... rest of component ...
}
```

Update handleFormSubmit (around line 130) to set context on success:
```typescript
const handleFormSubmit = async (formData: Record<string, any>) => {
  // ... existing validation ...

  try {
    const response = await fetch('/api/generate-project-doc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectData: {
          ...formData,
          productType: projectContext.productType,
          salesOrderNumber: projectContext.salesOrderNumber,
        },
        action: 'project_header',
        targetFolder: projectContext.folderPath,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // UPDATE PROJECT CONTEXT FOR HEADER
      setMetadata({
        SO_NUM: formData.SO_NUM || projectContext.salesOrderNumber,
        JOB_NAME: formData.JOB_NAME || '',
        CUSTOMER_NAME: formData.CUSTOMER_NAME || '',
      });

      // ... existing success message ...
    }
  } catch (error) {
    // ... existing error handling ...
  }
};
```

### Step 4: Update Header Component
**File:** `components/header.tsx`

Replace entire file:
```typescript
"use client";

import { Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { useProject } from "@/components/providers/project-context";
import { Shimmer } from "./ai-elements/shimmer";

export function Header() {
  const { setTheme, resolvedTheme } = useTheme();
  const { isOpen: sidebarOpen, toggle: toggleSidebar } = useSidebar();
  const { metadata } = useProject();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile Menu Toggle - Left Side */}
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            aria-label="Toggle sidebar menu"
            aria-expanded={sidebarOpen}
            aria-controls="chat-sidebar"
            className="flex size-10 items-center justify-center rounded-[10px] text-secondary-foreground transition-all duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>

        {/* Project Metadata - Center-Left */}
        {metadata && (
          <div className="hidden lg:flex items-center gap-4 flex-1 max-w-3xl ml-4">
            <h1
              className="text-xl font-semibold text-foreground truncate"
              title={`Sales Order: ${metadata.SO_NUM}`}
            >
              {metadata.SO_NUM}
            </h1>
            <h1
              className="text-xl font-semibold text-foreground/90 truncate ml-8"
              title={`Job Name: ${metadata.JOB_NAME}`}
            >
              {metadata.JOB_NAME}
            </h1>
            <h1
              className="text-xl font-semibold text-foreground/80 truncate ml-12"
              title={`Customer: ${metadata.CUSTOMER_NAME}`}
            >
              {metadata.CUSTOMER_NAME}
            </h1>
          </div>
        )}

        {/* EMJAC Logo and Theme Toggle - Right Side */}
        <div className="flex items-center justify-end gap-3 mr-4 ml-auto">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="group relative flex size-10 items-center justify-center rounded-[10px] transition-all duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          >
            <div className="relative">
              {resolvedTheme === "dark" ? (
                <Sun className="size-5 transition-transform duration-300 group-hover:rotate-45" />
              ) : (
                <Moon className="size-5 transition-transform duration-300 group-hover:-rotate-20" />
              )}
            </div>
          </button>

          {/* EMJAC Logo */}
          <div className="flex items-center gap-1">
            <h1 className="font-bold text-3xl tracking-tight whitespace-nowrap">EM</h1>
            <Shimmer duration={4} spread={20} as="h1" className="font-bold text-3xl tracking-tight whitespace-nowrap">
              JAC
            </Shimmer>
          </div>
        </div>
      </div>
    </header>
  );
}
```

### Step 5: Add Responsive Styles
**File:** `components/header.tsx`

Add mobile view with tooltip on hover:
```typescript
{/* Mobile Metadata - Compact View */}
{metadata && (
  <div className="flex lg:hidden items-center ml-2">
    <button
      className="text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors"
      title={`${metadata.SO_NUM} - ${metadata.JOB_NAME} - ${metadata.CUSTOMER_NAME}`}
    >
      {metadata.SO_NUM}
    </button>
  </div>
)}
```

Insert after mobile menu toggle, before desktop metadata.

### Step 6: Add Clear Metadata on New Project
**File:** `components/ClaudeChat.tsx`

In WelcomeScreen's handleButtonClick (when opening dialog):
```typescript
const handleButtonClick = (product: string) => {
  setSelectedProduct(product);
  setSalesOrder("");
  setFeedback(null);
  clearMetadata(); // Clear previous project metadata
  setDialogOpen(true);
};
```

Import `clearMetadata` from context:
```typescript
const { setMetadata, clearMetadata } = useProject();
```

### Step 7: Style Enhancements
**File:** `components/header.tsx`

Add visual separators between metadata fields:
```typescript
<div className="hidden lg:flex items-center gap-0 flex-1 max-w-3xl ml-4">
  <div className="flex items-center gap-2">
    <span className="text-xs text-muted-foreground uppercase tracking-wide">SO</span>
    <h1 className="text-lg font-bold text-foreground truncate">
      {metadata.SO_NUM}
    </h1>
  </div>

  <span className="mx-4 text-muted-foreground">•</span>

  <div className="flex items-center gap-2">
    <span className="text-xs text-muted-foreground uppercase tracking-wide">Job</span>
    <h1 className="text-lg font-semibold text-foreground/90 truncate">
      {metadata.JOB_NAME}
    </h1>
  </div>

  <span className="mx-4 text-muted-foreground">•</span>

  <div className="flex items-center gap-2">
    <span className="text-xs text-muted-foreground uppercase tracking-wide">Customer</span>
    <h1 className="text-lg font-semibold text-foreground/80 truncate">
      {metadata.CUSTOMER_NAME}
    </h1>
  </div>
</div>
```

## Todo List

- [ ] Create `components/providers/project-context.tsx` with ProjectProvider
- [ ] Add ProjectProvider to `app/layout.tsx`
- [ ] Import `useProject` in ClaudeChat component
- [ ] Update `handleFormSubmit` to call `setMetadata` on success
- [ ] Update `handleButtonClick` to call `clearMetadata` on new project
- [ ] Import `useProject` in Header component
- [ ] Add metadata display section to Header (desktop view)
- [ ] Add compact metadata display for mobile
- [ ] Add labels (SO, Job, Customer) with separators
- [ ] Test metadata appears after form submission
- [ ] Test metadata clears on new project creation
- [ ] Verify responsive layout on mobile/tablet/desktop
- [ ] Add truncation for long text values
- [ ] Verify accessibility (screen reader labels)

## Success Criteria

- [ ] Header displays SO_NUM, JOB_NAME, CUSTOMER_NAME after form submission
- [ ] Layout uses progressive left-to-right margins (0, 8px, 12px)
- [ ] Metadata hidden when no active project
- [ ] Metadata clears when creating new project
- [ ] Responsive: Full view on desktop, compact on mobile
- [ ] Text truncates gracefully for long names
- [ ] No console errors or warnings
- [ ] Context updates reflect in header immediately (<50ms)

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Layout shift when metadata appears | Medium | Reserve space or use absolute positioning |
| Long text overflow | Low | Add truncate class, title tooltip |
| Context not updating | High | Test with console.log, verify provider wraps app |
| Mobile layout break | Medium | Test responsive breakpoints, add overflow-hidden |

## Security Considerations

1. **XSS Prevention:** All metadata values already sanitized by DynamicFormRenderer
2. **HTML Injection:** Use textContent rendering (React default)
3. **Data Leakage:** Metadata only visible to authenticated users (if auth added later)
4. **Context Poisoning:** Only ClaudeChat can set metadata (trusted component)

## Visual Design Notes

### Desktop Layout (>1024px)
```
┌────────────────────────────────────────────────────────────────────┐
│ [☰] SO-12345 ·· Kitchen Remodel ··· Acme Corp ············ [🌙] EM JAC │
└────────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (<1024px)
```
┌──────────────────────────────────┐
│ [☰] SO-12345 ············ [🌙] EM JAC │
└──────────────────────────────────┘
```

### Spacing (Tailwind Classes)
- First h1: `ml-0` (16px from toggle)
- Second h1: `ml-8` (32px total)
- Third h1: `ml-12` (48px total)
- Visual separators: `mx-4` (16px each side)

## Next Steps

**Phase 04 is the final phase.** After completion:
1. Run full integration test (create project → fill form → verify header)
2. Test edge cases (empty fields, special characters, very long names)
3. Document usage in project README
4. Consider adding header metadata to session storage for persistence across page reloads

**Optional enhancements (future):**
- Add "Edit Project Header" button in header
- Show project creation date in tooltip
- Add product type badge (SDI/EMJAC/Harmonic)
- Animate metadata fade-in on update
