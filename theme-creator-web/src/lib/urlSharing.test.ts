import { describe, it, expect } from 'vitest';
import { encodeThemeToUrl, decodeThemeFromUrl } from './urlSharing';
import { ThemeState, ThemeConfigSnapshot, DEFAULT_THEME_STATE } from '../store/useThemeStore';

describe('urlSharing', () => {
  const mockState = {
    themeName: 'Cyber Test',
    accentColor: '#FF007F',
    secondaryAccent: '#00F3FF',
    isLightMode: false,
    taskbarMode: 'gradient',
    cornerRadius: 12,
    borderThickness: 3,
    hideRecommended: true,
    compactSearch: true,
    dynamicNotificationHeight: true,
    removeDropShadows: false,
    taskbarBlur: 20,
    startMenuBlur: 25,
    notificationBlur: 25,
    taskbarOpacity: 85,
    startMenuOpacity: 90,
    notificationOpacity: 90,
  } as ThemeState;

  it('encodes theme state to query string and decodes it back identically', () => {
    const encodedQuery = encodeThemeToUrl(mockState);
    expect(encodedQuery).toContain('theme=');

    const decoded = decodeThemeFromUrl(encodedQuery);
    expect(decoded).toBeTruthy();
    expect(decoded?.themeName).toBe('Cyber Test');
    expect(decoded?.accentColor).toBe('#FF007F');
    expect(decoded?.secondaryAccent).toBe('#00F3FF');
    expect(decoded?.taskbarMode).toBe('gradient');
    expect(decoded?.cornerRadius).toBe(12);
    expect(decoded?.borderThickness).toBe(3);
    expect(decoded?.hideRecommended).toBe(true);
    expect(decoded?.taskbarOpacity).toBe(85);
  });

  it('returns null for invalid or corrupted theme query', () => {
    expect(decodeThemeFromUrl('')).toBeNull();
    expect(decodeThemeFromUrl('?other=123')).toBeNull();
    expect(decodeThemeFromUrl('?theme=invalid-base-64!!')).toBeNull();
  });

  it('round-trips gradient, typography, animations, and component overrides', () => {
    const base: ThemeConfigSnapshot = {
      ...DEFAULT_THEME_STATE,
      globalGradient: {
        type: 'linear',
        angle: 135,
        stops: [
          { id: '1', color: '#FF0055', offset: 0 },
          { id: '2', color: '#00FFCC', offset: 100 },
        ],
      },
      typography: {
        fontFamily: 'JetBrains Mono',
        fontWeight: '700',
        characterSpacing: 30,
      },
      animations: {
        speed: 'snappy',
        durationMs: 150,
        easing: 'decelerate',
      },
      taskbarOverride: {
        enabled: true,
        materialStyle: 'mica',
        opacity: 85,
      },
    };
    const qs = encodeThemeToUrl(base);
    const decoded = decodeThemeFromUrl(new URLSearchParams(qs));
    expect(decoded?.typography?.fontFamily).toBe('JetBrains Mono');
    expect(decoded?.typography?.fontWeight).toBe('700');
    expect(decoded?.typography?.characterSpacing).toBe(30);
    expect(decoded?.animations?.speed).toBe('snappy');
    expect(decoded?.animations?.easing).toBe('decelerate');
    expect(decoded?.taskbarOverride?.enabled).toBe(true);
    expect(decoded?.taskbarOverride?.materialStyle).toBe('mica');
    expect(decoded?.globalGradient?.angle).toBe(135);
    expect(decoded?.globalGradient?.stops[0].color).toBe('#FF0055');
  });

  it('decodes legacy URLs without Phase 1 params safely', () => {
    const legacyParams = new URLSearchParams('name=Retro&accent=%23FF8800&radius=12');
    const decoded = decodeThemeFromUrl(legacyParams);
    expect(decoded?.themeName).toBe('Retro');
    expect(decoded?.accentColor).toBe('#FF8800');
    expect(decoded?.cornerRadius).toBe(12);
    expect(decoded?.typography).toBeDefined();
    expect(decoded?.animations).toBeDefined();
  });

  it('round-trips radial gradient and all component overrides from string URL', () => {
    const base: ThemeConfigSnapshot = {
      ...DEFAULT_THEME_STATE,
      globalGradient: {
        type: 'radial',
        angle: 0,
        stops: [
          { id: '1', color: '#112233', offset: 10 },
          { id: '2', color: '#445566', offset: 90 },
        ],
      },
      startMenuOverride: {
        enabled: true,
        materialStyle: 'pure-black-neon',
        blur: 30,
      },
      flyoutOverride: {
        enabled: true,
        materialStyle: 'matte-slate',
        opacity: 50,
      },
    };
    const qs = encodeThemeToUrl(base);
    const decoded = decodeThemeFromUrl(`https://theme-creator.local/studio${qs}`);
    expect(decoded?.globalGradient?.type).toBe('radial');
    expect(decoded?.globalGradient?.angle).toBe(0);
    expect(decoded?.globalGradient?.stops[0].color).toBe('#112233');
    expect(decoded?.startMenuOverride?.enabled).toBe(true);
    expect(decoded?.startMenuOverride?.materialStyle).toBe('pure-black-neon');
    expect(decoded?.flyoutOverride?.enabled).toBe(true);
    expect(decoded?.flyoutOverride?.opacity).toBe(50);
  });

  it('preserves 0 degree gradient angles for linear gradients', () => {
    const base: ThemeConfigSnapshot = {
      ...DEFAULT_THEME_STATE,
      globalGradient: {
        type: 'linear',
        angle: 0,
        stops: [
          { id: '1', color: '#111111', offset: 0 },
          { id: '2', color: '#222222', offset: 100 },
        ],
      },
    };
    const qs = encodeThemeToUrl(base);
    const decoded = decodeThemeFromUrl(new URLSearchParams(qs));
    expect(decoded?.globalGradient?.angle).toBe(0);
  });
});



