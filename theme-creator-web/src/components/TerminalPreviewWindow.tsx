import React, { useState } from 'react';
import { useThemeStore } from '../store/useThemeStore';
import { hexToRgb } from '../lib/paletteEngine';

export interface TerminalPreviewWindowProps {
  onClose?: () => void;
}

export function TerminalPreviewWindow({ onClose }: TerminalPreviewWindowProps): React.JSX.Element {
  const {
    typography,
    accentColor,
    cornerRadius,
    borderThickness,
  } = useThemeStore();

  const [activeTab, setActiveTab] = useState<'powershell' | 'cmd'>('powershell');
  const rgb = hexToRgb(accentColor);

  const termFont = typography?.fontFamily
    ? `${typography.fontFamily}, "Cascadia Code", Consolas, monospace`
    : '"Cascadia Code", Consolas, "Courier New", monospace';
  const termWeight = typography?.fontWeight ?? '400';
  const termSpacing = typography?.characterSpacing ? `${typography.characterSpacing}px` : '0px';

  return (
    <div
      data-testid="terminal-window"
      className="w-[640px] h-[390px] flex flex-col shadow-2xl overflow-hidden pointer-events-auto transition-all select-none text-neutral-100"
      style={{
        background: 'rgba(12, 12, 16, 0.92)',
        backdropFilter: 'blur(30px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(30px) saturate(1.2)',
        borderRadius: `${cornerRadius}px`,
        border: borderThickness > 0 ? `${borderThickness}px solid ${accentColor}66` : `1px solid ${accentColor}33`,
        boxShadow: `0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 24px ${accentColor}22`,
      }}
    >
      {/* Title Bar & Terminal Tabs */}
      <div
        className="h-10 px-2 flex items-center justify-between border-b"
        style={{
          borderColor: `${accentColor}25`,
          background: 'rgba(20, 20, 26, 0.85)',
        }}
      >
        <div className="flex items-center gap-1 text-xs h-full pt-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('powershell')}
            className={`px-3 py-1 rounded-t-md flex items-center gap-2 font-medium transition-all cursor-pointer ${
              activeTab === 'powershell'
                ? 'bg-[#0c0c10] text-white border-t-2'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
            style={{
              borderTopColor: activeTab === 'powershell' ? accentColor : 'transparent',
            }}
          >
            <span className="text-xs">⚡</span>
            <span>PowerShell</span>
            <span className="text-[10px] opacity-60 ml-1">✕</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cmd')}
            className={`px-3 py-1 rounded-t-md flex items-center gap-2 font-medium transition-all cursor-pointer ${
              activeTab === 'cmd'
                ? 'bg-[#0c0c10] text-white border-t-2'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
            style={{
              borderTopColor: activeTab === 'cmd' ? accentColor : 'transparent',
            }}
          >
            <span className="text-xs">⌨️</span>
            <span>Command Prompt</span>
            <span className="text-[10px] opacity-60 ml-1">✕</span>
          </button>

          <button
            type="button"
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-xs opacity-70 cursor-pointer text-neutral-300"
            title="New tab"
          >
            +
          </button>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-1 text-xs text-neutral-300">
          <span className="p-1.5 hover:bg-white/10 rounded cursor-pointer">─</span>
          <span className="p-1.5 hover:bg-white/10 rounded cursor-pointer">□</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-red-600 hover:text-white rounded cursor-pointer"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Terminal Console Body */}
      <div
        data-testid="terminal-body"
        className="flex-1 p-4 font-mono text-xs overflow-y-auto leading-relaxed text-neutral-200"
        style={{
          fontFamily: termFont,
          fontWeight: termWeight,
          letterSpacing: termSpacing,
        }}
      >
        <p className="text-neutral-400 mb-1">
          Windows PowerShell
        </p>
        <p className="text-neutral-500 mb-3">
          Copyright (C) Microsoft Corporation. All rights reserved.
        </p>
        <p className="text-neutral-400 mb-3">
          Install the latest PowerShell for new features and improvements! https://aka.ms/PSWindows
        </p>

        <div className="flex items-center gap-1 mt-3">
          <span style={{ color: accentColor }}>PS C:\Users\Windows11&gt;</span>
          <span className="text-neutral-100">Get-WindhawkTheme -Status Active</span>
        </div>

        <div className="mt-2 text-[11px] text-neutral-400 bg-black/40 p-2.5 rounded border border-white/5 flex flex-col gap-1">
          <div className="flex justify-between">
            <span>Name:</span>
            <span className="text-neutral-200 font-semibold">Custom Windows 11 Fluent Theme</span>
          </div>
          <div className="flex justify-between">
            <span>Accent:</span>
            <span className="font-mono" style={{ color: accentColor }}>{accentColor}</span>
          </div>
          <div className="flex justify-between">
            <span>Target Engine:</span>
            <span className="text-emerald-400">Windhawk WinUI 3 Styler</span>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-4">
          <span style={{ color: accentColor }}>PS C:\Users\Windows11&gt;</span>
          <span
            className="inline-block w-2 h-4 animate-pulse ml-0.5"
            style={{ backgroundColor: accentColor }}
          />
        </div>
      </div>
    </div>
  );
}

export default TerminalPreviewWindow;
