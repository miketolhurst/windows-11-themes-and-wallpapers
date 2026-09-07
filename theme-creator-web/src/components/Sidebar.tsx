import React, { useRef } from 'react';
import { useThemeStore } from '../store/useThemeStore';
import { THEME_PRESETS } from '../lib/presets';
import { parseRegFile } from '../lib/regParser';

export default function Sidebar() {
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
    cornerRadius,
    setCornerRadius,
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
    applyThemeConfig,
    resetToDefaults,
  } = useThemeStore();

  const regInputRef = useRef<HTMLInputElement>(null);
  const wallpaperInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="w-88 h-full bg-neutral-900 text-white p-5 flex flex-col gap-5 relative z-50 border-r border-neutral-800 overflow-y-auto select-none scrollbar-thin scrollbar-thumb-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <span>🎨</span> Windhawk Studio
          </h2>
          <p className="text-xs text-neutral-400">Windows 11 Theme Generator</p>
        </div>
        <button
          onClick={resetToDefaults}
          title="Reset to default Windows 11 settings"
          className="text-xs px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors border border-neutral-700"
        >
          Reset
        </button>
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
            className="text-xs px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 whitespace-nowrap transition-colors"
          >
            Import .reg
          </button>
          <input
            ref={regInputRef}
            type="file"
            accept=".reg,.txt"
            onChange={handleRegImport}
            className="hidden"
          />
        </div>
      </div>

      {/* Preset Chips */}
      <div>
        <label className="text-xs font-semibold uppercase text-neutral-400 mb-2 block">Curated Presets</label>
        <div className="grid grid-cols-2 gap-2">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                applyThemeConfig({
                  themeName: preset.name,
                  accentColor: preset.accentColor,
                  secondaryAccent: preset.secondaryAccent,
                  isLightMode: preset.isLightMode,
                  taskbarMode: preset.taskbarMode,
                  cornerRadius: preset.cornerRadius,
                  taskbarBlur: preset.taskbarBlur,
                  startMenuBlur: preset.startMenuBlur,
                  notificationBlur: preset.notificationBlur,
                  hideRecommended: preset.hideRecommended,
                  compactSearch: preset.compactSearch,
                  dynamicNotificationHeight: preset.dynamicNotificationHeight,
                  removeDropShadows: preset.removeDropShadows,
                  wallpaperUrl: preset.wallpaperUrl,
                });
              }}
              className="flex items-center gap-2 p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700/80 border border-neutral-700/60 text-left transition-all group"
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
            className={`py-1.5 px-3 rounded text-xs font-medium border transition-colors ${
              !isLightMode
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700'
            }`}
          >
            🌙 Dark Mode
          </button>
          <button
            onClick={() => setIsLightMode(true)}
            className={`py-1.5 px-3 rounded text-xs font-medium border transition-colors ${
              isLightMode
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700'
            }`}
          >
            ☀️ Light Mode
          </button>
        </div>
      </div>

      {/* Accent Colors */}
      <div className="pt-2 border-t border-neutral-800">
        <label className="text-xs font-semibold uppercase text-neutral-400 mb-2 block">Colors & Styling</label>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <span className="text-xs text-neutral-400 block mb-1">Primary Accent</span>
            <div className="flex items-center gap-2 bg-neutral-800 p-1.5 rounded border border-neutral-700">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="text-xs font-mono text-neutral-300 uppercase truncate">{accentColor}</span>
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
              <span className="text-xs font-mono text-neutral-300 uppercase truncate">{secondaryAccent}</span>
            </div>
          </div>
        </div>

        {/* Taskbar Fill Mode */}
        <div className="mb-3">
          <span className="text-xs text-neutral-400 block mb-1">Taskbar Material</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTaskbarMode('blur')}
              className={`py-1 px-2 rounded text-xs font-medium border transition-colors ${
                taskbarMode === 'blur'
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700'
              }`}
            >
              Frosted Glass
            </button>
            <button
              onClick={() => setTaskbarMode('gradient')}
              className={`py-1 px-2 rounded text-xs font-medium border transition-colors ${
                taskbarMode === 'gradient'
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700'
              }`}
            >
              Linear Gradient
            </button>
          </div>
        </div>

        {/* Custom Start Icon */}
        <div>
          <span className="text-xs text-neutral-400 block mb-1">Start Button Icon</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => iconInputRef.current?.click()}
              className="flex-1 py-1 px-2.5 rounded text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors truncate"
            >
              {customStartIconUrl ? 'Change Custom Icon...' : 'Upload Custom Icon...'}
            </button>
            {customStartIconUrl && (
              <button
                onClick={() => setCustomStartIcon(null, null)}
                className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-red-900/50 text-red-400 border border-neutral-700 transition-colors"
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
        <div className="flex gap-2">
          <button
            onClick={() => wallpaperInputRef.current?.click()}
            className="flex-1 py-1.5 px-3 rounded text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors"
          >
            {wallpaperUrl ? 'Change Wallpaper...' : 'Upload Custom Wallpaper...'}
          </button>
          {wallpaperUrl && (
            <button
              onClick={() => setWallpaper(null, null)}
              className="text-xs px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 border border-neutral-700"
              title="Reset wallpaper"
            >
              Clear
            </button>
          )}
          <input
            ref={wallpaperInputRef}
            type="file"
            accept="image/*"
            onChange={handleWallpaperUpload}
            className="hidden"
          />
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
          />
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
                <label htmlFor="notificationOpacity" className="text-neutral-300">Notification Center Opacity</label>
                <span className="text-blue-400 font-mono">{notificationOpacity}%</span>
              </div>
              <input
                id="notificationOpacity"
                aria-label="Notification Center Opacity"
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
      <div className="pt-2 border-t border-neutral-800 pb-4">
        <label className="text-xs font-semibold uppercase text-neutral-400 mb-2 block">Flyout Preview Mode</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setActivePane(activePane === 'start' ? null : 'start')}
            className={`py-1.5 px-3 rounded text-xs font-medium border transition-colors ${
              activePane === 'start'
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700'
            }`}
          >
            Start Menu
          </button>
          <button
            onClick={() => setActivePane(activePane === 'notifications' ? null : 'notifications')}
            className={`py-1.5 px-3 rounded text-xs font-medium border transition-colors ${
              activePane === 'notifications'
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700'
            }`}
          >
            Notification Center
          </button>
        </div>
      </div>
    </div>
  );
}
