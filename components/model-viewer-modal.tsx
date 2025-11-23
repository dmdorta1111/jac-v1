"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon, Maximize2, Minimize2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Interface } from "@/components/3d-model-viewer/interface";
import Experience from "@/components/3d-model-viewer/Experience";
import { ConfiguratorProvider } from "@/components/3d-model-viewer/Configurator";
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
