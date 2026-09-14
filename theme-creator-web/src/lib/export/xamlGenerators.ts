import type {
  MaterialStyle,
  GradientConfig,
  ComponentOverride,
  RunningIndicatorConfig,
  ThemeConfigSnapshot,
  ThemeState,
} from '../../types/theme';
import { DEFAULT_THEME_STATE } from '../../store/useThemeStore';
import {
  computeAccentPalette,
  hexToRgb,
  rgbToHex,
  buildLinearGradientBrush,
  opacityToAlphaHex,
  RGB,
} from '../paletteEngine';

export interface RawControlStyle {
  target: string;
  styles: string[];
}

export interface ModRawStyles {
  taskbarControlStyles: RawControlStyle[];
  startMenuControlStyles: RawControlStyle[];
  ncControlStyles: RawControlStyle[];
  contextMenuControlStyles: RawControlStyle[];
  fileExplorerControlStyles: RawControlStyle[];
  themeVarsCommon: string[];
  ncThemeVars: string[];
}

export interface WindhawkBackups {
  taskbarBackup: string;
  startMenuBackup: string;
  notificationCenterBackup: string;
  contextMenuBackup: string;
  fileExplorerBackup: string;
}

export interface WindhawkThemePackage {
  taskbarStyles: string;
  startMenuStyles: string;
  notificationCenterStyles: string;
  contextMenuStyles: string;
  fileExplorerStyles: string;
  themeVariables: string[];
}

export const DEFAULT_START_ICON_PNG = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
  0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
  0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
]);

