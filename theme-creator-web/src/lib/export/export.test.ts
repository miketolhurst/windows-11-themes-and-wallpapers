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
  generateWindhawkStylerMod,
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

  it('generates start button style with Background:= prefix and ImageBrush', () => {
    const stateWithIcon = {
      ...mockState,
      startButton: {
        type: 'preset' as const,
        presetId: 'win11-minimal' as const,
        colorMode: 'accent' as const,
        size: 24,
      },
    };
    const tb = buildTaskbarMod(stateWithIcon as any);
    const bgElement = tb.find((c) => c.target.includes('Border#BackgroundElement'));
    expect(bgElement).toBeDefined();
    expect(bgElement?.styles.some((s) => s.startsWith('Background:=<ImageBrush'))).toBe(true);
  });

  it('generates WinUI 3 typography rules targeting real Windows 11 TextBlock IDs', () => {
    const stateWithTypo = {
      ...mockState,
      typography: {
        fontFamily: 'Consolas',
        fontWeight: '600',
        characterSpacing: 25,
      },
    };
    const pkg = generateWindhawkStylerMod(stateWithTypo as any);
    expect(pkg.taskbarStyles).toContain('TextBlock#TimeInnerTextBlock');
    expect(pkg.taskbarStyles).toContain('FontFamily=Consolas');
    expect(pkg.taskbarStyles).toContain('FontWeight=SemiBold');
    expect(pkg.startMenuStyles).toContain('TextBlock#DisplayName');
    expect(pkg.startMenuStyles).toContain('FontFamily=Consolas');
  });

  it('packages start_icon.png into the generated zip payload for vector preset themes', async () => {
    const { generateZipPayload } = await import('./zipBundler');
    const JSZipModule = (await import('jszip')).default;

    const stateWithPreset = {
      ...mockState,
      startButton: {
        type: 'preset' as const,
        presetId: 'cyberpunk-hex' as const,
        colorMode: 'accent' as const,
        size: 24,
      },
    };

    const blob = await generateZipPayload(stateWithPreset as any);
    expect(blob.size).toBeGreaterThan(0);

    const zip = await JSZipModule.loadAsync(blob);
    const startIconFile = zip.file('start_icon.png');
    expect(startIconFile).not.toBeNull();
    const iconBytes = await startIconFile?.async('uint8array');
    expect(iconBytes).toBeDefined();
    expect(iconBytes?.length).toBeGreaterThan(50); // Valid PNG header + content
  });
});
