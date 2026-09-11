import { expect, test } from 'vitest';
import { useThemeStore } from './useThemeStore';

test('store initializes with default values', () => {
  const state = useThemeStore.getState();
  expect(state.accentColor).toBe('#0078D4');
  expect(state.taskbarBlur).toBe(10);
});

test('can update accent color', () => {
  useThemeStore.getState().setAccentColor('#FF0000');
  expect(useThemeStore.getState().accentColor).toBe('#FF0000');
});

test('can update borderThickness', () => {
  expect(useThemeStore.getState().borderThickness).toBe(2);
  useThemeStore.getState().setBorderThickness(4);
  expect(useThemeStore.getState().borderThickness).toBe(4);
});

test('supports quicksettings activePane', () => {
  useThemeStore.getState().setActivePane('quicksettings');
  expect(useThemeStore.getState().activePane).toBe('quicksettings');
});

test('supports undo and redo for accent color change', () => {
  useThemeStore.getState().resetToDefaults();
  const initial = useThemeStore.getState().accentColor;
  useThemeStore.getState().setAccentColor('#112233');
  expect(useThemeStore.getState().accentColor).toBe('#112233');
  expect(useThemeStore.getState().past.length).toBeGreaterThan(0);

  // Undo
  useThemeStore.getState().undo();
  expect(useThemeStore.getState().accentColor).toBe(initial);

  // Redo
  useThemeStore.getState().redo();
  expect(useThemeStore.getState().accentColor).toBe('#112233');
});

test('toggles sidebar collapse state and desktop toggles', () => {
  expect(useThemeStore.getState().isSidebarCollapsed).toBe(false);
  useThemeStore.getState().toggleSidebar();
  expect(useThemeStore.getState().isSidebarCollapsed).toBe(true);
  useThemeStore.getState().toggleSidebar();
  expect(useThemeStore.getState().isSidebarCollapsed).toBe(false);

  expect(useThemeStore.getState().showDesktopIcons).toBe(true);
  useThemeStore.getState().setShowDesktopIcons(false);
  expect(useThemeStore.getState().showDesktopIcons).toBe(false);

  expect(useThemeStore.getState().showWindowPreview).toBe(false);
  useThemeStore.getState().setShowWindowPreview(true);
  expect(useThemeStore.getState().showWindowPreview).toBe(true);
});

test('supports material styles, dock mode, and running indicators', () => {
  useThemeStore.getState().setMaterialStyle('pure-black-neon');
  expect(useThemeStore.getState().materialStyle).toBe('pure-black-neon');
  expect(useThemeStore.getState().taskbarMode).toBe('blur');

  useThemeStore.getState().setMaterialStyle('linear-gradient');
  expect(useThemeStore.getState().materialStyle).toBe('linear-gradient');
  expect(useThemeStore.getState().taskbarMode).toBe('gradient');

  useThemeStore.getState().setDockMode(true);
  expect(useThemeStore.getState().dockMode).toBe(true);
  useThemeStore.getState().setDockMargin(16);
  expect(useThemeStore.getState().dockMargin).toBe(16);

  useThemeStore.getState().setRunningIndicatorStyle('dot');
  expect(useThemeStore.getState().runningIndicatorStyle).toBe('dot');

  useThemeStore.getState().setColorHarmony('complementary');
  expect(useThemeStore.getState().colorHarmony).toBe('complementary');
});

test('supports saving, loading, and deleting custom themes', () => {
  useThemeStore.getState().setThemeName('My Test Theme');
  useThemeStore.getState().setAccentColor('#880088');
  useThemeStore.getState().saveCurrentTheme('My Saved Test Theme');

  const saved = useThemeStore.getState().savedThemes;
  expect(saved.length).toBeGreaterThan(0);
  const theme = saved.find((t) => t.name === 'My Saved Test Theme');
  expect(theme).toBeDefined();
  expect(theme?.config.accentColor).toBe('#880088');

  // Change accent then load back
  useThemeStore.getState().setAccentColor('#123456');
  useThemeStore.getState().loadSavedTheme(theme!.id);
  expect(useThemeStore.getState().accentColor).toBe('#880088');

  // Delete
  useThemeStore.getState().deleteSavedTheme(theme!.id);
  expect(useThemeStore.getState().savedThemes.find((t) => t.id === theme!.id)).toBeUndefined();
});


