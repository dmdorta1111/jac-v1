"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useProject } from "@/components/providers/project-context";

const PRODUCT_TYPES = ["SDI", "EMJAC", "HARMONIC"] as const;

interface NewProjectDialogProps {
  onProjectCreated?: (productType: string, salesOrderNumber: string, folderPath: string) => void;
  onExistingProjectLoad?: (productType: string, salesOrderNumber: string, folderPath: string) => Promise<void>;
  setProjectContext?: (context: { productType: string; salesOrderNumber: string; folderPath: string }) => void;
}

export function NewProjectDialog({
  onProjectCreated,
  onExistingProjectLoad,
  setProjectContext,
}: NewProjectDialogProps) {
  const { showNewProjectDialog, closeNewProjectDialog } = useProject();
  const [step, setStep] = useState<'select' | 'enter-so'>('select');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [salesOrder, setSalesOrder] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleProductSelect = (product: string) => {
    setSelectedProduct(product);
    setSalesOrder("");
    setFeedback(null);
    setStep('enter-so');
  };

  const handleBack = () => {
    setStep('select');
    setSelectedProduct(null);
    setSalesOrder("");
    setFeedback(null);
  };

  const handleClose = () => {
    setStep('select');
    setSelectedProduct(null);
    setSalesOrder("");
    setFeedback(null);
    closeNewProjectDialog();
  };

  const handleSubmit = async () => {
    if (!salesOrder.trim() || !selectedProduct) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/create-project-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: selectedProduct,
          salesOrderNumber: salesOrder.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store project context for form submission
        if (setProjectContext) {
          setProjectContext({
            productType: selectedProduct,
            salesOrderNumber: salesOrder.trim(),
            folderPath: data.path,
          });
        }

        if (data.exists) {
          // Existing project - load and rebuild sessions
          setFeedback({ type: 'success', message: `Loading existing project: ${data.path}` });

          setTimeout(async () => {
            handleClose();
            if (onExistingProjectLoad) {
              await onExistingProjectLoad(selectedProduct, salesOrder.trim(), data.path);
            }
          }, 1000);
        } else {
          // New project - show project header form
          setFeedback({ type: 'success', message: `Project folder created: ${data.path}` });

          setTimeout(() => {
            handleClose();
            if (onProjectCreated) {
              onProjectCreated(selectedProduct, salesOrder.trim(), data.path);
            }
          }, 1500);
        }
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to create folder' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting && salesOrder.trim()) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={showNewProjectDialog} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[423px]">
        {step === 'select' ? (
          <>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Select a product type to get started.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3 py-4">
              {PRODUCT_TYPES.map((product) => (
                <Button
                  key={product}
                  variant="outline"
                  size="lg"
                  onClick={() => handleProductSelect(product)}
                  className="w-full h-12 text-base font-medium rounded-md transition-all duration-200 border-0 bg-[#3f3f42] hover:bg-[#4a4a4d] text-white"
                >
                  {product}
                </Button>
              ))}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                className="h-9 px-4 rounded-md border-0 bg-[#353538] hover:bg-[#404043] text-white"
              >
                Cancel
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create {selectedProduct} Project</DialogTitle>
              <DialogDescription>
                Enter the sales order number to create a new project folder.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4">
              <div className="space-y-2">
                <label htmlFor="salesOrder" className="text-sm font-medium text-foreground">
                  Sales Order Number
                </label>
                <Input
                  id="salesOrder"
                  name="salesOrder"
                  placeholder="Enter sales order number"
                  value={salesOrder}
                  onChange={(e) => setSalesOrder(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSubmitting}
                  autoFocus
                  className="rounded-md bg-[#353538] shadow-none [outline:none!important] [border:none!important] focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus:ring-0"
                />
              </div>

              {feedback && (
                <div
                  className={`rounded-md px-3 py-2.5 text-sm ${
                    feedback.type === 'success'
                      ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  }`}
                >
                  {feedback.message}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
                className="h-9 px-4 rounded-md border-0 bg-[#353538] hover:bg-[#404043] text-white"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !salesOrder.trim()}
                className="h-9 px-4 rounded-md border-0 shadow-2xs"
              >
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
