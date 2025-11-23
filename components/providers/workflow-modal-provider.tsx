"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface WorkflowModalContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const WorkflowModalContext = createContext<WorkflowModalContextType | undefined>(undefined);

export function WorkflowModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <WorkflowModalContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </WorkflowModalContext.Provider>
  );
}

export function useWorkflowModal() {
  const context = useContext(WorkflowModalContext);
  if (context === undefined) {
    throw new Error("useWorkflowModal must be used within a WorkflowModalProvider");
  }
  return context;
}
