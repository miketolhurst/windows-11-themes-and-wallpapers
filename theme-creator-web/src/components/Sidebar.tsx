import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useThemeStore, MaterialStyle, RunningIndicatorStyle, ColorHarmonyType } from '../store/useThemeStore';
import { THEME_PRESETS, PRESET_CATEGORIES, PresetCategory } from '../lib/presets';
import { parseRegFile } from '../lib/regParser';
import { generateZipPayload } from '../lib/exportEngine';
import { copyShareLink } from '../lib/urlSharing';
import {
  extractPaletteFromImageUrl,
  hexToRgb,
  rgbToHex,
  blend,
  computeColorHarmonies,
  calculateContrastRatio,
  getContrastGrade,
  RGB,
} from '../lib/paletteEngine';

export default function Sidebar() {
  const state = useThemeStore();
  const {
    themeName,
    setThemeName,
    accentColor,
    setAccentColor,
    secondaryAccent,
    setSecondaryAccent,
    isLightMode,
    setIsLightMode,
    taskbarMode,
    setTaskbarMode,
    materialStyle,
    setMaterialStyle,
    noiseOpacity,
    setNoiseOpacity,
    tintSaturation,
    setTintSaturation,
    dockMode,
    setDockMode,
    dockMargin,
    setDockMargin,
    runningIndicatorStyle,
    setRunningIndicatorStyle,
    colorHarmony,
    setColorHarmony,
    savedThemes,
    saveCurrentTheme,
    loadSavedTheme,
    deleteSavedTheme,
    cornerRadius,
    setCornerRadius,
    borderThickness,
    setBorderThickness,
    wallpaperUrl,
    setWallpaper,
    customStartIconUrl,
    setCustomStartIcon,
    hideRecommended,
    setHideRecommended,
    compactSearch,
    setCompactSearch,
    dynamicNotificationHeight,
    setDynamicNotificationHeight,
    removeDropShadows,
    setRemoveDropShadows,
    taskbarBlur,
    setTaskbarBlur,
    startMenuBlur,
    setStartMenuBlur,
    notificationBlur,
    setNotificationBlur,
    taskbarOpacity,
    setTaskbarOpacity,
    startMenuOpacity,
    setStartMenuOpacity,
    notificationOpacity,
    setNotificationOpacity,
    activePane,
    setActivePane,
    showDesktopIcons,
    setShowDesktopIcons,
    showWindowPreview,
    setShowWindowPreview,
    isSidebarCollapsed,
    toggleSidebar,
    setShowDownloadModal,
    past,
    future,
    undo,
    redo,
    applyThemeConfig,
    resetToDefaults,
  } = state;

  const regInputRef = useRef<HTMLInputElement>(null);
  const wallpaperInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedSuccess, setExtractedSuccess] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<PresetCategory>('All');
  const [newThemeName, setNewThemeName] = useState('');
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [extractedSwatches, setExtractedSwatches] = useState<string[]>([]);

  // Real-time WCAG Contrast calculation against surface background
  const contrastInfo = useMemo(() => {
    const aRgb = hexToRgb(accentColor);
    const bgRgb: RGB = isLightMode ? [240, 240, 245] : [16, 18, 22];
    const ratio = calculateContrastRatio(aRgb, bgRgb);
    return getContrastGrade(ratio);
  }, [accentColor, isLightMode]);

  // Derived 5-swatch palette display
  const displayedSwatches = useMemo(() => {
    if (extractedSwatches.length >= 5) {
      return extractedSwatches.slice(0, 5);
    }
    const aRgb = hexToRgb(accentColor);
    const sRgb = hexToRgb(secondaryAccent);
    return [
      accentColor,
      secondaryAccent,
      rgbToHex(blend(aRgb, [255, 255, 255], 0.35)),
      rgbToHex(blend(aRgb, [0, 0, 0], 0.35)),
      rgbToHex(blend(sRgb, [255, 255, 255], 0.3)),
    ];
  }, [extractedSwatches, accentColor, secondaryAccent]);

  // Global Keyboard Shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

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

  // Handle custom start icon upload
  const handleStartIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const readerUrl = new FileReader();
    readerUrl.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const readerBuffer = new FileReader();
      readerBuffer.onload = (bufEv) => {
        const buffer = new Uint8Array(bufEv.target?.result as ArrayBuffer);
        setCustomStartIcon(dataUrl, buffer);
      };
      readerBuffer.readAsArrayBuffer(file);
    };
    readerUrl.readAsDataURL(file);
  };

  // Handle .reg theme import
  const handleRegImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const parsed = parseRegFile(content);
      applyThemeConfig(parsed);
    };
    reader.readAsText(file);
  };

  // Handle Share link copy
  const handleShare = async () => {
    const ok = await copyShareLink(state);
    if (ok) {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  // Handle Download Theme ZIP
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const blob = await generateZipPayload(state);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const slug = (themeName || 'Theme').replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `Windhawk_${slug}_Theme.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setShowDownloadModal(true);
    } catch (err) {
      console.error('Download error', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className={`h-full bg-neutral-900 text-white flex flex-col relative z-30 border-r border-neutral-800 transition-all duration-300 select-none overflow-x-hidden ${
        isSidebarCollapsed ? 'w-0 p-0 border-0 opacity-0 overflow-hidden pointer-events-none' : 'w-88 p-4 md:p-5'
      }`}
    >
      {/* Scrollable Options Section */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 flex flex-col gap-4.5 scrollbar-thin scrollbar-thumb-neutral-700">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>🎨</span> Windhawk Studio
            </h2>
            <p className="text-xs text-neutral-400">Windows 11 Theme Generator</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={undo}
              disabled={past.length === 0}
              title="Undo (Ctrl+Z)"
              className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-300 transition-colors border border-neutral-700 cursor-pointer"
            >
              ↩
            </button>
            <button
              onClick={redo}
              disabled={future.length === 0}
              title="Redo (Ctrl+Y)"
              className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-300 transition-colors border border-neutral-700 cursor-pointer"
            >
              ↪
            </button>
            <button
              onClick={resetToDefaults}
              title="Reset to default settings"
              className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors border border-neutral-700 cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={toggleSidebar}
              title="Collapse sidebar (Full-screen preview)"
              className="text-xs p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors border border-neutral-700 cursor-pointer ml-1"
            >
              ◀
            </button>
          </div>
        </div>

        {/* Theme Name & Actions */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase text-neutral-400">Theme Name</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              className="flex-1 bg-neutral-800 px-3 py-1.5 rounded text-sm text-white border border-neutral-700 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => regInputRef.current?.click()}
              className="text-xs px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 whitespace-nowrap transition-colors cursor-pointer"
              title="Import .reg file"
            >
              Import
            </button>
            <input
              ref={regInputRef}
              type="file"
              accept=".reg,.txt"
              onChange={handleRegImport}
              className="hidden"
            />
          </div>
          <button
            onClick={handleShare}
            className="w-full py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="Copy shareable link to clipboard"
          >
            <span>🔗</span>
            <span>{copiedShare ? '✓ Link Copied to Clipboard!' : 'Share this theme'}</span>
          </button>
        </div>

        {/* My Saved Themes */}
        <div className="pt-2 border-t border-neutral-800">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase text-neutral-400">My Saved Themes</label>
            <button
              onClick={() => setIsSavedDrawerOpen(!isSavedDrawerOpen)}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            >
              {isSavedDrawerOpen ? 'Hide' : `Show (${savedThemes.length})`}
            </button>
          </div>

          {isSavedDrawerOpen && (
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-lg p-2.5 flex flex-col gap-2 mb-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Save current theme as..."
                  value={newThemeName}
                  onChange={(e) => setNewThemeName(e.target.value)}
                  className="flex-1 bg-neutral-800 px-2.5 py-1 text-xs text-white rounded border border-neutral-700 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => {
                    saveCurrentTheme(newThemeName.trim() || themeName);
                    setNewThemeName('');
                  }}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium cursor-pointer"
                >
                  Save
                </button>
              </div>

              {savedThemes.length === 0 ? (
                <p className="text-[11px] text-neutral-500 py-1 text-center">No saved themes yet.</p>
              ) : (
                <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {savedThemes.map((saved) => (
                    <div
                      key={saved.id}
                      className="flex items-center justify-between p-1.5 rounded bg-neutral-800/80 border border-neutral-700/60 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: saved.config.accentColor }}
                        />
                        <span className="truncate text-neutral-200">{saved.name}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => loadSavedTheme(saved.id)}
                          className="px-2 py-0.5 rounded bg-neutral-700 hover:bg-blue-600 text-neutral-200 hover:text-white text-[10px] cursor-pointer"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteSavedTheme(saved.id)}
                          className="px-1.5 py-0.5 rounded text-neutral-400 hover:text-red-400 hover:bg-neutral-700 text-[10px] cursor-pointer"
                          title="Delete saved theme"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Curated Presets with Category Tabs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase text-neutral-400">Curated Presets</label>
            <span className="text-[11px] text-neutral-500 font-mono">{THEME_PRESETS.length} Themes</span>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar">
            {PRESET_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(selectedCategory === 'All'
              ? THEME_PRESETS
              : THEME_PRESETS.filter((p) => p.category === selectedCategory)
            ).map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  applyThemeConfig({
                    themeName: preset.name,
                    accentColor: preset.accentColor,
                    secondaryAccent: preset.secondaryAccent,
                    isLightMode: preset.isLightMode,
                    taskbarMode: preset.taskbarMode,
                    materialStyle: preset.materialStyle ?? (preset.taskbarMode === 'gradient' ? 'linear-gradient' : 'fluent-acrylic'),
                    dockMode: preset.dockMode ?? false,
                    dockMargin: preset.dockMargin ?? 12,
                    runningIndicatorStyle: preset.runningIndicatorStyle ?? 'standard',
                    cornerRadius: preset.cornerRadius,
                    borderThickness: preset.borderThickness ?? 2,
                    taskbarBlur: preset.taskbarBlur,
                    startMenuBlur: preset.startMenuBlur,
                    notificationBlur: preset.notificationBlur,
                    noiseOpacity: preset.noiseOpacity ?? 0.04,
                    tintSaturation: preset.tintSaturation ?? 0.85,
                    hideRecommended: preset.hideRecommended,
                    compactSearch: preset.compactSearch,
                    dynamicNotificationHeight: preset.dynamicNotificationHeight,
                    removeDropShadows: preset.removeDropShadows,
                    wallpaperUrl: preset.wallpaperUrl,
                  });
                }}
                className="flex items-center gap-2 p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700/80 border border-neutral-700 text-left transition-all group cursor-pointer shadow-xs"
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm border border-white/20"
                  style={{ background: preset.previewGradient }}
                />
                <span className="text-xs font-medium text-neutral-200 truncate group-hover:text-white">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Appearance & Mode */}
        <div className="pt-2 border-t border-neutral-800">
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
              <div className="flex items-center gap-2 bg-neutral-800 p-1.5 rounded border border-neutral-700">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => {
                    const c = e.target.value;
                    setAccentColor(c);
                    if (colorHarmony && colorHarmony !== 'custom') {
                      const h = computeColorHarmonies(c, colorHarmony);
                      setSecondaryAccent(h.secondary);
                    }
                  }}
                  className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-xs font-mono text-neutral-200 uppercase truncate">{accentColor}</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-neutral-400 block mb-1">Secondary Accent</span>
              <div className="flex items-center gap-2 bg-neutral-800 p-1.5 rounded border border-neutral-700">
                <input
                  type="color"
                  value={secondaryAccent}
                  onChange={(e) => setSecondaryAccent(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-xs font-mono text-neutral-200 uppercase truncate">{secondaryAccent}</span>
              </div>
            </div>
          </div>

          {/* Color Harmony Selector with WCAG Grade Badge */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-neutral-400">Color Harmony</span>
              <div
                className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white"
                style={{
                  backgroundColor:
                    contrastInfo.grade === 'AAA'
                      ? '#059669'
                      : contrastInfo.grade === 'AA'
                      ? '#2563eb'
                      : '#dc2626',
                }}
                title={`Contrast ratio: ${contrastInfo.ratio}:1 against surface (${contrastInfo.grade})`}
              >
                WCAG {contrastInfo.grade} ({contrastInfo.ratio}:1)
              </div>
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
          <div className="mb-3">
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

          {/* 4-Tier Material Style Selector */}
          <div className="mb-3">
            <span className="text-xs text-neutral-400 block mb-1">Material Style</span>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {[
                { id: 'fluent-acrylic', label: 'Acrylic Glass' },
                { id: 'pure-black-neon', label: 'OLED Neon' },
                { id: 'linear-gradient', label: 'Linear Gradient' },
                { id: 'matte-slate', label: 'Matte Slate' },
              ].map((mat) => {
                const isSelected =
                  (materialStyle ?? (taskbarMode === 'gradient' ? 'linear-gradient' : 'fluent-acrylic')) === mat.id;
                return (
                  <button
                    key={mat.id}
                    onClick={() => {
                      setMaterialStyle(mat.id as MaterialStyle);
                    }}
                    className={`py-1.5 px-2 rounded text-xs font-medium border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                        : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                    }`}
                  >
                    {mat.label}
                  </button>
                );
              })}
            </div>

            {/* Advanced Acrylic Tuning */}
            {(materialStyle ?? (taskbarMode === 'gradient' ? 'linear-gradient' : 'fluent-acrylic')) === 'fluent-acrylic' && (
              <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-2.5 flex flex-col gap-2 mt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">Noise Texture</span>
                    <span className="text-blue-400 font-mono">{Math.round((noiseOpacity ?? 0.04) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={Math.round((noiseOpacity ?? 0.04) * 100)}
                    onChange={(e) => setNoiseOpacity(parseInt(e.target.value, 10) / 100)}
                    className="w-full accent-blue-500 cursor-pointer"
                    aria-label="Noise Texture"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">Tint Saturation</span>
                    <span className="text-blue-400 font-mono">{Math.round((tintSaturation ?? 0.85) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={Math.round((tintSaturation ?? 0.85) * 100)}
                    onChange={(e) => setTintSaturation(parseInt(e.target.value, 10) / 100)}
                    className="w-full accent-blue-500 cursor-pointer"
                    aria-label="Tint Saturation"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Custom Start Icon */}
          <div>
            <span className="text-xs text-neutral-400 block mb-1">Start Button Icon</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => iconInputRef.current?.click()}
                className="flex-1 py-1 px-2.5 rounded text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors truncate cursor-pointer"
              >
                {customStartIconUrl ? 'Change Custom Icon...' : 'Upload Custom Icon...'}
              </button>
              {customStartIconUrl && (
                <button
                  onClick={() => setCustomStartIcon(null, null)}
                  className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-red-900/50 text-red-400 border border-neutral-700 transition-colors cursor-pointer"
                  title="Reset to default Windows 11 logo"
                >
                  ✕
                </button>
              )}
              <input
                ref={iconInputRef}
                type="file"
                accept="image/*"
                onChange={handleStartIconUpload}
                className="hidden"
              />
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

        {/* Desktop & Window Preview Elements */}
        <div className="pt-2 border-t border-neutral-800">
          <label className="text-xs font-semibold uppercase text-neutral-400 mb-2 block">Desktop Elements</label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showDesktopIcons}
                onChange={(e) => setShowDesktopIcons(e.target.checked)}
                className="rounded bg-neutral-800 border-neutral-700 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <span>Show Desktop Icons</span>
            </label>
            <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showWindowPreview}
                onChange={(e) => setShowWindowPreview(e.target.checked)}
                className="rounded bg-neutral-800 border-neutral-700 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <span>Show File Explorer Preview</span>
            </label>
          </div>
        </div>

        {/* Windhawk Layout & Tweaks */}
        <div className="pt-2 border-t border-neutral-800">
          <label className="text-xs font-semibold uppercase text-neutral-400 mb-2 block">Layout Tweaks</label>

          {/* Corner Radius */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-300">Corner Radius</span>
              <span className="text-blue-400 font-mono">{cornerRadius}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={cornerRadius}
              onChange={(e) => setCornerRadius(parseInt(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
              aria-label="Corner Radius"
            />
          </div>

          {/* Border Thickness */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-300">Border Thickness</span>
              <span className="text-blue-400 font-mono">{borderThickness}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              value={borderThickness}
              onChange={(e) => setBorderThickness(parseInt(e.target.value, 10))}
              className="w-full accent-blue-500 cursor-pointer"
              aria-label="Border Thickness"
            />
          </div>

          {/* Floating Dock Mode */}
          <div className="mb-3">
            <label className="flex items-center justify-between text-xs text-neutral-300 cursor-pointer hover:text-white mb-1.5">
              <span className="font-medium">Floating Dock (Island Taskbar)</span>
              <input
                type="checkbox"
                checked={dockMode}
                onChange={(e) => setDockMode(e.target.checked)}
                className="rounded bg-neutral-800 border-neutral-700 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                aria-label="Floating Dock Mode"
              />
            </label>
            {dockMode && (
              <div className="mt-2 pl-2 border-l-2 border-blue-500/40">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-300">Dock Margin</span>
                  <span className="text-blue-400 font-mono">{dockMargin}px</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="48"
                  step="2"
                  value={dockMargin}
                  onChange={(e) => setDockMargin(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-500 cursor-pointer"
                  aria-label="Dock Margin"
                />
              </div>
            )}
          </div>

          {/* Running App Indicator Style */}
          <div className="mb-3">
            <label className="text-xs text-neutral-300 block mb-1.5">Running App Indicator</label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'standard', label: 'Line' },
                { id: 'dot', label: 'Dot' },
                { id: 'glow', label: 'Glow' },
                { id: 'hidden', label: 'Off' },
              ].map((ind) => (
                <button
                  key={ind.id}
                  type="button"
                  onClick={() => setRunningIndicatorStyle(ind.id as any)}
                  className={`py-1 px-1.5 rounded text-[11px] font-medium border transition-colors cursor-pointer text-center ${
                    runningIndicatorStyle === ind.id
                      ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-neutral-200'
                  }`}
                  aria-label={`Indicator ${ind.label}`}
                >
                  {ind.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tweak Checkboxes */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={hideRecommended}
                onChange={(e) => setHideRecommended(e.target.checked)}
                className="rounded bg-neutral-800 border-neutral-700 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <span>Hide Recommended Section</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={compactSearch}
                onChange={(e) => setCompactSearch(e.target.checked)}
                className="rounded bg-neutral-800 border-neutral-700 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <span>Compact Search Box</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={dynamicNotificationHeight}
                onChange={(e) => setDynamicNotificationHeight(e.target.checked)}
                className="rounded bg-neutral-800 border-neutral-700 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <span>Dynamic Notification Height</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={removeDropShadows}
                onChange={(e) => setRemoveDropShadows(e.target.checked)}
                className="rounded bg-neutral-800 border-neutral-700 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <span>Remove Flyout Drop Shadows</span>
            </label>
          </div>
        </div>

        {/* Blur & Transparency */}
        <div className="pt-2 border-t border-neutral-800">
          <label className="text-xs font-semibold uppercase text-neutral-400 mb-2 block">
            {taskbarMode === 'gradient' ? 'Gradient Opacity' : 'Blur & Transparency'}
          </label>

          {taskbarMode === 'gradient' ? (
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="taskbarOpacity" className="text-neutral-300">Taskbar Opacity</label>
                  <span className="text-blue-400 font-mono">{taskbarOpacity}%</span>
                </div>
                <input
                  id="taskbarOpacity"
                  aria-label="Taskbar Opacity"
                  type="range"
                  min="0"
                  max="100"
                  value={taskbarOpacity}
                  onChange={(e) => setTaskbarOpacity(parseInt(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="startMenuOpacity" className="text-neutral-300">Start Menu Opacity</label>
                  <span className="text-blue-400 font-mono">{startMenuOpacity}%</span>
                </div>
                <input
                  id="startMenuOpacity"
                  aria-label="Start Menu Opacity"
                  type="range"
                  min="0"
                  max="100"
                  value={startMenuOpacity}
                  onChange={(e) => setStartMenuOpacity(parseInt(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="notificationOpacity" className="text-neutral-300">Flyout Opacity</label>
                  <span className="text-blue-400 font-mono">{notificationOpacity}%</span>
                </div>
                <input
                  id="notificationOpacity"
                  aria-label="Flyout Opacity"
                  type="range"
                  min="0"
                  max="100"
                  value={notificationOpacity}
                  onChange={(e) => setNotificationOpacity(parseInt(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="taskbarBlur" className="text-neutral-300">Taskbar Blur</label>
                  <span className="text-blue-400 font-mono">{taskbarBlur}px</span>
                </div>
                <input
                  id="taskbarBlur"
                  aria-label="Taskbar Blur"
                  type="range"
                  min="0"
                  max="30"
                  value={taskbarBlur}
                  onChange={(e) => setTaskbarBlur(parseInt(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="startMenuBlur" className="text-neutral-300">Start Menu Blur</label>
                  <span className="text-blue-400 font-mono">{startMenuBlur}px</span>
                </div>
                <input
                  id="startMenuBlur"
                  aria-label="Start Menu Blur"
                  type="range"
                  min="0"
                  max="30"
                  value={startMenuBlur}
                  onChange={(e) => setStartMenuBlur(parseInt(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="notificationBlur" className="text-neutral-300">Notification Blur</label>
                  <span className="text-blue-400 font-mono">{notificationBlur}px</span>
                </div>
                <input
                  id="notificationBlur"
                  aria-label="Notification Blur"
                  type="range"
                  min="0"
                  max="30"
                  value={notificationBlur}
                  onChange={(e) => setNotificationBlur(parseInt(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Preview Viewport Switcher */}
        <div className="pt-2 border-t border-neutral-800 pb-2">
          <label className="text-xs font-semibold uppercase text-neutral-400 mb-2 block">Flyout Preview Mode</label>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => setActivePane(activePane === 'start' ? null : 'start')}
              className={`py-1.5 px-2 rounded text-[11px] font-medium border transition-colors cursor-pointer text-center ${
                activePane === 'start'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
              }`}
            >
              Start
            </button>
            <button
              onClick={() => setActivePane(activePane === 'notifications' ? null : 'notifications')}
              className={`py-1.5 px-2 rounded text-[11px] font-medium border transition-colors cursor-pointer text-center ${
                activePane === 'notifications'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setActivePane(activePane === 'quicksettings' ? null : 'quicksettings')}
              className={`py-1.5 px-2 rounded text-[11px] font-medium border transition-colors cursor-pointer text-center ${
                activePane === 'quicksettings'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
              }`}
            >
              Quick
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Download Button at the bottom of the sidebar */}
      <div className="pt-3 border-t border-neutral-800 flex flex-col gap-2">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full py-3 px-4 rounded-xl text-white font-semibold text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-blue-400/30 hover:brightness-110 active:scale-98"
          style={{ backgroundColor: accentColor }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>{isDownloading ? 'Generating .zip...' : 'Download Theme (.zip)'}</span>
        </button>
      </div>
    </div>
  );
}
