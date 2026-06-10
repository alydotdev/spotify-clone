import { create } from "zustand";

interface LayoutStore {
	isMobileSidebarOpen: boolean;
	openMobileSidebar: () => void;
	closeMobileSidebar: () => void;
	toggleMobileSidebar: () => void;
}

export const useLayoutStore = create<LayoutStore>((set) => ({
	isMobileSidebarOpen: false,
	openMobileSidebar: () => set({ isMobileSidebarOpen: true }),
	closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
	toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
}));
