import { describe, it, expect } from 'vitest';
import { parseRegFile } from './regParser';

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
});
