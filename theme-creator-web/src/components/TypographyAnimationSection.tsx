import React, { useState } from 'react';
import {
  useThemeStore,
  TypographyConfig,
  AnimationConfig,
} from '../store/useThemeStore';

export interface TypographyAnimationSectionProps {
  onTestAnimation?: () => void;
}

const PRESET_FONTS = [
  { id: 'Segoe UI Variable', label: 'Segoe UI Variable (Default)' },
  { id: 'Inter', label: 'Inter' },
  { id: 'JetBrains Mono', label: 'JetBrains Mono' },
  { id: 'Fira Code', label: 'Fira Code' },
  { id: 'Cascadia Code', label: 'Cascadia Code' },
  { id: 'Roboto', label: 'Roboto' },
];

const FONT_WEIGHTS: { value: TypographyConfig['fontWeight']; label: string }[] = [
  { value: '300', label: '300 (Light)' },
  { value: '400', label: '400 (Regular)' },
  { value: '500', label: '500 (Medium)' },
  { value: '600', label: '600 (Semibold)' },
  { value: '700', label: '700 (Bold)' },
];

const SPEED_OPTIONS: {
  speed: AnimationConfig['speed'];
  durationMs: number;
  label: string;
}[] = [
  { speed: 'instant', durationMs: 0, label: 'Instant (0ms)' },
  { speed: 'snappy', durationMs: 150, label: 'Snappy (150ms)' },
  { speed: 'default', durationMs: 250, label: 'Default (250ms)' },
  { speed: 'smooth', durationMs: 400, label: 'Smooth (400ms)' },
];

const EASING_OPTIONS: {
  easing: AnimationConfig['easing'];
  label: string;
}[] = [
  { easing: 'fluent-spring', label: 'Fluent Spring' },
  { easing: 'decelerate', label: 'Decelerate' },
  { easing: 'linear', label: 'Linear' },
];

function TypeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  );
}

function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

export function TypographyAnimationSection({
  onTestAnimation,
}: TypographyAnimationSectionProps): React.JSX.Element {
  const { typography, setTypography, animations, setAnimations } = useThemeStore();

  const isPresetFont = PRESET_FONTS.some((f) => f.id === typography.fontFamily);
  const [isCustomMode, setIsCustomMode] = useState(!isPresetFont);

  const selectedDropdownValue = isCustomMode ? 'custom' : typography.fontFamily;

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'custom') {
      setIsCustomMode(true);
    } else {
      setIsCustomMode(false);
      setTypography({ fontFamily: val });
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTypography({ fontFamily: e.target.value });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Typography Subsection */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1.5 text-neutral-300">
          <TypeIcon className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Typography
          </span>
        </div>

        {/* Font Family Dropdown */}
        <div>
          <label htmlFor="font-family-select" className="text-xs text-neutral-400 block mb-1">
            Font Family
          </label>
          <select
            id="font-family-select"
            aria-label="Font Family"
            value={selectedDropdownValue}
            onChange={handleDropdownChange}
            className="w-full bg-neutral-800 px-2.5 py-1.5 rounded text-xs text-white border border-neutral-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {PRESET_FONTS.map((font) => (
              <option key={font.id} value={font.id}>
                {font.label}
              </option>
            ))}
            <option value="custom">Custom...</option>
          </select>
        </div>

        {/* Custom Font Text Input */}
        {isCustomMode && (
          <div className="animate-fadeIn">
            <label htmlFor="custom-font-input" className="text-xs text-neutral-400 block mb-1">
              Custom Font Name
            </label>
            <input
              id="custom-font-input"
              aria-label="Custom Font Family"
              type="text"
              placeholder="e.g. Cascadia Code, Comic Sans..."
              value={typography.fontFamily}
              onChange={handleCustomInputChange}
              className="w-full bg-neutral-800 px-2.5 py-1.5 rounded text-xs text-white border border-neutral-700 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* Font Weight Pills */}
        <div>
          <span className="text-xs text-neutral-400 block mb-1.5">Font Weight</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {FONT_WEIGHTS.map((weight) => {
              const isSelected = typography.fontWeight === weight.value;
              return (
                <button
                  key={weight.value}
                  type="button"
                  onClick={() => setTypography({ fontWeight: weight.value })}
                  className={`py-1 px-1.5 rounded text-[11px] font-medium border transition-colors cursor-pointer text-center ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  {weight.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Character Spacing Slider */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <label htmlFor="character-spacing-slider" className="text-neutral-300">
              Character Spacing
            </label>
            <span className="text-blue-400 font-mono">
              {typography.characterSpacing > 0 ? `+${typography.characterSpacing}` : typography.characterSpacing}
            </span>
          </div>
          <input
            id="character-spacing-slider"
            aria-label="Character Spacing"
            type="range"
            min="-50"
            max="100"
            value={typography.characterSpacing}
            onChange={(e) => setTypography({ characterSpacing: parseInt(e.target.value, 10) })}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Animation Subsection */}
      <div className="pt-3 border-t border-neutral-800 flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Animation Dynamics
        </span>

        {/* Speed Pills */}
        <div>
          <span className="text-xs text-neutral-400 block mb-1.5">Animation Speed</span>
          <div className="grid grid-cols-2 gap-1.5">
            {SPEED_OPTIONS.map((opt) => {
              const isSelected = animations.speed === opt.speed;
              return (
                <button
                  key={opt.speed}
                  type="button"
                  onClick={() =>
                    setAnimations({
                      speed: opt.speed,
                      durationMs: opt.durationMs,
                    })
                  }
                  className={`py-1.5 px-2 rounded text-[11px] font-medium border transition-colors cursor-pointer text-center ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Easing Curve Pills */}
        <div>
          <span className="text-xs text-neutral-400 block mb-1.5">Easing Curve</span>
          <div className="grid grid-cols-3 gap-1.5">
            {EASING_OPTIONS.map((opt) => {
              const isSelected = animations.easing === opt.easing;
              return (
                <button
                  key={opt.easing}
                  type="button"
                  onClick={() => setAnimations({ easing: opt.easing })}
                  className={`py-1.5 px-1.5 rounded text-[11px] font-medium border transition-colors cursor-pointer text-center ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview Flyout Animation Button */}
        <div>
          <button
            type="button"
            onClick={onTestAnimation}
            className="w-full py-2 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-98"
          >
            <PlayIcon className="w-3.5 h-3.5" />
            <span>Preview Flyout Animation</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TypographyAnimationSection;
