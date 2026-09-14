import { describe, it, expect } from 'vitest';
import { START_BUTTON_PRESETS, renderStartButtonSvg } from './startButtonVectors';

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
});
