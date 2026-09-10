import { describe, it, expect } from 'vitest';
import {
  hexToRgb,
  rgbToHex,
  blend,
  computeAccentPalette,
  buildLinearGradientBrush,
  extractPaletteFromPixels,
} from './paletteEngine';

describe('paletteEngine', () => {
  it('converts hex to rgb and back correctly', () => {
    const rgb = hexToRgb('#0078d4');
    expect(rgb).toEqual([0, 120, 212]);
    expect(rgbToHex(rgb).toLowerCase()).toBe('#0078d4');
  });

  it('blends colors with a factor', () => {
    const white: [number, number, number] = [255, 255, 255];
    const black: [number, number, number] = [0, 0, 0];
    expect(blend(white, black, 0.5)).toEqual([128, 128, 128]);
  });

  it('computes 32-byte AccentPalette matching Windows 11 specs', () => {
    const result = computeAccentPalette('#0078D4', '#2AA198');
    expect(result.colors.length).toBe(8);
    expect(result.bytes.length).toBe(32);
    expect(result.colors[3]).toEqual([0, 120, 212]); // Accent color
    expect(result.colors[7]).toEqual([42, 161, 152]); // Secondary color (#2AA198)

    // DWM DWORD format: 0xAABBGGRR -> 0xffd47800
    expect(result.accentDwordHex).toBe('ffd47800');
    // Colorization format: 0xAARRGGBB -> 0xc40078d4
    expect(result.colorizationHex).toBe('c40078d4');
  });

  it('computes fallback secondary color if none provided', () => {
    const result = computeAccentPalette('#FF0000');
    expect(result.colors.length).toBe(8);
    expect(result.bytes.length).toBe(32);
    expect(result.colors[7]).toBeDefined();
  });

  it('builds valid linear gradient brush XAML with custom opacity', () => {
    const brushDefault = buildLinearGradientBrush(
      '0,0',
      '1,1',
      [16, 18, 22],
      [0, 120, 212],
      [42, 161, 152]
    );
    expect(brushDefault).toContain('<LinearGradientBrush');
    expect(brushDefault).toContain('GradientStop');

    // Test 100% opacity -> ff
    const brush100 = buildLinearGradientBrush(
      '0,0',
      '1,1',
      [16, 18, 22],
      [0, 120, 212],
      [42, 161, 152],
      100
    );
    expect(brush100).toContain('Color="#ff0078d4"');

    // Test 50% opacity -> 80
    const brush50 = buildLinearGradientBrush(
      '0,0',
      '1,1',
      [16, 18, 22],
      [0, 120, 212],
      [42, 161, 152],
      50
    );
    expect(brush50).toContain('Color="#800078d4"');
  });

  it('extracts dominant primary and secondary colors from pixel data', () => {
    // Generate mock pixel data: 100 pixels of cyan [0, 240, 255] and 40 pixels of magenta [255, 0, 128]
    const pixels: number[] = [];
    for (let i = 0; i < 100; i++) {
      pixels.push(0, 240, 255, 255);
    }
    for (let i = 0; i < 40; i++) {
      pixels.push(255, 0, 128, 255);
    }

    const { primary, secondary } = extractPaletteFromPixels(pixels);
    expect(primary.toLowerCase()).toBe('#00f0ff');
    expect(secondary.toLowerCase()).toBe('#ff0080');
  });

  it('returns valid fallback colors for monochrome image data', () => {
    const pixels = [0, 0, 0, 255, 255, 255, 255, 255, 50, 50, 50, 255];
    const { primary, secondary } = extractPaletteFromPixels(pixels);
    expect(primary).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(secondary).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});

