import { create } from 'zustand';

interface UIState {
  sidebarOpen:          boolean;
  mobileSidebarOpen:    boolean;
  globalLoading:        boolean;
  commandOpen:          boolean;
  setSidebarOpen:       (open: boolean) => void;
  toggleSidebar:        () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setGlobalLoading:     (loading: boolean) => void;
  setCommandOpen:       (open: boolean) => void;
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