import { create } from 'zustand';
import { useTabStore } from '../../app/store';

export type PortalType = 'HOME' | 'PDR' | 'PREVENTIVE' | 'ANALYTICS' | 'ORGANIZATION' | 'SETTINGS' | 'FACTORY';

interface OsState {
  activePortal: PortalType;
  setPortal: (portal: PortalType) => void;
}

export const useOsStore = create<OsState>((set) => ({
  activePortal: 'HOME',
  setPortal: (portal) => {
    useTabStore.getState().clearTabs();
    set({ activePortal: portal });
  }
}));
