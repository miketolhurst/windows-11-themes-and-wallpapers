import { describe, it, expect } from 'vitest';
import { encodeThemeToUrl, decodeThemeFromUrl } from './urlSharing';
import { ThemeState } from '../store/useThemeStore';

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
});
