import { ThemeState } from '../store/useThemeStore';

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
}

export function encodeThemeToUrl(state: ThemeState): string {
  const payload: SharedThemePayload = {
    name: state.themeName,
    accent: state.accentColor,
    sec: state.secondaryAccent,
    light: state.isLightMode,
    mode: state.taskbarMode,
    rad: state.cornerRadius,
    bord: state.borderThickness,
    hideRec: state.hideRecommended,
    comp: state.compactSearch,
    dynNotif: state.dynamicNotificationHeight,
    noShad: state.removeDropShadows,
    tbBlur: state.taskbarBlur,
    smBlur: state.startMenuBlur,
    ncBlur: state.notificationBlur,
    tbOp: state.taskbarOpacity,
    smOp: state.startMenuOpacity,
    ncOp: state.notificationOpacity,
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

    return {
      themeName: payload.name || 'Shared Theme',
      accentColor: payload.accent,
      secondaryAccent: payload.sec || '#005A9E',
      isLightMode: Boolean(payload.light),
      taskbarMode: payload.mode === 'gradient' ? 'gradient' : 'blur',
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
