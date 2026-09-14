import React, { useState } from 'react';
import { useThemeStore } from '../../store/useThemeStore';
import { resolveComponentStyle, getCardBg, NoiseOverlay } from './previewStyles';

export default function FlyoutsPreview() {
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
    dynamicNotificationHeight,
    removeDropShadows,
    notificationBlur,
    notificationOpacity,
    activePane,
    flyoutOverride,
  } = useThemeStore();

  const [brightness, setBrightness] = useState(100);
  const [volume, setVolume] = useState(75);

  if (activePane !== 'notifications' && activePane !== 'quicksettings') {
    return null;
  }

  const borderThickness = rawBorderThickness ?? 2;

  const flyoutResolved = resolveComponentStyle({
    component: 'flyout',
    override: flyoutOverride,
    materialStyle,
    taskbarMode,
    globalGradient,
    defaultBlur: notificationBlur ?? 15,
    defaultOpacity: notificationOpacity ?? 97,
    accentColor,
    secondaryAccent,
    isLightMode,
  });

  const textColor = isLightMode ? 'text-neutral-900' : 'text-white';
  const subTextColor = isLightMode ? 'text-neutral-600' : 'text-neutral-400';
  const notifCardBg = getCardBg(flyoutResolved.material, flyoutResolved.opacity, isLightMode);
  const shadowClass = removeDropShadows
    ? 'shadow-none'
    : isLightMode
    ? 'shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)]'
    : 'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.75)]';

  return (
    <>
      {/* Windows 11 Notification Center & Calendar (Separated Floating Cards) */}
      {activePane === 'notifications' && (
        <div
          data-testid="flyout-notifications"
          className="absolute right-4 bottom-3 flex flex-col gap-3 pointer-events-auto z-40 transition-all"
          style={{
            ...(dockMode
              ? {
                  bottom: `${(dockMargin ?? 12) + 4}px`,
                  right: `${Math.max(16, (dockMargin ?? 12) + 4)}px`,
                }
              : {}),
            transitionDuration: 'var(--flyout-duration)',
            transitionTimingFunction: 'var(--flyout-easing)',
          }}
        >
          {/* Top Card: Notifications List */}
          <div
            className={`w-[360px] ${
              dynamicNotificationHeight ? 'max-h-[280px]' : 'h-[250px]'
            } flex flex-col overflow-hidden ${textColor} ${shadowClass} transition-all relative`}
            style={{
              background: flyoutResolved.background,
              backdropFilter: flyoutResolved.backdropFilter,
              WebkitBackdropFilter: flyoutResolved.backdropFilter,
              borderRadius: `${cornerRadius}px`,
              border: borderThickness > 0 ? `${borderThickness}px solid ${accentColor}` : 'none',
              boxShadow: flyoutResolved.boxShadow,
              transitionDuration: 'var(--flyout-duration)',
              transitionTimingFunction: 'var(--flyout-easing)',
            }}
          >
            <NoiseOverlay material={flyoutResolved.material} noiseOpacity={noiseOpacity} />
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
            className={`w-[360px] p-3.5 flex flex-col overflow-hidden ${textColor} ${shadowClass} transition-all relative`}
            style={{
              background: flyoutResolved.background,
              backdropFilter: flyoutResolved.backdropFilter,
              WebkitBackdropFilter: flyoutResolved.backdropFilter,
              borderRadius: `${cornerRadius}px`,
              border: borderThickness > 0 ? `${borderThickness}px solid ${accentColor}` : 'none',
              boxShadow: flyoutResolved.boxShadow,
              transitionDuration: 'var(--flyout-duration)',
              transitionTimingFunction: 'var(--flyout-easing)',
            }}
          >
            <NoiseOverlay material={flyoutResolved.material} noiseOpacity={noiseOpacity} />
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
          data-testid="flyout-quicksettings"
          className={`w-[360px] absolute right-4 bottom-3 flex flex-col p-4 gap-3.5 pointer-events-auto transition-all overflow-hidden ${textColor} ${shadowClass} z-40`}
          style={{
            background: flyoutResolved.background,
            backdropFilter: flyoutResolved.backdropFilter,
            WebkitBackdropFilter: flyoutResolved.backdropFilter,
            borderRadius: `${cornerRadius}px`,
            border: borderThickness > 0 ? `${borderThickness}px solid ${accentColor}` : 'none',
            boxShadow: flyoutResolved.boxShadow,
            bottom: dockMode ? `${(dockMargin ?? 12) + 4}px` : undefined,
            right: dockMode ? `${Math.max(16, (dockMargin ?? 12) + 4)}px` : undefined,
            transitionDuration: 'var(--flyout-duration)',
            transitionTimingFunction: 'var(--flyout-easing)',
          }}
        >
          <NoiseOverlay material={flyoutResolved.material} noiseOpacity={noiseOpacity} />
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
    </>
  );
}
