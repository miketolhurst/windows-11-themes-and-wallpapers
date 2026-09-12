'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { hexToRgb, rgbToHex } from '../lib/paletteEngine';

function PipetteIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m2 22 1-1h3l9-9" />
      <path d="M3 21v-3l9-9" />
      <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return [h, s, v];
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

const DEFAULT_QUICK_SWATCHES = [
  '#0078D4',
  '#005A9E',
  '#FF007F',
  '#00F3FF',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#3B82F6',
  '#6366F1',
];

export interface ColorPickerPopoverProps {
  value: string;
  onChange: (hex: string) => void;
  label?: string;
  quickSwatches?: string[];
  id?: string;
}

export const ColorPickerPopover: React.FC<ColorPickerPopoverProps> = ({
  value,
  onChange,
  label = 'Color',
  quickSwatches = DEFAULT_QUICK_SWATCHES,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const spectrumRef = useRef<HTMLDivElement>(null);
  const isDraggingSpectrum = useRef(false);

  // Normalize initial HSV
  const initRgb = hexToRgb(value || '#0078D4');
  const [initH, initS, initV] = rgbToHsv(initRgb[0], initRgb[1], initRgb[2]);
  const [hsv, setHsv] = useState<[number, number, number]>([initH, initS, initV]);

  // Sync external value changes
  useEffect(() => {
    if (value) {
      setHexInput(value);
      try {
        const rgb = hexToRgb(value);
        const [h, s, v] = rgbToHsv(rgb[0], rgb[1], rgb[2]);
        setHsv([h, s, v]);
      } catch {
        // Ignore invalid
      }
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const commitHex = useCallback(
    (newHex: string) => {
      let clean = newHex.trim();
      if (!clean.startsWith('#')) {
        clean = '#' + clean;
      }
      if (/^#[0-9A-Fa-f]{6}$/.test(clean)) {
        const formatted = clean.toUpperCase();
        setHexInput(formatted);
        onChange(formatted);
        const rgb = hexToRgb(formatted);
        const [h, s, v] = rgbToHsv(rgb[0], rgb[1], rgb[2]);
        setHsv([h, s, v]);
      } else if (/^#[0-9A-Fa-f]{3}$/.test(clean)) {
        const expanded =
          '#' +
          clean[1] +
          clean[1] +
          clean[2] +
          clean[2] +
          clean[3] +
          clean[3];
        const formatted = expanded.toUpperCase();
        setHexInput(formatted);
        onChange(formatted);
        const rgb = hexToRgb(formatted);
        const [h, s, v] = rgbToHsv(rgb[0], rgb[1], rgb[2]);
        setHsv([h, s, v]);
      }
    },
    [onChange]
  );

  const updateFromHsv = useCallback(
    (h: number, s: number, v: number) => {
      setHsv([h, s, v]);
      const rgb = hsvToRgb(h, s, v);
      const hex = rgbToHex(rgb).toUpperCase();
      setHexInput(hex);
      onChange(hex);
    },
    [onChange]
  );

  const handleSpectrumMove = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (!spectrumRef.current) return;
      const rect = spectrumRef.current.getBoundingClientRect();
      const clientX = 'clientX' in e ? e.clientX : 0;
      const clientY = 'clientY' in e ? e.clientY : 0;
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      const newS = x;
      const newV = 1 - y;
      updateFromHsv(hsv[0], newS, newV);
    },
    [hsv, updateFromHsv]
  );

  const handleSpectrumMouseDown = (e: React.MouseEvent) => {
    isDraggingSpectrum.current = true;
    handleSpectrumMove(e);

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (isDraggingSpectrum.current) {
        handleSpectrumMove(moveEvent);
      }
    };

    const onMouseUp = () => {
      isDraggingSpectrum.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newH = Number(e.target.value);
    updateFromHsv(newH, hsv[1], hsv[2]);
  };

  const handleEyeDropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        const dropper = new (window as unknown as { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper();
        const res = await dropper.open();
        if (res?.sRGBHex) {
          commitHex(res.sRGBHex);
        }
      } catch {
        // User cancelled or unsupported
      }
    }
  };

  const hasEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;

  return (
    <div ref={containerRef} className="relative inline-block w-full">
      {/* Visual Trigger Bar */}
      <div className="flex items-center gap-2 bg-neutral-800 p-1.5 rounded border border-neutral-700 hover:border-neutral-600 transition-colors">
        <button
          type="button"
          id={id}
          aria-label="Open color picker"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-7 h-7 rounded-md cursor-pointer border border-white/20 shadow-xs shrink-0 transition-transform active:scale-95 focus:outline-none focus:ring-1 focus:ring-blue-500"
          style={{ backgroundColor: value }}
          title={`Click to edit ${label}`}
        />
        <input
          type="text"
          aria-label={label}
          value={hexInput}
          onChange={(e) => {
            setHexInput(e.target.value);
            commitHex(e.target.value);
          }}
          onBlur={() => commitHex(hexInput)}
          placeholder="#0078D4"
          maxLength={7}
          className="w-full bg-transparent text-xs font-mono text-neutral-200 uppercase focus:outline-none focus:text-white"
        />
      </div>

      {/* Floating Popout Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={`${label} Color Popout`}
          className="absolute z-50 mt-2 left-0 w-64 p-3 rounded-xl bg-zinc-900/98 backdrop-blur-2xl border border-white/15 shadow-2xl flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-semibold text-neutral-200">{label}</span>
            <button
              type="button"
              aria-label="Close color picker"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <CloseIcon />
            </button>
          </div>

          {/* 2D Saturation / Value Area */}
          <div
            ref={spectrumRef}
            data-testid="color-spectrum"
            onMouseDown={handleSpectrumMouseDown}
            className="w-full h-32 rounded-lg relative cursor-crosshair overflow-hidden select-none border border-white/10"
            style={{
              backgroundColor: `hsl(${hsv[0]}, 100%, 50%)`,
              backgroundImage: `
                linear-gradient(to top, #000, transparent),
                linear-gradient(to right, #fff, transparent)
              `,
            }}
          >
            {/* Reticle Cursor */}
            <div
              className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-[0_0_2px_rgba(0,0,0,0.8)] absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${hsv[1] * 100}%`,
                top: `${(1 - hsv[2]) * 100}%`,
                backgroundColor: value,
              }}
            />
          </div>

          {/* 1D Hue Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-[10px] text-neutral-400">
              <span>Hue</span>
              <span className="font-mono">{Math.round(hsv[0])}°</span>
            </div>
            <input
              type="range"
              aria-label="Hue Slider"
              min={0}
              max={360}
              value={hsv[0]}
              onChange={handleHueChange}
              className="w-full h-3 rounded-md appearance-none cursor-pointer border border-white/10"
              style={{
                background:
                  'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
              }}
            />
          </div>

          {/* Controls: Eyedropper + HEX Only Input */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Pick color from screen"
              onClick={handleEyeDropper}
              disabled={!hasEyeDropper}
              className={`p-2 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                hasEyeDropper
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-white/10 hover:border-white/20'
                  : 'bg-neutral-800/40 text-neutral-600 border-white/5 cursor-not-allowed'
              }`}
              title={hasEyeDropper ? 'EyeDropper Tool (Pick from screen)' : 'EyeDropper not supported in this browser'}
            >
              <PipetteIcon />
            </button>

            <div className="flex-1 flex items-center bg-neutral-800/90 border border-white/10 focus-within:border-blue-500 rounded-lg px-2.5 py-1.5">
              <span className="text-xs font-mono text-neutral-500 mr-1 select-none">#</span>
              <input
                type="text"
                aria-label="HEX code input"
                value={hexInput.replace(/^#/, '')}
                onChange={(e) => {
                  const val = '#' + e.target.value;
                  setHexInput(val);
                  commitHex(val);
                }}
                onBlur={() => commitHex(hexInput)}
                placeholder="0078D4"
                maxLength={6}
                className="w-full bg-transparent text-xs font-mono text-white uppercase focus:outline-none"
              />
            </div>

            <button
              type="button"
              aria-label="Apply color"
              onClick={() => setIsOpen(false)}
              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg flex items-center justify-center transition-colors cursor-pointer"
              title="Confirm and close"
            >
              <CheckIcon />
            </button>
          </div>

          {/* Quick Swatches */}
          {quickSwatches && quickSwatches.length > 0 && (
            <div className="pt-2 border-t border-white/10 flex flex-col gap-1.5">
              <span className="text-[10px] text-neutral-400 font-medium">Quick Presets</span>
              <div className="flex flex-wrap gap-1.5">
                {quickSwatches.map((swatch, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => commitHex(swatch)}
                    className={`w-5 h-5 rounded-md border transition-transform hover:scale-110 cursor-pointer ${
                      value.toLowerCase() === swatch.toLowerCase()
                        ? 'border-white ring-1 ring-blue-400'
                        : 'border-white/15'
                    }`}
                    style={{ backgroundColor: swatch }}
                    title={swatch}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ColorPickerPopover;
