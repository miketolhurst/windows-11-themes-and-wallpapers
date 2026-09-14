'use client';

import React, { useRef } from 'react';
import {
  useThemeStore,
  StartButtonType,
  StartButtonPresetId,
  RunningIndicatorStyle,
} from '../store/useThemeStore';
import { START_BUTTON_PRESETS, renderStartButtonSvg } from '../lib/startButtonVectors';
import { ColorPickerPopover } from './ColorPickerPopover';

export function StartButtonAndIndicatorsSection(): React.JSX.Element {
  const {
    startButton,
    setStartButton,
    runningIndicator,
    setRunningIndicator,
    accentColor,
    secondaryAccent,
  } = useThemeStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleStartButtonTypeChange = (type: StartButtonType) => {
    setStartButton({ type });
  };

  const handleCustomIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setStartButton({
        type: 'custom',
        customIconUrl: dataUrl,
      });
    };
    reader.readAsDataURL(file);
  };

  const resolvedStartIconColor =
    startButton.colorMode === 'secondary'
      ? secondaryAccent
      : startButton.colorMode === 'custom'
      ? startButton.customColor
      : accentColor;

  return (
    <div className="border border-neutral-800 rounded-xl bg-neutral-900/40 p-3">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-semibold uppercase text-neutral-300">
          Start Button & Indicators
        </label>
      </div>

      {/* Start Button Section */}
      <div className="flex flex-col gap-2.5 pb-3 border-b border-neutral-800/80">
        <span className="text-[11px] font-medium text-neutral-400">Start Button Icon</span>

        {/* Start Button Mode Buttons */}
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => handleStartButtonTypeChange('default')}
            className={`py-1.5 px-2 rounded text-xs font-medium border transition-colors cursor-pointer text-center ${
              startButton.type === 'default'
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
            }`}
          >
            Windows Default
          </button>
          <button
            type="button"
            onClick={() => handleStartButtonTypeChange('preset')}
            className={`py-1.5 px-2 rounded text-xs font-medium border transition-colors cursor-pointer text-center ${
              startButton.type === 'preset'
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
            }`}
          >
            Vector Presets
          </button>
          <button
            type="button"
            onClick={() => {
              handleStartButtonTypeChange('custom');
              fileInputRef.current?.click();
            }}
            className={`py-1.5 px-2 rounded text-xs font-medium border transition-colors cursor-pointer text-center truncate ${
              startButton.type === 'custom'
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
            }`}
          >
            Upload Custom
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleCustomIconUpload}
            className="hidden"
            aria-label="Upload Custom Start Icon File"
          />
        </div>

        {/* Vector Presets Dropdown */}
        {startButton.type === 'preset' && (
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0">
                {renderStartButtonSvg(
                  startButton.presetId || 'win11-minimal',
                  resolvedStartIconColor,
                  20
                )}
              </div>
              <select
                aria-label="Start Button Vector Preset"
                value={startButton.presetId || 'win11-minimal'}
                onChange={(e) =>
                  setStartButton({
                    type: 'preset',
                    presetId: e.target.value as StartButtonPresetId,
                  })
                }
                className="flex-1 bg-neutral-800 px-2.5 py-1.5 rounded text-xs text-white border border-neutral-700 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {START_BUTTON_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Icon Color Mode */}
            <div className="flex flex-col gap-1.5 mt-1">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400">
                Icon Color Mode
              </span>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  aria-label="Start Icon Primary Accent"
                  onClick={() => setStartButton({ colorMode: 'accent' })}
                  className={`py-1 px-1.5 rounded text-[11px] font-medium border transition-colors cursor-pointer text-center ${
                    startButton.colorMode === 'accent'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
                  }`}
                >
                  Primary Accent
                </button>
                <button
                  type="button"
                  aria-label="Start Icon Secondary Accent"
                  onClick={() => setStartButton({ colorMode: 'secondary' })}
                  className={`py-1 px-1.5 rounded text-[11px] font-medium border transition-colors cursor-pointer text-center ${
                    startButton.colorMode === 'secondary'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
                  }`}
                >
                  Secondary Accent
                </button>
                <button
                  type="button"
                  aria-label="Start Icon Custom HEX"
                  onClick={() => setStartButton({ colorMode: 'custom' })}
                  className={`py-1 px-1.5 rounded text-[11px] font-medium border transition-colors cursor-pointer text-center ${
                    startButton.colorMode === 'custom'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
                  }`}
                >
                  Custom HEX
                </button>
              </div>

              {startButton.colorMode === 'custom' && (
                <div className="pt-1">
                  <ColorPickerPopover
                    label="Start Icon Custom Color"
                    color={startButton.customColor || '#0078D4'}
                    onChange={(hex) => setStartButton({ customColor: hex })}
                  />
                </div>
              )}
            </div>

            {/* Size Slider */}
            <div className="mt-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Icon Size</span>
                <span className="text-blue-400 font-mono">{startButton.size}px</span>
              </div>
              <input
                type="range"
                min="16"
                max="32"
                aria-label="Start Button Size"
                value={startButton.size}
                onChange={(e) => setStartButton({ size: Number(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Running App Indicators Section */}
      <div className="flex flex-col gap-2.5 pt-3">
        <span className="text-[11px] font-medium text-neutral-400">Running App Indicators</span>

        {/* Indicator Style Pills */}
        <div className="grid grid-cols-5 gap-1">
          {(['line', 'dot', 'pill', 'glow', 'off'] as RunningIndicatorStyle[]).map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setRunningIndicator({ style })}
              className={`py-1 px-1 rounded text-[11px] font-medium border transition-colors cursor-pointer text-center capitalize ${
                runningIndicator.style === style
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
              }`}
            >
              {style}
            </button>
          ))}
        </div>

        {runningIndicator.style !== 'off' && (
          <div className="flex flex-col gap-2 pt-1">
            {/* Active Indicator Color */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400">
                Active App Color
              </span>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  aria-label="Active Indicator Accent"
                  onClick={() => setRunningIndicator({ activeColorMode: 'accent' })}
                  className={`py-1 px-1.5 rounded text-[11px] font-medium border transition-colors cursor-pointer text-center ${
                    runningIndicator.activeColorMode === 'accent'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
                  }`}
                >
                  Accent
                </button>
                <button
                  type="button"
                  aria-label="Active Indicator White"
                  onClick={() => setRunningIndicator({ activeColorMode: 'white' })}
                  className={`py-1 px-1.5 rounded text-[11px] font-medium border transition-colors cursor-pointer text-center ${
                    runningIndicator.activeColorMode === 'white'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
                  }`}
                >
                  White Active
                </button>
                <button
                  type="button"
                  aria-label="Active Indicator Custom HEX"
                  onClick={() => setRunningIndicator({ activeColorMode: 'custom' })}
                  className={`py-1 px-1.5 rounded text-[11px] font-medium border transition-colors cursor-pointer text-center ${
                    runningIndicator.activeColorMode === 'custom'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
                  }`}
                >
                  Custom HEX
                </button>
              </div>
              {runningIndicator.activeColorMode === 'custom' && (
                <div className="pt-1">
                  <ColorPickerPopover
                    label="Active Indicator Color"
                    color={runningIndicator.activeCustomColor || '#0078D4'}
                    onChange={(hex) => setRunningIndicator({ activeCustomColor: hex })}
                  />
                </div>
              )}
            </div>

            {/* Inactive Indicator Color */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400">
                Inactive App Color
              </span>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  aria-label="Inactive Indicator Subtle White"
                  onClick={() => setRunningIndicator({ inactiveColorMode: 'subtle-white' })}
                  className={`py-1 px-1.5 rounded text-[11px] font-medium border transition-colors cursor-pointer text-center ${
                    runningIndicator.inactiveColorMode === 'subtle-white'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
                  }`}
                >
                  Subtle White
                </button>
                <button
                  type="button"
                  aria-label="Inactive Indicator Accent"
                  onClick={() => setRunningIndicator({ inactiveColorMode: 'accent' })}
                  className={`py-1 px-1.5 rounded text-[11px] font-medium border transition-colors cursor-pointer text-center ${
                    runningIndicator.inactiveColorMode === 'accent'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
                  }`}
                >
                  Accent
                </button>
                <button
                  type="button"
                  aria-label="Inactive Indicator Custom HEX"
                  onClick={() => setRunningIndicator({ inactiveColorMode: 'custom' })}
                  className={`py-1 px-1.5 rounded text-[11px] font-medium border transition-colors cursor-pointer text-center ${
                    runningIndicator.inactiveColorMode === 'custom'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
                  }`}
                >
                  Custom HEX
                </button>
              </div>
              {runningIndicator.inactiveColorMode === 'custom' && (
                <div className="pt-1">
                  <ColorPickerPopover
                    label="Inactive Indicator Color"
                    color={runningIndicator.inactiveCustomColor || '#808080'}
                    onChange={(hex) => setRunningIndicator({ inactiveCustomColor: hex })}
                  />
                </div>
              )}
            </div>

            {/* Thickness Slider */}
            <div className="mt-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Indicator Thickness</span>
                <span className="text-blue-400 font-mono">{runningIndicator.indicatorSize}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                aria-label="Running Indicator Thickness"
                value={runningIndicator.indicatorSize}
                onChange={(e) => setRunningIndicator({ indicatorSize: Number(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
