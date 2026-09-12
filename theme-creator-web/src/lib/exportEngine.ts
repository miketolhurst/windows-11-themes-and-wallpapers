import JSZip from 'jszip';
import {
  ThemeState,
  ThemeConfigSnapshot,
  MaterialStyle,
  GradientConfig,
  ComponentOverride,
  DEFAULT_THEME_STATE,
} from '../store/useThemeStore';
import {
  computeAccentPalette,
  hexToRgb,
  rgbToHex,
  buildLinearGradientBrush,
  opacityToAlphaHex,
  RGB,
} from './paletteEngine';

function escapeRegStr(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function calculateGradientPoints(angleDeg: number): { start: string; end: string } {
  const norm = ((angleDeg % 360) + 360) % 360;
  const rad = (norm * Math.PI) / 180;
  // 0deg = bottom-to-top (dx=0, dy=-1)
  // 90deg = left-to-right (dx=1, dy=0)
  // 180deg = top-to-bottom (dx=0, dy=1)
  // 270deg = right-to-left (dx=-1, dy=0)
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);

  const startX = 0.5 - 0.5 * dx;
  const startY = 0.5 - 0.5 * dy;
  const endX = 0.5 + 0.5 * dx;
  const endY = 0.5 + 0.5 * dy;

  const formatCoord = (n: number): string => {
    const val = Math.abs(n) < 1e-6 ? 0 : n;
    const rounded = Math.round(val * 100) / 100;
    return Number(rounded.toFixed(2)).toString();
  };

  return {
    start: `${formatCoord(startX)},${formatCoord(startY)}`,
    end: `${formatCoord(endX)},${formatCoord(endY)}`,
  };
}

export function generateGradientBrushXaml(config: GradientConfig, opacity?: number): string {
  const formatColor = (colorStr: string): string => {
    let clean = colorStr.replace(/^#/, '').trim();
    if (clean.length === 3) {
      clean = clean.split('').map((c) => c + c).join('');
    }
    if (opacity !== undefined) {
      const alphaHex = opacityToAlphaHex(opacity).toUpperCase();
      const rgbHex = clean.length === 8 ? clean.slice(2).toUpperCase() : clean.toUpperCase();
      return `#${alphaHex}${rgbHex}`;
    }
    if (clean.length === 6) {
      return `#FF${clean.toUpperCase()}`;
    }
    if (clean.length === 8) {
      return `#${clean.toUpperCase()}`;
    }
    return `#FF${clean.toUpperCase().padStart(6, '0')}`;
  };

  const formatOffset = (offsetVal: number): string => {
    const normalized = offsetVal / 100;
    const rounded = Math.round(normalized * 10000) / 10000;
    return Number(rounded.toFixed(4)).toString();
  };

  const stopsXaml = (config.stops || [])
    .map((stop) => `<GradientStop Color="${formatColor(stop.color)}" Offset="${formatOffset(stop.offset)}"/>`)
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
  } else if (material === 'mica') {
    return `<WindhawkBlur BlurAmount="38" TintColor="#${alphaHex}${bgHex}" TintOpacity="0.9" TintSaturation="${tintSaturation.toFixed(2)}" NoiseOpacity="0.02" NoiseDensity="1.0" FallbackColor="#${bgHex}"/>`;
  } else if (material === 'mica-alt') {
    return `<WindhawkBlur BlurAmount="45" TintColor="#${alphaHex}${bgHex}" TintOpacity="0.95" TintSaturation="${tintSaturation.toFixed(2)}" NoiseOpacity="0.01" NoiseDensity="1.0" FallbackColor="#${bgHex}"/>`;
  } else if (material === 'pure-black-neon') {
    return `<SolidColorBrush Color="#000000" Opacity="0.98"/>`;
  } else if (material === 'matte-slate') {
    return `<SolidColorBrush Color="#${bgHex}" Opacity="1.0"/>`;
  } else {
    return buildLinearGradientBrush(
      gradientCoords.start,
      gradientCoords.end,
      baseBgRgb,
      accentRgb,
      secRgb,
      opacity
    );
  }
}

export const buildMaterialBackgroundStyle = buildSurfaceFill;

export interface RawControlStyle {
  target: string;
  styles: string[];
}

export interface ModRawStyles {
  taskbarControlStyles: RawControlStyle[];
  startMenuControlStyles: RawControlStyle[];
  ncControlStyles: RawControlStyle[];
  themeVarsCommon: string[];
  ncThemeVars: string[];
}

