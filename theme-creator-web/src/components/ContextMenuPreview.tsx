import React from 'react';
import { useThemeStore } from '../store/useThemeStore';
import { hexToRgb } from '../lib/paletteEngine';

export interface ContextMenuPreviewProps {
  x?: number;
  y?: number;
  onClose?: () => void;
  isFloating?: boolean;
}

export function ContextMenuPreview({
  x,
  y,
  onClose,
  isFloating = false,
}: ContextMenuPreviewProps): React.JSX.Element {
  const {
    contextMenuOverride,
    accentColor,
    isLightMode,
    cornerRadius,
    borderThickness,
  } = useThemeStore();

  const isClassic = Boolean(contextMenuOverride?.enableClassicMenu);
  const isOverridden = Boolean(contextMenuOverride?.enabled);
  const itemHoverAccent = contextMenuOverride?.itemHoverAccent ?? true;

  const mat = isOverridden ? contextMenuOverride.materialStyle ?? 'fluent-acrylic' : 'fluent-acrylic';
  const op = isOverridden && contextMenuOverride.opacity !== undefined ? contextMenuOverride.opacity / 100 : 0.95;
  const blur = isOverridden && contextMenuOverride.blur !== undefined ? contextMenuOverride.blur : 20;
  const radius = isOverridden && contextMenuOverride.cornerRadius !== undefined ? contextMenuOverride.cornerRadius : Math.max(8, cornerRadius);
  const border = isOverridden && contextMenuOverride.borderThickness !== undefined ? contextMenuOverride.borderThickness : Math.max(1, borderThickness);

  const rgb = hexToRgb(accentColor);
  const textColor = isLightMode ? 'text-neutral-800' : 'text-neutral-100';
  const subTextColor = isLightMode ? 'text-neutral-500' : 'text-neutral-400';

  // Backdrop / Surface
  let bg = isLightMode ? `rgba(255, 255, 255, ${op})` : `rgba(32, 32, 36, ${op})`;
  let backdropFilter = `blur(${blur}px)`;

  if (mat === 'mica') {
    bg = isLightMode ? `rgba(245, 246, 250, ${Math.min(0.92, op)})` : `rgba(26, 28, 34, ${Math.min(0.92, op)})`;
    backdropFilter = 'blur(40px) saturate(1.2)';
  } else if (mat === 'mica-alt') {
    bg = isLightMode ? `rgba(240, 242, 248, ${Math.min(0.95, op)})` : `rgba(20, 22, 28, ${Math.min(0.95, op)})`;
    backdropFilter = 'blur(45px) saturate(1.1)';
  } else if (mat === 'pure-black-neon') {
    bg = 'rgba(10, 10, 12, 0.98)';
    backdropFilter = 'none';
  } else if (mat === 'matte-slate') {
    bg = isLightMode ? '#f1f5f9' : '#1e293b';
    backdropFilter = 'none';
  }

  const hoverStyle = itemHoverAccent
    ? {
        '--hover-bg': `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.18)`,
        '--hover-color': accentColor,
      } as React.CSSProperties
    : {
        '--hover-bg': isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
        '--hover-color': 'inherit',
      } as React.CSSProperties;

  // Render Classic Menu if enabled
  if (isClassic) {
    return (
      <div
        data-testid="classic-context-menu"
        className="w-56 py-1 shadow-xl text-xs select-none pointer-events-auto border transition-all z-50 animate-fadeIn"
        style={{
          backgroundColor: isLightMode ? '#f0f0f0' : '#2b2b2b',
          borderColor: isLightMode ? '#cccccc' : '#454545',
          color: isLightMode ? '#000000' : '#ffffff',
          borderRadius: '2px',
          boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.35)',
          position: isFloating ? 'relative' : 'absolute',
          top: isFloating ? undefined : y !== undefined ? Math.min(y, 350) : 80,
          left: isFloating ? undefined : x !== undefined ? Math.min(x, 480) : 100,
        }}
      >
        <div className="px-3 py-1.5 flex items-center justify-between hover:bg-blue-600 hover:text-white cursor-pointer">
          <span>View</span>
          <span className="text-[10px]">▶</span>
        </div>
        <div className="px-3 py-1.5 flex items-center justify-between hover:bg-blue-600 hover:text-white cursor-pointer">
          <span>Sort by</span>
          <span className="text-[10px]">▶</span>
        </div>
        <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer">
          <span>Refresh</span>
        </div>
        <div className="my-1 border-t" style={{ borderColor: isLightMode ? '#e0e0e0' : '#3f3f3f' }} />
        <div className="px-3 py-1.5 text-neutral-400 cursor-not-allowed">
          <span>Paste</span>
        </div>
        <div className="px-3 py-1.5 text-neutral-400 cursor-not-allowed">
          <span>Paste shortcut</span>
        </div>
        <div className="my-1 border-t" style={{ borderColor: isLightMode ? '#e0e0e0' : '#3f3f3f' }} />
        <div className="px-3 py-1.5 flex items-center justify-between hover:bg-blue-600 hover:text-white cursor-pointer">
          <span>New</span>
          <span className="text-[10px]">▶</span>
        </div>
        <div className="my-1 border-t" style={{ borderColor: isLightMode ? '#e0e0e0' : '#3f3f3f' }} />
        <div className="px-3 py-1.5 flex items-center gap-2 hover:bg-blue-600 hover:text-white cursor-pointer">
          <span>🖥️</span>
          <span>Display settings</span>
        </div>
        <div className="px-3 py-1.5 flex items-center gap-2 hover:bg-blue-600 hover:text-white cursor-pointer">
          <span>🎨</span>
          <span>Personalize</span>
        </div>
      </div>
    );
  }

  // Modern WinUI 3 Context Menu
  return (
    <div
      data-testid="context-menu-popover"
      className={`w-64 p-1.5 shadow-2xl flex flex-col gap-0.5 text-xs select-none pointer-events-auto transition-all z-50 animate-fadeIn ${textColor}`}
      style={{
        background: bg,
        backdropFilter,
        WebkitBackdropFilter: backdropFilter,
        borderRadius: `${radius}px`,
        border: border > 0 ? `${border}px solid ${accentColor}44` : '1px solid rgba(255,255,255,0.1)',
        boxShadow: `0 16px 36px -10px rgba(0, 0, 0, 0.55), 0 0 16px ${accentColor}20`,
        position: isFloating ? 'relative' : 'absolute',
        top: isFloating ? undefined : y !== undefined ? Math.min(y, 320) : 80,
        left: isFloating ? undefined : x !== undefined ? Math.min(x, 460) : 100,
        ...hoverStyle,
      }}
    >
      {/* Top Quick Actions Bar: Cut, Copy, Rename, Share, Delete */}
      <div className="flex items-center justify-around py-1 px-1 border-b border-white/10 mb-1">
        <button type="button" title="Cut" className="p-1.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer text-sm">✂️</button>
        <button type="button" title="Copy" className="p-1.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer text-sm">📋</button>
        <button type="button" title="Rename" className="p-1.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer text-sm">✏️</button>
        <button type="button" title="Share" className="p-1.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer text-sm">↗️</button>
        <button type="button" title="Delete" className="p-1.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer text-sm">🗑️</button>
      </div>

      {/* Menu items */}
      {[
        { label: 'View', icon: '👁️', hasSubmenu: true },
        { label: 'Sort by', icon: '↕️', hasSubmenu: true },
        { label: 'Refresh', icon: '🔄' },
      ].map((item) => (
        <div
          key={item.label}
          className="px-2.5 py-1.5 rounded-md flex items-center justify-between cursor-pointer transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--hover-color)]"
        >
          <div className="flex items-center gap-2">
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
          {item.hasSubmenu && <span className="text-[11px] opacity-60">›</span>}
        </div>
      ))}

      <div className="my-1 border-t border-white/10" />

      <div className="px-2.5 py-1.5 rounded-md flex items-center gap-2 cursor-pointer transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--hover-color)]">
        <span>⚡</span>
        <span>Open in Terminal</span>
      </div>

      <div className="my-1 border-t border-white/10" />

      <div className="px-2.5 py-1.5 rounded-md flex items-center justify-between cursor-pointer transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--hover-color)]">
        <div className="flex items-center gap-2">
          <span>⚙️</span>
          <span>Show more options</span>
        </div>
        <span className={`text-[10px] ${subTextColor}`}>Shift+F10</span>
      </div>
    </div>
  );
}

export default ContextMenuPreview;
