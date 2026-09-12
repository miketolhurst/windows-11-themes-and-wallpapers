import {
  ThemeState,
  ThemeConfigSnapshot,
  DEFAULT_THEME_STATE,
  MaterialStyle,
  RunningIndicatorStyle,
  GradientConfig,
  ComponentOverride,
  TypographyConfig,
  AnimationConfig,
} from '../store/useThemeStore';
import { ColorHarmonyType } from './paletteEngine';

export interface SharedThemePayload {
  name: string;
  accent: string;
  sec: string;
  light: boolean;
  mode: 'blur' | 'gradient';
  rad: number;
  bord: number;
  hideRec: boolean;
  comp: boolean;
  dynNotif: boolean;
  noShad: boolean;
  tbBlur: number;
  smBlur: number;
  ncBlur: number;
  tbOp: number;
  smOp: number;
  ncOp: number;
  mat?: MaterialStyle;
  noise?: number;
  sat?: number;
  dock?: boolean;
  dockM?: number;
  ind?: RunningIndicatorStyle;
  harm?: ColorHarmonyType;
}

function serializeGradient(grad?: GradientConfig): string | null {
  if (!grad) return null;
  const isDefault =
    grad.type === DEFAULT_THEME_STATE.globalGradient.type &&
    grad.angle === DEFAULT_THEME_STATE.globalGradient.angle &&
    grad.stops?.length === DEFAULT_THEME_STATE.globalGradient.stops.length &&
    grad.stops.every(
      (s, i) =>
        s.color.toLowerCase() === DEFAULT_THEME_STATE.globalGradient.stops[i].color.toLowerCase() &&
        s.offset === DEFAULT_THEME_STATE.globalGradient.stops[i].offset
    );
  if (isDefault) return null;
  const stopsStr = (grad.stops || []).map((s) => `${s.offset}-${s.color}`).join(',');
  return `${grad.type}:${grad.angle}:${stopsStr}`;
}

