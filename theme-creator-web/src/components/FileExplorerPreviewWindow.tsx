import React, { useState } from 'react';
import { useThemeStore } from '../store/useThemeStore';
import { hexToRgb } from '../lib/paletteEngine';

export interface FileExplorerPreviewWindowProps {
  onClose?: () => void;
}

export function FileExplorerPreviewWindow({ onClose }: FileExplorerPreviewWindowProps): React.JSX.Element {
  const {
    fileExplorerOverride,
    accentColor,
    isLightMode,
    cornerRadius,
    borderThickness,
    setShowDesktopIcons,
  } = useThemeStore();

  const [activeTabName, setActiveTabName] = useState<'Home' | 'Downloads' | 'Projects'>('Home');

  const isOverridden = Boolean(fileExplorerOverride?.enabled);
  const tabStyle = isOverridden ? fileExplorerOverride.tabStyle : 'integrated';
  const showCommandBarTint = isOverridden ? fileExplorerOverride.showCommandBarTint : false;
  const activeTabColorMode = isOverridden ? fileExplorerOverride.activeTabColorMode : 'accent';
  const mat = isOverridden ? fileExplorerOverride.materialStyle ?? 'mica' : 'mica';
  const op = isOverridden && fileExplorerOverride.opacity !== undefined ? fileExplorerOverride.opacity / 100 : 0.94;
  const blur = isOverridden && fileExplorerOverride.blur !== undefined ? fileExplorerOverride.blur : 25;

  const rgb = hexToRgb(accentColor);
  const textColor = isLightMode ? 'text-neutral-800' : 'text-neutral-100';
  const subTextColor = isLightMode ? 'text-neutral-500' : 'text-neutral-400';

  // Surface background and backdrop filter
  let bg = isLightMode ? `rgba(248, 249, 252, ${op})` : `rgba(24, 25, 30, ${op})`;
  let backdropFilter = `blur(${blur}px)`;

  if (mat === 'mica') {
    bg = isLightMode ? `rgba(245, 247, 251, ${Math.min(0.92, op)})` : `rgba(28, 30, 36, ${Math.min(0.92, op)})`;
    backdropFilter = 'blur(40px) saturate(1.2)';
  } else if (mat === 'mica-alt') {
    bg = isLightMode ? `rgba(240, 242, 247, ${Math.min(0.95, op)})` : `rgba(20, 21, 26, ${Math.min(0.95, op)})`;
    backdropFilter = 'blur(45px) saturate(1.1)';
  } else if (mat === 'pure-black-neon') {
    bg = 'rgba(10, 10, 12, 0.98)';
  }

  // Active tab background style
  const getTabStyle = (tabName: 'Home' | 'Downloads' | 'Projects') => {
    const isActive = activeTabName === tabName;
    if (!isActive) {
      return {
        background: 'transparent',
        color: isLightMode ? '#6b7280' : '#9ca3af',
      };
    }

    if (activeTabColorMode === 'accent') {
      return {
        background: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.22)`,
        color: isLightMode ? '#111827' : '#ffffff',
        borderBottom: tabStyle === 'accent-border' ? `2px solid ${accentColor}` : undefined,
        borderTop: tabStyle === 'accent-border' ? `2px solid ${accentColor}` : undefined,
      };
    }

    // Surface match
    return {
      background: isLightMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(38, 41, 50, 0.85)',
      color: isLightMode ? '#111827' : '#ffffff',
      borderBottom: tabStyle === 'accent-border' ? `2px solid ${accentColor}` : undefined,
      borderTop: tabStyle === 'accent-border' ? `2px solid ${accentColor}` : undefined,
    };
  };

  return (
    <div
      data-testid="file-explorer-window"
      className={`w-[660px] h-[440px] flex flex-col shadow-2xl overflow-hidden pointer-events-auto transition-all select-none ${textColor}`}
      style={{
        background: bg,
        backdropFilter,
        WebkitBackdropFilter: backdropFilter,
        borderRadius: `${cornerRadius}px`,
        border: borderThickness > 0 ? `${borderThickness}px solid ${accentColor}55` : `1px solid ${accentColor}33`,
        boxShadow: `0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 0 20px ${accentColor}18`,
      }}
    >
      {/* Title bar & Tabs */}
      <div
        className="h-10 px-2 flex items-center justify-between border-b"
        style={{ borderColor: `${accentColor}20` }}
      >
        <div className="flex items-center gap-1.5 text-xs h-full pt-1">
          {[
            { id: 'Home', icon: '📁', label: 'Home' },
            { id: 'Downloads', icon: '⬇️', label: 'Downloads' },
            { id: 'Projects', icon: '💻', label: 'Projects' },
          ].map((tab) => {
            const isActive = activeTabName === tab.id;
            const tabClasses =
              tabStyle === 'floating'
                ? `px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all cursor-pointer shadow-xs ${
                    isActive ? 'shadow-sm' : 'hover:bg-white/10'
                  }`
                : tabStyle === 'accent-border'
                ? `px-3.5 py-1.5 flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
                    isActive ? 'font-semibold' : 'hover:bg-white/10'
                  }`
                : `px-3 py-1.5 rounded-t-md flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
                    isActive ? 'border-t-2' : 'hover:bg-white/10'
                  }`;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabName(tab.id as any)}
                className={tabClasses}
                style={{
                  ...getTabStyle(tab.id as any),
                  borderTopColor: tabStyle === 'integrated' && isActive ? accentColor : undefined,
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {isActive && <span className="text-[10px] opacity-60 ml-1">✕</span>}
              </button>
            );
          })}
          <button
            type="button"
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-xs opacity-70 cursor-pointer"
            title="New tab"
          >
            +
          </button>
        </div>

        {/* Window controls */}
        <div className="flex items-center gap-1 text-xs">
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

      {/* Command Bar Ribbon */}
      <div
        data-testid="command-bar-ribbon"
        className="px-3 py-1.5 flex items-center gap-2 border-b text-xs transition-colors"
        style={{
          borderColor: `${accentColor}20`,
          backgroundColor: showCommandBarTint
            ? `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.12)`
            : 'transparent',
        }}
      >
        <button
          type="button"
          className="px-2.5 py-1 rounded flex items-center gap-1.5 font-medium hover:bg-white/10 cursor-pointer"
          style={{ color: accentColor }}
        >
          <span>＋</span>
          <span>New</span>
          <span className="text-[10px] opacity-70">▼</span>
        </button>

        <div className="h-4 w-px bg-neutral-700/50 mx-1" />

        <div className="flex items-center gap-1 text-sm text-neutral-400">
          <button type="button" title="Cut" className="p-1.5 rounded hover:bg-white/10 cursor-pointer">✂️</button>
          <button type="button" title="Copy" className="p-1.5 rounded hover:bg-white/10 cursor-pointer">📋</button>
          <button type="button" title="Rename" className="p-1.5 rounded hover:bg-white/10 cursor-pointer">✏️</button>
          <button type="button" title="Share" className="p-1.5 rounded hover:bg-white/10 cursor-pointer">↗️</button>
          <button type="button" title="Delete" className="p-1.5 rounded hover:bg-white/10 cursor-pointer">🗑️</button>
        </div>

        <div className="h-4 w-px bg-neutral-700/50 mx-1" />

        <div className="flex items-center gap-1 text-xs text-neutral-300">
          <button type="button" className="px-2 py-1 rounded hover:bg-white/10 flex items-center gap-1 cursor-pointer">
            <span>Sort</span>
            <span className="text-[10px] opacity-70">▼</span>
          </button>
          <button type="button" className="px-2 py-1 rounded hover:bg-white/10 flex items-center gap-1 cursor-pointer">
            <span>View</span>
            <span className="text-[10px] opacity-70">▼</span>
          </button>
        </div>
      </div>

      {/* Address Bar & Search */}
      <div
        className="px-3 py-1.5 flex items-center gap-2 border-b text-xs"
        style={{ borderColor: `${accentColor}18` }}
      >
        <div className="flex gap-1.5 text-neutral-400">
          <button type="button" className="p-1 hover:bg-white/10 rounded cursor-pointer">←</button>
          <button type="button" className="p-1 hover:bg-white/10 rounded cursor-pointer">→</button>
          <button type="button" className="p-1 hover:bg-white/10 rounded cursor-pointer">↑</button>
        </div>

        <div
          className="flex-1 px-3 py-1 rounded-md flex items-center gap-2 border text-xs"
          style={{
            backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 16, 20, 0.65)',
            borderColor: `${accentColor}30`,
          }}
        >
          <span>📁</span>
          <span>This PC</span>
          <span className="text-neutral-500">&gt;</span>
          <span>Local Disk (C:)</span>
          <span className="text-neutral-500">&gt;</span>
          <span className="font-medium text-blue-400">{activeTabName}</span>
        </div>

        <div
          className="w-44 px-2.5 py-1 rounded-md flex items-center gap-1.5 border text-xs text-neutral-400"
          style={{
            backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 16, 20, 0.65)',
            borderColor: `${accentColor}30`,
          }}
        >
          <span>🔍</span>
          <span>Search {activeTabName}</span>
        </div>
      </div>

      {/* Body: Sidebar & Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Tree */}
        <div
          className="w-40 border-r p-2 flex flex-col gap-1 text-xs"
          style={{ borderColor: `${accentColor}18` }}
        >
          {[
            { id: 'Home', name: 'Home', icon: '⭐' },
            { id: 'Desktop', name: 'Desktop', icon: '💻' },
            { id: 'Downloads', name: 'Downloads', icon: '⬇️' },
            { id: 'Documents', name: 'Documents', icon: '📄' },
            { id: 'Pictures', name: 'Pictures', icon: '🖼️' },
            { id: 'Music', name: 'Music', icon: '🎵' },
          ].map((nav) => {
            const isSelected = activeTabName === nav.id;
            return (
              <div
                key={nav.id}
                onClick={() => {
                  if (nav.id === 'Home' || nav.id === 'Downloads') {
                    setActiveTabName(nav.id as any);
                  }
                }}
                className="px-2.5 py-1.5 rounded-md flex items-center gap-2 cursor-pointer transition-colors"
                style={{
                  backgroundColor: isSelected ? `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.2)` : undefined,
                  color: isSelected ? accentColor : undefined,
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                <span>{nav.icon}</span>
                <span>{nav.name}</span>
              </div>
            );
          })}
        </div>

        {/* Folder items */}
        <div className="flex-1 p-3.5 overflow-y-auto">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-semibold">Quick Access</span>
            <span className={`text-[11px] ${subTextColor}`}>4 folders</span>
          </div>

          <div className="grid grid-cols-4 gap-2.5 mb-4">
            {[
              { name: 'Components', icon: '📁' },
              { name: 'Assets', icon: '📁' },
              { name: 'Scripts', icon: '📁' },
              { name: 'Themes', icon: '📁' },
            ].map((f) => (
              <div
                key={f.name}
                className="p-2.5 rounded-lg border flex items-center gap-2 text-xs transition-all hover:border-blue-400 cursor-pointer shadow-xs"
                style={{
                  backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(30, 32, 38, 0.6)',
                  borderColor: `${accentColor}25`,
                }}
              >
                <span className="text-xl">{f.icon}</span>
                <span className="font-medium truncate">{f.name}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-semibold">Files</span>
            <span className={`text-[11px] ${subTextColor}`}>3 files</span>
          </div>

          <div className="flex flex-col gap-1">
            {[
              { name: 'theme.reg', size: '1.4 KB', type: 'Registration Entries', icon: '📄', active: true },
              { name: 'manifest.json', size: '820 B', type: 'JSON File', icon: '⚙️', active: false },
              { name: 'styles.xaml', size: '3.2 KB', type: 'XAML Document', icon: '🎨', active: false },
            ].map((file) => (
              <div
                key={file.name}
                className="px-3 py-1.5 rounded-md flex items-center justify-between text-xs cursor-pointer border transition-colors"
                style={{
                  backgroundColor: file.active ? `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.16)` : 'transparent',
                  borderColor: file.active ? accentColor : 'transparent',
                }}
              >
                <div className="flex items-center gap-2">
                  <span>{file.icon}</span>
                  <span className="font-medium">{file.name}</span>
                </div>
                <div className={`flex items-center gap-4 ${subTextColor}`}>
                  <span>{file.type}</span>
                  <span className="font-mono">{file.size}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer / Status bar */}
      <div
        className={`h-6 px-3 border-t flex items-center justify-between text-[11px] ${subTextColor}`}
        style={{ borderColor: `${accentColor}18` }}
      >
        <span>7 items</span>
        <span>1 item selected (1.4 KB)</span>
      </div>
    </div>
  );
}

export default FileExplorerPreviewWindow;
