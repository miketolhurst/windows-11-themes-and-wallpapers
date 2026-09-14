import React, { useRef, useState, useMemo } from 'react';
import { useThemeStore, ColorHarmonyType } from '../../store/useThemeStore';
import ColorPickerPopover from '../ColorPickerPopover';
import {
  extractPaletteFromImageUrl,
  computeColorHarmonies,
  computeHarmonicSwatches,
} from '../../lib/paletteEngine';

export interface PaletteSectionProps {
  extractedSwatches: string[];
  setExtractedSwatches: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function PaletteSection({
  extractedSwatches,
  setExtractedSwatches,
}: PaletteSectionProps) {
  const accentColor = useThemeStore((s) => s.accentColor);
  const setAccentColor = useThemeStore((s) => s.setAccentColor);
  const secondaryAccent = useThemeStore((s) => s.secondaryAccent);
  const setSecondaryAccent = useThemeStore((s) => s.setSecondaryAccent);
  const isLightMode = useThemeStore((s) => s.isLightMode);
  const setIsLightMode = useThemeStore((s) => s.setIsLightMode);
  const colorHarmony = useThemeStore((s) => s.colorHarmony);
  const setColorHarmony = useThemeStore((s) => s.setColorHarmony);
  const wallpaperUrl = useThemeStore((s) => s.wallpaperUrl);
  const setWallpaper = useThemeStore((s) => s.setWallpaper);
  const applyThemeConfig = useThemeStore((s) => s.applyThemeConfig);

  const wallpaperInputRef = useRef<HTMLInputElement>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedSuccess, setExtractedSuccess] = useState(false);

  // Derived 5-swatch palette display
  const displayedSwatches = useMemo(() => {
    if (colorHarmony && colorHarmony !== 'custom') {
      return computeHarmonicSwatches(accentColor, secondaryAccent, colorHarmony);
    }
    if (extractedSwatches.length >= 5) {
      return extractedSwatches.slice(0, 5);
    }
    return computeHarmonicSwatches(accentColor, secondaryAccent, 'custom');
  }, [extractedSwatches, accentColor, secondaryAccent, colorHarmony]);

