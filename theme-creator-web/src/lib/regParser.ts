import { ThemeState } from '../store/useThemeStore';
import { rgbToHex, RGB } from './paletteEngine';

export function parseRegFile(content: string): Partial<ThemeState> {
  const result: Partial<ThemeState> = {};

  // Extract AppsUseLightTheme or SystemUsesLightTheme
  const lightModeMatch = content.match(/"(?:Apps|System)UseLightTheme"=dword:([0-9a-fA-F]+)/i);
  if (lightModeMatch) {
    const val = parseInt(lightModeMatch[1], 16);
    result.isLightMode = val === 1;
  }

  // Extract AccentColor: dword:AABBGGRR
  const accentMatch = content.match(/"AccentColor"=dword:([0-9a-fA-F]{8})/i);
  if (accentMatch) {
    const hex = accentMatch[1];
    // DWM hex format: AA BB GG RR
    const b = parseInt(hex.substring(2, 4), 16);
    const g = parseInt(hex.substring(4, 6), 16);
    const r = parseInt(hex.substring(6, 8), 16);
    result.accentColor = rgbToHex([r, g, b]);
  }

  // Extract CornerRadius from styler control styles
  const cornerRadiusMatch = content.match(/CornerRadius=(\d+)/i);
  if (cornerRadiusMatch) {
    result.cornerRadius = parseInt(cornerRadiusMatch[1], 10);
  }

  // Check taskbar mode: if LinearGradientBrush is present in settings
  if (content.includes('LinearGradientBrush')) {
    result.taskbarMode = 'gradient';
  } else if (content.includes('WindhawkBlur') || content.includes('BackgroundElement')) {
    result.taskbarMode = 'blur';
  }

  // Check layout tweaks
  if (content.includes('disableNewStartMenuLayout') || content.includes('HideRecommended') || content.includes('CompactSearch')) {
    if (/hideRecommended|disableNewStartMenuLayout/i.test(content)) {
      result.hideRecommended = true;
    }
  }

  return result;
}
