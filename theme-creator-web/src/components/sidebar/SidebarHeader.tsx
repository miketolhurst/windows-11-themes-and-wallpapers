import React, { useRef, useState, useEffect } from 'react';
import { useThemeStore } from '../../store/useThemeStore';
import { parseRegFile } from '../../lib/regParser';
import { copyShareLink } from '../../lib/urlSharing';

export interface SidebarHeaderProps {
  className?: string;
}

export default function SidebarHeader({ className = '' }: SidebarHeaderProps) {
  const themeName = useThemeStore((s) => s.themeName);
  const setThemeName = useThemeStore((s) => s.setThemeName);
  const canUndo = useThemeStore((s) => s.past.length > 0);
  const canRedo = useThemeStore((s) => s.future.length > 0);
  const undo = useThemeStore((s) => s.undo);
  const redo = useThemeStore((s) => s.redo);
  const applyThemeConfig = useThemeStore((s) => s.applyThemeConfig);
  const resetToDefaults = useThemeStore((s) => s.resetToDefaults);
  const toggleSidebar = useThemeStore((s) => s.toggleSidebar);

  const regInputRef = useRef<HTMLInputElement>(null);
  const [copiedShare, setCopiedShare] = useState(false);

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
    const ok = await copyShareLink(useThemeStore.getState());
    if (ok) {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className={`flex flex-col gap-3 pb-3 border-b border-neutral-800 ${className}`}>
      {/* Brand & Window Controls */}
      <div className="flex flex-col gap-2.5">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <span>🎨</span> Windhawk Studio
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">Windows 11 Theme Generator</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="text-xs px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-300 transition-colors border border-neutral-700 cursor-pointer flex-1 flex items-center justify-center gap-1"
          >
            <span>↩</span>
            <span>Undo</span>
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="text-xs px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-300 transition-colors border border-neutral-700 cursor-pointer flex-1 flex items-center justify-center gap-1"
          >
            <span>↪</span>
            <span>Redo</span>
          </button>
          <button
            onClick={resetToDefaults}
            title="Reset to default settings"
            className="text-xs px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors border border-neutral-700 cursor-pointer flex-1 flex items-center justify-center"
          >
            Reset
          </button>
          <button
            onClick={toggleSidebar}
            title="Collapse sidebar (Full-screen preview)"
            className="text-xs p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors border border-neutral-700 cursor-pointer"
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
    </div>
  );
}
