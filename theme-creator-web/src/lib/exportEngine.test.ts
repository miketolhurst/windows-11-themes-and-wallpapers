import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import {
  generateRegFileString,
  generatePs1Script,
  generateRestorePs1Script,
  generateRestoreBatString,
  buildWindhawkJsonBackups,
  generateZipPayload,
  generateGradientBrushXaml,
  calculateGradientPoints,
  generateWindhawkStylerMod,
} from './exportEngine';
import { ThemeState, useThemeStore } from '../store/useThemeStore';

describe('exportEngine', () => {
  const mockState = {
    themeName: 'Cyber Test',
    accentColor: '#0078D4',
    secondaryAccent: '#005A9E',
    isLightMode: false,
    taskbarMode: 'gradient',
    materialStyle: 'linear-gradient',
    dockMode: false,
    dockMargin: 12,
    runningIndicatorStyle: 'standard',
    cornerRadius: 12,
    borderThickness: 3,
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
    taskbarOpacity: 80,
    startMenuOpacity: 90,
    notificationOpacity: 85,
    activePane: 'start',
  } as unknown as ThemeState;

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
    expect(reg).toContain('"BorderThickness=3"');
    expect(reg).toContain('"Height=3"');
    expect(reg).toContain('Color=\\"#cc');
  });

  it('supports floating dock mode and margin in registry export', () => {
    const dockState = {
      ...mockState,
      dockMode: true,
    } as unknown as ThemeState;
    const reg = generateRegFileString(dockState);
    expect(reg).toContain('Taskbar.TaskbarBackground#BackgroundControl');
    expect(reg).toContain('Margin=5, 5, 5, 5');

    const backups = buildWindhawkJsonBackups(dockState);
    expect(backups.taskbarBackup).toContain('Margin=5, 5, 5, 5');
  });

  it('supports running indicator styles: dot, hidden, and glow', () => {
    const dotState = { ...mockState, runningIndicatorStyle: 'dot' } as unknown as ThemeState;
    const dotReg = generateRegFileString(dotState);
    expect(dotReg).toContain('Width=5');
    expect(dotReg).toContain('CornerRadius=5');

    const hiddenState = { ...mockState, runningIndicatorStyle: 'hidden' } as unknown as ThemeState;
    const hiddenReg = generateRegFileString(hiddenState);
    expect(hiddenReg).toContain('Visibility=Collapsed');

    const glowState = { ...mockState, runningIndicatorStyle: 'glow' } as unknown as ThemeState;
    const glowReg = generateRegFileString(glowState);
    expect(glowReg).toContain('LinearGradientBrush');
  });

  it('supports material styles: fluent-acrylic and pure-black-neon', () => {
    const acrylicState = {
      ...mockState,
      materialStyle: 'fluent-acrylic',
      noiseOpacity: 0.05,
      tintSaturation: 0.9,
    } as unknown as ThemeState;
    const acrylicReg = generateRegFileString(acrylicState);
    expect(acrylicReg).toContain('WindhawkBlur');
    expect(acrylicReg).toContain('NoiseOpacity=\\"0.05\\"');
    expect(acrylicReg).toContain('TintSaturation=\\"0.90\\"');

    const oledState = {
      ...mockState,
      materialStyle: 'pure-black-neon',
    } as unknown as ThemeState;
    const oledReg = generateRegFileString(oledState);
    expect(oledReg).toContain('SolidColorBrush Color=\\"#000000\\"');
  });

  it('generates PowerShell script with single consolidated UAC prompt and Explorer restart', () => {
    const ps1 = generatePs1Script(mockState);
    expect(ps1).toContain('SystemParametersInfo');
    expect(ps1).toContain('SendMessageTimeout');
    expect(ps1).toContain('Stop-Process -Name explorer -Force');
    expect(ps1).toContain('reg import');
    expect(ps1).toContain('SettingsChangeTime');
    // Ensure only one Start-Process with -Verb RunAs
    const runAsCount = (ps1.match(/-Verb RunAs/g) || []).length;
    expect(runAsCount).toBe(1);
  });

  it('generates restore scripts for reverting Windows 11 and Windhawk defaults', () => {
    const restorePs1 = generateRestorePs1Script();
    expect(restorePs1).toContain('Restoring Windows 11 & Windhawk Defaults');
    expect(restorePs1).toContain('reg delete \'HKLM\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-taskbar-styler\\Settings\' /f');
    expect(restorePs1).toContain('Stop-Process -Name explorer -Force');

    const restoreBat = generateRestoreBatString();
    expect(restoreBat).toContain('Restore_Defaults.ps1');
  });

  it('builds Windhawk JSON backups for taskbar, start menu, and notification center', () => {
    const backups = buildWindhawkJsonBackups(mockState);
    expect(backups.taskbarBackup).toContain('controlStyles:');
    expect(backups.taskbarBackup).toContain('Taskbar.TaskbarBackground#BackgroundControl');

    expect(backups.startMenuBackup).toContain('controlStyles:');
    expect(backups.startMenuBackup).toContain('Border#AcrylicBorder');
    expect(backups.startMenuBackup).toContain('SystemAccentColor=');

    expect(backups.notificationCenterBackup).toContain('controlStyles:');
    expect(backups.notificationCenterBackup).toContain('Grid#NotificationCenterGrid');
    expect(backups.notificationCenterBackup).toContain('ToggleSwitchFillOn=');
  });

  it('generates zip blob containing all theme files, restore scripts, and Windhawk backups', async () => {
    const blob = await generateZipPayload(mockState);
    expect(blob).toBeDefined();
    expect(blob.size).toBeGreaterThan(0);

    // Inspect zip contents
    const zip = await JSZip.loadAsync(blob);
    expect(zip.file('theme.reg')).not.toBeNull();
    expect(zip.file('Apply_Theme.ps1')).not.toBeNull();
    expect(zip.file('Apply_Theme.bat')).not.toBeNull();
    expect(zip.file('Restore_Defaults.ps1')).not.toBeNull();
    expect(zip.file('Restore_Default_Windows11.bat')).not.toBeNull();
    expect(zip.file('taskbar_backup.json')).not.toBeNull();
    expect(zip.file('start_menu_backup.json')).not.toBeNull();
    expect(zip.file('notification_center_backup.json')).not.toBeNull();
    expect(zip.file('wallpaper.jpg')).not.toBeNull();
  });

  it('packages default wallpaper into zip when no custom wallpaper is uploaded', async () => {
    const noUploadState: ThemeState = {
      ...mockState,
      wallpaperData: null,
      wallpaperUrl: null,
    };
    const blob = await generateZipPayload(noUploadState);
    const zip = await JSZip.loadAsync(blob);
    expect(zip.file('wallpaper.jpg')).not.toBeNull();
  });

  it('includes custom start icon in theme.reg, Apply_Theme.ps1, and zip payload', async () => {
    const iconState: ThemeState = {
      ...mockState,
      customStartIconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      customStartIconData: new Uint8Array([137, 80, 78, 71]),
    };

    const reg = generateRegFileString(iconState);
    expect(reg).toContain('AnimatedVisualPlayer#Icon');
    expect(reg).toContain('Visibility=Collapsed');
    expect(reg).toContain('ImageBrush ImageSource=\\"C:\\\\Users\\\\Public\\\\Pictures\\\\Windhawk_start_icon.png\\"');

    const ps1 = generatePs1Script(iconState);
    expect(ps1).toContain('Deploying Custom Start Button Icon');
    expect(ps1).toContain('Windhawk_start_icon.png');

    const blob = await generateZipPayload(iconState);
    const zip = await JSZip.loadAsync(blob);
    expect(zip.file('start_icon.png')).not.toBeNull();
  });
});

