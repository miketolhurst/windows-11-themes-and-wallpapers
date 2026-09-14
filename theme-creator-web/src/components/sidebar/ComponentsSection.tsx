import React, { useState } from 'react';
import { useThemeStore } from '../../store/useThemeStore';
import ComponentIsolationSection from '../ComponentIsolationSection';
import TypographyAnimationSection from '../TypographyAnimationSection';

export interface ComponentsSectionProps {
  onOpenGradientModal: (
    target: 'global' | 'taskbar' | 'startMenu' | 'flyout' | 'contextMenu' | 'fileExplorer'
  ) => void;
}

export default function ComponentsSection({ onOpenGradientModal }: ComponentsSectionProps) {
  const setActivePane = useThemeStore((s) => s.setActivePane);
  const [isIsolationExpanded, setIsIsolationExpanded] = useState(false);
  const [isTypographyExpanded, setIsTypographyExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {/* Component Isolation Accordion */}
      <div className="border border-neutral-800 rounded-xl bg-neutral-900/40 p-3">
        <button
          type="button"
          onClick={() => setIsIsolationExpanded(!isIsolationExpanded)}
          className="w-full flex items-center justify-between text-left cursor-pointer group select-none"
        >
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] text-neutral-400 transition-transform duration-200 ${
                isIsolationExpanded ? 'rotate-90' : ''
              }`}
            >
              ▶
            </span>
            <label className="text-xs font-semibold uppercase text-neutral-300 group-hover:text-white cursor-pointer">
              Component Isolation
            </label>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-400 group-hover:text-neutral-200">
              {isIsolationExpanded ? '▲' : '▼'}
            </span>
          </div>
        </button>

        {isIsolationExpanded && (
          <div className="mt-3 pt-3 border-t border-neutral-800">
            <ComponentIsolationSection
              onOpenGradientEditor={(target) => onOpenGradientModal(target)}
            />
          </div>
        )}
      </div>

      {/* Typography & Animations Accordion */}
      <div className="border border-neutral-800 rounded-xl bg-neutral-900/40 p-3">
        <button
          type="button"
          onClick={() => setIsTypographyExpanded(!isTypographyExpanded)}
          className="w-full flex items-center justify-between text-left cursor-pointer group select-none"
        >
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] text-neutral-400 transition-transform duration-200 ${
                isTypographyExpanded ? 'rotate-90' : ''
              }`}
            >
              ▶
            </span>
            <label className="text-xs font-semibold uppercase text-neutral-300 group-hover:text-white cursor-pointer">
              Typography & Animations
            </label>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-400 group-hover:text-neutral-200">
              {isTypographyExpanded ? '▲' : '▼'}
            </span>
          </div>
        </button>

        {isTypographyExpanded && (
          <div className="mt-3 pt-3 border-t border-neutral-800">
            <TypographyAnimationSection
              onTestAnimation={() => {
                const currentPane = useThemeStore.getState().activePane;
                setActivePane(currentPane === 'start' ? null : 'start');
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
