import React from 'react';
import { useThemeStore } from '../../store/useThemeStore';
import { resolveComponentStyle, getCardBg, NoiseOverlay } from './previewStyles';

export default function StartMenuPreview() {
  const {
    accentColor,
    secondaryAccent,
    isLightMode,
    taskbarMode,
    materialStyle,
    globalGradient,
    noiseOpacity,
    dockMode,
    dockMargin,
    cornerRadius,
    borderThickness: rawBorderThickness,
    hideRecommended,
    compactSearch,
    removeDropShadows,
    startMenuBlur,
    startMenuOpacity,
    activePane,
    startMenuOverride,
  } = useThemeStore();

  if (activePane !== 'start') return null;

  const borderThickness = rawBorderThickness ?? 2;

  const startMenuResolved = resolveComponentStyle({
    component: 'startMenu',
    override: startMenuOverride,
    materialStyle,
    taskbarMode,
    globalGradient,
    defaultBlur: startMenuBlur ?? 15,
    defaultOpacity: startMenuOpacity ?? 97,
    accentColor,
    secondaryAccent,
    isLightMode,
  });

  const textColor = isLightMode ? 'text-neutral-900' : 'text-white';
  const subTextColor = isLightMode ? 'text-neutral-600' : 'text-neutral-400';
  const cardHover = isLightMode ? 'hover:bg-neutral-200/60' : 'hover:bg-white/10';
  const startCardBg = getCardBg(startMenuResolved.material, startMenuResolved.opacity, isLightMode);
  const shadowClass = removeDropShadows
    ? 'shadow-none'
    : isLightMode
    ? 'shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)]'
    : 'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.75)]';

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
      data-testid="start-menu-container"
      className={`w-[580px] ${
        hideRecommended ? 'h-[520px]' : 'h-[640px]'
      } absolute left-3 bottom-3 flex flex-col pointer-events-auto transition-all overflow-hidden ${textColor} ${shadowClass}`}
      style={{
        background: startMenuResolved.background,
        backdropFilter: startMenuResolved.backdropFilter,
        WebkitBackdropFilter: startMenuResolved.backdropFilter,
        borderRadius: `${cornerRadius}px`,
        border: borderThickness > 0 ? `${borderThickness}px solid ${accentColor}` : 'none',
        boxShadow: startMenuResolved.boxShadow,
        bottom: dockMode ? `${(dockMargin ?? 12) + 4}px` : undefined,
        left: dockMode ? `${Math.max(12, dockMargin ?? 12)}px` : undefined,
        transitionDuration: 'var(--flyout-duration)',
        transitionTimingFunction: 'var(--flyout-easing)',
      }}
    >
      <NoiseOverlay material={startMenuResolved.material} noiseOpacity={noiseOpacity} />

      {/* Search Bar */}
      <div className={`p-6 ${compactSearch ? 'pb-2 pt-4' : 'pb-4'}`}>
        <div
          className={`w-full flex items-center gap-3 text-sm shadow-inner transition-all ${
            compactSearch ? 'py-1.5 px-3' : 'py-2.5 px-4'
          }`}
          style={{
            backgroundColor:
              startMenuResolved.material === 'linear-gradient' || taskbarMode === 'gradient'
                ? isLightMode
                  ? `rgba(255, 255, 255, ${Math.min(0.5, startMenuResolved.opacity * 0.4)})`
                  : `rgba(0, 0, 0, ${Math.min(0.35, startMenuResolved.opacity * 0.35)})`
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
            startMenuResolved.material === 'linear-gradient' || taskbarMode === 'gradient'
              ? isLightMode
                ? `rgba(235, 235, 240, ${startMenuResolved.opacity * 0.5})`
                : `rgba(15, 15, 18, ${startMenuResolved.opacity * 0.5})`
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
  );
}
