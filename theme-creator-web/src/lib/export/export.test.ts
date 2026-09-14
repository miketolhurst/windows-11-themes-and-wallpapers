import { describe, it, expect } from 'vitest';
import {
  calculateGradientPoints,
  generateGradientBrushXaml,
  buildSurfaceFill,
  buildTaskbarMod,
  buildStartMenuMod,
  buildNotificationCenterMod,
  buildContextMenuMod,
  buildFileExplorerMod,
  buildRunningIndicatorMod,
  escapeRegStr,
  generateRegFileContent,
  generateRegFileString,
  generateBatScript,
  generateDirectApplyPayload,
} from './index';
import { DEFAULT_THEME_STATE } from '../../store/useThemeStore';

describe('export modular subsystem', () => {
  const mockState = {
    ...DEFAULT_THEME_STATE,
    themeName: 'Cyber Test',
    accentColor: '#0078D4',
    secondaryAccent: '#005A9E',
    cornerRadius: 8,
    borderThickness: 2,
  };

  it('escapes strings for .reg output', () => {
    expect(escapeRegStr('C:\\Path\\To\\File.png')).toBe('C:\\\\Path\\\\To\\\\File.png');
    expect(escapeRegStr('Quote "test"')).toBe('Quote \\"test\\"');
  });

  it('provides generateRegFileContent as an exact match to generateRegFileString', () => {
    const reg1 = generateRegFileString(mockState);
    const reg2 = generateRegFileContent(mockState);
    expect(reg1).toBe(reg2);
    expect(reg2).toContain('windows-11-taskbar-styler');
  });

  it('generates custom batch scripts for arbitrary ps1 files', () => {
    const bat = generateBatScript('Custom_Script.ps1');
    expect(bat).toContain('@echo off');
    expect(bat).toContain('Custom_Script.ps1');
  });

  it('builds direct apply JSON payload for MCP direct application', () => {
    const payload = generateDirectApplyPayload(mockState);
    expect(payload.themeName).toBe('Cyber Test');
    expect(payload.accentColor).toBe('#0078D4');
    expect(payload.dwm).toBeDefined();
    expect(payload.explorerAccent).toBeDefined();
    expect(payload.windhawkMods.taskbar).toContain('controlStyles:');
    expect(payload.windhawkMods.startMenu).toContain('controlStyles:');
    expect(payload.windhawkMods.notificationCenter).toContain('controlStyles:');
    expect(payload.regFile).toContain('Windows Registry Editor Version 5.00');
    expect(payload.ps1Script).toContain('Apply_Theme.ps1');
  });

  it('invokes target mod builders independently', () => {
    const tb = buildTaskbarMod(mockState);
    expect(tb.length).toBeGreaterThan(0);
    expect(tb.some((c) => c.target.includes('TaskbarBackground'))).toBe(true);

    const sm = buildStartMenuMod(mockState);
    expect(sm.length).toBeGreaterThan(0);
    expect(sm.some((c) => c.target.includes('Border#AcrylicBorder'))).toBe(true);

    const nc = buildNotificationCenterMod(mockState);
    expect(nc.length).toBeGreaterThan(0);
    expect(nc.some((c) => c.target.includes('Grid#NotificationCenterGrid'))).toBe(true);

    const cm = buildContextMenuMod(mockState);
    expect(cm.length).toBeGreaterThan(0);
    expect(cm[0].target).toBe('MenuFlyoutPresenter');

    const fe = buildFileExplorerMod(mockState);
    expect(fe.length).toBeGreaterThan(0);
    expect(fe[0].target).toBe('TabViewItem');

    const ri = buildRunningIndicatorMod({
      style: 'pill',
      activeColorMode: 'accent',
      activeCustomColor: '',
      inactiveColorMode: 'subtle-white',
      inactiveCustomColor: '',
      indicatorSize: 3,
    });
    expect(ri).toContain('Width=12');
  });
});
