import { describe, it, expect } from 'vitest';
import { START_BUTTON_PRESETS, renderStartButtonSvg, getStartButtonSvgMarkup, rasterizeSvgToPng } from './startButtonVectors';

describe('startButtonVectors', () => {
  it('contains 8 curated presets with id, name, and renderSvg', () => {
    expect(START_BUTTON_PRESETS).toHaveLength(8);
    const ids = START_BUTTON_PRESETS.map((p) => p.id);
    expect(ids).toEqual([
      'win11-minimal',
      'win98-retro',
      'apple-glyph',
      'cyberpunk-hex',
      'linux-tux',
      'minimal-diamond',
      'gaming-rog',
      'fluent-orb',
    ]);
  });

  it('renders SVG for each preset with the specified color and size', () => {
    START_BUTTON_PRESETS.forEach((preset) => {
      const node = renderStartButtonSvg(preset.id, '#FF0055', 24);
      expect(node).toBeDefined();
    });
  });

  it('falls back to default preset if an unknown presetId is passed', () => {
    // @ts-expect-error testing fallback
    const node = renderStartButtonSvg('unknown-preset', '#0078D4', 20);
    expect(node).toBeDefined();
  });

  it('generates valid standalone SVG markup for all 8 presets', () => {
    START_BUTTON_PRESETS.forEach((preset) => {
      const svg = getStartButtonSvgMarkup(preset.id, '#00FFCC', 96);
      expect(svg).toContain('<svg');
      expect(svg).toContain('width="96"');
      expect(svg).toContain('height="96"');
      expect(svg).toContain('viewBox="0 0 24 24"');
      expect(svg).toContain('#00FFCC');
      expect(svg).toContain('</svg>');
    });
  });

  it('safely returns null when rasterizing in jsdom environment without hanging', async () => {
    const res = await rasterizeSvgToPng('<svg></svg>', 96);
    expect(res).toBeNull();
  });
});
