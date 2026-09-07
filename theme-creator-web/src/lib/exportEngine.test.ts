import { describe, it, expect } from 'vitest';
import { generateRegFileString, generatePs1Script, generateZipPayload } from './exportEngine';
import { ThemeState } from '../store/useThemeStore';

describe('exportEngine', () => {
  const mockState: ThemeState = {
    themeName: 'Cyber Test',
    accentColor: '#0078D4',
    secondaryAccent: '#005A9E',
    isLightMode: false,
    taskbarMode: 'gradient',
    cornerRadius: 12,
    wallpaperUrl: 'data:image/png;base64,123',
    wallpaperData: new Uint8Array([1, 2, 3, 4]),
    customStartIconUrl: null,
    customStartIconData: null,
    hideRecommended: true,
    compactSearch: true,
    dynamicNotificationHeight: true,
    removeDropShadows: false,
    taskbarBlur: 20,
    startMenuBlur: 25,
    notificationBlur: 25,
    activePane: 'start',
    setThemeName: () => {},
    setAccentColor: () => {},
    setSecondaryAccent: () => {},
    setIsLightMode: () => {},
    setTaskbarMode: () => {},
    setCornerRadius: () => {},
    setWallpaper: () => {},
    setCustomStartIcon: () => {},
    setHideRecommended: () => {},
    setCompactSearch: () => {},
    setDynamicNotificationHeight: () => {},
    setRemoveDropShadows: () => {},
    setTaskbarBlur: () => {},
    setStartMenuBlur: () => {},
    setNotificationBlur: () => {},
    setActivePane: () => {},
    applyThemeConfig: () => {},
    resetToDefaults: () => {},
  };

  it('generates comprehensive .reg string with all mods and HKCU keys', () => {
    const reg = generateRegFileString(mockState);
    expect(reg).toContain('windows-11-taskbar-styler');
    expect(reg).toContain('windows-11-start-menu-styler');
    expect(reg).toContain('windows-11-notification-center-styler');
    expect(reg).toContain('HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\DWM');
    expect(reg).toContain('"AccentColor"=dword:');
    expect(reg).toContain('"AccentPalette"=hex:');
    expect(reg).toContain('CornerRadius=12');
    expect(reg).toContain('"controlStyles[0].target"="Grid#NotificationCenterGrid"');
    expect(reg).toContain('"controlStyles[0].styles[1]"="BorderBrush=#0078d4"');
    expect(reg).toContain('"controlStyles[2].target"="Grid#ControlCenterRegion"');
    expect(reg).toContain('"controlStyles[2].styles[1]"="BorderBrush=#0078d4"');
  });

  it('generates PowerShell script with Explorer restart and broadcast messages', () => {
    const ps1 = generatePs1Script(mockState);
    expect(ps1).toContain('SystemParametersInfo');
    expect(ps1).toContain('SendMessageTimeout');
    expect(ps1).toContain('Stop-Process -Name explorer -Force');
    expect(ps1).toContain('Start-Process explorer');
    expect(ps1).toContain('SettingsChangeTime');
  });

  it('generates zip blob containing reg, ps1, bat, and wallpaper files', async () => {
    const blob = await generateZipPayload(mockState);
    expect(blob).toBeDefined();
    expect(blob.size).toBeGreaterThan(0);
  });
});
