import React, { useState, useEffect, useRef } from 'react';
import { GradientConfig, GradientStop } from '../store/useThemeStore';

export interface GradientEditorModalProps {
  isOpen: boolean;
  title: string;
  initialGradient: GradientConfig;
  onSave: (config: GradientConfig) => void;
  onClose: () => void;
}

interface GradientPreset {
  name: string;
  description: string;
  type: 'linear' | 'radial';
  angle: number;
  stops: { color: string; offset: number }[];
}

const PRESETS: GradientPreset[] = [
  {
    name: 'Sunset Glow',
    description: 'Coral -> Amber -> Deep Violet',
    type: 'linear',
    angle: 90,
    stops: [
      { color: '#FF6B6B', offset: 0 },
      { color: '#FFA94D', offset: 50 },
      { color: '#7048E8', offset: 100 },
    ],
  },
  {
    name: 'Cyber Horizon',
    description: 'Electric Cyan -> Magenta -> Dark Navy',
    type: 'linear',
    angle: 90,
    stops: [
      { color: '#00E5FF', offset: 0 },
      { color: '#F72585', offset: 50 },
      { color: '#0A1128', offset: 100 },
    ],
  },
  {
    name: 'Deep Nebula',
    description: 'Indigo -> Purple -> Pitch Black',
    type: 'linear',
    angle: 135,
    stops: [
      { color: '#4C1D95', offset: 0 },
      { color: '#7C3AED', offset: 50 },
      { color: '#05050A', offset: 100 },
    ],
  },
  {
    name: 'Aurora Borealis',
    description: 'Emerald Teal -> Mint -> Sky Blue',
    type: 'linear',
    angle: 90,
    stops: [
      { color: '#059669', offset: 0 },
      { color: '#10B981', offset: 50 },
      { color: '#38BDF8', offset: 100 },
    ],
  },
  {
    name: 'Subtle Fluent Sheen',
    description: 'Translucent Pearl -> Light Slate',
    type: 'linear',
    angle: 180,
    stops: [
      { color: '#F1F5F9', offset: 0 },
      { color: '#94A3B8', offset: 100 },
    ],
  },
];

const QUICK_ANGLES = [0, 45, 90, 135, 180, 270];

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function Trash2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

function RotateCwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

