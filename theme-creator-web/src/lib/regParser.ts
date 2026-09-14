import {
  ThemeState,
  ThemeConfigSnapshot,
  ComponentOverride,
  GradientConfig,
  TypographyConfig,
  AnimationConfig,
  ContextMenuOverride,
  FileExplorerOverride,
  StartButtonConfig,
  RunningIndicatorConfig,
} from '../store/useThemeStore';
import { rgbToHex, RGB } from './paletteEngine';

export interface ThemeDiffItem {
  key: string;
  label: string;
  currentValue: string;
  incomingValue: string;
  hasChanged: boolean;
}

function formatOverride(o?: ComponentOverride): string {
  if (!o || !o.enabled) return 'Disabled (Inherit global)';
  const parts: string[] = ['Enabled'];
  if (o.materialStyle) parts.push(`Material: ${o.materialStyle}`);
  if (o.customColor) parts.push(`Color: ${o.customColor}`);
  if (o.opacity !== undefined) parts.push(`Opacity: ${o.opacity}%`);
  if (o.blur !== undefined) parts.push(`Blur: ${o.blur}px`);
  if (o.gradient) parts.push(`Gradient: ${o.gradient.type}`);
  return parts.join(', ');
}

function isGradientChanged(curr?: GradientConfig, inc?: GradientConfig): boolean {
  if (!curr && !inc) return false;
  if (!curr || !inc) return true;
  if (inc.type !== undefined && inc.type !== curr.type) return true;
  if (inc.angle !== undefined && inc.angle !== curr.angle) return true;
  if (inc.stops) {
    if (inc.stops.length !== (curr.stops?.length || 0)) return true;
    for (let i = 0; i < inc.stops.length; i++) {
      if (inc.stops[i].color !== curr.stops[i].color || inc.stops[i].offset !== curr.stops[i].offset) {
        return true;
      }
    }
  }
  return false;
}

function isOverrideChanged(curr: ComponentOverride, inc: ComponentOverride): boolean {
  if (inc.enabled !== undefined && inc.enabled !== curr.enabled) return true;
  if (inc.enabled || curr.enabled) {
    if (inc.materialStyle !== undefined && inc.materialStyle !== curr.materialStyle) return true;
    if (inc.customColor !== undefined && inc.customColor !== curr.customColor) return true;
    if (inc.opacity !== undefined && inc.opacity !== curr.opacity) return true;
    if (inc.blur !== undefined && inc.blur !== curr.blur) return true;
    if (inc.gradient !== undefined && isGradientChanged(curr.gradient, inc.gradient)) return true;
  }
  return false;
}

function formatGradient(g?: GradientConfig): string {
  if (!g) return 'None';
  return `${g.type} (${g.angle}°, ${g.stops?.length || 0} stops)`;
}

function formatTypography(t?: TypographyConfig): string {
  if (!t) return 'Default (Segoe UI Variable)';
  return `${t.fontFamily || 'Segoe UI Variable'} (${t.fontWeight || '400'}, Spacing: ${t.characterSpacing ?? 0})`;
}

function formatAnimation(a?: AnimationConfig): string {
  if (!a) return 'Default (fluent-spring, 250ms)';
  return `${a.speed || 'default'} (${a.easing || 'fluent-spring'}, ${a.durationMs ?? 250}ms)`;
}

function formatContextMenu(ovr?: ContextMenuOverride): string {
  if (!ovr) return 'Default';
  const parts: string[] = [];
  if (ovr.enableClassicMenu) parts.push('Windows 10 Classic Menu');
  if (ovr.enabled) {
    parts.push(`WinUI 3 Override (${ovr.materialStyle || 'Default'}, ${ovr.cornerRadius ?? 8}px)`);
  }
  return parts.length > 0 ? parts.join(', ') : 'Default';
}

function isContextMenuChanged(curr?: ContextMenuOverride, inc?: ContextMenuOverride): boolean {
  if (!inc) return false;
  if (!curr) return true;
  return (
    (inc.enabled !== undefined && inc.enabled !== curr.enabled) ||
    (inc.enableClassicMenu !== undefined && inc.enableClassicMenu !== curr.enableClassicMenu) ||
    (inc.materialStyle !== undefined && inc.materialStyle !== curr.materialStyle) ||
    (inc.cornerRadius !== undefined && inc.cornerRadius !== curr.cornerRadius) ||
    (inc.borderThickness !== undefined && inc.borderThickness !== curr.borderThickness) ||
    (inc.itemHoverAccent !== undefined && inc.itemHoverAccent !== curr.itemHoverAccent)
  );
}

