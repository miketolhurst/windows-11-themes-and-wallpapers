import React from 'react';
import {
  MaterialStyle,
  ComponentOverride,
  GradientConfig,
} from '../../store/useThemeStore';
import { hexToRgb } from '../../lib/paletteEngine';

export function colorToRgba(color: string, opacity: number): string {
  if (color.startsWith('#')) {
    const rgb = hexToRgb(color);
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`;
  }
  return color;
}

export function buildGradientCss(
  gradient: GradientConfig,
  opacity: number,
  fallbackAngle: number = 90
): string {
  if (!gradient?.stops || gradient.stops.length === 0) return 'transparent';
  const angle = gradient.angle ?? fallbackAngle;
  const sortedStops = [...(gradient.stops || [])].sort((a, b) => a.offset - b.offset);
  const cssStops = sortedStops
    .map((s) => `${colorToRgba(s.color, opacity)} ${s.offset}%`)
    .join(', ');
  if (gradient.type === 'radial') {
    return `radial-gradient(circle at center, ${cssStops})`;
  }
  return `linear-gradient(${angle}deg, ${cssStops})`;
}

export interface ResolvedComponentStyle {
  material: MaterialStyle;
  opacity: number;
  blur: number;
  backdropFilter: string;
  background: string;
  boxShadow?: string;
}

export function resolveComponentStyle({
  component,
  override,
  materialStyle,
  taskbarMode,
  globalGradient,
  defaultBlur,
  defaultOpacity,
  accentColor,
  secondaryAccent,
  isLightMode,
}: {
  component: 'taskbar' | 'startMenu' | 'flyout';
  override?: ComponentOverride;
  materialStyle?: MaterialStyle;
  taskbarMode?: 'blur' | 'gradient';
  globalGradient?: GradientConfig;
  defaultBlur: number;
  defaultOpacity: number;
  accentColor: string;
  secondaryAccent: string;
  isLightMode: boolean;
}): ResolvedComponentStyle {
  const isOverridden = Boolean(override?.enabled);
  const baseMaterial = materialStyle || 'fluent-acrylic';
  const mat: MaterialStyle =
    isOverridden && override?.materialStyle ? override.materialStyle : baseMaterial;

  const op =
    isOverridden && override?.opacity !== undefined
      ? override.opacity / 100
      : (defaultOpacity ?? 97) / 100;

  const blur =
    isOverridden && override?.blur !== undefined
      ? override.blur
      : (defaultBlur ?? (component === 'taskbar' ? 10 : 15));

  const accentRgb = hexToRgb(accentColor);
  const secRgb = hexToRgb(secondaryAccent);
  const bgRgb = isLightMode ? [240, 240, 245] : [16, 18, 22];

  let background = '';
  let backdropFilter = 'none';

  if (isOverridden && override?.customColor) {
    const customRgb = hexToRgb(override.customColor);
    background = `rgba(${customRgb[0]}, ${customRgb[1]}, ${customRgb[2]}, ${op})`;
    if (mat === 'mica') {
      backdropFilter = 'blur(40px) saturate(1.15)';
    } else if (mat === 'mica-alt') {
      backdropFilter = 'blur(45px) saturate(1.10)';
    } else if (mat === 'fluent-acrylic') {
      backdropFilter = `blur(${blur}px)`;
    } else {
      backdropFilter = 'none';
    }
  } else if (isOverridden && override?.gradient) {
    background = buildGradientCss(override.gradient, op);
    backdropFilter = 'none';
  } else if (!isOverridden && taskbarMode === 'gradient' && mat !== 'linear-gradient') {
    backdropFilter = 'none';
    if (component === 'taskbar') {
      background = `linear-gradient(90deg, rgba(${secRgb[0]}, ${secRgb[1]}, ${secRgb[2]}, ${op}) 0%, rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, ${op}) 50%, rgba(${bgRgb[0]}, ${bgRgb[1]}, ${bgRgb[2]}, ${op}) 100%)`;
    } else if (component === 'startMenu') {
      background = `linear-gradient(135deg, rgba(${bgRgb[0]}, ${bgRgb[1]}, ${bgRgb[2]}, ${op}) 0%, rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, ${op}) 50%, rgba(${secRgb[0]}, ${secRgb[1]}, ${secRgb[2]}, ${op}) 100%)`;
    } else {
      background = `linear-gradient(315deg, rgba(${bgRgb[0]}, ${bgRgb[1]}, ${bgRgb[2]}, ${op}) 0%, rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, ${op}) 50%, rgba(${secRgb[0]}, ${secRgb[1]}, ${secRgb[2]}, ${op}) 100%)`;
    }
  } else if (mat === 'mica') {
    backdropFilter = 'blur(40px) saturate(1.15)';
    const micaAlpha = Number((op * 0.88).toFixed(2));
    background = isLightMode
      ? `rgba(243, 243, 243, ${micaAlpha})`
      : `rgba(32, 32, 32, ${micaAlpha})`;
  } else if (mat === 'mica-alt') {
    backdropFilter = 'blur(45px) saturate(1.10)';
    const micaAltAlpha = Number((op * 0.94).toFixed(2));
    background = isLightMode
      ? `rgba(235, 235, 235, ${micaAltAlpha})`
      : `rgba(24, 24, 24, ${micaAltAlpha})`;
  } else if (mat === 'pure-black-neon') {
    backdropFilter = 'none';
    background = isLightMode ? 'rgba(255, 255, 255, 0.98)' : 'rgba(0, 0, 0, 0.98)';
  } else if (mat === 'matte-slate') {
    backdropFilter = 'none';
    if (component === 'taskbar') {
      background = isLightMode ? '#e2e8f0' : '#1e293b';
    } else {
      background = isLightMode ? '#f1f5f9' : '#0f172a';
    }
  } else if (mat === 'linear-gradient') {
    backdropFilter = 'none';
    if (override?.gradient) {
      background = buildGradientCss(override.gradient, op);
    } else if (globalGradient && globalGradient.stops && globalGradient.stops.length > 0) {
      background = buildGradientCss(globalGradient, op);
    } else {
      if (component === 'taskbar') {
        background = `linear-gradient(90deg, rgba(${secRgb[0]}, ${secRgb[1]}, ${secRgb[2]}, ${op}) 0%, rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, ${op}) 50%, rgba(${bgRgb[0]}, ${bgRgb[1]}, ${bgRgb[2]}, ${op}) 100%)`;
      } else if (component === 'startMenu') {
        background = `linear-gradient(135deg, rgba(${bgRgb[0]}, ${bgRgb[1]}, ${bgRgb[2]}, ${op}) 0%, rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, ${op}) 50%, rgba(${secRgb[0]}, ${secRgb[1]}, ${secRgb[2]}, ${op}) 100%)`;
      } else {
        background = `linear-gradient(315deg, rgba(${bgRgb[0]}, ${bgRgb[1]}, ${bgRgb[2]}, ${op}) 0%, rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, ${op}) 50%, rgba(${secRgb[0]}, ${secRgb[1]}, ${secRgb[2]}, ${op}) 100%)`;
      }
    }
  } else {
    // fluent-acrylic (default)
    backdropFilter = `blur(${blur}px)`;
    if (component === 'taskbar') {
      background = isLightMode
        ? `rgba(245, 245, 250, ${(op * 0.72).toFixed(2)})`
        : `rgba(20, 20, 24, ${(op * 0.65).toFixed(2)})`;
    } else if (component === 'startMenu') {
      background = isLightMode
        ? `radial-gradient(circle at 90% 10%, ${secondaryAccent}35 0%, transparent 65%), radial-gradient(circle at 10% 90%, ${accentColor}35 0%, transparent 65%), rgba(245, 245, 250, 0.84)`
        : `radial-gradient(circle at 90% 10%, ${secondaryAccent}40 0%, transparent 65%), radial-gradient(circle at 10% 90%, ${accentColor}40 0%, transparent 65%), rgba(18, 20, 25, 0.84)`;
    } else {
      background = isLightMode
        ? `radial-gradient(circle at 90% 90%, ${secondaryAccent}35 0%, transparent 65%), radial-gradient(circle at 10% 10%, ${accentColor}35 0%, transparent 65%), rgba(245, 245, 250, 0.84)`
        : `radial-gradient(circle at 90% 90%, ${secondaryAccent}40 0%, transparent 65%), radial-gradient(circle at 10% 10%, ${accentColor}40 0%, transparent 65%), rgba(18, 20, 25, 0.84)`;
    }
  }

  const boxShadow =
    mat === 'pure-black-neon'
      ? `0 0 24px ${accentColor}60, inset 0 0 16px ${accentColor}25`
      : `0 0 24px -6px ${accentColor}40`;

  return {
    material: mat,
    opacity: op,
    blur,
    backdropFilter,
    background,
    boxShadow,
  };
}

export function getCardBg(mat: MaterialStyle, op: number, isLightMode: boolean): string {
  if (mat === 'linear-gradient') {
    return isLightMode
      ? `rgba(255, 255, 255, ${Math.min(0.7, op * 0.7)})`
      : `rgba(0, 0, 0, ${Math.min(0.4, op * 0.4)})`;
  }
  if (mat === 'pure-black-neon') {
    return isLightMode ? 'rgba(240, 240, 245, 0.9)' : 'rgba(20, 20, 25, 0.9)';
  }
  if (mat === 'matte-slate') {
    return isLightMode ? '#ffffff' : '#1e293b';
  }
  return isLightMode ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.35)';
}

export function NoiseOverlay({
  material,
  noiseOpacity,
}: {
  material: MaterialStyle;
  noiseOpacity?: number;
}) {
  if (material !== 'fluent-acrylic' || (noiseOpacity ?? 0.05) <= 0) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-0 mix-blend-overlay"
      style={{
        opacity: noiseOpacity ?? 0.05,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}
