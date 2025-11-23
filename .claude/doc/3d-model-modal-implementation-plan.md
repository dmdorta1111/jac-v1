# 3D Model Viewer Modal - Implementation Plan

## Overview

This document outlines the comprehensive implementation plan for converting the existing `/app/models/page.tsx` (3D Model Viewer page) into a large modal dialog that can be triggered from the sidebar.

## Research Summary

### Existing Components Analysis

#### 1. Current Models Page (`app/models/page.tsx`)
- Uses `@react-three/fiber` Canvas with antialiasing and shadows
- Camera positioned at `[4, 0, 6]` with FOV 35
- Wrapped in `ConfiguratorProvider` context
- Contains `Experience` and `Interface` components
- CSS class `.Models` sets `100vw x 100vh` dimensions

#### 2. Existing Dialog Component (`components/ui/dialog.tsx`)
- Built on `@radix-ui/react-dialog`
- Current overlay: `bg-black/50` (50% black opacity)
- Has animations: `fade-in-0`, `fade-out-0`, `zoom-in-95`, `zoom-out-95`
- Content max-width: `sm:max-w-lg` (too small for 3D viewer)
- Has `showCloseButton` prop for optional close button

#### 3. Sidebar Component (`components/leftsidebar.tsx`)
- Contains "New Chat" button with Plus icon
- Has chat sessions list with navigation
- Uses `useSidebar` hook from sidebar-provider
- Styled with gradient backgrounds and consistent button patterns

#### 4. Context Providers (in `app/layout.tsx`)
- `ThemeProvider` wraps entire app
- `SidebarProvider` already exists for sidebar state
- Both are available at root level

---

## Proposed Implementation

### 1. New Modal Provider for Model Viewer

**File: `components/providers/model-modal-provider.tsx`**

```tsx
"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface ModelModalContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const ModelModalContext = createContext<ModelModalContextType | undefined>(undefined);

export function ModelModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <ModelModalContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </ModelModalContext.Provider>
  );
}

export function useModelModal() {
  const context = useContext(ModelModalContext);
  if (context === undefined) {
    throw new Error("useModelModal must be used within a ModelModalProvider");
  }
  return context;
}
```

**Reasoning:**
- Follows existing pattern from `sidebar-provider.tsx`
- Provides global access to modal state
- Allows sidebar button and modal to communicate without prop drilling

---

### 2. Enhanced Dialog Overlay with Blur

**Modification to: `components/ui/dialog.tsx`**

Add a new variant for the overlay with backdrop blur:

```tsx
// Add new DialogOverlayBlurred function
function DialogOverlayBlurred({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay-blurred"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60 backdrop-blur-md",
        className
      )}
      {...props}
    />
  )
}

// Export it
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogOverlayBlurred, // NEW
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
```

**CSS Recommendations for Blur:**
- `backdrop-blur-sm` (4px) - Subtle blur, text still readable
- `backdrop-blur-md` (12px) - **Recommended** - Good balance, clearly blurred
- `backdrop-blur-lg` (16px) - Heavy blur
- `backdrop-blur-xl` (24px) - Very heavy blur

The `bg-black/60` combined with `backdrop-blur-md` creates an elegant effect that:
- Works well in both light and dark modes
- Clearly distinguishes modal from background
- Maintains focus on the 3D viewer

---

### 3. Model Viewer Modal Component

**File: `components/model-viewer-modal.tsx`**

