"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface StdsModalContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const StdsModalContext = createContext<StdsModalContextType | undefined>(undefined);

export function StdsModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <StdsModalContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </StdsModalContext.Provider>
  );
}

export function useStdsModal() {
  const context = useContext(StdsModalContext);
  if (context === undefined) {
    throw new Error("useStdsModal must be used within a StdsModalProvider");
  }
  return context;
}
