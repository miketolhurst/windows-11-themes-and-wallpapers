import type { ThemeState, ThemeConfigSnapshot } from '../../types/theme';
import { computeAccentPalette, hexToRgb } from '../paletteEngine';
import { getModRawStyles, RawControlStyle } from './xamlGenerators';

export function escapeRegStr(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function generateTaskbarRegKeys(taskbarControlStyles: RawControlStyle[]): string[] {
  const lines: string[] = [
    '; ============================================================',
    '; 1. Windows 11 Taskbar Styler',
    '; ============================================================',
    '[-HKEY_LOCAL_MACHINE\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-taskbar-styler\\Settings]',
    '',
    '[HKEY_LOCAL_MACHINE\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-taskbar-styler\\Settings]',
  ];
  taskbarControlStyles.forEach((ctrl, i) => {
    lines.push(`"controlStyles[${i}].target"="${escapeRegStr(ctrl.target)}"`);
    ctrl.styles.forEach((style, sIdx) => {
      lines.push(`"controlStyles[${i}].styles[${sIdx}]"="${escapeRegStr(style)}"`);
    });
  });
  return lines;
}

export function generateStartMenuRegKeys(
  startMenuControlStyles: RawControlStyle[],
  themeVarsCommon: string[]
): string[] {
  const lines: string[] = [
    '; ============================================================',
    '; 2. Windows 11 Start Menu Styler',
    '; ============================================================',
    '[-HKEY_LOCAL_MACHINE\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-start-menu-styler\\Settings]',
    '',
    '[HKEY_LOCAL_MACHINE\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-start-menu-styler\\Settings]',
  ];
  startMenuControlStyles.forEach((ctrl, i) => {
    lines.push(`"controlStyles[${i}].target"="${escapeRegStr(ctrl.target)}"`);
    ctrl.styles.forEach((style, sIdx) => {
      lines.push(`"controlStyles[${i}].styles[${sIdx}]"="${escapeRegStr(style)}"`);
    });
  });
  themeVarsCommon.forEach((v, i) => {
    lines.push(`"themeResourceVariables[${i}]"="${escapeRegStr(v)}"`);
  });
  return lines;
}

export function generateNotificationCenterRegKeys(
  ncControlStyles: RawControlStyle[],
  ncThemeVars: string[]
): string[] {
  const lines: string[] = [
    '; ============================================================',
    '; 3. Windows 11 Notification Center & Quick Settings Styler',
    '; ============================================================',
    '[-HKEY_LOCAL_MACHINE\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-notification-center-styler\\Settings]',
    '',
    '[HKEY_LOCAL_MACHINE\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-notification-center-styler\\Settings]',
  ];
  ncControlStyles.forEach((ctrl, i) => {
    lines.push(`"controlStyles[${i}].target"="${escapeRegStr(ctrl.target)}"`);
    ctrl.styles.forEach((style, sIdx) => {
      lines.push(`"controlStyles[${i}].styles[${sIdx}]"="${escapeRegStr(style)}"`);
    });
  });
  ncThemeVars.forEach((v, i) => {
    lines.push(`"themeResourceVariables[${i}]"="${escapeRegStr(v)}"`);
  });
  return lines;
}

export function generatePersonalizationRegKeys(
  accentColor: string,
  secondaryAccent: string,
  isLightMode: boolean
): string[] {
  const palette = computeAccentPalette(accentColor, secondaryAccent);
  const accentRgb = hexToRgb(accentColor);
  const darkVal = isLightMode ? 1 : 0;
  const rgbStr = `${accentRgb[0]} ${accentRgb[1]} ${accentRgb[2]}`;

  return [
    '; ============================================================',
    '; 4. Windows 11 Personalization Accent Color & Explorer Accent',
    '; ============================================================',
    '[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\DWM]',
    `"AccentColor"=dword:${palette.accentDwordHex}`,
    `"ColorizationColor"=dword:${palette.colorizationHex}`,
    `"ColorizationAfterglow"=dword:${palette.colorizationHex}`,
    `"AccentColorInactive"=dword:ff22272e`,
    `"ColorPrevalence"=dword:00000001`,
    '',
    '[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Accent]',
    `"AccentColorMenu"=dword:${palette.accentDwordHex}`,
    `"StartColorMenu"=dword:${palette.accentDwordHex}`,
    `"AccentPalette"=hex:${palette.hexString}`,
    '',
    '[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\History\\Colors]',
    `"ColorHistory0"=dword:${palette.accentDwordHex}`,
    '',
    '[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize]',
    `"AppsUseLightTheme"=dword:${darkVal.toString(16).padStart(8, '0')}`,
    `"SystemUsesLightTheme"=dword:${darkVal.toString(16).padStart(8, '0')}`,
    `"EnableTransparency"=dword:00000001`,
    '',
    '[HKEY_CURRENT_USER\\Control Panel\\Desktop]',
    `"AutoColorization"=dword:00000000`,
    '',
    '[HKEY_CURRENT_USER\\Control Panel\\Colors]',
    `"Hilight"="${rgbStr}"`,
    `"HotTrackingColor"="${rgbStr}"`,
  ];
}

export function generateClassicContextMenuRegKeys(enableClassicMenu?: boolean): string[] {
  if (enableClassicMenu) {
    return [
      '; ============================================================',
      '; 5. Classic Windows 10 Context Menu Override',
      '; ============================================================',
      '[HKEY_CURRENT_USER\\Software\\Classes\\CLSID\\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\\InprocServer32]',
      '@=""',
    ];
  }
  return [
    '; ============================================================',
    '; 5. Restore Modern Windows 11 Context Menu',
    '; ============================================================',
    '[-HKEY_CURRENT_USER\\Software\\Classes\\CLSID\\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}]',
  ];
}

export function generateRegFileString(state: ThemeConfigSnapshot | ThemeState): string {
  const {
    taskbarControlStyles,
    startMenuControlStyles,
    ncControlStyles,
    themeVarsCommon,
    ncThemeVars,
  } = getModRawStyles(state);

  const regLines: string[] = [
    'Windows Registry Editor Version 5.00',
    '',
    ...generateTaskbarRegKeys(taskbarControlStyles),
    '',
    ...generateStartMenuRegKeys(startMenuControlStyles, themeVarsCommon),
    '',
    ...generateNotificationCenterRegKeys(ncControlStyles, ncThemeVars),
    '',
    ...generatePersonalizationRegKeys(state.accentColor, state.secondaryAccent, state.isLightMode),
    '',
    ...generateClassicContextMenuRegKeys(state.contextMenuOverride?.enableClassicMenu),
    '',
  ];

  return regLines.join('\r\n');
}

export const generateRegFileContent = generateRegFileString;
