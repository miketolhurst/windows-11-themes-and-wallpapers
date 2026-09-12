import { describe, it, expect } from 'vitest';
import { parseRegFile, compareThemeConfigs } from './regParser';
import { DEFAULT_THEME_STATE } from '../store/useThemeStore';

describe('regParser', () => {
  it('parses DWM AccentColor, LightMode, and CornerRadius correctly', () => {
    const sampleReg = `
Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\DWM]
"AccentColor"=dword:ffd47800
"ColorizationColor"=dword:c40078d4

[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize]
"AppsUseLightTheme"=dword:00000001
"SystemUsesLightTheme"=dword:00000001

[HKEY_LOCAL_MACHINE\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-taskbar-styler\\Settings]
"controlStyles[0].styles[0]"="CornerRadius=12"
"controlStyles[1].styles[0]"="Fill:=<LinearGradientBrush StartPoint=\\"0,0\\" EndPoint=\\"1,1\\"></LinearGradientBrush>"
    `;

    const parsed = parseRegFile(sampleReg);
    expect(parsed.accentColor?.toLowerCase()).toBe('#0078d4');
    expect(parsed.isLightMode).toBe(true);
    expect(parsed.cornerRadius).toBe(12);
    expect(parsed.taskbarMode).toBe('gradient');
  });

  it('parses Mica material and typography from reg file', () => {
    const sampleReg = `
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-taskbar-styler\\Settings]
"controlStyles[0].styles[0]"="SystemBackdrop=MicaAlt"
"controlStyles[0].styles[1]"="FontFamily=JetBrains Mono"
"controlStyles[0].styles[2]"="FontWeight=700"
"controlStyles[0].styles[3]"="CharacterSpacing=25"
    `;

    const parsed = parseRegFile(sampleReg);
    expect(parsed.materialStyle).toBe('mica-alt');
    expect(parsed.typography?.fontFamily).toBe('JetBrains Mono');
    expect(parsed.typography?.fontWeight).toBe('700');
    expect(parsed.typography?.characterSpacing).toBe(25);
  });

  it('parses standard Mica material from reg file', () => {
    const sampleReg = `
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-taskbar-styler\\Settings]
"controlStyles[0].styles[0]"="SystemBackdrop=Mica"
    `;

    const parsed = parseRegFile(sampleReg);
    expect(parsed.materialStyle).toBe('mica');
    expect(parsed.taskbarMode).toBe('blur');
  });
});


describe('compareThemeConfigs', () => {
  it('computes diffs between current snapshot and incoming partial config', () => {
    const current = { ...DEFAULT_THEME_STATE, accentColor: '#0078D4' };
    const incoming = {
      accentColor: '#FF0055',
      typography: {
        fontFamily: 'Inter',
        fontWeight: '600' as const,
        characterSpacing: 10,
      },
    };
    const diffs = compareThemeConfigs(current, incoming);
    const accentDiff = diffs.find((d) => d.key === 'accentColor');
    expect(accentDiff).toBeDefined();
    expect(accentDiff?.hasChanged).toBe(true);
    expect(accentDiff?.currentValue).toBe('#0078D4');
    expect(accentDiff?.incomingValue).toBe('#FF0055');

    const typoDiff = diffs.find((d) => d.key === 'typography');
    expect(typoDiff?.hasChanged).toBe(true);
  });

  it('correctly reports no changes when incoming matches current', () => {
    const current = { ...DEFAULT_THEME_STATE };
    const incoming = {
      accentColor: DEFAULT_THEME_STATE.accentColor,
      isLightMode: DEFAULT_THEME_STATE.isLightMode,
    };
    const diffs = compareThemeConfigs(current, incoming);
    const changed = diffs.filter((d) => d.hasChanged);
    expect(changed).toHaveLength(0);
  });

  it('detects overrides and animation diffs', () => {
    const current = { ...DEFAULT_THEME_STATE };
    const incoming = {
      animations: {
        speed: 'snappy' as const,
        durationMs: 150,
        easing: 'decelerate' as const,
      },
      taskbarOverride: {
        enabled: true,
        materialStyle: 'mica' as const,
        opacity: 80,
      },
    };
    const diffs = compareThemeConfigs(current, incoming);
    const animDiff = diffs.find((d) => d.key === 'animations');
    expect(animDiff?.hasChanged).toBe(true);

    const tbDiff = diffs.find((d) => d.key === 'taskbarOverride');
    expect(tbDiff?.hasChanged).toBe(true);
  });
});

