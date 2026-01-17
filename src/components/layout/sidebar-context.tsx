"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const STORAGE_KEY = "sidebar-collapsed";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load preference from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setIsCollapsed(stored === "true");
    }
  }, []);

  // Persist preference to localStorage
  const setCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed);
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, []);

  const toggle = useCallback(() => {
    setCollapsed(!isCollapsed);
  }, [isCollapsed, setCollapsed]);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

// Default values for when used outside provider (e.g., mobile sidebar)
const defaultSidebarContext: SidebarContextType = {
  isCollapsed: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  toggle: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setCollapsed: () => {},
};

export function useSidebar() {
  const context = useContext(SidebarContext);
  // Return default context if not within provider (for mobile sidebar)
  return context ?? defaultSidebarContext;
}
