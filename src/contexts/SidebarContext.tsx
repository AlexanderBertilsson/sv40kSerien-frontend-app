import { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  // Content to render in the sidebar slot (mobile only)
  sidebarContent: ReactNode | null;
  setSidebarContent: (content: ReactNode | null) => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [sidebarContent, setSidebarContent] = useState<ReactNode | null>(null);

  return (
    <SidebarContext.Provider value={{ sidebarContent, setSidebarContent }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarContent() {
  const context = useContext(SidebarContext);
  if (!context) {
    // Return a no-op if context is not available (standalone usage)
    return {
      sidebarContent: null,
      setSidebarContent: () => {},
    };
  }
  return context;
}
