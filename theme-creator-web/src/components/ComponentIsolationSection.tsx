import React, { useState } from 'react';
import ColorPickerPopover from './ColorPickerPopover';
import {
  useThemeStore,
  MaterialStyle,
  ComponentOverride,
} from '../store/useThemeStore';

export interface ComponentIsolationSectionProps {
  onOpenGradientEditor: (target: 'taskbar' | 'startMenu' | 'flyout') => void;
}

type TabType = 'taskbar' | 'startMenu' | 'flyout';

const MATERIAL_OPTIONS: { id: MaterialStyle; label: string }[] = [
  { id: 'fluent-acrylic', label: 'Acrylic Glass' },
  { id: 'mica', label: 'Mica' },
  { id: 'mica-alt', label: 'Mica Alt' },
  { id: 'pure-black-neon', label: 'OLED Neon' },
  { id: 'matte-slate', label: 'Matte Slate' },
  { id: 'linear-gradient', label: 'Linear Gradient' },
];

function SlidersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="4" x2="4" y1="21" y2="14" />
      <line x1="4" x2="4" y1="10" y2="3" />
      <line x1="12" x2="12" y1="21" y2="12" />
      <line x1="12" x2="12" y1="8" y2="3" />
      <line x1="20" x2="20" y1="21" y2="16" />
      <line x1="20" x2="20" y1="12" y2="3" />
      <line x1="1" x2="7" y1="14" y2="14" />
      <line x1="9" x2="15" y1="8" y2="8" />
      <line x1="17" x2="23" y1="16" y2="16" />
    </svg>
  );
}

function RefreshCcwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 2v6h6" />
      <path d="M21 12A9 9 0 0 0 6 5.3L3 8" />
      <path d="M21 22v-6h-6" />
      <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7" />
    </svg>
  );
}

export function ComponentIsolationSection({
  onOpenGradientEditor,
}: ComponentIsolationSectionProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>('taskbar');

  const {
    taskbarOverride,
    startMenuOverride,
    flyoutOverride,
    setTaskbarOverride,
    setStartMenuOverride,
    setFlyoutOverride,
    materialStyle,
    accentColor,
    taskbarOpacity,
    startMenuOpacity,
    notificationOpacity,
    taskbarBlur,
    startMenuBlur,
    notificationBlur,
  } = useThemeStore();

  const override: ComponentOverride =
    activeTab === 'taskbar'
      ? taskbarOverride
      : activeTab === 'startMenu'
      ? startMenuOverride
      : flyoutOverride;

  const setOverride = (partial: Partial<ComponentOverride>) => {
    if (activeTab === 'taskbar') {
      setTaskbarOverride(partial);
    } else if (activeTab === 'startMenu') {
      setStartMenuOverride(partial);
    } else {
      setFlyoutOverride(partial);
    }
  };

  const globalOpacity =
    activeTab === 'taskbar'
      ? taskbarOpacity
      : activeTab === 'startMenu'
      ? startMenuOpacity
      : notificationOpacity;

  const globalBlur =
    activeTab === 'taskbar'
      ? taskbarBlur
      : activeTab === 'startMenu'
      ? startMenuBlur
      : notificationBlur;

  const currentMaterial: MaterialStyle =
    override.materialStyle ?? materialStyle ?? 'fluent-acrylic';
  const currentColor: string = override.customColor ?? accentColor ?? '#0078D4';
  const currentOpacity: number = override.opacity ?? globalOpacity ?? 97;
  const currentBlur: number = override.blur ?? globalBlur ?? 15;

  const targetLabel =
    activeTab === 'taskbar'
      ? 'Taskbar'
      : activeTab === 'startMenu'
      ? 'Start Menu'
      : 'Flyouts';

  return (
    <div className="flex flex-col gap-3">
      {/* 3-tab Segmented Control */}
      <div className="flex bg-neutral-800/80 p-1 rounded-xl border border-neutral-700/60">
        {[
          { id: 'taskbar', label: 'Taskbar' },
          { id: 'startMenu', label: 'Start Menu' },
          { id: 'flyout', label: 'Flyouts' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-700/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Override Global Toggle */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
        <label htmlFor={`override-toggle-${activeTab}`} className="flex flex-col cursor-pointer select-none">
          <span className="text-xs font-medium text-neutral-200">Override Global Styling</span>
          <span className="text-[10px] text-neutral-400">Custom rules for {targetLabel}</span>
        </label>
        <input
          id={`override-toggle-${activeTab}`}
          aria-label="Override Global Styling"
          type="checkbox"
          checked={Boolean(override.enabled)}
          onChange={(e) => setOverride({ enabled: e.target.checked })}
          className="w-4 h-4 rounded bg-neutral-800 border-neutral-700 text-blue-600 focus:ring-0 cursor-pointer"
        />
      </div>

      {/* Inheriting Badge or Custom Controls */}
      {!override.enabled ? (
        <div className="p-3 rounded-lg bg-neutral-800/30 border border-neutral-700/40 text-center">
          <span className="inline-block px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-medium leading-relaxed">
            Inheriting global material, color, and blur settings.
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 animate-fadeIn">
          {/* Material Finish Selector */}
          <div>
            <span className="text-xs text-neutral-400 block mb-1.5">Material Finish</span>
            <div className="grid grid-cols-2 gap-1.5">
              {MATERIAL_OPTIONS.map((mat) => {
                const isSelected = currentMaterial === mat.id;
                return (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => setOverride({ materialStyle: mat.id })}
                    className={`py-1.5 px-2 rounded text-xs font-medium border transition-colors cursor-pointer text-center ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                        : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                    }`}
                  >
                    {mat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Solid Color Picker */}
          <div>
            <span className="text-xs text-neutral-400 block mb-1.5">Custom Fill Color</span>
            <ColorPickerPopover
              id={`component-color-picker-${activeTab}`}
              label="Component Custom Color"
              value={currentColor}
              onChange={(c) => setOverride({ customColor: c })}
            />
          </div>

          {/* Edit Gradient Button (Only when material is linear-gradient) */}
          {currentMaterial === 'linear-gradient' && (
            <div>
              <button
                type="button"
                onClick={() => onOpenGradientEditor(activeTab)}
                className="w-full py-1.5 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <SlidersIcon className="w-3.5 h-3.5" />
                <span>Edit Gradient</span>
              </button>
            </div>
          )}

          {/* Opacity Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <label htmlFor={`opacity-slider-${activeTab}`} className="text-neutral-300">
                Opacity
              </label>
              <span className="text-blue-400 font-mono">{currentOpacity}%</span>
            </div>
            <input
              id={`opacity-slider-${activeTab}`}
              aria-label="Component Opacity"
              type="range"
              min="0"
              max="100"
              value={currentOpacity}
              onChange={(e) => setOverride({ opacity: parseInt(e.target.value, 10) })}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Blur Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <label htmlFor={`blur-slider-${activeTab}`} className="text-neutral-300">
                Blur Radius
              </label>
              <span className="text-blue-400 font-mono">{currentBlur}px</span>
            </div>
            <input
              id={`blur-slider-${activeTab}`}
              aria-label="Component Blur"
              type="range"
              min="0"
              max="60"
              value={currentBlur}
              onChange={(e) => setOverride({ blur: parseInt(e.target.value, 10) })}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Reset to Global */}
          <div className="pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setOverride({ enabled: false })}
              className="w-full py-1 px-2.5 rounded text-xs text-neutral-400 hover:text-red-400 hover:bg-neutral-800/80 border border-transparent hover:border-neutral-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCcwIcon className="w-3 h-3" />
              <span>Reset to Global</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComponentIsolationSection;
