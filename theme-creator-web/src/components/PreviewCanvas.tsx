import React, { useState } from 'react';
import { useThemeStore } from '../store/useThemeStore';
import {
  DesktopBackground,
  TaskbarPreview,
  StartMenuPreview,
  FlyoutsPreview,
} from './preview';

export default function PreviewCanvas() {
  const {
    isLightMode,
    wallpaperUrl,
    setActivePane,
    typography,
    animations,
  } = useThemeStore();

  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);

  const basePath =
    typeof window !== 'undefined'
      ? window.location.pathname.startsWith('/theme-creator')
        ? '/theme-creator'
        : ''
      : '/theme-creator';
  const defaultWallpaper = isLightMode
    ? `${basePath}/wallpapers/default-light.jpg`
    : `${basePath}/wallpapers/default-dark.jpg`;
  const activeWallpaper = wallpaperUrl || defaultWallpaper;

  const flyoutDuration =
    animations?.speed === 'instant' ? '0ms' : `${animations?.durationMs ?? 250}ms`;
  const flyoutEasing =
    animations?.easing === 'linear'
      ? 'linear'
      : animations?.easing === 'decelerate'
      ? 'cubic-bezier(0.0, 0.0, 0.2, 1)'
      : 'cubic-bezier(0.1, 0.9, 0.2, 1)';

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenuPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setShowContextMenu(true);
  };

  const handleDismiss = () => {
    setActivePane(null);
    if (showContextMenu) setShowContextMenu(false);
  };

  return (
    <div
      data-testid="preview-canvas-root"
      className="flex-1 h-full flex flex-col justify-end relative select-none overflow-hidden"
      onContextMenu={handleContextMenu}
      onClick={() => {
        if (showContextMenu) setShowContextMenu(false);
      }}
      style={{
        backgroundColor: isLightMode ? '#f8fafc' : '#090a10',
        backgroundImage: `url("${activeWallpaper}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: `${typography?.fontFamily || 'Segoe UI Variable'}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
        fontWeight: typography?.fontWeight || '400',
        letterSpacing: `${(typography?.characterSpacing ?? 0) / 1000}em`,
        '--flyout-duration': flyoutDuration,
        '--flyout-easing': flyoutEasing,
      } as React.CSSProperties}
    >
      <DesktopBackground
        showContextMenu={showContextMenu}
        contextMenuPos={contextMenuPos}
        onCloseContextMenu={() => setShowContextMenu(false)}
        onDismiss={handleDismiss}
      />

      {/* Floating Canvas Area (Start Menu, Notification Center, or Quick Settings) */}
      <div className="z-20 w-full h-[calc(100%-48px)] relative pointer-events-none pb-3">
        <StartMenuPreview />
        <FlyoutsPreview />
      </div>

      <TaskbarPreview />
    </div>
  );
}