  // Handle custom wallpaper upload
  const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const readerUrl = new FileReader();
    readerUrl.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const readerBuffer = new FileReader();
      readerBuffer.onload = (bufEv) => {
        const buffer = new Uint8Array(bufEv.target?.result as ArrayBuffer);
        setWallpaper(dataUrl, buffer);
      };
      readerBuffer.readAsArrayBuffer(file);
    };
    readerUrl.readAsDataURL(file);
  };

  // Auto-palette extraction from wallpaper
  const handleExtractPalette = async () => {
    setIsExtracting(true);
    try {
      const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/theme-creator') ? '/theme-creator' : '';
      const activeWp = wallpaperUrl || (isLightMode ? `${basePath}/wallpapers/default-light.jpg` : `${basePath}/wallpapers/default-dark.jpg`);
      const palette = await extractPaletteFromImageUrl(activeWp);
      applyThemeConfig({
        accentColor: palette.primary,
        secondaryAccent: palette.secondary,
      });
      if (palette.swatches && palette.swatches.length > 0) {
        setExtractedSwatches(palette.swatches);
      }
      setExtractedSuccess(true);
      setTimeout(() => setExtractedSuccess(false), 2000);
    } catch {
      // ignore
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Appearance & Mode */}
      <div className="pt-2 border-t border-neutral-800 first:border-t-0 first:pt-0">
        <label className="text-xs font-semibold uppercase text-neutral-400 mb-2 block">Appearance</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setIsLightMode(false)}
            className={`py-1.5 px-3 rounded text-xs font-medium border transition-colors cursor-pointer ${
              !isLightMode
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
            }`}
          >
            🌙 Dark Mode
          </button>
          <button
            onClick={() => setIsLightMode(true)}
            className={`py-1.5 px-3 rounded text-xs font-medium border transition-colors cursor-pointer ${
              isLightMode
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
            }`}
          >
            ☀️ Light Mode
          </button>
        </div>
      </div>

      {/* Colors & Styling */}
      <div className="pt-2 border-t border-neutral-800">
        <label className="text-xs font-semibold uppercase text-neutral-400 mb-2 block">Colors & Styling</label>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <span className="text-xs text-neutral-400 block mb-1">Primary Accent</span>
            <ColorPickerPopover
              id="primary-accent-picker"
              label="Primary Accent"
              value={accentColor}
              onChange={(c) => {
                setAccentColor(c);
                if (colorHarmony && colorHarmony !== 'custom') {
                  const h = computeColorHarmonies(c, colorHarmony);
                  setSecondaryAccent(h.secondary);
                }
              }}
            />
          </div>
          <div>
            <span className="text-xs text-neutral-400 block mb-1">Secondary Accent</span>
            <ColorPickerPopover
              id="secondary-accent-picker"
              label="Secondary Accent"
              value={secondaryAccent}
              onChange={(c) => setSecondaryAccent(c)}
            />
          </div>
        </div>

        {/* Color Harmony Selector */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-neutral-400">Color Harmony</span>
          </div>
          <select
            value={colorHarmony ?? 'custom'}
            onChange={(e) => {
              const h = e.target.value as ColorHarmonyType;
              setColorHarmony(h);
              if (h !== 'custom') {
                const result = computeColorHarmonies(accentColor, h);
                setSecondaryAccent(result.secondary);
              }
            }}
            className="w-full bg-neutral-800 px-2.5 py-1.5 rounded text-xs text-white border border-neutral-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="custom">Custom (Independent)</option>
            <option value="complementary">Complementary (High Contrast)</option>
            <option value="analogous">Analogous (Harmonious Neighbor)</option>
            <option value="triadic">Triadic (Balanced Vibrant Trio)</option>
            <option value="split-complementary">Split-Complementary (Nuanced Contrast)</option>
            <option value="monochromatic">Monochromatic (Shades & Tints)</option>
          </select>
        </div>

        {/* 5-Swatch Extracted Chips */}
        <div className="mb-1">
          <span className="text-xs text-neutral-400 block mb-1">
            Extracted Swatches <span className="text-[10px] text-neutral-500">(Click: Primary, Shift-Click: Secondary)</span>
          </span>
          <div className="flex items-center justify-between gap-1 p-1.5 bg-neutral-800 rounded border border-neutral-700">
            {displayedSwatches.map((hex, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  if (e.shiftKey) {
                    setSecondaryAccent(hex);
                  } else {
                    setAccentColor(hex);
                    if (colorHarmony && colorHarmony !== 'custom') {
                      const h = computeColorHarmonies(hex, colorHarmony);
                      setSecondaryAccent(h.secondary);
                    }
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setSecondaryAccent(hex);
                }}
                className="w-7 h-7 rounded-full border border-white/20 shadow-xs hover:scale-110 transition-transform cursor-pointer relative"
                style={{ backgroundColor: hex }}
                title={`${hex} - Left-click for Primary, Shift-click for Secondary`}
              >
                {(hex.toLowerCase() === accentColor.toLowerCase() || hex.toLowerCase() === secondaryAccent.toLowerCase()) && (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-bold drop-shadow">
                    {hex.toLowerCase() === accentColor.toLowerCase() ? 'P' : 'S'}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Wallpaper */}
      <div className="pt-2 border-t border-neutral-800">
        <label className="text-xs font-semibold uppercase text-neutral-400 mb-2 block">Wallpaper</label>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => wallpaperInputRef.current?.click()}
              className="flex-1 py-1.5 px-3 rounded text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors cursor-pointer"
            >
              {wallpaperUrl ? 'Change Wallpaper...' : 'Upload Wallpaper...'}
            </button>
            {wallpaperUrl && (
              <button
                onClick={() => setWallpaper(null, null)}
                className="text-xs px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 border border-neutral-700 cursor-pointer"
                title="Reset to default wallpaper"
              >
                Reset
              </button>
            )}
          </div>

          {/* Auto-Theming: Extract Palette from Wallpaper */}
          <button
            onClick={handleExtractPalette}
            disabled={isExtracting}
            className="py-1.5 px-3 rounded text-xs font-medium bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>✨</span>
            <span>{isExtracting ? 'Extracting...' : extractedSuccess ? '✓ Palette Applied!' : 'Extract Palette from Wallpaper'}</span>
          </button>

          <input
            ref={wallpaperInputRef}
            type="file"
            accept="image/*"
            onChange={handleWallpaperUpload}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