describe('exportEngine Phase 1 extensions', () => {
  it('calculates normalized gradient start and end coordinates from degrees', () => {
    const right = calculateGradientPoints(90);
    expect(right.start).toBe('0,0.5');
    expect(right.end).toBe('1,0.5');

    const down = calculateGradientPoints(180);
    expect(down.start).toBe('0.5,0');
    expect(down.end).toBe('0.5,1');
  });

  it('generates multi-stop LinearGradientBrush XAML', () => {
    const xaml = generateGradientBrushXaml({
      type: 'linear',
      angle: 90,
      stops: [
        { id: '1', color: '#0078D4', offset: 0 },
        { id: '2', color: '#EC4899', offset: 50 },
        { id: '3', color: '#8B5CF6', offset: 100 },
      ],
    });
    expect(xaml).toContain('<LinearGradientBrush');
    expect(xaml).toContain('StartPoint="0,0.5" EndPoint="1,0.5"');
    expect(xaml).toContain('<GradientStop Color="#FF0078D4" Offset="0"/>');
    expect(xaml).toContain('<GradientStop Color="#FFEC4899" Offset="0.5"/>');
    expect(xaml).toContain('<GradientStop Color="#FF8B5CF6" Offset="1"/>');
  });

  it('generates RadialGradientBrush XAML when type is radial', () => {
    const xaml = generateGradientBrushXaml({
      type: 'radial',
      angle: 0,
      stops: [
        { id: '1', color: '#FFFFFF', offset: 0 },
        { id: '2', color: '#000000', offset: 100 },
      ],
    });
    expect(xaml).toContain('<RadialGradientBrush Center="0.5,0.5" RadiusX="0.5" RadiusY="0.5"');
    expect(xaml).toContain('<GradientStop Color="#FFFFFFFF" Offset="0"/>');
    expect(xaml).toContain('<GradientStop Color="#FF000000" Offset="1"/>');
  });

  it('exports calibrated Mica & Mica Alt WindhawkBlur rules', () => {
    const micaState = { ...useThemeStore.getState(), materialStyle: 'mica' as const };
    const micaPkg = generateWindhawkStylerMod(micaState);
    expect(micaPkg.taskbarStyles).toContain('BlurAmount="38"');
    expect(micaPkg.taskbarStyles).toContain('TintOpacity="0.9"');

    const altState = { ...useThemeStore.getState(), materialStyle: 'mica-alt' as const };
    const altPkg = generateWindhawkStylerMod(altState);
    expect(altPkg.taskbarStyles).toContain('BlurAmount="45"');
    expect(altPkg.taskbarStyles).toContain('TintOpacity="0.95"');
  });

  it('applies taskbar component overrides when enabled', () => {
    const state = {
      ...useThemeStore.getState(),
      taskbarOverride: {
        enabled: true,
        materialStyle: 'pure-black-neon' as const,
        customColor: '#FF0055',
        opacity: 80,
      },
    };
    const pkg = generateWindhawkStylerMod(state);
    expect(pkg.taskbarStyles).toContain('#CCFF0055'); // 80% opacity in hex
  });

  it('injects typography and animation tweaks into mod styles', () => {
    const state = {
      ...useThemeStore.getState(),
      typography: {
        fontFamily: 'Inter',
        fontWeight: '600' as const,
        characterSpacing: 25,
      },
      animations: {
        speed: 'snappy' as const,
        durationMs: 150,
        easing: 'decelerate' as const,
      },
    };
    const pkg = generateWindhawkStylerMod(state);
    expect(pkg.taskbarStyles).toContain('FontFamily=Inter');
    expect(pkg.taskbarStyles).toContain('FontWeight=SemiBold');
    expect(pkg.taskbarStyles).toContain('CharacterSpacing=25');
  });
});

