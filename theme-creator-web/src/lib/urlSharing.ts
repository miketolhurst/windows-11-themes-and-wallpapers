import { ThemeState, MaterialStyle, RunningIndicatorStyle } from '../store/useThemeStore';
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

export function encodeThemeToUrl(state: Partial<ThemeState> & { accentColor: string }): string {
  const payload: SharedThemePayload = {
    name: state.themeName || 'Custom Theme',
    accent: state.accentColor,
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
  return `?theme=${encodeURIComponent(base64)}`;
}

export function decodeThemeFromUrl(searchStringOrUrl: string): Partial<ThemeState> | null {
  try {
    if (!searchStringOrUrl) return null;
    let queryString = searchStringOrUrl;
    if (searchStringOrUrl.includes('?')) {
      queryString = searchStringOrUrl.slice(searchStringOrUrl.indexOf('?'));
    }
    const params = new URLSearchParams(queryString);
    const themeParam = params.get('theme');
    if (!themeParam) return null;

    let jsonStr: string;
    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      jsonStr = decodeURIComponent(window.atob(themeParam));
    } else {
      jsonStr = decodeURIComponent(Buffer.from(themeParam, 'base64').toString('utf8'));
    }

    const payload = JSON.parse(jsonStr) as Partial<SharedThemePayload>;
    if (!payload.accent) return null;

    const materialStyle: MaterialStyle = payload.mat || (payload.mode === 'gradient' ? 'linear-gradient' : 'fluent-acrylic');

    return {
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
  } catch {
    return null;
  }
}

export async function copyShareLink(state: ThemeState): Promise<boolean> {
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
