import { describe, it, expect, test, beforeEach } from 'vitest';
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

describe('Phase 1 useThemeStore extensions', () => {
  beforeEach(() => {
    useThemeStore.getState().resetToDefaults();
  });

  it('initializes with default Phase 1 properties', () => {
    const state = useThemeStore.getState();
    expect(state.globalGradient.type).toBe('linear');
    expect(state.globalGradient.stops.length).toBeGreaterThanOrEqual(2);
    expect(state.taskbarOverride.enabled).toBe(false);
    expect(state.startMenuOverride.enabled).toBe(false);
    expect(state.flyoutOverride.enabled).toBe(false);
    expect(state.typography.fontFamily).toBe('Segoe UI Variable');
    expect(state.animations.speed).toBe('default');
  });

  it('updates global gradient and component overrides with history tracking', () => {
    const store = useThemeStore.getState();
    store.setGlobalGradient({
      type: 'linear',
      angle: 180,
      stops: [
        { id: '1', color: '#FF0000', offset: 0 },
        { id: '2', color: '#0000FF', offset: 100 },
      ],
    });
    expect(useThemeStore.getState().globalGradient.angle).toBe(180);
    expect(useThemeStore.getState().canUndo()).toBe(true);

    store.setTaskbarOverride({ enabled: true, materialStyle: 'mica' });
    expect(useThemeStore.getState().taskbarOverride.enabled).toBe(true);
    expect(useThemeStore.getState().taskbarOverride.materialStyle).toBe('mica');

    store.setStartMenuOverride({ enabled: true, customColor: '#123456' });
    expect(useThemeStore.getState().startMenuOverride.enabled).toBe(true);
    expect(useThemeStore.getState().startMenuOverride.customColor).toBe('#123456');

    store.setFlyoutOverride({ enabled: true, blur: 20 });
    expect(useThemeStore.getState().flyoutOverride.enabled).toBe(true);
    expect(useThemeStore.getState().flyoutOverride.blur).toBe(20);

    store.setTypography({ fontFamily: 'JetBrains Mono', fontWeight: '600', characterSpacing: 20 });
    expect(useThemeStore.getState().typography.fontFamily).toBe('JetBrains Mono');

    store.setAnimations({ speed: 'snappy', durationMs: 150, easing: 'decelerate' });
    expect(useThemeStore.getState().animations.speed).toBe('snappy');
    expect(useThemeStore.getState().animations.durationMs).toBe(150);
  });

  it('supports undo and redo for Phase 1 properties', () => {
    const store = useThemeStore.getState();
    store.setTypography({ fontFamily: 'Cascadia Code', fontWeight: '700', characterSpacing: 10 });
    expect(useThemeStore.getState().typography.fontFamily).toBe('Cascadia Code');

    store.undo();
    expect(useThemeStore.getState().typography.fontFamily).toBe('Segoe UI Variable');

    store.redo();
    expect(useThemeStore.getState().typography.fontFamily).toBe('Cascadia Code');
  });

  it('supports mica and mica-alt material styles', () => {
    const store = useThemeStore.getState();
    store.setMaterialStyle('mica');
    expect(useThemeStore.getState().materialStyle).toBe('mica');

    store.setMaterialStyle('mica-alt');
    expect(useThemeStore.getState().materialStyle).toBe('mica-alt');
  });

  it('correctly applies Phase 1 partial theme configs and resets to defaults', () => {
    const store = useThemeStore.getState();
    store.applyThemeConfig({
      typography: { fontFamily: 'Consolas', fontWeight: '500', characterSpacing: 5 },
      taskbarOverride: { enabled: true, materialStyle: 'mica-alt' },
    });
    expect(useThemeStore.getState().typography.fontFamily).toBe('Consolas');
    expect(useThemeStore.getState().taskbarOverride.enabled).toBe(true);
    expect(useThemeStore.getState().taskbarOverride.materialStyle).toBe('mica-alt');

    store.resetToDefaults();
    expect(useThemeStore.getState().typography.fontFamily).toBe('Segoe UI Variable');
    expect(useThemeStore.getState().taskbarOverride.enabled).toBe(false);
  });
});