function deserializeGradient(val: string | null): GradientConfig | undefined {
  if (!val) return undefined;
  try {
    if (val.startsWith('{')) {
      return JSON.parse(val);
    }
    const parts = val.split(':');
    if (parts.length >= 3) {
      const type = parts[0] === 'radial' ? 'radial' : 'linear';
      const parsedAngle = parseInt(parts[1], 10);
      const angle = Number.isNaN(parsedAngle) ? 90 : parsedAngle;
      const stopsStr = parts.slice(2).join(':');
      const stops = stopsStr
        .split(',')
        .filter(Boolean)
        .map((s, idx) => {
          const dashIdx = s.indexOf('-');
          if (dashIdx === -1) return { id: String(idx + 1), offset: 0, color: s };
          const offset = parseFloat(s.slice(0, dashIdx));
          const color = s.slice(dashIdx + 1);
          return { id: String(idx + 1), offset, color };
        });
      return { type, angle, stops };
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function serializeOverride(ovr?: ComponentOverride): string | null {
  if (!ovr || !ovr.enabled) return null;
  return JSON.stringify(ovr);
}

function deserializeOverride(val: string | null): ComponentOverride | undefined {
  if (!val) return undefined;
  try {
    const parsed = JSON.parse(val);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as ComponentOverride;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function serializeTypography(typo?: TypographyConfig): string | null {
  if (!typo) return null;
  const isDefault =
    typo.fontFamily === DEFAULT_THEME_STATE.typography.fontFamily &&
    typo.fontWeight === DEFAULT_THEME_STATE.typography.fontWeight &&
    typo.characterSpacing === DEFAULT_THEME_STATE.typography.characterSpacing;
  if (isDefault) return null;
  return `${typo.fontFamily}:${typo.fontWeight}:${typo.characterSpacing}`;
}

function deserializeTypography(val: string | null): TypographyConfig | undefined {
  if (!val) return undefined;
  try {
    const parts = val.split(':');
    if (parts.length >= 3) {
      const spacing = parseInt(parts[parts.length - 1], 10);
      const weight = parts[parts.length - 2] as TypographyConfig['fontWeight'];
      const family = parts.slice(0, parts.length - 2).join(':');
      return {
        fontFamily: family,
        fontWeight: weight,
        characterSpacing: isNaN(spacing) ? 0 : spacing,
      };
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function serializeAnimation(anim?: AnimationConfig): string | null {
  if (!anim) return null;
  const isDefault =
    anim.speed === DEFAULT_THEME_STATE.animations.speed &&
    anim.durationMs === DEFAULT_THEME_STATE.animations.durationMs &&
    anim.easing === DEFAULT_THEME_STATE.animations.easing;
  if (isDefault) return null;
  return `${anim.speed}:${anim.easing}:${anim.durationMs}`;
}

function deserializeAnimation(val: string | null): AnimationConfig | undefined {
  if (!val) return undefined;
  try {
    const parts = val.split(':');
    if (parts.length >= 2) {
      const speed = parts[0] as AnimationConfig['speed'];
      const easing = parts[1] as AnimationConfig['easing'];
      const durationMs = parts[2]
        ? parseInt(parts[2], 10)
        : speed === 'instant'
        ? 0
        : speed === 'snappy'
        ? 150
        : speed === 'smooth'
        ? 400
        : 250;
      return {
        speed,
        durationMs: isNaN(durationMs) ? 250 : durationMs,
        easing,
      };
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export function encodeThemeToUrl(state: Partial<ThemeConfigSnapshot> & { accentColor?: string }): string {
  const accent = state.accentColor || '#0078D4';
  const payload: SharedThemePayload = {
    name: state.themeName || 'Custom Theme',
    accent,
    sec: state.secondaryAccent || '#005A9E',
    light: Boolean(state.isLightMode),
    mode: state.taskbarMode || 'blur',
    rad: typeof state.cornerRadius === 'number' ? state.cornerRadius : 8,
    bord: typeof state.borderThickness === 'number' ? state.borderThickness : 2,
    hideRec: Boolean(state.hideRecommended),
    comp: Boolean(state.compactSearch),
    dynNotif: Boolean(state.dynamicNotificationHeight),
    noShad: Boolean(state.removeDropShadows),
    tbBlur: typeof state.taskbarBlur === 'number' ? state.taskbarBlur : 10,
    smBlur: typeof state.startMenuBlur === 'number' ? state.startMenuBlur : 15,
    ncBlur: typeof state.notificationBlur === 'number' ? state.notificationBlur : 15,
    tbOp: typeof state.taskbarOpacity === 'number' ? state.taskbarOpacity : 97,
    smOp: typeof state.startMenuOpacity === 'number' ? state.startMenuOpacity : 97,
    ncOp: typeof state.notificationOpacity === 'number' ? state.notificationOpacity : 97,
    mat: state.materialStyle || (state.taskbarMode === 'gradient' ? 'linear-gradient' : 'fluent-acrylic'),
    noise: typeof state.noiseOpacity === 'number' ? state.noiseOpacity : 0.04,
    sat: typeof state.tintSaturation === 'number' ? state.tintSaturation : 0.85,
    dock: Boolean(state.dockMode),
    dockM: typeof state.dockMargin === 'number' ? state.dockMargin : 12,
    ind: state.runningIndicatorStyle || 'bar',
    harm: state.colorHarmony || 'custom',
  };

  const jsonStr = JSON.stringify(payload);
  let base64: string;
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    base64 = window.btoa(encodeURIComponent(jsonStr));
  } else {
    base64 = Buffer.from(encodeURIComponent(jsonStr)).toString('base64');
  }

  const params = new URLSearchParams();
  params.set('theme', base64);

  const grad = serializeGradient(state.globalGradient);
  if (grad) params.set('grad', grad);

  const tbOvr = serializeOverride(state.taskbarOverride);
  if (tbOvr) params.set('tbOvr', tbOvr);

  const smOvr = serializeOverride(state.startMenuOverride);
  if (smOvr) params.set('smOvr', smOvr);

  const flyOvr = serializeOverride(state.flyoutOverride);
  if (flyOvr) params.set('flyOvr', flyOvr);

  const typo = serializeTypography(state.typography);
  if (typo) params.set('typo', typo);

  const anim = serializeAnimation(state.animations);
  if (anim) params.set('anim', anim);

  return `?${params.toString()}`;
}

export function decodeThemeFromUrl(searchStringOrUrl: string | URLSearchParams): Partial<ThemeConfigSnapshot> | null {
  try {
    if (!searchStringOrUrl) return null;
    let params: URLSearchParams;
    if (typeof searchStringOrUrl === 'string') {
      if (!searchStringOrUrl.trim()) return null;
      let queryString = searchStringOrUrl;
      if (searchStringOrUrl.includes('?')) {
        queryString = searchStringOrUrl.slice(searchStringOrUrl.indexOf('?') + 1);
      }
      params = new URLSearchParams(queryString);
    } else {
      params = searchStringOrUrl;
    }

    let result: Partial<ThemeConfigSnapshot> = {};

    const themeParam = params.get('theme');
    if (themeParam) {
      let jsonStr: string;
      if (typeof window !== 'undefined' && typeof window.atob === 'function') {
        jsonStr = decodeURIComponent(window.atob(themeParam));
      } else {
        jsonStr = decodeURIComponent(Buffer.from(themeParam, 'base64').toString('utf8'));
      }

      const payload = JSON.parse(jsonStr) as Partial<SharedThemePayload>;
      if (!payload.accent) return null;

      const materialStyle: MaterialStyle =
        payload.mat || (payload.mode === 'gradient' ? 'linear-gradient' : 'fluent-acrylic');

      result = {
        themeName: payload.name || 'Shared Theme',
        accentColor: payload.accent,
        secondaryAccent: payload.sec || '#005A9E',
        isLightMode: Boolean(payload.light),
        taskbarMode: materialStyle === 'linear-gradient' ? 'gradient' : 'blur',
        materialStyle,
        cornerRadius: typeof payload.rad === 'number' ? payload.rad : 8,
        borderThickness: typeof payload.bord === 'number' ? payload.bord : 2,
        hideRecommended: Boolean(payload.hideRec),
        compactSearch: Boolean(payload.comp),
        dynamicNotificationHeight: Boolean(payload.dynNotif),
        removeDropShadows: Boolean(payload.noShad),
        taskbarBlur: typeof payload.tbBlur === 'number' ? payload.tbBlur : 10,
        startMenuBlur: typeof payload.smBlur === 'number' ? payload.smBlur : 15,
        notificationBlur: typeof payload.ncBlur === 'number' ? payload.ncBlur : 15,
        taskbarOpacity: typeof payload.tbOp === 'number' ? payload.tbOp : 97,
        startMenuOpacity: typeof payload.smOp === 'number' ? payload.smOp : 97,
        notificationOpacity: typeof payload.ncOp === 'number' ? payload.ncOp : 97,
        noiseOpacity: typeof payload.noise === 'number' ? payload.noise : 0.04,
        tintSaturation: typeof payload.sat === 'number' ? payload.sat : 0.85,
        dockMode: Boolean(payload.dock),
        dockMargin: typeof payload.dockM === 'number' ? payload.dockM : 12,
        runningIndicatorStyle: payload.ind || 'bar',
        colorHarmony: payload.harm || 'custom',
      };
    } else {
      // Legacy URL without ?theme parameter (e.g. ?name=Retro&accent=%23FF8800&radius=12)
      const accent = params.get('accent') || params.get('accentColor');
      const name = params.get('name') || params.get('themeName');
      if (!accent && !name && !params.get('radius') && !params.get('rad')) {
        return null;
      }
      const rawRadius = params.get('radius') || params.get('rad');
      const rawBorder = params.get('bord') || params.get('border');
      const mat = (params.get('mat') || params.get('materialStyle')) as MaterialStyle | null;
      const isLight = params.get('light') === 'true' || params.get('light') === '1';

      result = {
        themeName: name || 'Shared Theme',
        accentColor: accent || '#0078D4',
        secondaryAccent: params.get('sec') || '#005A9E',
        isLightMode: isLight,
        taskbarMode: mat === 'linear-gradient' ? 'gradient' : 'blur',
        materialStyle: mat || 'fluent-acrylic',
        cornerRadius: rawRadius ? parseInt(rawRadius, 10) : 8,
        borderThickness: rawBorder ? parseInt(rawBorder, 10) : 2,
        hideRecommended: params.get('hideRec') === 'true',
        compactSearch: params.get('comp') === 'true',
        dynamicNotificationHeight: params.get('dynNotif') === 'true',
        removeDropShadows: params.get('noShad') === 'true',
        taskbarBlur: params.get('tbBlur') ? parseInt(params.get('tbBlur')!, 10) : 10,
        startMenuBlur: params.get('smBlur') ? parseInt(params.get('smBlur')!, 10) : 15,
        notificationBlur: params.get('ncBlur') ? parseInt(params.get('ncBlur')!, 10) : 15,
        taskbarOpacity: params.get('tbOp') ? parseInt(params.get('tbOp')!, 10) : 97,
        startMenuOpacity: params.get('smOp') ? parseInt(params.get('smOp')!, 10) : 97,
        notificationOpacity: params.get('ncOp') ? parseInt(params.get('ncOp')!, 10) : 97,
        noiseOpacity: params.get('noise') ? parseFloat(params.get('noise')!) : 0.04,
        tintSaturation: params.get('sat') ? parseFloat(params.get('sat')!) : 0.85,
        dockMode: params.get('dock') === 'true',
        dockMargin: params.get('dockM') ? parseInt(params.get('dockM')!, 10) : 12,
        runningIndicatorStyle: (params.get('ind') as RunningIndicatorStyle) || 'bar',
        colorHarmony: (params.get('harm') as any) || 'custom',
      };
    }

    // Parse Phase 1 properties if present, or assign safe fallbacks
    const gradParsed = deserializeGradient(params.get('grad'));
    result.globalGradient = gradParsed || {
      ...DEFAULT_THEME_STATE.globalGradient,
      stops: DEFAULT_THEME_STATE.globalGradient.stops.map((s) => ({ ...s })),
    };

    const tbOvrParsed = deserializeOverride(params.get('tbOvr'));
    result.taskbarOverride = tbOvrParsed || { ...DEFAULT_THEME_STATE.taskbarOverride };

    const smOvrParsed = deserializeOverride(params.get('smOvr'));
    result.startMenuOverride = smOvrParsed || { ...DEFAULT_THEME_STATE.startMenuOverride };

    const flyOvrParsed = deserializeOverride(params.get('flyOvr'));
    result.flyoutOverride = flyOvrParsed || { ...DEFAULT_THEME_STATE.flyoutOverride };

    const typoParsed = deserializeTypography(params.get('typo'));
    result.typography = typoParsed || { ...DEFAULT_THEME_STATE.typography };

    const animParsed = deserializeAnimation(params.get('anim'));
    result.animations = animParsed || { ...DEFAULT_THEME_STATE.animations };

    return result;
  } catch {
    return null;
  }
}

export async function copyShareLink(state: ThemeConfigSnapshot | ThemeState): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const query = encodeThemeToUrl(state);
    const fullUrl = `${window.location.origin}${window.location.pathname}${query}`;
    await navigator.clipboard.writeText(fullUrl);
    return true;
  } catch {
    return false;
  }
}

