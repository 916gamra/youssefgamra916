import { create } from 'zustand';

export interface Tab {
  id: string;
  title: string;
  component: string;
  isActive: boolean;
}

interface TabState {
  tabs: Tab[];
  activeTabId: string | null;
  openTab: (tab: Omit<Tab, 'isActive'>) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
}

export const useTabStore = create<TabState>((set) => ({
  tabs: [],
  activeTabId: null,
  openTab: (newTab) => set((state) => {
    const existingTab = state.tabs.find(t => t.id === newTab.id);
    if (existingTab) {
      return {
        tabs: state.tabs.map(t => ({ ...t, isActive: t.id === newTab.id })),
        activeTabId: newTab.id
      };
    }
    return {
      tabs: [...state.tabs.map(t => ({ ...t, isActive: false })), { ...newTab, isActive: true }],
      activeTabId: newTab.id
    };
  }),
  closeTab: (id) => set((state) => {
    const newTabs = state.tabs.filter(t => t.id !== id);
    let newActiveId = state.activeTabId;
    if (state.activeTabId === id) {
      newActiveId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
    }
    return {
      tabs: newTabs.map(t => ({ ...t, isActive: t.id === newActiveId })),
      activeTabId: newActiveId
    };
  }),
  setActiveTab: (id) => set((state) => ({
    tabs: state.tabs.map(t => ({ ...t, isActive: t.id === id })),
    activeTabId: id
  }))
}));