export function calculateGradientPoints(
  angleDeg: number,
  expansionFactor: number = 1.2
): { start: string; end: string } {
  const norm = ((angleDeg % 360) + 360) % 360;
  const rad = (norm * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  const maxD = Math.max(Math.abs(dx), Math.abs(dy));
  const scale = (maxD > 0 ? 0.5 / maxD : 0.5) * expansionFactor;

  const fmt = (n: number) => {
    const val = Math.abs(n) < 1e-6 ? 0 : n;
    return Number((Math.round(val * 100) / 100).toFixed(2)).toString();
  };
  return {
    start: `${fmt(0.5 - scale * dx)},${fmt(0.5 - scale * dy)}`,
    end: `${fmt(0.5 + scale * dx)},${fmt(0.5 + scale * dy)}`,
  };
}

export function generateGradientBrushXaml(config: GradientConfig, opacity?: number): string {
  const formatColor = (c: string): string => {
    let clean = c.replace(/^#/, '').trim();
    if (clean.length === 3) clean = clean.split('').map((x) => x + x).join('');
    if (opacity !== undefined) {
      const alphaHex = opacityToAlphaHex(opacity).toUpperCase();
      const rgbHex = clean.length === 8 ? clean.slice(2).toUpperCase() : clean.toUpperCase();
      return `#${alphaHex}${rgbHex}`;
    }
    if (clean.length === 6 || clean.length === 8) return `#${clean.length === 6 ? 'FF' : ''}${clean.toUpperCase()}`;
    return `#FF${clean.toUpperCase().padStart(6, '0')}`;
  };

  const stopsXaml = (config.stops || [])
    .map((s) => `<GradientStop Color="${formatColor(s.color)}" Offset="${Number((Math.round((s.offset / 100) * 10000) / 10000).toFixed(4))}"/>`)
    .join('');

  if (config.type === 'radial') {
    return `<RadialGradientBrush Center="0.5,0.5" RadiusX="0.5" RadiusY="0.5">${stopsXaml}</RadialGradientBrush>`;
  }
  const { start, end } = calculateGradientPoints(config.angle ?? 90);
  return `<LinearGradientBrush StartPoint="${start}" EndPoint="${end}">${stopsXaml}</LinearGradientBrush>`;
}

export function buildSurfaceFill(
  material: MaterialStyle,
  blurAmount: number,
  baseBgRgb: RGB,
  accentRgb: RGB,
  secRgb: RGB,
  opacity: number,
  noiseOpacity: number = 0.04,
  tintSaturation: number = 0.85,
  gradientCoords: { start: string; end: string } = { start: '1.4, 1.4', end: '-0.4, -0.4' }
): string {
  const bgHex = rgbToHex(baseBgRgb).replace('#', '');
  const alphaHex = opacityToAlphaHex(opacity);

  if (material === 'fluent-acrylic') {
    return `<WindhawkBlur BlurAmount="${blurAmount}" TintColor="#${alphaHex}${bgHex}" TintOpacity="${(opacity / 100).toFixed(2)}" TintSaturation="${tintSaturation.toFixed(2)}" NoiseOpacity="${noiseOpacity.toFixed(2)}" NoiseDensity="1.0" FallbackColor="#${bgHex}"/>`;
  }
  if (material === 'mica') {
    return `<WindhawkBlur BlurAmount="38" TintColor="#${alphaHex}${bgHex}" TintOpacity="0.9" TintSaturation="${tintSaturation.toFixed(2)}" NoiseOpacity="0.02" NoiseDensity="1.0" FallbackColor="#${bgHex}"/>`;
  }
  if (material === 'mica-alt') {
    return `<WindhawkBlur BlurAmount="45" TintColor="#${alphaHex}${bgHex}" TintOpacity="0.95" TintSaturation="${tintSaturation.toFixed(2)}" NoiseOpacity="0.01" NoiseDensity="1.0" FallbackColor="#${bgHex}"/>`;
  }
  if (material === 'pure-black-neon') return `<SolidColorBrush Color="#000000" Opacity="0.98"/>`;
  if (material === 'matte-slate') return `<SolidColorBrush Color="#${bgHex}" Opacity="1.0"/>`;
  return buildLinearGradientBrush(gradientCoords.start, gradientCoords.end, baseBgRgb, accentRgb, secRgb, opacity);
}

export const buildMaterialBackgroundStyle = buildSurfaceFill;

export function resolveSurfaceFill(
  state: ThemeConfigSnapshot | ThemeState,
  override: ComponentOverride | undefined,
  defaultMaterial: MaterialStyle,
  defaultBlur: number,
  defaultOpacity: number,
  defaultCoords: { start: string; end: string }
): string {
  const accentRgb = hexToRgb(state.accentColor);
  const secRgb = hexToRgb(state.secondaryAccent);
  const baseBgRgb = state.isLightMode ? ([240, 240, 245] as [number, number, number]) : ([16, 18, 22] as [number, number, number]);
  const noise = state.noiseOpacity ?? 0.04;
  const sat = state.tintSaturation ?? 0.85;

  if (override?.enabled) {
    if (override.customColor) {
      const alphaHex = opacityToAlphaHex(override.opacity ?? defaultOpacity).toUpperCase();
      let cleanHex = override.customColor.replace(/^#/, '').trim().toUpperCase();
      if (cleanHex.length === 8) cleanHex = cleanHex.slice(2);
      else if (cleanHex.length === 3) cleanHex = cleanHex.split('').map((c) => c + c).join('');
      return `<SolidColorBrush Color="#${alphaHex}${cleanHex}"/>`;
    }
    if (override.gradient) return generateGradientBrushXaml(override.gradient, override.opacity ?? defaultOpacity);
    return buildSurfaceFill(override.materialStyle ?? defaultMaterial, override.blur ?? defaultBlur, baseBgRgb, accentRgb, secRgb, override.opacity ?? defaultOpacity, noise, sat, defaultCoords);
  }
  if (defaultMaterial === 'linear-gradient' && state.globalGradient) {
    return generateGradientBrushXaml(state.globalGradient, defaultOpacity);
  }
  return buildSurfaceFill(defaultMaterial, defaultBlur, baseBgRgb, accentRgb, secRgb, defaultOpacity, noise, sat, defaultCoords);
}

export function buildRunningIndicatorMod(config: RunningIndicatorConfig, cNormal: string = '#0078D4', radius: number = 8): string[] {
  const activeColor = config.activeColorMode === 'white' ? '#FFFFFF' : config.activeColorMode === 'custom' ? config.activeCustomColor : cNormal;
  const inactiveColor = config.inactiveColorMode === 'accent' ? cNormal : config.inactiveColorMode === 'custom' ? config.inactiveCustomColor : '#888888';
  const size = config.indicatorSize || 3;

  if (config.style === 'dot') return [`Fill=${inactiveColor}`, `Width=${size}`, `Height=${size}`, 'CornerRadius=99', `Fill@ActiveRunningIndicator=${activeColor}`];
  if (config.style === 'pill') return [`Fill=${inactiveColor}`, 'Width=12', `Height=${size}`, 'CornerRadius=3', `Fill@ActiveRunningIndicator=${activeColor}`];
  if (config.style === 'glow') {
    return [
      `Fill:=<LinearGradientBrush StartPoint="0,0" EndPoint="1,0"><GradientStop Color="#00${activeColor.replace('#', '')}" Offset="0.0"/><GradientStop Color="${activeColor}" Offset="0.5"/><GradientStop Color="#00${activeColor.replace('#', '')}" Offset="1.0"/></LinearGradientBrush>`,
      `Height=${size}`,
      'CornerRadius=99',
      `Fill@ActiveRunningIndicator=${activeColor}`,
    ];
  }
  if (config.style === 'off' || (config.style as string) === 'hidden') return ['Visibility=Collapsed'];
  return [`Fill=${inactiveColor}`, `Height=${size}`, `CornerRadius=${radius}`, `Fill@ActiveRunningIndicator=${activeColor}`];
}

export const generateRunningIndicatorStyles = buildRunningIndicatorMod;

export function buildContextMenuMod(state: ThemeConfigSnapshot | ThemeState): RawControlStyle[] {
  const cNormal = (state.accentColor || '#0078D4').toLowerCase();
  const radius = state.contextMenuOverride?.cornerRadius ?? state.cornerRadius ?? 8;
  const thickness = state.contextMenuOverride?.borderThickness ?? state.borderThickness ?? 2;
  const defaultBlur = state.notificationBlur ?? 15;
  const defaultOp = state.notificationOpacity ?? 95;
  const cm = state.contextMenuOverride;

  let cmFill = '';
  if (cm?.materialStyle === 'pure-black-neon') {
    cmFill = '<SolidColorBrush Color="#0A0A0C"/>';
  } else if (cm?.customColor) {
    const alphaHex = opacityToAlphaHex(cm.opacity ?? defaultOp);
    let clean = cm.customColor.replace(/^#/, '');
    if (clean.length === 8) clean = clean.slice(2);
    cmFill = `<SolidColorBrush Color="#${alphaHex}${clean}"/>`;
  } else if (cm?.gradient) {
    cmFill = generateGradientBrushXaml(cm.gradient, cm.opacity ?? defaultOp);
  } else {
    cmFill = `<WindhawkBlur BlurAmount="${cm?.blur ?? defaultBlur}" TintColor="#f7101216" TintOpacity="${((cm?.opacity ?? defaultOp) / 100).toFixed(2)}" TintSaturation="0.85" NoiseOpacity="0.04" NoiseDensity="1.0" FallbackColor="#101216"/>`;
  }

  const styles: RawControlStyle[] = [
    {
      target: 'MenuFlyoutPresenter',
      styles: [`Background:=${cmFill}`, `BorderBrush=${cNormal}`, `BorderThickness=${thickness}`, `CornerRadius=${radius}`, 'Padding=4,4,4,4'],
    },
    {
      target: 'MenuFlyoutItem',
      styles: cm?.itemHoverAccent !== false ? ['CornerRadius=4', `Background@PointerOver:=<SolidColorBrush Color="${cNormal}" Opacity="0.18"/>`] : ['CornerRadius=4'],
    },
  ];
  return styles;
}

export const generateContextMenuStyles = buildContextMenuMod;

export function buildFileExplorerMod(state: ThemeConfigSnapshot | ThemeState): RawControlStyle[] {
  const cNormal = (state.accentColor || '#0078D4').toLowerCase();
  const fe = state.fileExplorerOverride;
  const tabStyle = fe?.tabStyle ?? 'integrated';
  const styles: RawControlStyle[] = [];

  if (tabStyle === 'floating') {
    styles.push({ target: 'TabViewItem', styles: ['Margin=2,2,2,0', 'CornerRadius=6'] });
  } else if (tabStyle === 'accent-border') {
    styles.push({ target: 'TabViewItem', styles: ['BorderBottomThickness=2', `BorderBrush=${cNormal}`] });
  } else {
    styles.push({ target: 'TabViewItem', styles: ['CornerRadius=6,6,0,0'] });
  }

  if ((fe?.activeTabColorMode ?? 'accent') === 'accent') {
    styles.push({ target: 'TabViewItem@Selected', styles: [`Background:=<SolidColorBrush Color="${cNormal}" Opacity="0.22"/>`] });
  }
  if (fe?.showCommandBarTint) {
    styles.push({ target: 'CommandBar', styles: [`Background:=<SolidColorBrush Color="${cNormal}" Opacity="0.12"/>`] });
  }
  return styles;
}

export const generateFileExplorerStyles = buildFileExplorerMod;

export function buildTaskbarMod(
  state: ThemeConfigSnapshot | ThemeState,
  tbFill?: string,
  cNormal?: string,
  radius?: number,
  thickness?: number
): RawControlStyle[] {
  const material: MaterialStyle = state.materialStyle || (state.taskbarMode === 'gradient' ? 'linear-gradient' : 'fluent-acrylic');
  const fill = tbFill ?? resolveSurfaceFill(state, state.taskbarOverride, material, state.taskbarBlur ?? 10, state.taskbarOpacity ?? 97, { start: '1.4, 1.4', end: '-0.4, -0.4' });
  const normal = cNormal ?? (state.accentColor || '#0078D4').toLowerCase();
  const rad = radius ?? state.cornerRadius;
  const thick = thickness ?? (state.borderThickness ?? 2);
  const hasIcon = !!(state.customStartIconUrl || state.customStartIconData || state.startButton?.type === 'preset' || (state.startButton?.type === 'custom' && state.startButton.customIconUrl));

  const styles: RawControlStyle[] = [];
  if (hasIcon) {
    styles.push(
      { target: 'Taskbar.ExperienceToggleButton#LaunchListButton[AutomationPropertiesAutomationId=StartButton] > Taskbar.TaskListButtonPanel > Grid > Microsoft.UI.Xaml.Controls.AnimatedVisualPlayer#Icon', styles: ['Visibility=Collapsed'] },
      { target: 'Taskbar.ExperienceToggleButton#LaunchListButton[AutomationPropertiesAutomationId=StartButton] > Taskbar.TaskListButtonPanel > Grid > Border#BackgroundElement', styles: [`CornerRadius=${rad}`, '<ImageBrush ImageSource="C:\\Users\\Public\\Pictures\\Windhawk_start_icon.png" Stretch="Uniform"/>'] }
    );
  } else {
    styles.push({ target: 'Taskbar.ExperienceToggleButton#LaunchListButton[AutomationPropertiesAutomationId=StartButton] > Taskbar.TaskListButtonPanel > Grid > Border#BackgroundElement', styles: [`CornerRadius=${rad}`] });
  }

  if (state.dockMode) styles.push({ target: 'Taskbar.TaskbarBackground#BackgroundControl', styles: ['Margin=5, 5, 5, 5'] });
  styles.push(
    { target: 'Taskbar.TaskbarBackground#BackgroundControl > Windows.UI.Xaml.Controls.Grid > Windows.UI.Xaml.Shapes.Rectangle#BackgroundFill', styles: [`Fill:=${fill}`] },
    { target: 'Taskbar.TaskbarBackground#BackgroundControl > Windows.UI.Xaml.Controls.Grid > Windows.UI.Xaml.Shapes.Rectangle#BackgroundStroke', styles: [`Fill=${normal}`, `Height=${thick}`] }
  );

  let indicatorStyles: string[];
  if (state.runningIndicator) indicatorStyles = buildRunningIndicatorMod(state.runningIndicator, normal, rad);
  else if (state.runningIndicatorStyle === 'dot') indicatorStyles = [`Fill=${normal}`, 'Width=5', 'Height=5', 'CornerRadius=5', `Fill@ActiveRunningIndicator=${normal}`];
  else if (state.runningIndicatorStyle === 'hidden') indicatorStyles = ['Visibility=Collapsed'];
  else if (state.runningIndicatorStyle === 'glow') {
    indicatorStyles = [`Fill:=<LinearGradientBrush StartPoint="0,0" EndPoint="1,0"><GradientStop Color="#00${normal.replace('#', '')}" Offset="0.0"/><GradientStop Color="${normal}" Offset="0.5"/><GradientStop Color="#00${normal.replace('#', '')}" Offset="1.0"/></LinearGradientBrush>`, 'Height=3', `CornerRadius=${rad}`, `Fill@ActiveRunningIndicator=${normal}`];
  } else {
    indicatorStyles = [`Fill=${normal}`, 'Height=3', `CornerRadius=${rad}`, `Fill@ActiveRunningIndicator=${normal}`];
  }
  styles.push({ target: 'Taskbar.TaskListLabeledButtonPanel@RunningIndicatorStates > Rectangle#RunningIndicator', styles: indicatorStyles });
  styles.push({ target: 'Taskbar.TaskListButtonPanel > Border#BackgroundElement', styles: [`CornerRadius=${rad}`, `Background@ActiveNormal:=<SolidColorBrush Color="${normal}" Opacity="0.18"/>`] });
  return styles;
}

export function buildStartMenuMod(
  state: ThemeConfigSnapshot | ThemeState,
  smFill?: string,
  cNormal?: string,
  radius?: number,
  thickness?: number
): RawControlStyle[] {
  const material: MaterialStyle = state.materialStyle || (state.taskbarMode === 'gradient' ? 'linear-gradient' : 'fluent-acrylic');
  const fill = smFill ?? resolveSurfaceFill(state, state.startMenuOverride, material, state.startMenuBlur ?? 15, state.startMenuOpacity ?? 97, { start: '1.2, -0.2', end: '-0.2, 1.2' });
  const normal = cNormal ?? (state.accentColor || '#0078D4').toLowerCase();
  const rad = radius ?? state.cornerRadius;
  const thick = thickness ?? (state.borderThickness ?? 2);

  const styles: RawControlStyle[] = [
    { target: 'Border#AcrylicBorder', styles: [`Background:=${fill}`, `BorderBrush=${normal}`, `BorderThickness=${thick}`, `CornerRadius=${rad}`] },
    { target: 'Border#AppBorder', styles: [`CornerRadius=${rad}`] },
    state.compactSearch
      ? { target: 'StartDocked.SearchBoxToggleButton', styles: ['Height=0', 'Margin=0,0,0,24', 'Visibility=Collapsed'] }
      : { target: 'StartDocked.SearchBoxToggleButton', styles: [`Background=${normal}EE`, `BorderBrush=${normal}EE`, `BorderThickness=${thick}`, `CornerRadius=${rad}`] },
  ];

  if (state.hideRecommended) {
    styles.push(
      { target: 'Grid#TopLevelSuggestionsListHeader', styles: ['Visibility=Collapsed'] },
      { target: 'Grid#NoTopLevelSuggestionsText', styles: ['Visibility=Collapsed'] },
      { target: 'Grid#TopLevelSuggestionsContainer', styles: ['Visibility=Collapsed'] },
      { target: 'Grid#ShowMoreSuggestions', styles: ['Visibility=Collapsed'] },
      { target: 'StartMenu.PinnedList', styles: ['Height=504'] }
    );
  }
  return styles;
}

export function buildNotificationCenterMod(
  state: ThemeConfigSnapshot | ThemeState,
  ncFill?: string,
  cNormal?: string,
  radius?: number,
  thickness?: number,
  buttonRadius?: number
): RawControlStyle[] {
  const material: MaterialStyle = state.materialStyle || (state.taskbarMode === 'gradient' ? 'linear-gradient' : 'fluent-acrylic');
  const fill = ncFill ?? resolveSurfaceFill(state, state.flyoutOverride, material, state.notificationBlur ?? 15, state.notificationOpacity ?? 97, { start: '1.2, 1.2', end: '-0.2, -0.2' });
  const normal = cNormal ?? (state.accentColor || '#0078D4').toLowerCase();
  const rad = radius ?? state.cornerRadius;
  const thick = thickness ?? (state.borderThickness ?? 2);
  const btnRadius = buttonRadius ?? Math.max(0, rad - 4);

  return [
    {
      target: 'Grid#NotificationCenterGrid',
      styles: [`Background:=${fill}`, `BorderBrush=${normal}`, `BorderThickness=${thick}`, `CornerRadius=${rad}`, ...(state.dynamicNotificationHeight ? ['VerticalAlignment=2'] : []), ...(state.removeDropShadows ? ['Shadow:='] : [])],
    },
    {
      target: 'Grid#CalendarCenterGrid',
      styles: [`Background:=${fill}`, `BorderBrush=${normal}`, `BorderThickness=${thick}`, `CornerRadius=${rad}`, ...(state.removeDropShadows ? ['Shadow:='] : [])],
    },
    {
      target: 'Grid#ControlCenterRegion',
      styles: [`Background:=${fill}`, `BorderBrush=${normal}`, `BorderThickness=${thick}`, `CornerRadius=${rad}`],
    },
    { target: 'QuickActions.AccessibleToggleButton#ToggleButton', styles: [`CornerRadius=${btnRadius}`] },
    { target: 'QuickActions.AccessibleToggleButton#SplitL2Button', styles: [`CornerRadius=${btnRadius}`] },
  ];
}

export function getModRawStyles(state: ThemeConfigSnapshot | ThemeState): ModRawStyles {
  const palette = computeAccentPalette(state.accentColor, state.secondaryAccent);
  const accentRgb = hexToRgb(state.accentColor);
  const cNormal = rgbToHex(accentRgb);
  const material: MaterialStyle = state.materialStyle || (state.taskbarMode === 'gradient' ? 'linear-gradient' : 'fluent-acrylic');
  const radius = state.cornerRadius;
  const thickness = state.borderThickness ?? 2;
  const buttonRadius = Math.max(0, radius - 4);

  const tbFill = resolveSurfaceFill(state, state.taskbarOverride, material, state.taskbarBlur ?? 10, state.taskbarOpacity ?? 97, { start: '1.4, 1.4', end: '-0.4, -0.4' });
  const smFill = resolveSurfaceFill(state, state.startMenuOverride, material, state.startMenuBlur ?? 15, state.startMenuOpacity ?? 97, { start: '1.2, -0.2', end: '-0.2, 1.2' });
  const ncFill = resolveSurfaceFill(state, state.flyoutOverride, material, state.notificationBlur ?? 15, state.notificationOpacity ?? 97, { start: '1.2, 1.2', end: '-0.2, -0.2' });

  const taskbarControlStyles = buildTaskbarMod(state, tbFill, cNormal, radius, thickness);
  const startMenuControlStyles = buildStartMenuMod(state, smFill, cNormal, radius, thickness);
  const ncControlStyles = buildNotificationCenterMod(state, ncFill, cNormal, radius, thickness, buttonRadius);

  if (state.typography) {
    const weightMap: Record<string, string> = { '300': 'Light', '400': 'Normal', '500': 'Medium', '600': 'SemiBold', '700': 'Bold' };
    const typo = [`FontFamily=${state.typography.fontFamily}`, `FontWeight=${weightMap[state.typography.fontWeight] || state.typography.fontWeight || 'Normal'}`, `CharacterSpacing=${state.typography.characterSpacing}`];
    taskbarControlStyles.push(
      { target: 'TextBlock#LabelControl, SystemTray.ClockButton * > TextBlock, TextBlock#TimeTextBlock, TextBlock#DateTextBlock', styles: typo },
      { target: 'SystemTray.TextIconContent > * > TextBlock', styles: ['FontFamily=Segoe Fluent Icons', 'CharacterSpacing=0'] }
    );
    startMenuControlStyles.push(
      { target: 'StartMenu.PinnedList TextBlock, StartMenu.AllAppsList TextBlock, StartDocked.SearchBoxToggleButton TextBlock, Grid#TopLevelSuggestionsContainer TextBlock, StartDocked.UserProfileButton TextBlock', styles: typo },
      { target: 'StartDocked.PowerOptionsView TextBlock, Button#PowerButton TextBlock', styles: ['FontFamily=Segoe Fluent Icons', 'CharacterSpacing=0'] }
    );
    ncControlStyles.push(
      { target: 'Grid#NotificationCenterGrid TextBlock#Header, Grid#NotificationCenterGrid TextBlock#Body, CalendarView TextBlock', styles: typo },
      { target: 'ActionCenter.FocusSessionControl TextBlock, QuickActions.AccessibleToggleButton TextBlock', styles: ['FontFamily=Segoe Fluent Icons', 'CharacterSpacing=0'] }
    );
  }

  if (state.animations?.durationMs !== undefined) {
    const dur = [`Duration=0:0:${(state.animations.durationMs / 1000).toFixed(3)}`];
    taskbarControlStyles.push({ target: 'Storyboard', styles: dur });
    startMenuControlStyles.push({ target: 'Storyboard', styles: dur });
    ncControlStyles.push({ target: 'Storyboard', styles: dur });
  }

  const themeVarsCommon = [
    `SystemAccentColor=${cNormal}`,
    `SystemAccentColorLight1=${rgbToHex(palette.colors[2])}`,
    `SystemAccentColorLight2=${rgbToHex(palette.colors[1])}`,
    `SystemAccentColorLight3=${rgbToHex(palette.colors[0])}`,
    `SystemAccentColorDark1=${rgbToHex(palette.colors[4])}`,
    `SystemAccentColorDark2=${rgbToHex(palette.colors[5])}`,
    `SystemAccentColorDark3=${rgbToHex(palette.colors[6])}`,
  ];

  return {
    taskbarControlStyles,
    startMenuControlStyles,
    ncControlStyles,
    contextMenuControlStyles: buildContextMenuMod(state),
    fileExplorerControlStyles: buildFileExplorerMod(state),
    themeVarsCommon,
    ncThemeVars: [...themeVarsCommon, `ToggleSwitchFillOn=${cNormal}`, `SliderTrackValueFill=${cNormal}`, `SliderThumbBackground=${cNormal}`],
  };
}

export function buildWindhawkJsonBackups(state: ThemeConfigSnapshot | ThemeState): WindhawkBackups {
  const { taskbarControlStyles, startMenuControlStyles, ncControlStyles, contextMenuControlStyles, fileExplorerControlStyles, themeVarsCommon, ncThemeVars } = getModRawStyles(state);

  const toYaml = (styles: RawControlStyle[]) =>
    styles.map((c) => `  - target: ${c.target}\n    styles:\n${c.styles.map((s) => `      - ${s}`).join('\n')}`).join('\n');

  return {
    taskbarBackup: `theme: ''\nstyleConstants:\n  - ''\ncontrolStyles:\n${toYaml(taskbarControlStyles)}\nthemeResourceVariables:\n  - ''\nclickThroughTaskbar: 0\nxamlDiagnosticsHandling: ''\n`,
    startMenuBackup: `theme: ''\ndisableNewStartMenuLayout: ''\nstyleConstants:\n  - ''\ncontrolStyles:\n${toYaml(startMenuControlStyles)}\nthemeResourceVariables:\n${themeVarsCommon.map((v) => `  - ${v}`).join('\n')}\nwebContentStyles:\n  - target: ''\n    styles:\n      - ''\nwebContentCustomJs: ''\n`,
    notificationCenterBackup: `theme: ''\nstyleConstants:\n  - ''\ncontrolStyles:\n${toYaml(ncControlStyles)}\nthemeResourceVariables:\n${ncThemeVars.map((v) => `  - ${v}`).join('\n')}\n`,
    contextMenuBackup: `theme: ''\nstyleConstants:\n  - ''\ncontrolStyles:\n${toYaml(contextMenuControlStyles)}\n`,
    fileExplorerBackup: `theme: ''\nstyleConstants:\n  - ''\ncontrolStyles:\n${toYaml(fileExplorerControlStyles)}\n`,
  };
}

export function generateWindhawkStylerMod(state: ThemeConfigSnapshot | ThemeState): WindhawkThemePackage {
  const fullState = { ...DEFAULT_THEME_STATE, ...state } as ThemeState;
  const { themeVarsCommon, ncThemeVars } = getModRawStyles(fullState);
  const backups = buildWindhawkJsonBackups(fullState);

  return {
    taskbarStyles: backups.taskbarBackup,
    startMenuStyles: backups.startMenuBackup,
    notificationCenterStyles: backups.notificationCenterBackup,
    contextMenuStyles: backups.contextMenuBackup,
    fileExplorerStyles: backups.fileExplorerBackup,
    themeVariables: Array.from(new Set([...themeVarsCommon, ...ncThemeVars])),
  };
}
