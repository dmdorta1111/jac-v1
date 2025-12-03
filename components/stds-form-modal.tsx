"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon, Maximize2, Minimize2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useStdsModal } from "@/components/providers/stds-modal-provider";
import { useProject } from "@/components/providers/project-context";
import { useStandards } from "@/components/providers/standards-provider";
import { Button } from "@/components/ui/button";
import DynamicFormRenderer from "@/components/DynamicFormRenderer";

interface FormField {
  id: string;
  name: string;
  label: string;
  type: string;
  defaultValue?: unknown;
  [key: string]: unknown;
}

interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
}

interface FormSpec {
  formId: string;
  itemType: string;
  title: string;
  description?: string;
  sections: FormSection[];
  submitButton: {
    text: string;
    action: string;
  };
}

export function StdsFormModal() {
  const { isOpen, close } = useStdsModal();
  const { metadata } = useProject();
  const { refresh: refreshStandards } = useStandards();
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [formSpec, setFormSpec] = React.useState<FormSpec | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [projectStandards, setProjectStandards] = React.useState<Record<string, unknown> | null>(null);

  // Build project path from metadata
  const projectPath = React.useMemo(() => {
    if (metadata?.folderPath) {
      return metadata.folderPath;
    }
    if (metadata?.productType && metadata?.SO_NUM) {
      const productFolder = metadata.productType === 'SDI' ? 'SDI' :
                           metadata.productType === 'EMJAC' ? 'EMJAC' : 'HARMONIC';
      return `project-docs/${productFolder}/${metadata.SO_NUM}`;
    }
    return null;
  }, [metadata]);

  // Load form spec and project standards when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setIsLoading(true);

      // Load form spec
      const loadFormSpec = fetch("/form-templates/stds-form.json")
        .then((res) => res.json());

      // Load project standards if we have a project path
      const loadStandards = projectPath
        ? fetch(`/api/project-standards?projectPath=${encodeURIComponent(projectPath)}`)
            .then((res) => res.ok ? res.json() : { standards: null })
            .then((data) => data.standards || null)
            .catch(() => null)
        : Promise.resolve(null);

      Promise.all([loadFormSpec, loadStandards])
        .then(([spec, standards]) => {
          // If we have project standards, merge them into form spec as defaultValues
          if (standards && Object.keys(standards).length > 0) {
            const updatedSpec = {
              ...spec,
              sections: spec.sections.map((section: FormSection) => ({
                ...section,
                fields: section.fields.map((field: FormField) => ({
                  ...field,
                  defaultValue: standards[field.name] !== undefined
                    ? standards[field.name]
                    : field.defaultValue,
                })),
              })),
            };
            setFormSpec(updatedSpec);
            setProjectStandards(standards);
          } else {
            setFormSpec(spec);
            setProjectStandards(null);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load STDS form:", err);
          setIsLoading(false);
        });
    }
  }, [isOpen, projectPath]);

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

  // Called by DynamicFormRenderer when user clicks Submit
  const handleSubmit = async (formData: Record<string, unknown>) => {
    try {
      // If we have a project path, save to project-header.json
      if (projectPath) {
        const response = await fetch("/api/project-standards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectPath,
            standards: formData,
          }),
        });

        if (response.ok) {
          setProjectStandards(formData);
          await refreshStandards();
          toast.success("Project standards saved successfully");
          close();
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || "Failed to save standards");
        }
      } else {
        // No project selected - show warning
        toast.warning("No project selected. Please create or select a project first.");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Error saving standards");
    }
  };

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
            "fixed z-50 bg-background border border-border rounded-2xl shadow-2xl flex flex-col",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "duration-300 ease-out",
            isFullscreen
              ? "inset-2 sm:inset-4"
              : "top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[95vw] h-[90vh] max-w-7xl"
          )}
        >
          {/* Header Bar */}
          <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-sm border-b border-border rounded-t-2xl">
            <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
              Project Standards
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

          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading form...</p>
              </div>
            ) : formSpec ? (
              <DynamicFormRenderer
                sessionId="stds-modal"
                formSpec={formSpec as Parameters<typeof DynamicFormRenderer>[0]["formSpec"]}
                onSubmit={handleSubmit}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-destructive">Failed to load form</p>
              </div>
            )}
          </div>

          {/* Hidden description for accessibility */}
          <DialogPrimitive.Description className="sr-only">
            Configure project-level standards for door and frame manufacturing.
          </DialogPrimitive.Description>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
