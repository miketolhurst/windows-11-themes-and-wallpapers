import { create } from 'zustand';

export interface ThemeState {
  accentColor: string;
  taskbarBlur: number;
  startMenuBlur: number;
  notificationBlur: number;
  activePane: 'start' | 'notifications';
  setAccentColor: (c: string) => void;
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
  setAccentColor: (c: string) => set({ accentColor: c }),
  setTaskbarBlur: (b: number) => set({ taskbarBlur: b }),
  setStartMenuBlur: (b: number) => set({ startMenuBlur: b }),
  setNotificationBlur: (b: number) => set({ notificationBlur: b }),
  setActivePane: (pane: 'start' | 'notifications') => set({ activePane: pane }),
}));
