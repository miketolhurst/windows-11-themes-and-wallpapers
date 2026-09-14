import React from 'react';
import { useThemeStore, MaterialStyle, PreviewViewMode } from '../../store/useThemeStore';
import { StartButtonAndIndicatorsSection } from '../StartButtonAndIndicatorsSection';

export interface ShellSectionProps {
  onOpenGradientModal: (
    target: 'global' | 'taskbar' | 'startMenu' | 'flyout' | 'contextMenu' | 'fileExplorer'
  ) => void;
}

export default function ShellSection({ onOpenGradientModal }: ShellSectionProps) {
  const taskbarMode = useThemeStore((s) => s.taskbarMode);
  const materialStyle = useThemeStore((s) => s.materialStyle);
  const setMaterialStyle = useThemeStore((s) => s.setMaterialStyle);
  const noiseOpacity = useThemeStore((s) => s.noiseOpacity);
  const setNoiseOpacity = useThemeStore((s) => s.setNoiseOpacity);
  const tintSaturation = useThemeStore((s) => s.tintSaturation);
  const setTintSaturation = useThemeStore((s) => s.setTintSaturation);
  const cornerRadius = useThemeStore((s) => s.cornerRadius);
  const setCornerRadius = useThemeStore((s) => s.setCornerRadius);
  const borderThickness = useThemeStore((s) => s.borderThickness);
  const setBorderThickness = useThemeStore((s) => s.setBorderThickness);
  const dockMode = useThemeStore((s) => s.dockMode);
  const setDockMode = useThemeStore((s) => s.setDockMode);
  const dockMargin = useThemeStore((s) => s.dockMargin);
  const setDockMargin = useThemeStore((s) => s.setDockMargin);
  const runningIndicatorStyle = useThemeStore((s) => s.runningIndicatorStyle);
  const setRunningIndicatorStyle = useThemeStore((s) => s.setRunningIndicatorStyle);
  const hideRecommended = useThemeStore((s) => s.hideRecommended);
  const setHideRecommended = useThemeStore((s) => s.setHideRecommended);
  const compactSearch = useThemeStore((s) => s.compactSearch);
  const setCompactSearch = useThemeStore((s) => s.setCompactSearch);
  const dynamicNotificationHeight = useThemeStore((s) => s.dynamicNotificationHeight);
  const setDynamicNotificationHeight = useThemeStore((s) => s.setDynamicNotificationHeight);
  const removeDropShadows = useThemeStore((s) => s.removeDropShadows);
  const setRemoveDropShadows = useThemeStore((s) => s.setRemoveDropShadows);
  const taskbarBlur = useThemeStore((s) => s.taskbarBlur);
  const setTaskbarBlur = useThemeStore((s) => s.setTaskbarBlur);
  const startMenuBlur = useThemeStore((s) => s.startMenuBlur);
  const setStartMenuBlur = useThemeStore((s) => s.setStartMenuBlur);
  const notificationBlur = useThemeStore((s) => s.notificationBlur);
  const setNotificationBlur = useThemeStore((s) => s.setNotificationBlur);
  const taskbarOpacity = useThemeStore((s) => s.taskbarOpacity);
  const setTaskbarOpacity = useThemeStore((s) => s.setTaskbarOpacity);
  const startMenuOpacity = useThemeStore((s) => s.startMenuOpacity);
  const setStartMenuOpacity = useThemeStore((s) => s.setStartMenuOpacity);
  const notificationOpacity = useThemeStore((s) => s.notificationOpacity);
  const setNotificationOpacity = useThemeStore((s) => s.setNotificationOpacity);
  const previewViewMode = useThemeStore((s) => s.previewViewMode);
  const setPreviewViewMode = useThemeStore((s) => s.setPreviewViewMode);
  const activePane = useThemeStore((s) => s.activePane);
  const setActivePane = useThemeStore((s) => s.setActivePane);
  const showDesktopIcons = useThemeStore((s) => s.showDesktopIcons);
  const setShowDesktopIcons = useThemeStore((s) => s.setShowDesktopIcons);
  const showWindowPreview = useThemeStore((s) => s.showWindowPreview);
  const setShowWindowPreview = useThemeStore((s) => s.setShowWindowPreview);

  const activeMaterial =
    materialStyle ?? (taskbarMode === 'gradient' ? 'linear-gradient' : 'fluent-acrylic');

  const materials: { id: MaterialStyle; label: string }[] = [
    { id: 'fluent-acrylic', label: 'Acrylic Glass' },
    { id: 'mica', label: 'Mica' },
    { id: 'mica-alt', label: 'Mica Alt' },
    { id: 'pure-black-neon', label: 'OLED Neon' },
    { id: 'linear-gradient', label: 'Linear Gradient' },
    { id: 'matte-slate', label: 'Matte Slate' },
  ];

  const tweakCheckboxes = [
    { label: 'Hide Recommended Section', checked: hideRecommended, onChange: setHideRecommended },
    { label: 'Compact Search Box', checked: compactSearch, onChange: setCompactSearch },
    { label: 'Dynamic Notification Height', checked: dynamicNotificationHeight, onChange: setDynamicNotificationHeight },
    { label: 'Remove Flyout Drop Shadows', checked: removeDropShadows, onChange: setRemoveDropShadows },
  ];

  const desktopCheckboxes = [
    { label: 'Show Desktop Icons', checked: showDesktopIcons, onChange: setShowDesktopIcons },
    { label: 'Show File Explorer Preview', checked: showWindowPreview, onChange: setShowWindowPreview },
  ];

  const blurSliders = [
    { id: 'taskbarBlur', label: 'Taskbar Blur', value: taskbarBlur, onChange: setTaskbarBlur },
    { id: 'startMenuBlur', label: 'Start Menu Blur', value: startMenuBlur, onChange: setStartMenuBlur },
    { id: 'notificationBlur', label: 'Notification Blur', value: notificationBlur, onChange: setNotificationBlur },
  ];

  const opacitySliders = [
    { id: 'taskbarOpacity', label: 'Taskbar Opacity', value: taskbarOpacity, onChange: setTaskbarOpacity },
    { id: 'startMenuOpacity', label: 'Start Menu Opacity', value: startMenuOpacity, onChange: setStartMenuOpacity },
    { id: 'notificationOpacity', label: 'Flyout Opacity', value: notificationOpacity, onChange: setNotificationOpacity },
  ];

  const previewSurfaces: { id: PreviewViewMode; label: string }[] = [
    { id: 'desktop', label: '🖥️ Desktop' },
    { id: 'file-explorer', label: '📁 File Explorer' },
    { id: 'terminal', label: '💻 Terminal' },
    { id: 'context-menu', label: '📋 Context Menu' },
  ];

  const flyoutPanes = [
    { id: 'start', label: 'Start' },
    { id: 'notifications', label: 'Calendar' },
    { id: 'quicksettings', label: 'Quick' },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      {/* Material Style Selector */}
      <div className="pt-2 border-t border-neutral-800 first:border-t-0 first:pt-0">
        <span className="text-xs text-neutral-400 block mb-1">Material Style</span>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {materials.map((mat) => (
            <button
              key={mat.id}
              onClick={() => setMaterialStyle(mat.id)}
              className={`py-1.5 px-2 rounded text-xs font-medium border transition-colors cursor-pointer ${
                activeMaterial === mat.id
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
              }`}
            >
              {mat.label}
            </button>
          ))}
        </div>

        {activeMaterial === 'linear-gradient' && (
          <div className="mt-2 mb-2">
            <button
              type="button"
              onClick={() => onOpenGradientModal('global')}
              className="w-full py-1.5 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="4" y1="21" y2="14" /><line x1="4" x2="4" y1="10" y2="3" />
                <line x1="12" x2="12" y1="21" y2="12" /><line x1="12" x2="12" y1="8" y2="3" />
                <line x1="20" x2="20" y1="21" y2="16" /><line x1="20" x2="20" y1="12" y2="3" />
                <line x1="1" x2="7" y1="14" y2="14" /><line x1="9" x2="15" y1="8" y2="8" /><line x1="17" x2="23" y1="16" y2="16" />
              </svg>
              <span>Edit Gradient</span>
            </button>
          </div>
        )}

        {activeMaterial === 'fluent-acrylic' && (
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

      {/* Start Button & Indicators */}
      <StartButtonAndIndicatorsSection />

      {/* Layout Tweaks */}
      <div className="pt-2 border-t border-neutral-800">
        <label className="text-xs font-semibold uppercase text-neutral-400 mb-2 block">Layout Tweaks</label>

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
            onChange={(e) => setCornerRadius(parseInt(e.target.value, 10))}
            className="w-full accent-blue-500 cursor-pointer"
            aria-label="Corner Radius"
          />
        </div>

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

        <div className="flex flex-col gap-2">
          {tweakCheckboxes.map((cb) => (
            <label key={cb.label} className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={cb.checked}
                onChange={(e) => cb.onChange(e.target.checked)}
                className="rounded bg-neutral-800 border-neutral-700 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <span>{cb.label}</span>
            </label>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-neutral-800/80 flex flex-col gap-2">
          <span className="text-[11px] font-medium text-neutral-400">Desktop Elements</span>
          {desktopCheckboxes.map((cb) => (
            <label key={cb.label} className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={cb.checked}
                onChange={(e) => cb.onChange(e.target.checked)}
                className="rounded bg-neutral-800 border-neutral-700 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <span>{cb.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Blur & Transparency / Gradient Opacity */}
      <div className="pt-2 border-t border-neutral-800">
        <label className="text-xs font-semibold uppercase text-neutral-400 mb-2 block">
          {taskbarMode === 'gradient' ? 'Gradient Opacity' : 'Blur & Transparency'}
        </label>
        <div className="flex flex-col gap-3">
          {(taskbarMode === 'gradient' ? opacitySliders : blurSliders).map((slider) => (
            <div key={slider.id}>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor={slider.id} className="text-neutral-300">{slider.label}</label>
                <span className="text-blue-400 font-mono">
                  {slider.value}{taskbarMode === 'gradient' ? '%' : 'px'}
                </span>
              </div>
              <input
                id={slider.id}
                aria-label={slider.label}
                type="range"
                min="0"
                max={taskbarMode === 'gradient' ? 100 : 30}
                value={slider.value}
                onChange={(e) => slider.onChange(parseInt(e.target.value, 10))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Preview Surfaces & Windows Switcher */}
      <div className="pt-2 border-t border-neutral-800">
        <label className="text-xs font-semibold uppercase text-neutral-400 mb-2 block">
          Preview Surfaces & Windows
        </label>
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          {previewSurfaces.map((surface) => (
            <button
              key={surface.id}
              type="button"
              onClick={() => setPreviewViewMode(surface.id)}
              className={`py-1.5 px-2 rounded text-[11px] font-medium border transition-colors cursor-pointer text-center ${
                previewViewMode === surface.id
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
              }`}
            >
              {surface.label}
            </button>
          ))}
        </div>
      </div>

      {/* Flyout Preview Mode */}
      <div className="pt-2 border-t border-neutral-800 pb-2">
        <label className="text-xs font-semibold uppercase text-neutral-400 mb-2 block">Flyout Preview Mode</label>
        <div className="grid grid-cols-3 gap-1.5">
          {flyoutPanes.map((pane) => (
            <button
              key={pane.id}
              onClick={() => setActivePane(activePane === pane.id ? null : pane.id)}
              className={`py-1.5 px-2 rounded text-[11px] font-medium border transition-colors cursor-pointer text-center ${
                activePane === pane.id
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
              }`}
            >
              {pane.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