function formatFileExplorer(ovr?: FileExplorerOverride): string {
  if (!ovr || !ovr.enabled) return 'Default';
  const parts: string[] = [ovr.tabStyle || 'integrated'];
  if (ovr.showCommandBarTint) parts.push('Tinted Command Bar');
  if (ovr.activeTabColorMode) parts.push(`Tab: ${ovr.activeTabColorMode}`);
  return parts.join(', ');
}

function isFileExplorerChanged(curr?: FileExplorerOverride, inc?: FileExplorerOverride): boolean {
  if (!inc) return false;
  if (!curr) return true;
  return (
    (inc.enabled !== undefined && inc.enabled !== curr.enabled) ||
    (inc.tabStyle !== undefined && inc.tabStyle !== curr.tabStyle) ||
    (inc.showCommandBarTint !== undefined && inc.showCommandBarTint !== curr.showCommandBarTint) ||
    (inc.activeTabColorMode !== undefined && inc.activeTabColorMode !== curr.activeTabColorMode)
  );
}

function formatStartButton(sb?: StartButtonConfig): string {
  if (!sb) return 'Default';
  if (sb.type === 'default') return 'Windows 11 Default';
  if (sb.type === 'custom') return `Custom Icon (${sb.size}px)`;
  return `Preset (${sb.presetId || 'win11-minimal'}, ${sb.colorMode}, ${sb.size}px)`;
}

function isStartButtonChanged(curr?: StartButtonConfig, inc?: StartButtonConfig): boolean {
  if (!inc) return false;
  if (!curr) return true;
  return (
    (inc.type !== undefined && inc.type !== curr.type) ||
    (inc.presetId !== undefined && inc.presetId !== curr.presetId) ||
    (inc.colorMode !== undefined && inc.colorMode !== curr.colorMode) ||
    (inc.customColor !== undefined && inc.customColor !== curr.customColor) ||
    (inc.size !== undefined && inc.size !== curr.size) ||
    (inc.customIconUrl !== undefined && inc.customIconUrl !== curr.customIconUrl)
  );
}

function formatRunningIndicator(ind?: RunningIndicatorConfig): string {
  if (!ind) return 'Line';
  return `${ind.style} (${ind.activeColorMode}, ${ind.indicatorSize}px)`;
}

function isRunningIndicatorChanged(curr?: RunningIndicatorConfig, inc?: RunningIndicatorConfig): boolean {
  if (!inc) return false;
  if (!curr) return true;
  return (
    (inc.style !== undefined && inc.style !== curr.style) ||
    (inc.activeColorMode !== undefined && inc.activeColorMode !== curr.activeColorMode) ||
    (inc.activeCustomColor !== undefined && inc.activeCustomColor !== curr.activeCustomColor) ||
    (inc.inactiveColorMode !== undefined && inc.inactiveColorMode !== curr.inactiveColorMode) ||
    (inc.inactiveCustomColor !== undefined && inc.inactiveCustomColor !== curr.inactiveCustomColor) ||
    (inc.indicatorSize !== undefined && inc.indicatorSize !== curr.indicatorSize)
  );
}

