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

  // Extract BorderThickness from styler control styles
  const borderThicknessMatch = content.match(/BorderThickness=(\d+(?:\.\d+)?)/i);
  if (borderThicknessMatch) {
    result.borderThickness = Math.round(parseFloat(borderThicknessMatch[1]));
  }

  // Check taskbar mode and material style
  if (content.includes('NoiseOpacity') || content.includes('WindhawkBlur')) {
    result.materialStyle = 'fluent-acrylic';
    result.taskbarMode = 'blur';
  } else if (content.includes('LinearGradientBrush')) {
    result.materialStyle = 'linear-gradient';
    result.taskbarMode = 'gradient';
  } else if (content.includes('#000000') && (content.includes('pure-black') || content.includes('BackgroundFill'))) {
    result.materialStyle = 'pure-black-neon';
    result.taskbarMode = 'blur';
  } else if (content.includes('SolidColorBrush')) {
    result.materialStyle = 'matte-slate';
    result.taskbarMode = 'blur';
  }

  // Extract NoiseOpacity & TintSaturation if present
  const noiseMatch = content.match(/NoiseOpacity="([0-9.]+)"/i);
  if (noiseMatch) {
    result.noiseOpacity = parseFloat(noiseMatch[1]);
  }
  const satMatch = content.match(/TintSaturation="([0-9.]+)"/i);
  if (satMatch) {
    result.tintSaturation = parseFloat(satMatch[1]);
  }

  // Check dock mode
  const marginMatch = content.match(/Margin=(\d+),\s*\d+,\s*\d+,\s*\d+/i);
  if (marginMatch) {
    result.dockMode = true;
    result.dockMargin = parseInt(marginMatch[1], 10);
  }

  // Check running indicator style
  if (content.includes('Rectangle#RunningIndicator')) {
    if (content.includes('Width=5') && content.includes('CornerRadius=5')) {
      result.runningIndicatorStyle = 'dot';
    } else if (content.includes('Visibility=Collapsed')) {
      result.runningIndicatorStyle = 'hidden';
    } else if (content.includes('LinearGradientBrush')) {
      result.runningIndicatorStyle = 'glow';
    } else {
      result.runningIndicatorStyle = 'bar';
    }
  }

  // Check layout tweaks
  if (
    content.includes('Grid#TopLevelSuggestionsContainer') ||
    content.includes('TopLevelSuggestions') ||
    content.includes('disableNewStartMenuLayout') ||
    content.includes('HideRecommended')
  ) {
    result.hideRecommended = true;
  }

  if (content.includes('SearchBoxToggleButton') && content.includes('Height=0')) {
    result.compactSearch = true;
  }

  if (content.includes('NotificationCenterGrid') && content.includes('VerticalAlignment=2')) {
    result.dynamicNotificationHeight = true;
  }

  if (content.includes('Shadow:=')) {
    result.removeDropShadows = true;
  }

  return result;
}
