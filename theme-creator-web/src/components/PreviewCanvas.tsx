import React from 'react';
import { useThemeStore } from '../store/useThemeStore';

export default function PreviewCanvas() {
  const {
    accentColor,
    secondaryAccent,
    isLightMode,
    taskbarMode,
    cornerRadius,
    wallpaperUrl,
    customStartIconUrl,
    hideRecommended,
    compactSearch,
    dynamicNotificationHeight,
    removeDropShadows,
    taskbarBlur,
    startMenuBlur,
    notificationBlur,
    activePane,
    setActivePane,
  } = useThemeStore();

  // Determine dynamic colors for Light vs Dark mode
  const flyoutBg = isLightMode
    ? 'rgba(245, 245, 250, 0.85)'
    : 'rgba(24, 24, 27, 0.75)';
  const flyoutBorder = isLightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
  const textColor = isLightMode ? 'text-neutral-900' : 'text-white';
  const subTextColor = isLightMode ? 'text-neutral-500' : 'text-neutral-400';
  const cardBg = isLightMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.35)';
  const cardHover = isLightMode ? 'hover:bg-neutral-200/50' : 'hover:bg-white/5';
  const shadowClass = removeDropShadows
    ? 'shadow-none'
    : isLightMode
    ? 'shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)]'
    : 'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)]';

  // Taskbar background styling
  const taskbarStyle: React.CSSProperties = {
    backdropFilter: `blur(${taskbarBlur}px)`,
    WebkitBackdropFilter: `blur(${taskbarBlur}px)`,
  };

  if (taskbarMode === 'gradient') {
    taskbarStyle.background = `linear-gradient(90deg, ${
      isLightMode ? '#f0f0f5' : '#101216'
    } 0%, ${accentColor}cc 50%, ${secondaryAccent}cc 100%)`;
  } else {
    taskbarStyle.backgroundColor = isLightMode
      ? 'rgba(245, 245, 250, 0.72)'
      : 'rgba(20, 20, 24, 0.65)';
  }

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

  return (
    <div
      className="flex-1 h-full flex flex-col justify-end relative select-none overflow-hidden font-sans"
      style={
        wallpaperUrl
          ? {
              backgroundImage: `url(${wallpaperUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {
              background: isLightMode
                ? `radial-gradient(circle at 50% 60%, ${accentColor}22 0%, #e2e8f0 75%)`
                : `radial-gradient(circle at 50% 60%, ${accentColor}33 0%, #09090b 75%)`,
            }
      }
    >
      {/* Mobile warning overlay (Task 4.3) */}
      <div className="lg:hidden absolute top-3 left-3 right-3 z-50 bg-amber-500/90 text-neutral-950 px-3 py-2 rounded-lg text-xs font-medium shadow flex items-center gap-2">
        <span>⚠️</span>
        <span>Windhawk Studio is optimized for larger displays to accurately render the desktop canvas.</span>
      </div>

      {/* Desktop click area to dismiss open flyouts */}
      <div
        className="absolute inset-0 z-10"
        onClick={() => setActivePane(null)}
      />

      {/* Floating Canvas Area (Start Menu or Notification Center) */}
      <div className="z-20 w-full h-[calc(100%-48px)] relative flex items-end justify-center pointer-events-none pb-3">
        {activePane === 'start' && (
          <div
            className={`w-[580px] ${
              hideRecommended ? 'h-[520px]' : 'h-[640px]'
            } flex flex-col pointer-events-auto transition-all duration-200 overflow-hidden ${textColor} ${shadowClass}`}
            style={{
              backgroundColor: flyoutBg,
              backdropFilter: `blur(${startMenuBlur}px)`,
              WebkitBackdropFilter: `blur(${startMenuBlur}px)`,
              borderRadius: `${cornerRadius}px`,
              border: `1px solid ${flyoutBorder}`,
            }}
          >
            {/* Search Bar */}
            <div className={`p-6 ${compactSearch ? 'pb-2 pt-4' : 'pb-4'}`}>
              <div
                className={`w-full flex items-center gap-3 text-sm shadow-inner transition-all ${
                  compactSearch ? 'py-1.5 px-3' : 'py-2.5 px-4'
                }`}
                style={{
                  backgroundColor: cardBg,
                  borderRadius: `${Math.max(4, cornerRadius - 2)}px`,
                  border: `1px solid ${flyoutBorder}`,
                }}
              >
                <svg className={`w-4 h-4 ${subTextColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className={`px-2 py-0.5 text-[11px] transition-colors ${subTextColor} ${cardHover}`}
                  style={{
                    backgroundColor: cardBg,
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
                      className={`px-2 py-0.5 text-[11px] transition-colors ${subTextColor} ${cardHover}`}
                      style={{
                        backgroundColor: cardBg,
                        borderRadius: `${Math.max(3, cornerRadius - 4)}px`,
                      }}
                    >
                      More &gt;
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    <div
                      className={`flex items-center gap-2.5 p-2 transition-colors cursor-pointer ${cardHover}`}
                      style={{
                        backgroundColor: cardBg,
                        borderRadius: `${Math.max(4, cornerRadius - 4)}px`,
                        border: `1px solid ${flyoutBorder}`,
                      }}
                    >
                      <span className="text-lg">📄</span>
                      <div className="flex flex-col text-left">
                        <span className={`font-medium text-xs truncate ${textColor}`}>Theme_Setup.reg</span>
                        <span className={`text-[10px] ${subTextColor}`}>Just now</span>
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-2.5 p-2 transition-colors cursor-pointer ${cardHover}`}
                      style={{
                        backgroundColor: cardBg,
                        borderRadius: `${Math.max(4, cornerRadius - 4)}px`,
                        border: `1px solid ${flyoutBorder}`,
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
                backgroundColor: isLightMode ? 'rgba(235, 235, 240, 0.9)' : 'rgba(15, 15, 18, 0.9)',
                borderColor: flyoutBorder,
              }}
            >
              <div
                className={`flex items-center gap-3 cursor-pointer p-1.5 px-2.5 transition-colors ${cardHover}`}
                style={{ borderRadius: `${Math.max(4, cornerRadius - 4)}px` }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow"
                  style={{ backgroundColor: accentColor }}
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

        {activePane === 'notifications' && (
          <div
            className={`w-[380px] ${
              dynamicNotificationHeight ? 'h-[500px]' : 'h-[580px]'
            } absolute right-4 bottom-0 flex flex-col pointer-events-auto transition-all duration-200 overflow-hidden ${textColor} ${shadowClass}`}
            style={{
              backgroundColor: flyoutBg,
              backdropFilter: `blur(${notificationBlur}px)`,
              WebkitBackdropFilter: `blur(${notificationBlur}px)`,
              borderRadius: `${cornerRadius}px`,
              border: `1px solid ${flyoutBorder}`,
            }}
          >
            {/* Header */}
            <div
              className="px-5 py-3.5 border-b flex justify-between items-center text-xs font-semibold"
              style={{ borderColor: flyoutBorder }}
            >
              <span className={textColor}>Notifications</span>
              <button className={`text-[11px] transition-colors ${subTextColor} hover:underline`}>
                Clear all
              </button>
            </div>

            {/* Notifications List */}
            <div className="p-3.5 flex-1 flex flex-col gap-2.5 overflow-y-auto">
              <div
                className="p-3 text-left shadow-sm"
                style={{
                  backgroundColor: cardBg,
                  borderRadius: `${Math.max(4, cornerRadius - 4)}px`,
                  border: `1px solid ${flyoutBorder}`,
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
                  backgroundColor: cardBg,
                  borderRadius: `${Math.max(4, cornerRadius - 4)}px`,
                  border: `1px solid ${flyoutBorder}`,
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

              {/* Quick Actions Panel */}
              <div
                className="mt-auto pt-3 border-t"
                style={{ borderColor: flyoutBorder }}
              >
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {['Wi-Fi', 'Bluetooth', 'Airplane'].map((action, i) => (
                    <button
                      key={action}
                      className="p-2 text-center text-[10px] font-medium transition-colors"
                      style={{
                        backgroundColor: i === 0 ? accentColor : cardBg,
                        color: i === 0 ? '#ffffff' : isLightMode ? '#000000' : '#ffffff',
                        borderRadius: `${Math.max(4, cornerRadius - 4)}px`,
                      }}
                    >
                      {action}
                    </button>
                  ))}
                </div>

                {/* Mini Calendar */}
                <div className="text-xs font-semibold mb-2 flex justify-between items-center">
                  <span className={textColor}>September 2026</span>
                  <div className={`flex gap-2 text-xs ${subTextColor}`}>
                    <button className="hover:opacity-80">&lt;</button>
                    <button className="hover:opacity-80">&gt;</button>
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
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Windows 11 Taskbar */}
      <div
        className="h-12 w-full z-30 flex items-center justify-between px-4 transition-all duration-300"
        style={{
          ...taskbarStyle,
          borderTop: `1px solid ${flyoutBorder}`,
        }}
      >
        {/* Left Weather Widget Area */}
        <div
          className={`flex items-center gap-2 cursor-pointer px-2.5 py-1.5 transition-colors ${cardHover}`}
          style={{ borderRadius: `${Math.max(4, cornerRadius - 4)}px` }}
        >
          <span>🌤️</span>
          <div className="flex flex-col text-[11px] leading-tight">
            <span className={`font-semibold ${textColor}`}>22°C</span>
            <span className={`text-[9px] ${subTextColor}`}>Mostly Sunny</span>
          </div>
        </div>

        {/* Center App Icons & Start Button */}
        <div className="flex items-center gap-1.5">
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

          {/* Taskbar Pinned Icons */}
          {['🔍', '📂', '🌐', '💬', '🎵'].map((icon, idx) => (
            <div
              key={idx}
              className={`w-10 h-10 flex items-center justify-center text-lg cursor-pointer transition-colors ${cardHover}`}
              style={{ borderRadius: `${cornerRadius}px` }}
            >
              {icon}
            </div>
          ))}
        </div>

        {/* Right System Tray */}
        <div className="flex items-center gap-1">
          <div
            className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer text-xs transition-colors ${cardHover} ${textColor}`}
            style={{ borderRadius: `${Math.max(4, cornerRadius - 4)}px` }}
          >
            <span>🔊</span>
            <span>📶</span>
            <span>🔋</span>
          </div>

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