export function compareThemeConfigs(
  current: ThemeConfigSnapshot,
  incoming: Partial<ThemeConfigSnapshot>
): ThemeDiffItem[] {
  const items: ThemeDiffItem[] = [];

  // Theme Name
  items.push({
    key: 'themeName',
    label: 'Theme Name',
    currentValue: current.themeName,
    incomingValue: incoming.themeName !== undefined ? incoming.themeName : current.themeName,
    hasChanged: incoming.themeName !== undefined && incoming.themeName !== current.themeName,
  });

  // Accent Color
  items.push({
    key: 'accentColor',
    label: 'Accent Color',
    currentValue: current.accentColor,
    incomingValue: incoming.accentColor !== undefined ? incoming.accentColor : current.accentColor,
    hasChanged:
      incoming.accentColor !== undefined &&
      incoming.accentColor.toLowerCase() !== current.accentColor.toLowerCase(),
  });

  // Secondary Accent
  items.push({
    key: 'secondaryAccent',
    label: 'Secondary Accent',
    currentValue: current.secondaryAccent,
    incomingValue: incoming.secondaryAccent !== undefined ? incoming.secondaryAccent : current.secondaryAccent,
    hasChanged:
      incoming.secondaryAccent !== undefined &&
      incoming.secondaryAccent.toLowerCase() !== current.secondaryAccent.toLowerCase(),
  });

  // Light / Dark Mode
  const currMode = current.isLightMode ? 'Light Mode' : 'Dark Mode';
  const incMode =
    incoming.isLightMode !== undefined
      ? incoming.isLightMode
        ? 'Light Mode'
        : 'Dark Mode'
      : currMode;
  items.push({
    key: 'isLightMode',
    label: 'Light / Dark Mode',
    currentValue: currMode,
    incomingValue: incMode,
    hasChanged: incoming.isLightMode !== undefined && incoming.isLightMode !== current.isLightMode,
  });

  // Material Finish
  items.push({
    key: 'materialStyle',
    label: 'Material Finish',
    currentValue: current.materialStyle,
    incomingValue: incoming.materialStyle !== undefined ? incoming.materialStyle : current.materialStyle,
    hasChanged: incoming.materialStyle !== undefined && incoming.materialStyle !== current.materialStyle,
  });

  // Corner Radius
  items.push({
    key: 'cornerRadius',
    label: 'Corner Radius',
    currentValue: `${current.cornerRadius}px`,
    incomingValue: incoming.cornerRadius !== undefined ? `${incoming.cornerRadius}px` : `${current.cornerRadius}px`,
    hasChanged: incoming.cornerRadius !== undefined && incoming.cornerRadius !== current.cornerRadius,
  });

  // Border Thickness
  items.push({
    key: 'borderThickness',
    label: 'Border Thickness',
    currentValue: `${current.borderThickness}px`,
    incomingValue:
      incoming.borderThickness !== undefined ? `${incoming.borderThickness}px` : `${current.borderThickness}px`,
    hasChanged: incoming.borderThickness !== undefined && incoming.borderThickness !== current.borderThickness,
  });

  // Taskbar Blur
  items.push({
    key: 'taskbarBlur',
    label: 'Taskbar Blur',
    currentValue: `${current.taskbarBlur}px`,
    incomingValue: incoming.taskbarBlur !== undefined ? `${incoming.taskbarBlur}px` : `${current.taskbarBlur}px`,
    hasChanged: incoming.taskbarBlur !== undefined && incoming.taskbarBlur !== current.taskbarBlur,
  });

  // Taskbar Opacity
  items.push({
    key: 'taskbarOpacity',
    label: 'Taskbar Opacity',
    currentValue: `${current.taskbarOpacity}%`,
    incomingValue: incoming.taskbarOpacity !== undefined ? `${incoming.taskbarOpacity}%` : `${current.taskbarOpacity}%`,
    hasChanged: incoming.taskbarOpacity !== undefined && incoming.taskbarOpacity !== current.taskbarOpacity,
  });

  // Start Menu Blur
  items.push({
    key: 'startMenuBlur',
    label: 'Start Menu Blur',
    currentValue: `${current.startMenuBlur}px`,
    incomingValue: incoming.startMenuBlur !== undefined ? `${incoming.startMenuBlur}px` : `${current.startMenuBlur}px`,
    hasChanged: incoming.startMenuBlur !== undefined && incoming.startMenuBlur !== current.startMenuBlur,
  });

  // Start Menu Opacity
  items.push({
    key: 'startMenuOpacity',
    label: 'Start Menu Opacity',
    currentValue: `${current.startMenuOpacity}%`,
    incomingValue:
      incoming.startMenuOpacity !== undefined ? `${incoming.startMenuOpacity}%` : `${current.startMenuOpacity}%`,
    hasChanged: incoming.startMenuOpacity !== undefined && incoming.startMenuOpacity !== current.startMenuOpacity,
  });

  // Flyout Blur
  items.push({
    key: 'notificationBlur',
    label: 'Flyout Blur',
    currentValue: `${current.notificationBlur}px`,
    incomingValue:
      incoming.notificationBlur !== undefined ? `${incoming.notificationBlur}px` : `${current.notificationBlur}px`,
    hasChanged: incoming.notificationBlur !== undefined && incoming.notificationBlur !== current.notificationBlur,
  });

  // Flyout Opacity
  items.push({
    key: 'notificationOpacity',
    label: 'Flyout Opacity',
    currentValue: `${current.notificationOpacity}%`,
    incomingValue:
      incoming.notificationOpacity !== undefined
        ? `${incoming.notificationOpacity}%`
        : `${current.notificationOpacity}%`,
    hasChanged:
      incoming.notificationOpacity !== undefined && incoming.notificationOpacity !== current.notificationOpacity,
  });

  // Taskbar Override
  const isTbOvrChanged =
    incoming.taskbarOverride !== undefined &&
    isOverrideChanged(current.taskbarOverride, incoming.taskbarOverride);
  items.push({
    key: 'taskbarOverride',
    label: 'Taskbar Override',
    currentValue: formatOverride(current.taskbarOverride),
    incomingValue: incoming.taskbarOverride
      ? formatOverride(incoming.taskbarOverride)
      : formatOverride(current.taskbarOverride),
    hasChanged: isTbOvrChanged,
  });

  // Start Menu Override
  const isSmOvrChanged =
    incoming.startMenuOverride !== undefined &&
    isOverrideChanged(current.startMenuOverride, incoming.startMenuOverride);
  items.push({
    key: 'startMenuOverride',
    label: 'Start Menu Override',
    currentValue: formatOverride(current.startMenuOverride),
    incomingValue: incoming.startMenuOverride
      ? formatOverride(incoming.startMenuOverride)
      : formatOverride(current.startMenuOverride),
    hasChanged: isSmOvrChanged,
  });

  // Flyout Override
  const isFlyOvrChanged =
    incoming.flyoutOverride !== undefined &&
    isOverrideChanged(current.flyoutOverride, incoming.flyoutOverride);
  items.push({
    key: 'flyoutOverride',
    label: 'Flyout Override',
    currentValue: formatOverride(current.flyoutOverride),
    incomingValue: incoming.flyoutOverride
      ? formatOverride(incoming.flyoutOverride)
      : formatOverride(current.flyoutOverride),
    hasChanged: isFlyOvrChanged,
  });

  // Typography
  const isTypoChanged =
    incoming.typography !== undefined &&
    ((incoming.typography.fontFamily !== undefined &&
      incoming.typography.fontFamily !== current.typography.fontFamily) ||
      (incoming.typography.fontWeight !== undefined &&
        incoming.typography.fontWeight !== current.typography.fontWeight) ||
      (incoming.typography.characterSpacing !== undefined &&
        incoming.typography.characterSpacing !== current.typography.characterSpacing));
  items.push({
    key: 'typography',
    label: 'Typography',
    currentValue: formatTypography(current.typography),
    incomingValue: incoming.typography
      ? formatTypography(incoming.typography)
      : formatTypography(current.typography),
    hasChanged: Boolean(isTypoChanged),
  });

  // Animations
  const isAnimChanged =
    incoming.animations !== undefined &&
    ((incoming.animations.speed !== undefined && incoming.animations.speed !== current.animations.speed) ||
      (incoming.animations.easing !== undefined && incoming.animations.easing !== current.animations.easing) ||
      (incoming.animations.durationMs !== undefined &&
        incoming.animations.durationMs !== current.animations.durationMs));
  items.push({
    key: 'animations',
    label: 'Animations',
    currentValue: formatAnimation(current.animations),
    incomingValue: incoming.animations
      ? formatAnimation(incoming.animations)
      : formatAnimation(current.animations),
    hasChanged: Boolean(isAnimChanged),
  });

  // Global Gradient
  const isGradChanged =
    incoming.globalGradient !== undefined && isGradientChanged(current.globalGradient, incoming.globalGradient);
  items.push({
    key: 'globalGradient',
    label: 'Global Gradient',
    currentValue: formatGradient(current.globalGradient),
    incomingValue: incoming.globalGradient
      ? formatGradient(incoming.globalGradient)
      : formatGradient(current.globalGradient),
    hasChanged: isGradChanged,
  });

  // Context Menu Override
  const isCmChanged =
    incoming.contextMenuOverride !== undefined &&
    isContextMenuChanged(current.contextMenuOverride, incoming.contextMenuOverride);
  items.push({
    key: 'contextMenuOverride',
    label: 'Context Menu',
    currentValue: formatContextMenu(current.contextMenuOverride),
    incomingValue: incoming.contextMenuOverride
      ? formatContextMenu(incoming.contextMenuOverride)
      : formatContextMenu(current.contextMenuOverride),
    hasChanged: isCmChanged,
  });

  // File Explorer Override
  const isFeChanged =
    incoming.fileExplorerOverride !== undefined &&
    isFileExplorerChanged(current.fileExplorerOverride, incoming.fileExplorerOverride);
  items.push({
    key: 'fileExplorerOverride',
    label: 'File Explorer',
    currentValue: formatFileExplorer(current.fileExplorerOverride),
    incomingValue: incoming.fileExplorerOverride
      ? formatFileExplorer(incoming.fileExplorerOverride)
      : formatFileExplorer(current.fileExplorerOverride),
    hasChanged: isFeChanged,
  });

  // Start Button
  const isSbChanged =
    incoming.startButton !== undefined &&
    isStartButtonChanged(current.startButton, incoming.startButton);
  items.push({
    key: 'startButton',
    label: 'Start Button',
    currentValue: formatStartButton(current.startButton),
    incomingValue: incoming.startButton
      ? formatStartButton(incoming.startButton)
      : formatStartButton(current.startButton),
    hasChanged: isSbChanged,
  });

  // Running Indicator
  const isIndCfgChanged =
    incoming.runningIndicator !== undefined &&
    isRunningIndicatorChanged(current.runningIndicator, incoming.runningIndicator);
  items.push({
    key: 'runningIndicator',
    label: 'Running Indicator',
    currentValue: formatRunningIndicator(current.runningIndicator),
    incomingValue: incoming.runningIndicator
      ? formatRunningIndicator(incoming.runningIndicator)
      : formatRunningIndicator(current.runningIndicator),
    hasChanged: isIndCfgChanged,
  });

  return items;
}

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
  if (
    content.includes('SystemBackdrop=MicaAlt') ||
    content.includes('materialStyle=mica-alt') ||
    content.includes('BlurAmount="45"')
  ) {
    result.materialStyle = 'mica-alt';
    result.taskbarMode = 'blur';
  } else if (
    content.includes('SystemBackdrop=Mica') ||
    content.includes('materialStyle=mica') ||
    content.includes('BlurAmount="38"')
  ) {
    result.materialStyle = 'mica';
    result.taskbarMode = 'blur';
  } else if (content.includes('NoiseOpacity') || content.includes('WindhawkBlur')) {
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

  // Extract typography if present in control styles
  const fontMatch = content.match(/FontFamily[=:]"?([^"\r\n]+)"?/i);
  const weightMatch = content.match(/FontWeight[=:]"?(\d+)"?/i);
  const spacingMatch = content.match(/CharacterSpacing[=:]"?(-?\d+)"?/i);
  if (fontMatch || weightMatch || spacingMatch) {
    result.typography = {
      fontFamily: fontMatch ? fontMatch[1].trim() : 'Segoe UI Variable',
      fontWeight: (weightMatch ? weightMatch[1] : '400') as any,
      characterSpacing: spacingMatch ? parseInt(spacingMatch[1], 10) : 0,
    };
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

  if (content.includes('{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}')) {
    result.contextMenuOverride = {
      ...(result.contextMenuOverride || {
        enabled: true,
        itemHoverAccent: true,
        materialStyle: 'fluent-acrylic',
        opacity: 95,
        blur: 20,
        cornerRadius: 8,
        borderThickness: 1,
      }),
      enableClassicMenu: true,
    };
  } else if (content.includes('MenuFlyoutPresenter')) {
    result.contextMenuOverride = {
      ...(result.contextMenuOverride || {
        enableClassicMenu: false,
        itemHoverAccent: true,
        materialStyle: 'fluent-acrylic',
        opacity: 95,
        blur: 20,
        cornerRadius: 8,
        borderThickness: 1,
      }),
      enabled: true,
    };
  }

  if (content.includes('TabViewItem')) {
    result.fileExplorerOverride = {
      ...(result.fileExplorerOverride || {
        tabStyle: 'integrated',
        showCommandBarTint: false,
        activeTabColorMode: 'accent',
        materialStyle: 'mica',
      }),
      enabled: true,
    };
  }

  return result;
}

