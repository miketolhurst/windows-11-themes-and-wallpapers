import React from 'react';
import { useThemeStore } from '../../store/useThemeStore';
import { renderStartButtonSvg } from '../../lib/startButtonVectors';
import { resolveComponentStyle, NoiseOverlay } from './previewStyles';

export default function TaskbarPreview() {
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
    runningIndicatorStyle,
    cornerRadius,
    borderThickness: rawBorderThickness,
    customStartIconUrl,
    taskbarBlur,
    taskbarOpacity,
    activePane,
    setActivePane,
    taskbarOverride,
    startButton,
    runningIndicator,
  } = useThemeStore();

  const borderThickness = rawBorderThickness ?? 2;

  const taskbarResolved = resolveComponentStyle({
    component: 'taskbar',
    override: taskbarOverride,
    materialStyle,
    taskbarMode,
    globalGradient,
    defaultBlur: taskbarBlur ?? 10,
    defaultOpacity: taskbarOpacity ?? 97,
    accentColor,
    secondaryAccent,
    isLightMode,
  });

  const textColor = isLightMode ? 'text-neutral-900' : 'text-white';
  const subTextColor = isLightMode ? 'text-neutral-600' : 'text-neutral-400';
  const cardHover = isLightMode ? 'hover:bg-neutral-200/60' : 'hover:bg-white/10';

  return (
    <div
      data-testid="taskbar-container"
      className="h-12 w-full z-30 flex items-center justify-between px-3 transition-all duration-300 relative"
      style={{
        background: taskbarResolved.background,
        backdropFilter: taskbarResolved.backdropFilter,
        WebkitBackdropFilter: taskbarResolved.backdropFilter,
        ...(dockMode
          ? {
              margin: `0 ${dockMargin ?? 12}px ${(dockMargin ?? 12) > 8 ? 8 : (dockMargin ?? 12)}px ${dockMargin ?? 12}px`,
              width: `calc(100% - ${(dockMargin ?? 12) * 2}px)`,
              borderRadius: `${Math.max(cornerRadius, 12)}px`,
              border: borderThickness > 0 ? `${borderThickness}px solid ${accentColor}` : 'none',
              borderTop: borderThickness > 0 ? `${borderThickness}px solid ${accentColor}` : 'none',
              boxShadow:
                taskbarResolved.material === 'pure-black-neon'
                  ? `0 0 20px ${accentColor}60, 0 8px 32px rgba(0,0,0,0.5)`
                  : `0 8px 32px 0 rgba(0, 0, 0, 0.37)`,
            }
          : {
              borderTop: borderThickness > 0 ? `${borderThickness}px solid ${accentColor}` : 'none',
              boxShadow:
                taskbarResolved.material === 'pure-black-neon'
                  ? `0 -4px 16px ${accentColor}40`
                  : undefined,
            }),
      }}
    >
      <NoiseOverlay material={taskbarResolved.material} noiseOpacity={noiseOpacity} />

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
          {customStartIconUrl || (startButton?.type === 'custom' && startButton.customIconUrl) ? (
            <img
              src={
                startButton?.type === 'custom' && startButton.customIconUrl
                  ? startButton.customIconUrl
                  : customStartIconUrl!
              }
              alt="Start Icon"
              className="w-5 h-5 object-contain"
            />
          ) : startButton?.type === 'preset' ? (
            <span data-testid="custom-start-icon-vector" className="flex items-center justify-center">
              {renderStartButtonSvg(
                startButton.presetId || 'win11-minimal',
                startButton.colorMode === 'accent'
                  ? accentColor
                  : startButton.colorMode === 'secondary'
                  ? secondaryAccent
                  : startButton.customColor || accentColor,
                startButton.size || 20
              )}
            </span>
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
        {['🔍', '📂', '🌐', '💬', '🎵'].map((icon, idx) => {
          const indConfig = runningIndicator || {
            style: 'line',
            activeColorMode: 'accent',
            activeCustomColor: accentColor,
            inactiveColorMode: 'subtle-white',
            inactiveCustomColor: '#FFFFFF',
            indicatorSize: 3,
          };

          let effectiveStyle: string = indConfig.style || 'line';
          if (
            runningIndicatorStyle &&
            runningIndicatorStyle !== 'standard' &&
            indConfig.style === 'line'
          ) {
            effectiveStyle = runningIndicatorStyle;
          }
          if (
            runningIndicatorStyle === 'hidden' ||
            indConfig.style === 'off' ||
            (indConfig.style as string) === 'hidden'
          ) {
            effectiveStyle = 'off';
          }

          const isRunning =
            idx < 3 &&
            effectiveStyle !== 'off' &&
            effectiveStyle !== 'hidden';

          const activeColor =
            indConfig.activeColorMode === 'white'
              ? '#ffffff'
              : indConfig.activeColorMode === 'custom'
              ? indConfig.activeCustomColor
              : accentColor;

          const inactiveColor =
            indConfig.inactiveColorMode === 'accent'
              ? accentColor
              : indConfig.inactiveColorMode === 'custom'
              ? indConfig.inactiveCustomColor
              : isLightMode
              ? 'rgba(0,0,0,0.35)'
              : 'rgba(255,255,255,0.45)';

          const indColor = idx === 0 ? activeColor : inactiveColor;
          const indSize = indConfig.indicatorSize || 3;

          return (
            <div
              key={idx}
              className={`w-10 h-10 flex flex-col items-center justify-center text-lg cursor-pointer transition-colors relative ${cardHover}`}
              style={{ borderRadius: `${cornerRadius}px` }}
            >
              <span>{icon}</span>
              {isRunning && (
                effectiveStyle === 'dot' ? (
                  <div
                    data-testid="indicator-dot"
                    className="rounded-full absolute bottom-1 transition-all"
                    style={{
                      width: `${Math.max(4, indSize * 1.5)}px`,
                      height: `${Math.max(4, indSize * 1.5)}px`,
                      backgroundColor: indColor,
                      boxShadow: idx === 0 ? `0 0 6px ${indColor}` : undefined,
                    }}
                  />
                ) : effectiveStyle === 'pill' ? (
                  <div
                    data-testid="indicator-pill"
                    className="rounded-full absolute bottom-1 transition-all"
                    style={{
                      width: '12px',
                      height: `${Math.max(3, indSize)}px`,
                      backgroundColor: indColor,
                      boxShadow: idx === 0 ? `0 0 6px ${indColor}88` : undefined,
                    }}
                  />
                ) : effectiveStyle === 'glow' ? (
                  <div
                    data-testid="indicator-glow"
                    className="rounded-full absolute bottom-0.5 transition-all blur-[1px]"
                    style={{
                      width: '20px',
                      height: `${Math.max(2, indSize)}px`,
                      backgroundColor: indColor,
                      boxShadow: `0 0 8px 2px ${indColor}`,
                    }}
                  />
                ) : (
                  <div
                    data-testid="indicator-standard"
                    className="rounded-full absolute bottom-1 transition-colors"
                    style={{
                      width: '16px',
                      height: `${Math.max(2, indSize)}px`,
                      backgroundColor: indColor,
                    }}
                  />
                )
              )}
            </div>
          );
        })}
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
  );
}