```tsx
"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon, Maximize2, Minimize2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Interface } from "@/components/interface";
import Experience from "@/components/Experience";
import { ConfiguratorProvider } from "@/components/Configurator";
import { useModelModal } from "@/components/providers/model-modal-provider";
import { Button } from "@/components/ui/button";

export function ModelViewerModal() {
  const { isOpen, close } = useModelModal();
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        close();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, close]);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogPrimitive.Portal>
        {/* Blurred Overlay */}
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/60 backdrop-blur-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />

        {/* Modal Content */}
        <DialogPrimitive.Content
          className={cn(
            "fixed z-50 bg-background border border-border rounded-2xl shadow-2xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "duration-300 ease-out",
            // Positioning - centered with responsive sizing
            isFullscreen
              ? "inset-2 sm:inset-4"
              : "top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[95vw] h-[90vh] max-w-7xl"
          )}
        >
          {/* Header Bar */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-sm border-b border-border rounded-t-2xl">
            <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
              3D Model Configurator
            </DialogPrimitive.Title>

            <div className="flex items-center gap-2">
              {/* Fullscreen Toggle */}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>

              {/* Close Button */}
              <DialogPrimitive.Close asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close modal"
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </DialogPrimitive.Close>
            </div>
          </div>

          {/* 3D Canvas Container */}
          <ConfiguratorProvider>
            <div className="relative w-full h-full pt-14 overflow-hidden rounded-b-2xl">
              {/* Canvas takes full available space */}
              <Canvas
                gl={{ antialias: true, preserveDrawingBuffer: true }}
                shadows
                camera={{ position: [4, 0, 6], fov: 35 }}
                className="bg-background"
                style={{ background: 'var(--background)' }}
              >
                <Experience />
              </Canvas>

              {/* Interface Panel - positioned absolutely over canvas */}
              <Interface />
            </div>
          </ConfiguratorProvider>

          {/* Hidden description for accessibility */}
          <DialogPrimitive.Description className="sr-only">
            Configure and view 3D models with customizable materials, colors, and dimensions.
          </DialogPrimitive.Description>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
```

**Key Design Decisions:**

1. **Size**: `w-[95vw] h-[90vh] max-w-7xl` - Large enough for 3D content, responsive
2. **Fullscreen Option**: Toggle between centered modal and near-fullscreen
3. **Canvas Options**:
   - `preserveDrawingBuffer: true` - Helps with WebGL context preservation
   - Background uses CSS variable for theme support
4. **Header Bar**: Semi-transparent with blur for modern look
5. **ConfiguratorProvider**: Wrapped inside modal so context is fresh on each open

---

### 4. Sidebar Button Design

**Modification to: `components/leftsidebar.tsx`**

Add the 3D Model button below the "New Chat" button:

```tsx
// Add import at top
import { Box } from "lucide-react";
import { useModelModal } from "@/components/providers/model-modal-provider";

// Inside LeftSidebar component, add after the New Chat button div:
export function LeftSidebar({ ... }) {
  const { isOpen: mobileSidebarOpen, close: closeSidebar } = useSidebar();
  const { open: openModelModal } = useModelModal();

  // ... existing code ...

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {/* ... existing code ... */}

      {/* Chat History Sidebar */}
      <aside
        id="chat-sidebar"
        role="navigation"
        aria-label="Chat sessions"
        className={`...existing classes...`}
      >
        {/* New Chat Button */}
        <div className="mb-6 px-2">
          <button
            onClick={onNewChat}
            className="...existing classes..."
          >
            <Plus className="h-5 w-5" />
            New Chat
          </button>
        </div>

        {/* NEW: 3D Model Viewer Button */}
        <div className="mb-6 px-2">
          <button
            onClick={() => {
              openModelModal();
              // Close mobile sidebar after opening modal
              if (typeof window !== "undefined" && window.innerWidth < 1024) {
                closeSidebar();
              }
            }}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-gradient-to-br from-blue-50 to-slate-50 px-5 py-3.5 text-sm font-semibold text-blue-600 shadow-md transition-all duration-200 hover:border-blue-400 hover:from-blue-100 hover:to-blue-50 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 dark:border-blue-900/50 dark:bg-gradient-to-br dark:from-blue-950/40 dark:to-blue-900/20 dark:text-blue-400 dark:shadow-lg dark:hover:border-blue-700 dark:hover:from-blue-950/60 dark:hover:to-blue-900/30 dark:hover:text-blue-300"
            aria-label="Open 3D Model Viewer"
          >
            <Box className="h-5 w-5" />
            3D Viewer
          </button>
        </div>

        {/* Chat Sessions List */}
        {/* ... rest of existing code ... */}
      </aside>
    </>
  );
}
```

**Icon Choice: `Box` from lucide-react**
- Represents 3D/spatial concept
- Clean and recognizable
- Alternative options: `Cube`, `View`, `Package`

