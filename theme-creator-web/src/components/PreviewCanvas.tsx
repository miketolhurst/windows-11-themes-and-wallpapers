import React from 'react';
import { useThemeStore } from '../store/useThemeStore';
import { hexToRgb } from '../lib/paletteEngine';

export default function PreviewCanvas() {
  const {
    accentColor,
    secondaryAccent,
    isLightMode,
    taskbarMode,
    materialStyle,
    noiseOpacity,
    tintSaturation,
    dockMode,
    dockMargin,
    runningIndicatorStyle,
    cornerRadius,
    borderThickness: rawBorderThickness,
    wallpaperUrl,
    customStartIconUrl,
    hideRecommended,
    compactSearch,
    dynamicNotificationHeight,
    removeDropShadows,
    taskbarBlur,
    startMenuBlur,
    notificationBlur,
    taskbarOpacity,
    startMenuOpacity,
    notificationOpacity,
    activePane,
    setActivePane,
    showDesktopIcons,
    showWindowPreview,
    setShowWindowPreview,
  } = useThemeStore();

  const [brightness, setBrightness] = React.useState(100);
  const [volume, setVolume] = React.useState(75);

  const borderThickness = rawBorderThickness ?? 2;
  const tbOpacity = (taskbarOpacity ?? 97) / 100;
  const smOpacity = (startMenuOpacity ?? 97) / 100;
  const ncOpacity = (notificationOpacity ?? 97) / 100;

  const accentRgb = hexToRgb(accentColor);
  const secRgb = hexToRgb(secondaryAccent);
  const bgRgb = isLightMode ? [240, 240, 245] : [16, 18, 22];

  const effectiveMaterial =
    materialStyle ?? (taskbarMode === 'gradient' ? 'linear-gradient' : 'fluent-acrylic');

  // Dynamic flyout backgrounds matching Windhawk Styler & Material styles
  let startMenuBg = '';
  let notifCenterBg = '';
  const taskbarStyle: React.CSSProperties = {};

  if (effectiveMaterial === 'linear-gradient' || taskbarMode === 'gradient') {
    taskbarStyle.backdropFilter = 'none';
    taskbarStyle.WebkitBackdropFilter = 'none';
    taskbarStyle.background = `linear-gradient(90deg, rgba(${secRgb[0]}, ${secRgb[1]}, ${secRgb[2]}, ${tbOpacity}) 0%, rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, ${tbOpacity}) 50%, rgba(${bgRgb[0]}, ${bgRgb[1]}, ${bgRgb[2]}, ${tbOpacity}) 100%)`;

    startMenuBg = `linear-gradient(135deg, rgba(${bgRgb[0]}, ${bgRgb[1]}, ${bgRgb[2]}, ${smOpacity}) 0%, rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, ${smOpacity}) 50%, rgba(${secRgb[0]}, ${secRgb[1]}, ${secRgb[2]}, ${smOpacity}) 100%)`;
    notifCenterBg = `linear-gradient(315deg, rgba(${bgRgb[0]}, ${bgRgb[1]}, ${bgRgb[2]}, ${ncOpacity}) 0%, rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, ${ncOpacity}) 50%, rgba(${secRgb[0]}, ${secRgb[1]}, ${secRgb[2]}, ${ncOpacity}) 100%)`;
  } else if (effectiveMaterial === 'pure-black-neon') {
    taskbarStyle.backdropFilter = 'none';
    taskbarStyle.WebkitBackdropFilter = 'none';
    taskbarStyle.backgroundColor = isLightMode ? 'rgba(255, 255, 255, 0.98)' : 'rgba(0, 0, 0, 0.98)';

    startMenuBg = isLightMode ? 'rgba(255, 255, 255, 0.98)' : 'rgba(0, 0, 0, 0.98)';
    notifCenterBg = isLightMode ? 'rgba(255, 255, 255, 0.98)' : 'rgba(0, 0, 0, 0.98)';
  } else if (effectiveMaterial === 'matte-slate') {
    taskbarStyle.backdropFilter = 'none';
    taskbarStyle.WebkitBackdropFilter = 'none';
    taskbarStyle.backgroundColor = isLightMode ? '#e2e8f0' : '#1e293b';

    startMenuBg = isLightMode ? '#f1f5f9' : '#0f172a';
    notifCenterBg = isLightMode ? '#f1f5f9' : '#0f172a';
  } else {
    // fluent-acrylic (default)
    taskbarStyle.backdropFilter = `blur(${taskbarBlur}px)`;
    taskbarStyle.WebkitBackdropFilter = `blur(${taskbarBlur}px)`;
    taskbarStyle.backgroundColor = isLightMode
      ? `rgba(245, 245, 250, ${(tbOpacity * 0.72).toFixed(2)})`
      : `rgba(20, 20, 24, ${(tbOpacity * 0.65).toFixed(2)})`;

    startMenuBg = isLightMode
      ? `radial-gradient(circle at 90% 10%, ${secondaryAccent}35 0%, transparent 65%), radial-gradient(circle at 10% 90%, ${accentColor}35 0%, transparent 65%), rgba(245, 245, 250, 0.84)`
      : `radial-gradient(circle at 90% 10%, ${secondaryAccent}40 0%, transparent 65%), radial-gradient(circle at 10% 90%, ${accentColor}40 0%, transparent 65%), rgba(18, 20, 25, 0.84)`;

    notifCenterBg = isLightMode
      ? `radial-gradient(circle at 90% 90%, ${secondaryAccent}35 0%, transparent 65%), radial-gradient(circle at 10% 10%, ${accentColor}35 0%, transparent 65%), rgba(245, 245, 250, 0.84)`
      : `radial-gradient(circle at 90% 90%, ${secondaryAccent}40 0%, transparent 65%), radial-gradient(circle at 10% 10%, ${accentColor}40 0%, transparent 65%), rgba(18, 20, 25, 0.84)`;
  }

  // Borders match Windhawk Styler (BorderBrush=c_normal, BorderThickness=2)
  const flyoutBorder = accentColor;
  const textColor = isLightMode ? 'text-neutral-900' : 'text-white';
  const subTextColor = isLightMode ? 'text-neutral-600' : 'text-neutral-400';
  const startCardBg =
    taskbarMode === 'gradient' || effectiveMaterial === 'linear-gradient'
      ? isLightMode
        ? `rgba(255, 255, 255, ${Math.min(0.7, smOpacity * 0.7)})`
        : `rgba(0, 0, 0, ${Math.min(0.4, smOpacity * 0.4)})`
      : effectiveMaterial === 'pure-black-neon'
      ? isLightMode
        ? 'rgba(240, 240, 245, 0.9)'
        : 'rgba(20, 20, 25, 0.9)'
      : effectiveMaterial === 'matte-slate'
      ? isLightMode
        ? '#ffffff'
        : '#1e293b'
      : isLightMode
      ? 'rgba(255, 255, 255, 0.65)'
      : 'rgba(0, 0, 0, 0.35)';

  const notifCardBg =
    taskbarMode === 'gradient' || effectiveMaterial === 'linear-gradient'
      ? isLightMode
        ? `rgba(255, 255, 255, ${Math.min(0.7, ncOpacity * 0.7)})`
        : `rgba(0, 0, 0, ${Math.min(0.4, ncOpacity * 0.4)})`
      : effectiveMaterial === 'pure-black-neon'
      ? isLightMode
        ? 'rgba(240, 240, 245, 0.9)'
        : 'rgba(20, 20, 25, 0.9)'
      : effectiveMaterial === 'matte-slate'
      ? isLightMode
        ? '#ffffff'
        : '#1e293b'
      : isLightMode
      ? 'rgba(255, 255, 255, 0.65)'
      : 'rgba(0, 0, 0, 0.35)';
  const cardHover = isLightMode ? 'hover:bg-neutral-200/60' : 'hover:bg-white/10';
  const shadowClass = removeDropShadows
    ? 'shadow-none'
    : isLightMode
    ? 'shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)]'
    : 'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.75)]';

  const flyoutBoxShadow =
    effectiveMaterial === 'pure-black-neon'
      ? `0 0 24px ${accentColor}60, inset 0 0 16px ${accentColor}25`
      : `0 0 24px -6px ${accentColor}40`;

  const startMenuBackdrop =
    effectiveMaterial === 'fluent-acrylic' && taskbarMode !== 'gradient'
      ? `blur(${startMenuBlur}px)`
      : 'none';

  const notifCenterBackdrop =
    effectiveMaterial === 'fluent-acrylic' && taskbarMode !== 'gradient'
      ? `blur(${notificationBlur}px)`
      : 'none';

  const noiseOverlay =
    effectiveMaterial === 'fluent-acrylic' && (noiseOpacity ?? 0.05) > 0 ? (
      <div
        className="absolute inset-0 pointer-events-none z-0 mix-blend-overlay"
        style={{
          opacity: noiseOpacity ?? 0.05,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    ) : null;

  // Pinned apps data
  const pinnedApps = [
    { name: 'Edge', icon: '🌐' },
    { name: 'Word', icon: '📝' },
    { name: 'Excel', icon: '📊' },
    { name: 'PowerPoint', icon: '📑' },
    { name: 'Store', icon: '🛍️' },
    { name: 'Photos', icon: '🖼️' },
    { name: 'Settings', icon: '⚙️' },
    { name: 'Xbox', icon: '🎮' },
    { name: 'Spotify', icon: '🎵' },
    { name: 'VS Code', icon: '💻' },
    { name: 'Terminal', icon: '⌨️' },
    { name: 'Windhawk', icon: '🦅' },
    ...(hideRecommended
      ? [
          { name: 'Mail', icon: '✉️' },
          { name: 'Calculator', icon: '🧮' },
          { name: 'Notepad', icon: '📋' },
          { name: 'Clock', icon: '⏰' },
          { name: 'Files', icon: '📁' },
          { name: 'Discord', icon: '💬' },
        ]
      : []),
  ];

  // Derive active wallpaper: user upload or rich abstract 3D flowing wallpaper render
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

  return (
    <div
      className="flex-1 h-full flex flex-col justify-end relative select-none overflow-hidden font-sans"
      style={{
        backgroundColor: isLightMode ? '#f8fafc' : '#090a10',
        backgroundImage: `url("${activeWallpaper}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Mobile warning overlay */}
      <div className="lg:hidden absolute top-3 left-3 right-3 z-50 bg-amber-500/90 text-neutral-950 px-3 py-2 rounded-lg text-xs font-medium shadow flex items-center gap-2">
        <span>⚠️</span>
        <span>Windhawk Studio is optimized for larger displays to accurately render the desktop canvas.</span>
      </div>

      {/* Desktop click area to dismiss open flyouts */}
      <div
        className="absolute inset-0 z-10"
        onClick={() => setActivePane(null)}
      />

      {/* Desktop Icons Layer */}
      {showDesktopIcons && (
        <div className="absolute left-5 top-5 flex flex-col gap-4 pointer-events-auto z-15">
          {[
            { name: 'Recycle Bin', icon: '🗑️' },
            { name: 'This PC', icon: '💻' },
            { name: 'Files', icon: '📁' },
            { name: 'Edge', icon: '🌐' },
          ].map((item) => (
            <div
              key={item.name}
              className="w-20 p-2 rounded-lg flex flex-col items-center text-center cursor-pointer border border-transparent hover:bg-white/15 hover:border-white/20 transition-all group"
            >
              <span className="text-3xl mb-1 filter drop-shadow-md">{item.icon}</span>
              <span className="text-[11px] text-white font-normal leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] truncate max-w-full">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Window Preview (Mock Windows 11 File Explorer) */}
      {showWindowPreview && (
        <div
          className={`absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 w-[680px] h-[420px] max-w-[92%] max-h-[72%] rounded-xl shadow-2xl border overflow-hidden flex flex-col pointer-events-auto z-15 transition-all duration-200 ${shadowClass}`}
          style={{
            background: isLightMode ? 'rgba(255, 255, 255, 0.88)' : 'rgba(24, 24, 28, 0.88)',
            backdropFilter: `blur(${Math.max(12, taskbarBlur)}px)`,
            WebkitBackdropFilter: `blur(${Math.max(12, taskbarBlur)}px)`,
            borderColor: `${accentColor}44`,
            borderRadius: `${cornerRadius}px`,
          }}
        >
          {/* Window Title Bar & Tabs */}
          <div className="h-9 flex items-center justify-between border-b px-2 select-none" style={{ borderColor: `${accentColor}22` }}>
            <div className="flex items-center gap-1 text-xs">
              <div
                className="px-3 py-1 rounded-t-md flex items-center gap-1.5 font-medium border-t-2"
                style={{
                  backgroundColor: isLightMode ? 'rgba(240, 240, 245, 0.9)' : 'rgba(35, 35, 42, 0.9)',
                  borderColor: accentColor,
                  color: isLightMode ? '#111827' : '#f3f4f6',
                }}
              >
                <span>📁</span>
                <span>Home</span>
                <span className="text-[10px] opacity-60 ml-1">✕</span>
              </div>
              <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-xs opacity-70">+</button>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="p-1 hover:bg-white/10 rounded cursor-pointer">─</span>
              <span className="p-1 hover:bg-white/10 rounded cursor-pointer">□</span>
              <button
                onClick={() => setShowWindowPreview(false)}
                className="p-1 hover:bg-red-600 hover:text-white rounded cursor-pointer"
                title="Close window preview"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Address & Search Bar */}
          <div className="px-3 py-2 flex items-center gap-2 border-b text-xs" style={{ borderColor: `${accentColor}22` }}>
            <div className="flex gap-2 text-neutral-400">
              <span>←</span>
              <span>→</span>
              <span>↑</span>
            </div>
            <div
              className="flex-1 px-2.5 py-1 rounded flex items-center gap-2 border text-xs"
              style={{
                backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 15, 18, 0.6)',
                borderColor: `${accentColor}33`,
              }}
            >
              <span>📁</span>
              <span className={textColor}>Home</span>
            </div>
            <div
              className="w-48 px-2.5 py-1 rounded flex items-center gap-1.5 border text-xs text-neutral-400"
              style={{
                backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 15, 18, 0.6)',
                borderColor: `${accentColor}33`,
              }}
            >
              <span>🔍</span>
              <span>Search Home</span>
            </div>
          </div>

          {/* Window Body: Navigation + Content */}
          <div className="flex-1 flex overflow-hidden">
            <div className="w-40 border-r p-2 flex flex-col gap-1 text-xs" style={{ borderColor: `${accentColor}22` }}>
              {[
                { name: 'Home', icon: '⭐', active: true },
                { name: 'Desktop', icon: '💻', active: false },
                { name: 'Downloads', icon: '⬇️', active: false },
                { name: 'Documents', icon: '📄', active: false },
                { name: 'Pictures', icon: '🖼️', active: false },
              ].map((nav) => (
                <div
                  key={nav.name}
                  className="px-2 py-1 rounded flex items-center gap-2 cursor-pointer transition-colors"
                  style={{
                    backgroundColor: nav.active ? `${accentColor}25` : undefined,
                    color: nav.active ? accentColor : undefined,
                    fontWeight: nav.active ? 600 : 400,
                  }}
                >
                  <span>{nav.icon}</span>
                  <span>{nav.name}</span>
                </div>
              ))}
            </div>

            <div className="flex-1 p-3.5 overflow-y-auto">
              <h4 className={`text-xs font-semibold mb-2.5 ${textColor}`}>Quick Access</h4>
              <div className="grid grid-cols-3 gap-2.5">
                {['Desktop', 'Downloads', 'Documents', 'Pictures', 'Music', 'Videos'].map((f) => (
                  <div
                    key={f}
                    className="p-2.5 rounded-lg border flex items-center gap-2.5 text-xs transition-all hover:border-blue-400 cursor-pointer shadow-xs"
                    style={{
                      backgroundColor: notifCardBg,
                      borderColor: `${accentColor}25`,
                    }}
                  >
                    <span className="text-xl">📁</span>
                    <span className={`font-medium ${textColor}`}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Canvas Area (Start Menu, Notification Center, or Quick Settings) */}
      <div className="z-20 w-full h-[calc(100%-48px)] relative pointer-events-none pb-3">
        {activePane === 'start' && (
          <div
            className={`w-[580px] ${
              hideRecommended ? 'h-[520px]' : 'h-[640px]'
            } absolute left-3 bottom-3 flex flex-col pointer-events-auto transition-all duration-200 overflow-hidden ${textColor} ${shadowClass}`}
            style={{
              background: startMenuBg,
              backdropFilter: startMenuBackdrop,
              WebkitBackdropFilter: startMenuBackdrop,
              borderRadius: `${cornerRadius}px`,
              border: borderThickness > 0 ? `${borderThickness}px solid ${accentColor}` : 'none',
              boxShadow: flyoutBoxShadow,
              bottom: dockMode ? `${(dockMargin ?? 12) + 4}px` : undefined,
              left: dockMode ? `${Math.max(12, dockMargin ?? 12)}px` : undefined,
            }}
          >
            {noiseOverlay}
            {/* Search Bar */}
            <div className={`p-6 ${compactSearch ? 'pb-2 pt-4' : 'pb-4'}`}>
              <div
                className={`w-full flex items-center gap-3 text-sm shadow-inner transition-all ${
                  compactSearch ? 'py-1.5 px-3' : 'py-2.5 px-4'
                }`}
                style={{
                  backgroundColor:
                    taskbarMode === 'gradient'
                      ? isLightMode
                        ? `rgba(255, 255, 255, ${Math.min(0.5, smOpacity * 0.4)})`
                        : `rgba(0, 0, 0, ${Math.min(0.35, smOpacity * 0.35)})`
                      : isLightMode
                      ? `${accentColor}10`
                      : `${accentColor}18`,
                  borderRadius: `${Math.max(4, cornerRadius - 2)}px`,
                  border: `1.5px solid ${accentColor}88`,
                }}
              >
                <svg className="w-4 h-4" style={{ color: accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className={`text-xs ${subTextColor}`}>
                  {compactSearch ? 'Search...' : 'Search for apps, settings, and documents'}
                </span>
              </div>
            </div>

            {/* Pinned Section */}
            <div className="px-6 flex-1 flex flex-col overflow-y-auto">
              <div className="flex justify-between items-center text-xs font-semibold mb-3">
                <span className={textColor}>Pinned</span>
                <button
                  className="px-2.5 py-1 text-[11px] font-medium transition-all"
                  style={{
                    backgroundColor: startCardBg,
                    border: `1px solid ${accentColor}33`,
                    color: isLightMode ? '#0f172a' : '#f8fafc',
                    borderRadius: `${Math.max(3, cornerRadius - 4)}px`,
                  }}
                >
                  All apps &gt;
                </button>
              </div>

              <div className="grid grid-cols-6 gap-y-3 gap-x-2 text-center text-[11px]">
                {pinnedApps.map((app, i) => (
                  <div
                    key={i}
                    className={`flex flex-col items-center gap-1.5 p-2 transition-colors cursor-pointer ${cardHover}`}
                    style={{ borderRadius: `${Math.max(4, cornerRadius - 4)}px` }}
                  >
                    <span className="text-2xl drop-shadow">{app.icon}</span>
                    <span className={`truncate w-full text-[11px] ${textColor}`}>{app.name}</span>
                  </div>
                ))}
              </div>

              {/* Recommended Section (Hidden if hideRecommended is true) */}
              {!hideRecommended && (
                <>
                  <div className="mt-5 flex justify-between items-center text-xs font-semibold mb-2.5">
                    <span className={textColor}>Recommended</span>
                    <button
                      className="px-2.5 py-1 text-[11px] font-medium transition-all"
                      style={{
                        backgroundColor: startCardBg,
                        border: `1px solid ${accentColor}33`,
                        color: isLightMode ? '#0f172a' : '#f8fafc',
                        borderRadius: `${Math.max(3, cornerRadius - 4)}px`,
                      }}
                    >
                      More &gt;
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    <div
                      className={`flex items-center gap-2.5 p-2.5 transition-colors cursor-pointer ${cardHover}`}
                      style={{
                        backgroundColor: startCardBg,
                        borderRadius: `${Math.max(4, cornerRadius - 4)}px`,
                        border: `1px solid ${accentColor}44`,
                        borderLeft: `3px solid ${accentColor}`,
                      }}
                    >
                      <span className="text-lg">📄</span>
                      <div className="flex flex-col text-left">
                        <span className={`font-medium text-xs truncate ${textColor}`}>Theme_Setup.reg</span>
                        <span className={`text-[10px] ${subTextColor}`}>Just now</span>
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-2.5 p-2.5 transition-colors cursor-pointer ${cardHover}`}
                      style={{
                        backgroundColor: startCardBg,
                        borderRadius: `${Math.max(4, cornerRadius - 4)}px`,
                        border: `1px solid ${accentColor}44`,
                        borderLeft: `3px solid ${accentColor}`,
                      }}
                    >
                      <span className="text-lg">🎨</span>
                      <div className="flex flex-col text-left">
                        <span className={`font-medium text-xs truncate ${textColor}`}>Windhawk_Palette.json</span>
                        <span className={`text-[10px] ${subTextColor}`}>Yesterday at 4:20 PM</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Bottom Profile Bar */}
            <div
              className="mt-auto px-6 py-3 border-t flex items-center justify-between"
              style={{
                backgroundColor:
                  taskbarMode === 'gradient'
                    ? isLightMode
                      ? `rgba(235, 235, 240, ${smOpacity * 0.5})`
                      : `rgba(15, 15, 18, ${smOpacity * 0.5})`
                    : isLightMode
                    ? 'rgba(235, 235, 240, 0.92)'
                    : 'rgba(15, 15, 18, 0.92)',
                borderColor: `${accentColor}33`,
              }}
            >
              <div
                className={`flex items-center gap-3 cursor-pointer p-1.5 px-2.5 transition-colors ${cardHover}`}
                style={{ borderRadius: `${Math.max(4, cornerRadius - 4)}px` }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 0 0 2px ${accentColor}66`,
                  }}
                >
                  U
                </div>
                <span className={`text-xs font-medium ${textColor}`}>Windows User</span>
              </div>

              <button
                className={`p-2 transition-colors ${subTextColor} ${cardHover}`}
                style={{ borderRadius: `${Math.max(4, cornerRadius - 4)}px` }}
                title="Power"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Windows 11 Notification Center & Calendar (Separated Floating Cards) */}
        {activePane === 'notifications' && (
          <div
            className="absolute right-4 bottom-3 flex flex-col gap-3 pointer-events-auto z-40"
            style={
              dockMode
                ? {
                    bottom: `${(dockMargin ?? 12) + 4}px`,
                    right: `${Math.max(16, (dockMargin ?? 12) + 4)}px`,
                  }
                : undefined
            }
          >
            {/* Top Card: Notifications List */}
            <div
              className={`w-[360px] ${
                dynamicNotificationHeight ? 'max-h-[280px]' : 'h-[250px]'
              } flex flex-col overflow-hidden ${textColor} ${shadowClass} transition-all duration-200 relative`}
              style={{
                background: notifCenterBg,
                backdropFilter: notifCenterBackdrop,
                WebkitBackdropFilter: notifCenterBackdrop,
                borderRadius: `${cornerRadius}px`,
                border: borderThickness > 0 ? `${borderThickness}px solid ${accentColor}` : 'none',
                boxShadow: flyoutBoxShadow,
              }}
            >
              {noiseOverlay}
              {/* Header */}
              <div
                className="px-4 py-3 border-b flex justify-between items-center text-xs font-semibold"
                style={{ borderColor: `${accentColor}33` }}
              >
                <div className="flex items-center gap-2">
                  <span className={textColor}>Notifications</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-neutral-300">2</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span title="Do not disturb" className="text-xs cursor-pointer hover:opacity-80">🔕</span>
                  <button className="text-[11px] transition-colors font-medium hover:underline cursor-pointer" style={{ color: accentColor }}>
                    Clear all
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="p-3 flex-1 flex flex-col gap-2.5 overflow-y-auto">
                <div
                  className="p-3 text-left shadow-sm"
                  style={{
                    backgroundColor: notifCardBg,
                    borderRadius: `${Math.max(4, cornerRadius - 4)}px`,
                    border: `1px solid ${accentColor}44`,
                    borderLeft: `3px solid ${accentColor}`,
                  }}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className={`font-semibold flex items-center gap-1.5 ${textColor}`}>
                      🦅 Windhawk Engine
                    </span>
                    <span className={subTextColor}>Just now</span>
                  </div>
                  <p className={`text-xs ${textColor}`}>New Styler mod configuration applied smoothly.</p>
                </div>

                <div
                  className="p-3 text-left shadow-sm"
                  style={{
                    backgroundColor: notifCardBg,
                    borderRadius: `${Math.max(4, cornerRadius - 4)}px`,
                    border: `1px solid ${accentColor}44`,
                    borderLeft: `3px solid ${accentColor}`,
                  }}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className={`font-semibold flex items-center gap-1.5 ${textColor}`}>
                      ⚡ Windows 11
                    </span>
                    <span className={subTextColor}>10m ago</span>
                  </div>
                  <p className={`text-xs ${textColor}`}>32-byte AccentPalette loaded into HKCU.</p>
                </div>
              </div>
            </div>

            {/* Bottom Card: Calendar & Clock */}
            <div
              className={`w-[360px] p-3.5 flex flex-col overflow-hidden ${textColor} ${shadowClass} transition-all duration-200 relative`}
              style={{
                background: notifCenterBg,
                backdropFilter: notifCenterBackdrop,
                WebkitBackdropFilter: notifCenterBackdrop,
                borderRadius: `${cornerRadius}px`,
                border: borderThickness > 0 ? `${borderThickness}px solid ${accentColor}` : 'none',
                boxShadow: flyoutBoxShadow,
              }}
            >
              {noiseOverlay}
              <div className="flex justify-between items-center mb-2 px-1">
                <span className={`text-xs font-semibold ${textColor}`}>September 2026</span>
                <div className={`flex gap-1 text-xs ${subTextColor}`}>
                  <button className="hover:opacity-80 p-1 cursor-pointer">&lt;</button>
                  <button className="hover:opacity-80 p-1 cursor-pointer">&gt;</button>
                </div>
              </div>
              <div className={`grid grid-cols-7 text-center text-[10px] gap-y-1 ${subTextColor}`}>
                <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <span
                    key={d}
                    className={`py-1 text-[10px] ${
                      d === 7
                        ? 'text-white font-bold'
                        : 'hover:opacity-80 cursor-pointer'
                    }`}
                    style={{
                      backgroundColor: d === 7 ? accentColor : undefined,
                      borderRadius: `${Math.max(2, cornerRadius - 6)}px`,
                    }}
                  >
                    {d}
                  </span>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t flex justify-between items-center text-[11px]" style={{ borderColor: `${accentColor}33` }}>
                <button className="flex items-center gap-1.5 text-xs hover:opacity-80 font-medium cursor-pointer" style={{ color: accentColor }}>
                  <span>⏱️</span>
                  <span>Focus session</span>
                </button>
                <button className={`${subTextColor} hover:opacity-80 text-xs cursor-pointer`}>▲</button>
              </div>
            </div>
          </div>
        )}

        {/* Windows 11 Quick Settings Flyout */}
        {activePane === 'quicksettings' && (
          <div
            className={`w-[360px] absolute right-4 bottom-3 flex flex-col p-4 gap-3.5 pointer-events-auto transition-all duration-200 overflow-hidden ${textColor} ${shadowClass} z-40`}
            style={{
              background: notifCenterBg,
              backdropFilter: notifCenterBackdrop,
              WebkitBackdropFilter: notifCenterBackdrop,
              borderRadius: `${cornerRadius}px`,
              border: borderThickness > 0 ? `${borderThickness}px solid ${accentColor}` : 'none',
              boxShadow: flyoutBoxShadow,
              bottom: dockMode ? `${(dockMargin ?? 12) + 4}px` : undefined,
              right: dockMode ? `${Math.max(16, (dockMargin ?? 12) + 4)}px` : undefined,
            }}
          >
            {noiseOverlay}
            {/* 3x2 Quick Toggles Grid */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Wi-Fi', icon: '📶', active: true },
                { label: 'Bluetooth', icon: 'ᛒ', active: true },
                { label: 'Airplane', icon: '✈️', active: false },
                { label: 'Night light', icon: '🌙', active: false },
                { label: 'Accessibility', icon: '♿', active: false },
                { label: 'Cast', icon: '🖥️', active: false },
              ].map((btn) => (
                <button
                  key={btn.label}
                  className="p-2.5 flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-all shadow-xs cursor-pointer"
                  style={{
                    backgroundColor: btn.active ? accentColor : notifCardBg,
                    color: btn.active ? '#ffffff' : isLightMode ? '#111827' : '#f3f4f6',
                    borderRadius: `${Math.max(4, cornerRadius - 4)}px`,
                    border: !btn.active ? `1px solid ${accentColor}33` : undefined,
                  }}
                >
                  <span className="text-base leading-none">{btn.icon}</span>
                  <span className="truncate text-[10px]">{btn.label}</span>
                </button>
              ))}
            </div>

            {/* Sliders: Volume & Brightness */}
            <div className="flex flex-col gap-2.5 pt-1">
              <div className="flex items-center gap-3">
                <span className="text-sm">☀️</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer h-1.5 rounded-lg"
                  style={{ accentColor }}
                  aria-label="Display Brightness"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm">
                  {volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊'}
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer h-1.5 rounded-lg"
                  style={{ accentColor }}
                  aria-label="System Volume"
                />
              </div>
            </div>

            {/* Footer: Battery & Shortcut buttons */}
            <div className="pt-2 border-t flex justify-between items-center text-xs" style={{ borderColor: `${accentColor}33` }}>
              <div className="flex items-center gap-1.5 font-medium">
                <span>🔋</span>
                <span className={textColor}>95%</span>
              </div>
              <div className="flex items-center gap-2">
                <button title="Edit quick settings" className={`p-1.5 rounded hover:bg-white/10 ${subTextColor} cursor-pointer`}>
                  ✏️
                </button>
                <button title="All settings" className={`p-1.5 rounded hover:bg-white/10 ${subTextColor} cursor-pointer`}>
                  ⚙️
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Windows 11 Taskbar */}
      <div
        className="h-12 w-full z-30 flex items-center justify-between px-3 transition-all duration-300 relative"
        style={{
          ...taskbarStyle,
          ...(dockMode
            ? {
                margin: `0 ${dockMargin ?? 12}px ${(dockMargin ?? 12) > 8 ? 8 : (dockMargin ?? 12)}px ${dockMargin ?? 12}px`,
                width: `calc(100% - ${(dockMargin ?? 12) * 2}px)`,
                borderRadius: `${Math.max(cornerRadius, 12)}px`,
                border: borderThickness > 0 ? `${borderThickness}px solid ${accentColor}` : 'none',
                borderTop: borderThickness > 0 ? `${borderThickness}px solid ${accentColor}` : 'none',
                boxShadow:
                  effectiveMaterial === 'pure-black-neon'
                    ? `0 0 20px ${accentColor}60, 0 8px 32px rgba(0,0,0,0.5)`
                    : `0 8px 32px 0 rgba(0, 0, 0, 0.37)`,
              }
            : {
                borderTop: borderThickness > 0 ? `${borderThickness}px solid ${accentColor}` : 'none',
                boxShadow:
                  effectiveMaterial === 'pure-black-neon'
                    ? `0 -4px 16px ${accentColor}40`
                    : undefined,
              }),
        }}
      >
        {noiseOverlay}
        {/* Left: Start Button & App Icons */}
        <div className="flex items-center gap-1.5 z-10">
          {/* Start Button */}
          <button
            onClick={() => setActivePane(activePane === 'start' ? null : 'start')}
            className={`w-10 h-10 flex items-center justify-center transition-all ${
              activePane === 'start' ? 'bg-white/20' : cardHover
            }`}
            style={{ borderRadius: `${cornerRadius}px` }}
            title="Start"
          >
            {customStartIconUrl ? (
              <img
                src={customStartIconUrl}
                alt="Start Icon"
                className="w-5 h-5 object-contain"
              />
            ) : (
              <div
                className="w-5 h-5 grid grid-cols-2 gap-0.5 rounded-xs p-0.5 transition-colors"
                style={{ backgroundColor: accentColor }}
              >
                <div className="bg-white rounded-xs"></div>
                <div className="bg-white rounded-xs"></div>
                <div className="bg-white rounded-xs"></div>
                <div className="bg-white rounded-xs"></div>
              </div>
            )}
          </button>

          {/* Taskbar Pinned Icons with Running Indicators */}
          {['🔍', '📂', '🌐', '💬', '🎵'].map((icon, idx) => (
            <div
              key={idx}
              className={`w-10 h-10 flex flex-col items-center justify-center text-lg cursor-pointer transition-colors relative ${cardHover}`}
              style={{ borderRadius: `${cornerRadius}px` }}
            >
              <span>{icon}</span>
              {/* Running indicator matching Windows 11 Taskbar Styler */}
              {idx < 3 && runningIndicatorStyle !== 'hidden' && (
                runningIndicatorStyle === 'dot' ? (
                  <div
                    data-testid="indicator-dot"
                    className="w-1.5 h-1.5 rounded-full absolute bottom-1 transition-all"
                    style={{
                      backgroundColor:
                        idx === 0
                          ? accentColor
                          : isLightMode
                          ? 'rgba(0,0,0,0.35)'
                          : 'rgba(255,255,255,0.45)',
                      boxShadow: idx === 0 ? `0 0 6px ${accentColor}` : undefined,
                    }}
                  />
                ) : runningIndicatorStyle === 'glow' ? (
                  <div
                    data-testid="indicator-glow"
                    className="w-5 h-1 rounded-full absolute bottom-0.5 transition-all blur-[1px]"
                    style={{
                      backgroundColor:
                        idx === 0
                          ? accentColor
                          : isLightMode
                          ? 'rgba(0,0,0,0.3)'
                          : 'rgba(255,255,255,0.4)',
                      boxShadow: `0 0 8px 2px ${idx === 0 ? accentColor : 'rgba(255,255,255,0.3)'}`,
                    }}
                  />
                ) : (
                  <div
                    data-testid="indicator-standard"
                    className="w-4 h-0.5 rounded-full absolute bottom-1 transition-colors"
                    style={{
                      backgroundColor:
                        idx === 0
                          ? accentColor
                          : isLightMode
                          ? 'rgba(0,0,0,0.35)'
                          : 'rgba(255,255,255,0.45)',
                    }}
                  />
                )
              )}
            </div>
          ))}
        </div>

        {/* Right System Tray */}
        <div className="flex items-center gap-1 z-10">
          <button
            onClick={() => setActivePane(activePane === 'quicksettings' ? null : 'quicksettings')}
            className={`flex items-center gap-2 px-2.5 py-1.5 cursor-pointer text-xs transition-colors ${
              activePane === 'quicksettings' ? 'bg-white/20' : cardHover
            } ${textColor}`}
            style={{ borderRadius: `${Math.max(4, cornerRadius - 4)}px` }}
            title="Quick Settings"
          >
            <span>🔊</span>
            <span>📶</span>
            <span>🔋</span>
          </button>

          <button
            onClick={() => setActivePane(activePane === 'notifications' ? null : 'notifications')}
            className={`flex flex-col items-end px-2 py-1 text-right transition-colors ${
              activePane === 'notifications' ? 'bg-white/20' : cardHover
            }`}
            style={{ borderRadius: `${Math.max(4, cornerRadius - 4)}px` }}
            title="Notification Center & Calendar"
          >
            <span className={`text-[11px] font-medium leading-none ${textColor}`}>9:41 AM</span>
            <span className={`text-[10px] leading-none mt-1 ${subTextColor}`}>9/7/2026</span>
          </button>
        </div>
      </div>
    </div>
  );
}
