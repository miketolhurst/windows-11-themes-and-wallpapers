import React, { useState } from 'react';
import { useThemeStore } from '../../store/useThemeStore';
import { THEME_PRESETS, PRESET_CATEGORIES, PresetCategory } from '../../lib/presets';
import { generateZipPayload, generateDirectApplyPayload } from '../../lib/exportEngine';
import { ThemeDiffModal } from '../ThemeDiffModal';

export interface LibrarySectionProps {
  onResetExtractedSwatches?: () => void;
}

export default function LibrarySection({ onResetExtractedSwatches }: LibrarySectionProps) {
  const state = useThemeStore();
  const {
    themeName,
    savedThemes,
    saveCurrentTheme,
    loadSavedTheme,
    deleteSavedTheme,
    applyThemeConfig,
    setShowDownloadModal,
  } = state;

  const [selectedCategory, setSelectedCategory] = useState<PresetCategory>('All');
  const [newThemeName, setNewThemeName] = useState('');
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isPresetsExpanded, setIsPresetsExpanded] = useState(false);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedDirectApply, setCopiedDirectApply] = useState(false);

  const basePath =
    typeof window !== 'undefined' && window.location.pathname.startsWith('/theme-creator')
      ? '/theme-creator'
      : '/theme-creator';

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

  // Handle MCP Direct Apply payload copy
  const handleDirectApply = async () => {
    try {
      const payload = generateDirectApplyPayload(state);
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
        setCopiedDirectApply(true);
        setTimeout(() => setCopiedDirectApply(false), 2000);
      }
    } catch (err) {
      console.error('Direct apply copy error', err);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* My Saved Themes */}
      <div className="pt-2 border-t border-neutral-800 first:border-t-0 first:pt-0">
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
                        onClick={() => {
                          onResetExtractedSwatches?.();
                          loadSavedTheme(saved.id);
                        }}
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

      {/* Curated Presets Accordion */}
      <div className="border border-neutral-800 rounded-xl bg-neutral-900/40 p-3">
        <button
          type="button"
          onClick={() => setIsPresetsExpanded(!isPresetsExpanded)}
          className="w-full flex items-center justify-between text-left cursor-pointer group select-none"
        >
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] text-neutral-400 transition-transform duration-200 ${
                isPresetsExpanded ? 'rotate-90' : ''
              }`}
            >
              ▶
            </span>
            <label className="text-xs font-semibold uppercase text-neutral-300 group-hover:text-white cursor-pointer">
              Curated Presets
            </label>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-500 font-mono">{THEME_PRESETS.length} Themes</span>
            <span className="text-[10px] text-neutral-400 group-hover:text-neutral-200">
              {isPresetsExpanded ? '▲' : '▼'}
            </span>
          </div>
        </button>

        {isPresetsExpanded && (
          <div className="mt-3 pt-3 border-t border-neutral-800 flex flex-col gap-2.5">
            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 mb-1 no-scrollbar">
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
                    onResetExtractedSwatches?.();
                    applyThemeConfig({
                      themeName: preset.name,
                      accentColor: preset.accentColor,
                      secondaryAccent: preset.secondaryAccent,
                      isLightMode: preset.isLightMode,
                      taskbarMode: preset.taskbarMode,
                      materialStyle:
                        preset.materialStyle ??
                        (preset.taskbarMode === 'gradient' ? 'linear-gradient' : 'fluent-acrylic'),
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
                      wallpaperUrl: preset.wallpaperFileName
                        ? `${basePath}/wallpapers/${preset.wallpaperFileName}`
                        : preset.wallpaperUrl,
                      wallpaperData: null,
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
        )}
      </div>

      {/* Theme Diff Inspector Trigger */}
      <div className="pt-2 border-t border-neutral-800">
        <label className="text-xs font-semibold uppercase text-neutral-400 mb-2 block">Theme Inspector</label>
        <button
          type="button"
          onClick={() => setIsDiffModalOpen(true)}
          className="w-full py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          title="Inspect Active Theme Settings or Compare Incoming Diffs"
        >
          <span>🔍</span>
          <span>Inspect Theme Settings / Diffs</span>
        </button>
      </div>

      {/* Export & Apply Actions */}
      <div className="pt-3 border-t border-neutral-800 flex flex-col gap-2">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer border border-blue-500/40 hover:brightness-110 active:scale-98"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>{isDownloading ? 'Generating .zip...' : 'Download Theme (.zip)'}</span>
        </button>

        <button
          type="button"
          onClick={handleDirectApply}
          className="w-full py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          title="Copy MCP Direct Apply JSON payload to clipboard"
        >
          <span>⚡</span>
          <span>{copiedDirectApply ? '✓ Payload Copied for MCP!' : 'Direct Apply (MCP / Windhawk)'}</span>
        </button>
      </div>

      {/* Theme Diff Modal */}
      {isDiffModalOpen && (
        <ThemeDiffModal
          isOpen={isDiffModalOpen}
          incomingConfig={null}
          onClose={() => setIsDiffModalOpen(false)}
          onApply={(config) => applyThemeConfig(config)}
        />
      )}
    </div>
  );
}