**Button Styling:**
- Distinct blue gradient to differentiate from "New Chat"
- Matches existing button patterns but with unique color scheme
- Full dark mode support

---

### 5. App Layout Integration

**Modification to: `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SidebarProvider } from "@/components/providers/sidebar-provider";
import { ModelModalProvider } from "@/components/providers/model-modal-provider";
import { ModelViewerModal } from "@/components/model-viewer-modal";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

// ... font configuration ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#0a0f1a] font-sans antialiased`}
      >
        <ThemeProvider defaultTheme="dark" storageKey="emjac-theme">
          <SidebarProvider>
            <ModelModalProvider>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              {/* Modal rendered at root level */}
              <ModelViewerModal />
            </ModelModalProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

## CSS Additions (Optional Enhancements)

**Add to `app/globals.css`:**

```css
/* Modal animations for 3D viewer */
@keyframes modal-scale-in {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes modal-scale-out {
  from {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
}

/* Canvas container for proper Three.js rendering */
.model-canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--background);
  transition: background-color 0.3s ease;
}

/* Ensure canvas fills container */
.model-canvas-container canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
```

---

## Implementation Order

### Phase 1: Foundation
1. Create `model-modal-provider.tsx`
2. Update `app/layout.tsx` to include provider

### Phase 2: Modal Component
3. Create `model-viewer-modal.tsx`
4. Add modal to layout (rendered at root)

### Phase 3: Sidebar Integration
5. Update `leftsidebar.tsx` with 3D Viewer button
6. Test modal opening/closing

### Phase 4: Polish
7. Add optional CSS enhancements to `globals.css`
8. Test responsive behavior
9. Test dark/light mode
10. Test keyboard accessibility

---

## Technical Considerations

### Three.js Canvas in Modal

1. **Canvas Mounting**: The Canvas component will remount each time the modal opens. This is intentional and ensures:
   - Fresh WebGL context
   - No memory leaks from persistent contexts
   - Clean state for ConfiguratorProvider

2. **Performance**: If you need the model to persist, consider:
   - Using `React.memo` on Experience component
   - Implementing a cache for loaded GLTF models
   - Using `frameloop="demand"` on Canvas when modal is hidden

3. **Resize Handling**: React Three Fiber handles resize automatically. The Canvas will adapt to container size changes.

### Accessibility

1. **Focus Management**: Radix Dialog handles focus trapping automatically
2. **Keyboard**: Escape closes modal, Tab navigates controls
3. **Screen Readers**: Title and Description provided
4. **Reduced Motion**: Animations respect `prefers-reduced-motion` via existing CSS

### Mobile Considerations

1. Modal is responsive (`w-[95vw]` with max-width)
2. Sidebar closes automatically when opening modal on mobile
3. Touch interactions work with OrbitControls

---

## Files to Create/Modify Summary

| File | Action | Description |
|------|--------|-------------|
| `components/providers/model-modal-provider.tsx` | CREATE | New context provider for modal state |
| `components/model-viewer-modal.tsx` | CREATE | Main modal component with 3D viewer |
| `components/leftsidebar.tsx` | MODIFY | Add 3D Viewer button |
| `app/layout.tsx` | MODIFY | Add ModelModalProvider and render ModelViewerModal |
| `app/globals.css` | MODIFY (optional) | Add modal animation styles |

---

## Testing Checklist

- [ ] Modal opens from sidebar button
- [ ] Modal closes with X button
- [ ] Modal closes with Escape key
- [ ] Modal closes when clicking overlay
- [ ] 3D model renders correctly
- [ ] Interface panel displays and functions
- [ ] Color picker works
- [ ] Dimension inputs work
- [ ] Material selection works
- [ ] OrbitControls work (rotate, zoom, pan)
- [ ] Dark mode displays correctly
- [ ] Light mode displays correctly
- [ ] Mobile responsive layout
- [ ] Focus trapped in modal when open
- [ ] Body scroll locked when modal open
- [ ] Fullscreen toggle works
- [ ] No console errors
- [ ] No WebGL context warnings

---

Last Updated: 2025-11-22
Status: RESEARCH COMPLETE - READY FOR IMPLEMENTATION