export function GradientEditorModal({
  isOpen,
  title,
  initialGradient,
  onSave,
  onClose,
}: GradientEditorModalProps): React.JSX.Element | null {
  const [type, setType] = useState<'linear' | 'radial'>(initialGradient?.type || 'linear');
  const [angle, setAngle] = useState<number>(initialGradient?.angle ?? 90);
  const [stops, setStops] = useState<GradientStop[]>(
    initialGradient?.stops && initialGradient.stops.length > 0
      ? initialGradient.stops.map((s) => ({ ...s }))
      : [
          { id: 'stop-1', color: '#0078D4', offset: 0 },
          { id: 'stop-2', color: '#8B5CF6', offset: 100 },
        ]
  );
  const [selectedStopId, setSelectedStopId] = useState<string>(
    initialGradient?.stops && initialGradient.stops.length > 0 ? initialGradient.stops[0].id : 'stop-1'
  );

  const trackRef = useRef<HTMLDivElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && initialGradient) {
      setType(initialGradient.type || 'linear');
      setAngle(initialGradient.angle ?? 90);
      const nextStops =
        initialGradient.stops && initialGradient.stops.length > 0
          ? initialGradient.stops.map((s) => ({ ...s }))
          : [
              { id: 'stop-1', color: '#0078D4', offset: 0 },
              { id: 'stop-2', color: '#8B5CF6', offset: 100 },
            ];
      setStops(nextStops);
      setSelectedStopId(nextStops[0].id);
    }
  }, [isOpen, initialGradient]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sortedStops = [...stops].sort((a, b) => a.offset - b.offset);
  const cssStops = sortedStops.map((s) => `${s.color} ${s.offset}%`).join(', ');
  const previewGradientCss =
    type === 'linear'
      ? `linear-gradient(${angle}deg, ${cssStops})`
      : `radial-gradient(circle at center, ${cssStops})`;
  const trackGradientCss = `linear-gradient(to right, ${cssStops})`;

  const selectedStop = stops.find((s) => s.id === selectedStopId) || stops[0];

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const newId = `stop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const currentColor = selectedStop ? selectedStop.color : '#0078D4';
    const newStop: GradientStop = {
      id: newId,
      color: currentColor,
      offset: pct,
    };
    setStops((prev) => [...prev, newStop]);
    setSelectedStopId(newId);
  };

  const handlePinMouseDown = (e: React.MouseEvent, stopId: string) => {
    e.stopPropagation();
    setSelectedStopId(stopId);
    const trackElem = trackRef.current;
    if (!trackElem) return;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const rect = trackElem.getBoundingClientRect();
      const pct = Math.max(0, Math.min(100, Math.round(((moveEvent.clientX - rect.left) / rect.width) * 100)));
      setStops((prev) => prev.map((s) => (s.id === stopId ? { ...s, offset: pct } : s)));
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handlePinKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, stopId: string) => {
    let delta = 0;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') delta = e.shiftKey ? -5 : -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') delta = e.shiftKey ? 5 : 1;
    if (delta !== 0) {
      e.preventDefault();
      setStops((prev) =>
        prev.map((s) => (s.id === stopId ? { ...s, offset: Math.max(0, Math.min(100, s.offset + delta)) } : s))
      );
    }
  };

  const handleAddStop = () => {
    const newId = `stop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newOffset = Math.min(100, Math.max(0, selectedStop ? Math.min(100, selectedStop.offset + 15) : 50));
    const newStop: GradientStop = {
      id: newId,
      color: selectedStop ? selectedStop.color : '#00E5FF',
      offset: newOffset,
    };
    setStops((prev) => [...prev, newStop]);
    setSelectedStopId(newId);
  };

  const handleDeleteStop = () => {
    if (stops.length <= 2) return;
    const remaining = stops.filter((s) => s.id !== selectedStopId);
    setStops(remaining);
    setSelectedStopId(remaining[0].id);
  };

  const updateSelectedColor = (color: string) => {
    setStops((prev) => prev.map((s) => (s.id === selectedStopId ? { ...s, color } : s)));
  };

  const updateSelectedOffset = (offset: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(offset) ? 0 : offset));
    setStops((prev) => prev.map((s) => (s.id === selectedStopId ? { ...s, offset: clamped } : s)));
  };

  const validPickerColor =
    selectedStop?.color && /^#[0-9A-Fa-f]{6}$/.test(selectedStop.color)
      ? selectedStop.color
      : '#0078D4';

  const handleHexChange = (val: string) => {
    const formatted = val.startsWith('#') ? val : `#${val}`;
    updateSelectedColor(formatted);
  };

  const updateAngleFromPointer = (clientX: number, clientY: number) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const radians = Math.atan2(clientY - centerY, clientX - centerX);
    let deg = Math.round((radians * 180) / Math.PI) + 90;
    if (deg < 0) deg += 360;
    if (deg >= 360) deg -= 360;
    setAngle(deg);
  };

  const handleDialMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    updateAngleFromPointer(e.clientX, e.clientY);
    const handleMouseMove = (moveEvent: MouseEvent) => {
      updateAngleFromPointer(moveEvent.clientX, moveEvent.clientY);
    };
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleApplyPreset = (preset: GradientPreset) => {
    setType(preset.type);
    setAngle(preset.angle);
    const newStops = preset.stops.map((s, idx) => ({
      id: `preset-stop-${idx}-${Date.now()}`,
      color: s.color,
      offset: s.offset,
    }));
    setStops(newStops);
    setSelectedStopId(newStops[0].id);
  };

  const handleSave = () => {
    onSave({
      type,
      angle,
      stops: [...stops].sort((a, b) => a.offset - b.offset),
    });
    onClose();
  };

  return (
    <div
      data-testid="gradient-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="gradient-modal-title"
        className="w-full max-w-2xl bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-7 flex flex-col gap-6 text-white relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <SparklesIcon className="w-5 h-5" />
            </span>
            <h2 id="gradient-modal-title" className="text-lg font-bold text-white tracking-tight">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
            title="Close modal"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Card */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <span>Live Preview</span>
            <span className="font-mono text-zinc-300">
              {type === 'linear' ? `${angle}° Linear` : 'Radial'}
            </span>
          </div>
          <div
            className="h-28 w-full rounded-xl border border-white/15 shadow-inner relative overflow-hidden flex items-end p-4 transition-all duration-300"
            style={{ background: previewGradientCss }}
          >
            <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-white shadow-md">
              Taskbar Sample Content
            </div>
          </div>
        </div>

        {/* Type & Angle Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-zinc-950/60 border border-white/5 p-4 rounded-xl">
          {/* Gradient Type */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Type</label>
            <div className="flex bg-zinc-800/80 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setType('linear')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                  type === 'linear'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Linear
              </button>
              <button
                type="button"
                onClick={() => setType('radial')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                  type === 'radial'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Radial
              </button>
            </div>
          </div>

          {/* Rotary Dial & Angle (Only visible for linear) */}
          {type === 'linear' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Angle</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    aria-label="Angle in degrees"
                    min="0"
                    max="360"
                    value={angle}
                    onChange={(e) => setAngle(Math.max(0, Math.min(360, Number(e.target.value))))}
                    className="w-16 bg-zinc-800 border border-white/10 rounded-lg px-2 py-1 text-xs text-center text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <span className="text-xs text-zinc-400">deg</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Visual Dial */}
                <div
                  ref={dialRef}
                  onMouseDown={handleDialMouseDown}
                  className="w-12 h-12 rounded-full border border-white/20 bg-zinc-800/90 relative flex items-center justify-center cursor-pointer select-none shadow-inner shrink-0 hover:border-blue-400/50 transition-colors"
                  title="Drag or click to adjust angle"
                >
                  <div
                    className="absolute w-full h-0.5 pointer-events-none"
                    style={{
                      transform: `rotate(${angle - 90}deg)`,
                      transformOrigin: 'center center',
                    }}
                  >
                    <div className="w-1/2 h-full bg-blue-400 ml-auto rounded-r-full shadow-[0_0_6px_rgba(96,165,250,0.9)]" />
                  </div>
                  <div className="w-2 h-2 rounded-full bg-white shadow" />
                </div>

                {/* Quick Snap Chips */}
                <div className="flex flex-wrap gap-1 flex-1">
                  {QUICK_ANGLES.map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => setAngle(deg)}
                      className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                        angle === deg
                          ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-semibold'
                          : 'bg-zinc-800/60 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Gradient Track & Pins */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Gradient Stops Track
            </label>
            <span className="text-[11px] text-zinc-500">Click track to add stop</span>
          </div>

          <div className="relative py-4 select-none">
            {/* Horizontal Track */}
            <div
              ref={trackRef}
              onClick={handleTrackClick}
              className="h-7 w-full rounded-lg border border-white/20 shadow-inner cursor-crosshair relative overflow-visible"
              style={{ background: trackGradientCss }}
            >
              {/* Stop Pins */}
              {stops.map((stop, index) => {
                const isSelected = stop.id === selectedStopId;
                return (
                  <div
                    key={stop.id}
                    role="slider"
                    aria-label={`Gradient stop ${index + 1}`}
                    aria-valuenow={stop.offset}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStopId(stop.id);
                    }}
                    onKeyDown={(e) => handlePinKeyDown(e, stop.id)}
                    onMouseDown={(e) => handlePinMouseDown(e, stop.id)}
                    className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center transition-transform shadow-lg ${
                      isSelected
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-125 z-20'
                        : 'border-2 border-white/80 hover:scale-110 z-10'
                    }`}
                    style={{
                      left: `${stop.offset}%`,
                      backgroundColor: stop.color,
                    }}
                    title={`Stop ${index + 1}: ${stop.color} (${stop.offset}%)`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white/70 shadow-sm" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Stop Inspector & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950/60 border border-white/5 p-3.5 rounded-xl">
            <div className="flex flex-wrap items-center gap-3">
              {/* Color picker preview + hex */}
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/20 cursor-pointer shadow-sm">
                  <input
                    type="color"
                    aria-label="Stop color picker"
                    value={validPickerColor}
                    onChange={(e) => updateSelectedColor(e.target.value)}
                    className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer opacity-0"
                  />
                  <div
                    className="w-full h-full"
                    style={{ backgroundColor: selectedStop ? selectedStop.color : '#0078D4' }}
                  />
                </div>
                <input
                  type="text"
                  aria-label="Stop color hex"
                  value={selectedStop ? selectedStop.color : '#0078D4'}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="w-24 bg-zinc-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Offset Position */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-zinc-400">Pos:</span>
                <input
                  type="number"
                  aria-label="Stop position percent"
                  min="0"
                  max="100"
                  value={selectedStop ? selectedStop.offset : 0}
                  onChange={(e) => updateSelectedOffset(Number(e.target.value))}
                  className="w-16 bg-zinc-800 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-center text-white focus:outline-none focus:border-blue-500 font-mono"
                />
                <span className="text-xs text-zinc-400">%</span>
              </div>
            </div>

            {/* Stop Actions (Add / Delete) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddStop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white border border-white/10 transition-colors"
              >
                <PlusIcon className="w-4 h-4 text-blue-400" />
                <span>Add Stop</span>
              </button>

              <button
                type="button"
                aria-label="Delete stop"
                disabled={stops.length <= 2}
                onClick={handleDeleteStop}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  stops.length <= 2
                    ? 'opacity-40 cursor-not-allowed bg-zinc-800/40 border-white/5 text-zinc-500'
                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                }`}
              >
                <Trash2Icon className="w-4 h-4" />
                <span>Delete Stop</span>
              </button>
            </div>
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Presets</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESETS.map((preset) => {
              const presetCssStops = preset.stops.map((s) => `${s.color} ${s.offset}%`).join(', ');
              const bgGradient = `linear-gradient(90deg, ${presetCssStops})`;
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-zinc-950/40 hover:bg-zinc-800/80 border border-white/5 hover:border-white/15 text-left transition-all group"
                >
                  <div
                    className="h-7 w-full rounded-md shadow-sm border border-white/10 group-hover:scale-[1.02] transition-transform"
                    style={{ background: bgGradient }}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {preset.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 truncate">{preset.description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 border border-blue-400/30 transition-all hover:scale-105 active:scale-95"
          >
            <CheckIcon className="w-4 h-4" />
            <span>Apply to Theme</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default GradientEditorModal;
