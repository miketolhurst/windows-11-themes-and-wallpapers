import { create } from 'zustand';

export interface ThemeState {
  accentColor: string;
  taskbarBlur: number;
  startMenuBlur: number;
  notificationBlur: number;
  activePane: 'start' | 'notifications';
  setAccentColor: (c) => void;
  setTaskbarBlur: (b: number) => void;
  setStartMenuBlur: (b: number) => void;
  setNotificationBlur: (b: number) => void;
  setActivePane: (pane: 'start' | 'notifications') => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  accentColor: '#0078D4',
  taskbarBlur: 10,
  startMenuBlur: 15,
  notificationBlur: 15,
  activePane: 'start',
  setAccentColor: (c) => set({ accentColor: c }),
  setTaskbarBlur: (b) => set({ taskbarBlur: b }),
  setStartMenuBlur: (b) => set({ startMenuBlur: b }),
  setNotificationBlur: (b) => set({ notificationBlur: b }),
  setActivePane: (pane) => set({ activePane: pane }),
}));
