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
