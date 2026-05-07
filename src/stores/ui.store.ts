// ─────────────────────────────────────────────────────────────
// Neutek Auto Care — UI Store (Zustand)
// ─────────────────────────────────────────────────────────────
import { create } from 'zustand';

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Mobile sidebar
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;

  // Global loading overlay
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;

  // Command palette
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen:       true,
  mobileSidebarOpen: false,
  globalLoading:     false,
  commandOpen:       false,

  setSidebarOpen:       (open)    => set({ sidebarOpen: open }),
  toggleSidebar:        ()        => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setMobileSidebarOpen: (open)    => set({ mobileSidebarOpen: open }),
  setGlobalLoading:     (loading) => set({ globalLoading: loading }),
  setCommandOpen:       (open)    => set({ commandOpen: open }),
}));