export function getModRawStyles(state: ThemeConfigSnapshot | ThemeState): ModRawStyles {
  const palette = computeAccentPalette(state.accentColor, state.secondaryAccent);
  const accentRgb = hexToRgb(state.accentColor);
  const secRgb = hexToRgb(state.secondaryAccent);
  const baseBgRgb = state.isLightMode ? ([240, 240, 245] as [number, number, number]) : ([16, 18, 22] as [number, number, number]);

  const cNormal = rgbToHex(accentRgb);
  const cLight1 = rgbToHex(palette.colors[2]);
  const cLight2 = rgbToHex(palette.colors[1]);
  const cLight3 = rgbToHex(palette.colors[0]);
  const cDark1 = rgbToHex(palette.colors[4]);
  const cDark2 = rgbToHex(palette.colors[5]);
  const cDark3 = rgbToHex(palette.colors[6]);

  const materialStyle: MaterialStyle =
    state.materialStyle || (state.taskbarMode === 'gradient' ? 'linear-gradient' : 'fluent-acrylic');
  const noise = state.noiseOpacity ?? 0.04;
  const sat = state.tintSaturation ?? 0.85;

  const resolveFill = (
    override: ComponentOverride | undefined,
    defaultMaterial: MaterialStyle,
    defaultBlur: number,
    defaultOpacity: number,
    defaultCoords: { start: string; end: string }
  ): string => {
    if (override?.enabled) {
      if (override.customColor) {
        const op = override.opacity ?? defaultOpacity;
        const alphaHex = opacityToAlphaHex(op).toUpperCase();
        let cleanHex = override.customColor.replace(/^#/, '').trim().toUpperCase();
        if (cleanHex.length === 8) {
          cleanHex = cleanHex.slice(2);
        } else if (cleanHex.length === 3) {
          cleanHex = cleanHex.split('').map((c) => c + c).join('');
        }
        return `<SolidColorBrush Color="#${alphaHex}${cleanHex}"/>`;
      }
      if (override.gradient) {
        return generateGradientBrushXaml(override.gradient, override.opacity ?? defaultOpacity);
      }
      return buildSurfaceFill(
        override.materialStyle ?? defaultMaterial,
        override.blur ?? defaultBlur,
        baseBgRgb,
        accentRgb,
        secRgb,
        override.opacity ?? defaultOpacity,
        noise,
        sat,
        defaultCoords
      );
    }
    if (defaultMaterial === 'linear-gradient' && state.globalGradient) {
      return generateGradientBrushXaml(state.globalGradient, defaultOpacity);
    }
    return buildSurfaceFill(
      defaultMaterial,
      defaultBlur,
      baseBgRgb,
      accentRgb,
      secRgb,
      defaultOpacity,
      noise,
      sat,
      defaultCoords
    );
  };

  const tbFill = resolveFill(
    state.taskbarOverride,
    materialStyle,
    state.taskbarBlur ?? 10,
    state.taskbarOpacity ?? 97,
    { start: '1.4, 1.4', end: '-0.4, -0.4' }
  );

  const smFill = resolveFill(
    state.startMenuOverride,
    materialStyle,
    state.startMenuBlur ?? 15,
    state.startMenuOpacity ?? 97,
    { start: '1.2, -0.2', end: '-0.2, 1.2' }
  );

  const ncFill = resolveFill(
    state.flyoutOverride,
    materialStyle,
    state.notificationBlur ?? 15,
    state.notificationOpacity ?? 97,
    { start: '1.2, 1.2', end: '-0.2, -0.2' }
  );

  const radius = state.cornerRadius;
  const thickness = state.borderThickness ?? 2;
  const buttonRadius = Math.max(0, radius - 4);

  const hasCustomIcon = !!(state.customStartIconUrl || state.customStartIconData);
  const taskbarControlStyles: RawControlStyle[] = [];

  if (hasCustomIcon) {
    taskbarControlStyles.push({
      target:
        'Taskbar.ExperienceToggleButton#LaunchListButton[AutomationPropertiesAutomationId=StartButton] > Taskbar.TaskListButtonPanel > Grid > Microsoft.UI.Xaml.Controls.AnimatedVisualPlayer#Icon',
      styles: ['Visibility=Collapsed'],
    });
    taskbarControlStyles.push({
      target:
        'Taskbar.ExperienceToggleButton#LaunchListButton[AutomationPropertiesAutomationId=StartButton] > Taskbar.TaskListButtonPanel > Grid > Border#BackgroundElement',
      styles: [
        `CornerRadius=${radius}`,
        '<ImageBrush ImageSource="C:\\Users\\Public\\Pictures\\Windhawk_start_icon.png" Stretch="Uniform"/>',
      ],
    });
  } else {
    taskbarControlStyles.push({
      target:
        'Taskbar.ExperienceToggleButton#LaunchListButton[AutomationPropertiesAutomationId=StartButton] > Taskbar.TaskListButtonPanel > Grid > Border#BackgroundElement',
      styles: [`CornerRadius=${radius}`],
    });
  }

  // Floating dock mode
  if (state.dockMode) {
    taskbarControlStyles.push({
      target: 'Taskbar.TaskbarBackground#BackgroundControl',
      styles: ['Margin=5, 5, 5, 5'],
    });
  }

  taskbarControlStyles.push({
    target:
      'Taskbar.TaskbarBackground#BackgroundControl > Windows.UI.Xaml.Controls.Grid > Windows.UI.Xaml.Shapes.Rectangle#BackgroundFill',
    styles: [`Fill:=${tbFill}`],
  });

  taskbarControlStyles.push({
    target:
      'Taskbar.TaskbarBackground#BackgroundControl > Windows.UI.Xaml.Controls.Grid > Windows.UI.Xaml.Shapes.Rectangle#BackgroundStroke',
    styles: [`Fill=${cNormal}`, `Height=${thickness}`, `BorderThickness=${thickness}`],
  });

  // Running indicator
  if (state.runningIndicatorStyle === 'dot') {
    taskbarControlStyles.push({
      target: 'Taskbar.TaskListLabeledButtonPanel@RunningIndicatorStates > Rectangle#RunningIndicator',
      styles: [
        `Fill=${cNormal}`,
        'Width=5',
        'Height=5',
        'CornerRadius=5',
        `Fill@ActiveRunningIndicator=${cNormal}`,
      ],
    });
  } else if (state.runningIndicatorStyle === 'hidden') {
    taskbarControlStyles.push({
      target: 'Taskbar.TaskListLabeledButtonPanel@RunningIndicatorStates > Rectangle#RunningIndicator',
      styles: ['Visibility=Collapsed'],
    });
  } else if (state.runningIndicatorStyle === 'glow') {
    taskbarControlStyles.push({
      target: 'Taskbar.TaskListLabeledButtonPanel@RunningIndicatorStates > Rectangle#RunningIndicator',
      styles: [
        `Fill:=<LinearGradientBrush StartPoint="0,0" EndPoint="1,0"><GradientStop Color="#00${cNormal.replace('#', '')}" Offset="0.0"/><GradientStop Color="${cNormal}" Offset="0.5"/><GradientStop Color="#00${cNormal.replace('#', '')}" Offset="1.0"/></LinearGradientBrush>`,
        'Height=3',
        `CornerRadius=${radius}`,
        `Fill@ActiveRunningIndicator=${cNormal}`,
      ],
    });
  } else {
    taskbarControlStyles.push({
      target: 'Taskbar.TaskListLabeledButtonPanel@RunningIndicatorStates > Rectangle#RunningIndicator',
      styles: [
        `Fill=${cNormal}`,
        'Height=3',
        `CornerRadius=${radius}`,
        `Fill@ActiveRunningIndicator=${cNormal}`,
      ],
    });
  }

  taskbarControlStyles.push({
    target: 'Taskbar.TaskListButtonPanel > Border#BackgroundElement',
    styles: [
      `CornerRadius=${radius}`,
      `Background@ActiveNormal:=<SolidColorBrush Color="${cNormal}" Opacity="0.18"/>`,
    ],
  });

  // Start menu styles
  const startMenuControlStyles: RawControlStyle[] = [
    {
      target: 'Border#AcrylicBorder',
      styles: [
        `Background:=${smFill}`,
        `BorderBrush=${cNormal}`,
        `BorderThickness=${thickness}`,
        `CornerRadius=${radius}`,
      ],
    },
    {
      target: 'Border#AppBorder',
      styles: [`CornerRadius=${radius}`],
    },
  ];

  if (state.compactSearch) {
    startMenuControlStyles.push({
      target: 'StartDocked.SearchBoxToggleButton',
      styles: ['Height=0', 'Margin=0,0,0,24', 'Visibility=Collapsed'],
    });
  } else {
    startMenuControlStyles.push({
      target: 'StartDocked.SearchBoxToggleButton',
      styles: [
        `Background=${cNormal}EE`,
        `BorderBrush=${cNormal}EE`,
        `BorderThickness=${thickness}`,
        `CornerRadius=${radius}`,
      ],
    });
  }

  if (state.hideRecommended) {
    startMenuControlStyles.push(
      { target: 'Grid#TopLevelSuggestionsListHeader', styles: ['Visibility=Collapsed'] },
      { target: 'Grid#NoTopLevelSuggestionsText', styles: ['Visibility=Collapsed'] },
      { target: 'Grid#TopLevelSuggestionsContainer', styles: ['Visibility=Collapsed'] },
      { target: 'Grid#ShowMoreSuggestions', styles: ['Visibility=Collapsed'] },
      { target: 'StartMenu.PinnedList', styles: ['Height=504'] }
    );
  }

  // Notification center styles
  const ncControlStyles: RawControlStyle[] = [
    {
      target: 'Grid#NotificationCenterGrid',
      styles: [
        `Background:=${ncFill}`,
        `BorderBrush=${cNormal}`,
        `BorderThickness=${thickness}`,
        `CornerRadius=${radius}`,
        ...(state.dynamicNotificationHeight ? ['VerticalAlignment=2'] : []),
        ...(state.removeDropShadows ? ['Shadow:='] : []),
      ],
    },
    {
      target: 'Grid#CalendarCenterGrid',
      styles: [
        `Background:=${ncFill}`,
        `BorderBrush=${cNormal}`,
        `BorderThickness=${thickness}`,
        `CornerRadius=${radius}`,
        ...(state.removeDropShadows ? ['Shadow:='] : []),
      ],
    },
    {
      target: 'Grid#ControlCenterRegion',
      styles: [
        `Background:=${ncFill}`,
        `BorderBrush=${cNormal}`,
        `BorderThickness=${thickness}`,
        `CornerRadius=${radius}`,
      ],
    },
    {
      target: 'QuickActions.AccessibleToggleButton#ToggleButton',
      styles: [`CornerRadius=${buttonRadius}`],
    },
    {
      target: 'QuickActions.AccessibleToggleButton#SplitL2Button',
      styles: [`CornerRadius=${buttonRadius}`],
    },
  ];

  const themeVarsCommon = [
    `SystemAccentColor=${cNormal}`,
    `SystemAccentColorLight1=${cLight1}`,
    `SystemAccentColorLight2=${cLight2}`,
    `SystemAccentColorLight3=${cLight3}`,
    `SystemAccentColorDark1=${cDark1}`,
    `SystemAccentColorDark2=${cDark2}`,
    `SystemAccentColorDark3=${cDark3}`,
  ];

  const ncThemeVars = [
    ...themeVarsCommon,
    `ToggleSwitchFillOn=${cNormal}`,
    `SliderTrackValueFill=${cNormal}`,
    `SliderThumbBackground=${cNormal}`,
  ];

  if (state.typography) {
    const fontWeightMap: Record<string, string> = {
      '300': 'Light',
      '400': 'Normal',
      '500': 'Medium',
      '600': 'SemiBold',
      '700': 'Bold',
    };
    const mappedWeight =
      fontWeightMap[state.typography.fontWeight] || state.typography.fontWeight || 'Normal';
    const typoStyles = [
      `FontFamily=${state.typography.fontFamily}`,
      `FontWeight=${mappedWeight}`,
      `CharacterSpacing=${state.typography.characterSpacing}`,
    ];
    taskbarControlStyles.push({
      target: 'TextBlock',
      styles: typoStyles,
    });
    startMenuControlStyles.push({
      target: 'TextBlock',
      styles: typoStyles,
    });
    ncControlStyles.push({
      target: 'TextBlock',
      styles: typoStyles,
    });
  }

  if (state.animations && state.animations.durationMs !== undefined) {
    const sec = (state.animations.durationMs / 1000).toFixed(3);
    const durationStyle = `Duration=0:0:${sec}`;
    taskbarControlStyles.push({
      target: 'Storyboard',
      styles: [durationStyle],
    });
    startMenuControlStyles.push({
      target: 'Storyboard',
      styles: [durationStyle],
    });
    ncControlStyles.push({
      target: 'Storyboard',
      styles: [durationStyle],
    });
  }

  return {
    taskbarControlStyles,
    startMenuControlStyles,
    ncControlStyles,
    themeVarsCommon,
    ncThemeVars,
  };
}

export function generateRegFileString(state: ThemeState): string {
  const palette = computeAccentPalette(state.accentColor, state.secondaryAccent);
  const accentRgb = hexToRgb(state.accentColor);
  const darkVal = state.isLightMode ? 1 : 0;
  const rgbStr = `${accentRgb[0]} ${accentRgb[1]} ${accentRgb[2]}`;

  const {
    taskbarControlStyles,
    startMenuControlStyles,
    ncControlStyles,
    themeVarsCommon,
    ncThemeVars,
  } = getModRawStyles(state);

  const taskbarLines: string[] = [];
  taskbarControlStyles.forEach((ctrl, i) => {
    taskbarLines.push(`"controlStyles[${i}].target"="${escapeRegStr(ctrl.target)}"`);
    ctrl.styles.forEach((style, sIdx) => {
      taskbarLines.push(`"controlStyles[${i}].styles[${sIdx}]"="${escapeRegStr(style)}"`);
    });
  });

  const startMenuLines: string[] = [];
  startMenuControlStyles.forEach((ctrl, i) => {
    startMenuLines.push(`"controlStyles[${i}].target"="${escapeRegStr(ctrl.target)}"`);
    ctrl.styles.forEach((style, sIdx) => {
      startMenuLines.push(`"controlStyles[${i}].styles[${sIdx}]"="${escapeRegStr(style)}"`);
    });
  });

  const ncLines: string[] = [];
  ncControlStyles.forEach((ctrl, i) => {
    ncLines.push(`"controlStyles[${i}].target"="${escapeRegStr(ctrl.target)}"`);
    ctrl.styles.forEach((style, sIdx) => {
      ncLines.push(`"controlStyles[${i}].styles[${sIdx}]"="${escapeRegStr(style)}"`);
    });
  });

  const regLines: string[] = [
    'Windows Registry Editor Version 5.00',
    '',
    '; ============================================================',
    '; 1. Windows 11 Taskbar Styler',
    '; ============================================================',
    '[-HKEY_LOCAL_MACHINE\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-taskbar-styler\\Settings]',
    '',
    '[HKEY_LOCAL_MACHINE\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-taskbar-styler\\Settings]',
    ...taskbarLines,
    '',
    '; ============================================================',
    '; 2. Windows 11 Start Menu Styler',
    '; ============================================================',
    '[-HKEY_LOCAL_MACHINE\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-start-menu-styler\\Settings]',
    '',
    '[HKEY_LOCAL_MACHINE\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-start-menu-styler\\Settings]',
    ...startMenuLines,
    ...themeVarsCommon.map((v, i) => `"themeResourceVariables[${i}]"="${escapeRegStr(v)}"`),
    '',
    '; ============================================================',
    '; 3. Windows 11 Notification Center & Quick Settings Styler',
    '; ============================================================',
    '[-HKEY_LOCAL_MACHINE\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-notification-center-styler\\Settings]',
    '',
    '[HKEY_LOCAL_MACHINE\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-notification-center-styler\\Settings]',
    ...ncLines,
    ...ncThemeVars.map((v, i) => `"themeResourceVariables[${i}]"="${escapeRegStr(v)}"`),
    '',
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
    '',
  ];

  return regLines.join('\r\n');
}

export interface WindhawkBackups {
  taskbarBackup: string;
  startMenuBackup: string;
  notificationCenterBackup: string;
}

export function buildWindhawkJsonBackups(state: ThemeConfigSnapshot | ThemeState): WindhawkBackups {
  const {
    taskbarControlStyles,
    startMenuControlStyles,
    ncControlStyles,
    themeVarsCommon,
    ncThemeVars,
  } = getModRawStyles(state);

  const formatStylesYaml = (styles: RawControlStyle[]): string => {
    return styles
      .map((c) => {
        const stylesLines = c.styles.map((s) => `      - ${s}`).join('\n');
        return `  - target: ${c.target}\n    styles:\n${stylesLines}`;
      })
      .join('\n');
  };

  const taskbarBackup = [
    "theme: ''",
    "styleConstants:",
    "  - ''",
    "controlStyles:",
    formatStylesYaml(taskbarControlStyles),
    "themeResourceVariables:",
    "  - ''",
    "clickThroughTaskbar: 0",
    "xamlDiagnosticsHandling: ''",
    "",
  ].join('\n');

  const startMenuBackup = [
    "theme: ''",
    "disableNewStartMenuLayout: ''",
    "styleConstants:",
    "  - ''",
    "controlStyles:",
    formatStylesYaml(startMenuControlStyles),
    "themeResourceVariables:",
    ...themeVarsCommon.map((v) => `  - ${v}`),
    "webContentStyles:",
    "  - target: ''",
    "    styles:",
    "      - ''",
    "webContentCustomJs: ''",
    "",
  ].join('\n');

  const notificationCenterBackup = [
    "theme: ''",
    "styleConstants:",
    "  - ''",
    "controlStyles:",
    formatStylesYaml(ncControlStyles),
    "themeResourceVariables:",
    ...ncThemeVars.map((v) => `  - ${v}`),
    "",
  ].join('\n');

  return {
    taskbarBackup,
    startMenuBackup,
    notificationCenterBackup,
  };
}

export interface WindhawkThemePackage {
  taskbarStyles: string;
  startMenuStyles: string;
  notificationCenterStyles: string;
  themeVariables: string[];
}

export function generateWindhawkStylerMod(
  state: ThemeConfigSnapshot | ThemeState
): WindhawkThemePackage {
  const fullState = {
    ...DEFAULT_THEME_STATE,
    ...state,
  } as ThemeState;

  const { themeVarsCommon, ncThemeVars } = getModRawStyles(fullState);
  const backups = buildWindhawkJsonBackups(fullState);

  return {
    taskbarStyles: backups.taskbarBackup,
    startMenuStyles: backups.startMenuBackup,
    notificationCenterStyles: backups.notificationCenterBackup,
    themeVariables: Array.from(new Set([...themeVarsCommon, ...ncThemeVars])),
  };
}

export function generateRestoreBatString(): string {
  return `@echo off\r\npowershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Restore_Defaults.ps1"\r\npause\r\n`;
}

export function generateRestorePs1Script(): string {
  return `# Restore_Defaults.ps1 - Windows 11 & Windhawk Defaults Restoration
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host " Restoring Windows 11 & Windhawk Defaults" -ForegroundColor Yellow
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Reset Windows 11 Default Accent Color & Light/Dark Mode
Write-Host "[1/3] Restoring Default Windows Accent Palette & Colors..." -ForegroundColor Yellow
$defaultAccentDword = [int]0xffd77800 # Standard Windows Blue
$defaultColorization = [int]0xc40078d4

Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\DWM" -Name "AccentColor" -Value $defaultAccentDword -Type DWord -ErrorAction SilentlyContinue
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\DWM" -Name "ColorizationColor" -Value $defaultColorization -Type DWord -ErrorAction SilentlyContinue
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\DWM" -Name "ColorPrevalence" -Value 0 -Type DWord -ErrorAction SilentlyContinue

Remove-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Accent" -Name "AccentColorMenu" -ErrorAction SilentlyContinue
Remove-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Accent" -Name "StartColorMenu" -ErrorAction SilentlyContinue
Remove-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Accent" -Name "AccentPalette" -ErrorAction SilentlyContinue

# Broadcast color change to shell
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Win32MsgHelper {
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern IntPtr SendMessageTimeout(
        IntPtr hWnd, uint Msg, UIntPtr wParam, string lParam,
        uint fuFlags, uint uTimeout, out UIntPtr lpdwResult);
}
"@ -ErrorAction SilentlyContinue

$msgResult = [UIntPtr]::Zero
[Win32MsgHelper]::SendMessageTimeout([IntPtr]0xffff, 0x001A, [UIntPtr]::Zero, "ImmersiveColorSet", 2, 1000, [ref]$msgResult) | Out-Null
[Win32MsgHelper]::SendMessageTimeout([IntPtr]0xffff, 0x001A, [UIntPtr]::Zero, "WindowsThemeElement", 2, 1000, [ref]$msgResult) | Out-Null
Write-Host "Windows default colors restored." -ForegroundColor Green
Write-Host ""

# 2. Reset Windhawk Styler Mod Settings (Single Elevated UAC Prompt)
Write-Host "[2/3] Resetting Windhawk Styler Mods to Defaults (Elevated)..." -ForegroundColor Yellow
$t = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$elevatedReset = "reg delete 'HKLM\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-taskbar-styler\\Settings' /f; reg delete 'HKLM\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-start-menu-styler\\Settings' /f; reg delete 'HKLM\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-notification-center-styler\\Settings' /f; Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Windhawk\\Engine\\Mods\\*' -Name SettingsChangeTime -Value $t -ErrorAction SilentlyContinue"
Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command $elevatedReset" -Verb RunAs -Wait
Write-Host "Windhawk styler settings cleared." -ForegroundColor Green
Write-Host ""

# 3. Restart Windows Explorer
Write-Host "[3/3] Restarting Windows Explorer..." -ForegroundColor Yellow
Stop-Process -Name explorer -Force
Start-Process explorer
Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host " Windows 11 defaults restored successfully!" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Cyan
`;
}

export function generatePs1Script(state: ThemeState): string {
  const palette = computeAccentPalette(state.accentColor, state.secondaryAccent);
  const paletteBytesStr = palette.bytes.map((b) => `0x${b.toString(16).padStart(2, '0')}`).join(', ');
  const darkVal = state.isLightMode ? 1 : 0;
  const accentRgb = hexToRgb(state.accentColor);
  const rgbStr = `${accentRgb[0]} ${accentRgb[1]} ${accentRgb[2]}`;

  return `# Apply_Theme.ps1 - ${state.themeName}
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host " Applying ${state.themeName} Theme" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Desktop Wallpaper
Write-Host "[1/4] Setting Desktop Wallpaper..." -ForegroundColor Yellow
$wpFile = "$PSScriptRoot\\wallpaper.jpg"
if (Test-Path $wpFile) {
    $wallpaperPath = (Resolve-Path $wpFile).Path
    Add-Type @"
using System;
using System.Runtime.InteropServices;
public class WallHelper {
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
"@ -ErrorAction SilentlyContinue

    $setRes = [WallHelper]::SystemParametersInfo(20, 0, $wallpaperPath, 3)
    Set-ItemProperty -Path "HKCU:\\Control Panel\\Desktop" -Name "WallPaper" -Value $wallpaperPath
    Write-Host "Wallpaper updated successfully." -ForegroundColor Green
} else {
    Write-Host "Wallpaper file '$wpFile' not found. Skipping wallpaper." -ForegroundColor Yellow
}
Write-Host ""

# 2. Windows 11 Personalization Accent Color & Dark Mode
Write-Host "[2/4] Applying Windows 11 Accent Color & Personalization..." -ForegroundColor Yellow
$accentDword = [int]0x${palette.accentDwordHex}
$colorizationDword = [int]${palette.colorizationInt}
$palette = [byte[]]@(${paletteBytesStr})

# DWM
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\DWM" -Name "AccentColor" -Value $accentDword -Type DWord
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\DWM" -Name "ColorizationColor" -Value $colorizationDword -Type DWord
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\DWM" -Name "ColorizationAfterglow" -Value $colorizationDword -Type DWord
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\DWM" -Name "AccentColorInactive" -Value 0xff22272e -Type DWord
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\DWM" -Name "ColorPrevalence" -Value 1 -Type DWord

# Explorer Accent
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Accent" -Name "AccentColorMenu" -Value $accentDword -Type DWord
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Accent" -Name "StartColorMenu" -Value $accentDword -Type DWord
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Accent" -Name "AccentPalette" -Value $palette -Type Binary

# Themes Personalize
New-Item -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" -Force | Out-Null
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" -Name "AppsUseLightTheme" -Value ${darkVal} -Type DWord
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" -Name "SystemUsesLightTheme" -Value ${darkVal} -Type DWord
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" -Name "EnableTransparency" -Value 1 -Type DWord

# Colors
New-Item -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\History\\Colors" -Force | Out-Null
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\History\\Colors" -Name "ColorHistory0" -Value $accentDword -Type DWord
Set-ItemProperty -Path "HKCU:\\Control Panel\\Desktop" -Name "AutoColorization" -Value 0 -Type DWord
Set-ItemProperty -Path "HKCU:\\Control Panel\\Colors" -Name "Hilight" -Value "${rgbStr}"
Set-ItemProperty -Path "HKCU:\\Control Panel\\Colors" -Name "HotTrackingColor" -Value "${rgbStr}"

# Broadcast color change to shell
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Win32MsgHelper {
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern IntPtr SendMessageTimeout(
        IntPtr hWnd, uint Msg, UIntPtr wParam, string lParam,
        uint fuFlags, uint uTimeout, out UIntPtr lpdwResult);
}
"@ -ErrorAction SilentlyContinue

$msgResult = [UIntPtr]::Zero
[Win32MsgHelper]::SendMessageTimeout([IntPtr]0xffff, 0x001A, [UIntPtr]::Zero, "ImmersiveColorSet", 2, 1000, [ref]$msgResult) | Out-Null
[Win32MsgHelper]::SendMessageTimeout([IntPtr]0xffff, 0x001A, [UIntPtr]::Zero, "WindowsThemeElement", 2, 1000, [ref]$msgResult) | Out-Null
Write-Host "Windows 11 accent color applied." -ForegroundColor Green
Write-Host ""

# Deploy Custom Start Button Icon if present
$iconFile = "$PSScriptRoot\\start_icon.png"
if (Test-Path $iconFile) {
    Write-Host "[*] Deploying Custom Start Button Icon..." -ForegroundColor Yellow
    $publicDir = "$env:PUBLIC\\Pictures"
    if (-not (Test-Path $publicDir)) {
        New-Item -ItemType Directory -Path $publicDir -Force | Out-Null
    }
    Copy-Item -Path $iconFile -Destination "$publicDir\\Windhawk_start_icon.png" -Force
    if (Test-Path "C:\\Users\\Public\\Pictures") {
        Copy-Item -Path $iconFile -Destination "C:\\Users\\Public\\Pictures\\Windhawk_start_icon.png" -Force -ErrorAction SilentlyContinue
    }
    Write-Host "Start button icon deployed to '$publicDir\\Windhawk_start_icon.png'." -ForegroundColor Green
    Write-Host ""
}

# 3. Windhawk Registry & Mod Refresh (Single Elevated UAC Prompt)
Write-Host "[3/4] Importing Windhawk Styler Mod Settings (Elevated)..." -ForegroundColor Yellow
$regPath = (Resolve-Path "$PSScriptRoot\\theme.reg").Path
$t = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$elevatedCmd = "reg import \`"$regPath\`"; Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Windhawk\\Engine\\Mods\\*' -Name SettingsChangeTime -Value $t -ErrorAction SilentlyContinue"
Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command $elevatedCmd" -Verb RunAs -Wait
Write-Host "Windhawk engine styles refreshed." -ForegroundColor Green
Write-Host ""

# 4. Restart Windows Explorer
Write-Host "[4/4] Restarting Windows Explorer..." -ForegroundColor Yellow
Stop-Process -Name explorer -Force
Start-Process explorer
Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host " Done! ${state.themeName} is active!" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Cyan
`;
}

export async function generateZipPayload(state: ThemeState): Promise<Blob> {
  const zip = new JSZip();

  // 1. theme.reg (UTF-16LE with BOM)
  const regContent = generateRegFileString(state);
  const buffer = new ArrayBuffer(regContent.length * 2 + 2);
  const view = new DataView(buffer);
  view.setUint16(0, 0xfeff, true); // BOM
  for (let i = 0; i < regContent.length; i++) {
    view.setUint16(i * 2 + 2, regContent.charCodeAt(i), true);
  }
  zip.file('theme.reg', buffer);

  // 2. Apply_Theme.ps1
  const ps1Content = generatePs1Script(state);
  zip.file('Apply_Theme.ps1', ps1Content);

  // 3. Apply_Theme.bat
  const batContent = `@echo off\r\npowershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Apply_Theme.ps1"\r\npause\r\n`;
  zip.file('Apply_Theme.bat', batContent);

  // 4. Restore Defaults
  zip.file('Restore_Defaults.ps1', generateRestorePs1Script());
  zip.file('Restore_Default_Windows11.bat', generateRestoreBatString());

  // 5. Windhawk JSON Backups
  const backups = buildWindhawkJsonBackups(state);
  zip.file('taskbar_backup.json', backups.taskbarBackup);
  zip.file('start_menu_backup.json', backups.startMenuBackup);
  zip.file('notification_center_backup.json', backups.notificationCenterBackup);

  // 6. Wallpaper (Custom upload, active preset, or default Windows 11 wallpaper)
  if (state.wallpaperData) {
    zip.file('wallpaper.jpg', state.wallpaperData);
  } else {
    try {
      const basePath =
        typeof window !== 'undefined' && window.location.pathname.startsWith('/theme-creator')
          ? '/theme-creator'
          : '/theme-creator';

      let targetUrl = state.wallpaperUrl;
      // Fallback to light/dark default wallpaper if no url or if it's an SVG data URI
      if (!targetUrl || targetUrl.startsWith('data:image/svg+xml')) {
        targetUrl = state.isLightMode
          ? `${basePath}/wallpapers/default-light.jpg`
          : `${basePath}/wallpapers/default-dark.jpg`;
      } else if (!targetUrl.startsWith('data:') && !targetUrl.startsWith('http') && !targetUrl.startsWith(basePath)) {
        targetUrl = `${basePath}${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`;
      }

      if (targetUrl.startsWith('data:')) {
        const parts = targetUrl.split(',');
        if (parts[1]) {
          zip.file('wallpaper.jpg', parts[1], { base64: true });
        }
      } else if (typeof fetch !== 'undefined') {
        const res = await fetch(targetUrl);
        if (res.ok) {
          const buf = await res.arrayBuffer();
          zip.file('wallpaper.jpg', buf);
        } else {
          // Fallback minimal valid JPEG buffer so wallpaper.jpg is always present
          zip.file('wallpaper.jpg', new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]));
        }
      } else {
        zip.file('wallpaper.jpg', new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]));
      }
    } catch {
      zip.file('wallpaper.jpg', new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]));
    }
  }

  // 7. Custom Start Icon if present
  if (state.customStartIconData) {
    zip.file('start_icon.png', state.customStartIconData);
  } else if (state.customStartIconUrl && state.customStartIconUrl.startsWith('data:')) {
    const parts = state.customStartIconUrl.split(',');
    if (parts[1]) {
      zip.file('start_icon.png', parts[1], { base64: true });
    }
  }

  return await zip.generateAsync({ type: 'blob' });
}
