import React from 'react';
import { StartButtonPresetId } from '@/store/useThemeStore';

export interface StartButtonPreset {
  id: StartButtonPresetId;
  name: string;
  renderSvg: (color: string, size: number) => React.ReactNode;
}

export const START_BUTTON_PRESETS: StartButtonPreset[] = [
  {
    id: 'win11-minimal',
    name: 'Windows 11 Minimal',
    renderSvg: (color: string, size: number) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="9" height="9" rx="1.5" fill={color} />
        <rect x="13" y="2" width="9" height="9" rx="1.5" fill={color} />
        <rect x="2" y="13" width="9" height="9" rx="1.5" fill={color} />
        <rect x="13" y="13" width="9" height="9" rx="1.5" fill={color} />
      </svg>
    ),
  },
  {
    id: 'win98-retro',
    name: 'Retro 98/XP Flag',
    renderSvg: (color: string, size: number) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3 5.5C5.5 3.5 8.5 5 11.5 4.5V11C8.5 11.5 5.5 10 3 12V5.5Z"
          fill={color}
          fillOpacity="0.9"
        />
        <path
          d="M12.5 4.3C15.5 3.8 18.5 5.5 21 3.5V10C18.5 12 15.5 10.5 12.5 11V4.3Z"
          fill={color}
        />
        <path
          d="M3 13C5.5 11 8.5 12.5 11.5 12V18.5C8.5 19 5.5 17.5 3 19.5V13Z"
          fill={color}
          fillOpacity="0.8"
        />
        <path
          d="M12.5 11.8C15.5 11.3 18.5 13 21 11V17.5C18.5 19.5 15.5 18 12.5 18.5V11.8Z"
          fill={color}
          fillOpacity="0.95"
        />
      </svg>
    ),
  },
  {
    id: 'apple-glyph',
    name: 'Apple Glyph',
    renderSvg: (color: string, size: number) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M15.5 2C15.5 3.2 14.6 4.3 13.5 4.8C13.2 3.6 14.2 2.4 15.5 2Z"
          fill={color}
        />
        <path
          d="M18.7 12.8C18.7 10.4 20.6 9.2 20.7 9.1C19.6 7.5 17.9 7.3 17.3 7.2C15.8 7.1 14.4 8.1 13.6 8.1C12.8 8.1 11.6 7.2 10.4 7.2C8.8 7.2 7.3 8.2 6.5 9.6C4.8 12.5 6.1 16.9 7.7 19.3C8.5 20.4 9.5 21.7 10.8 21.6C12 21.6 12.5 20.8 14 20.8C15.4 20.8 15.8 21.6 17.1 21.6C18.4 21.6 19.2 20.4 20 19.3C20.9 18 21.3 16.7 21.4 16.6C21.3 16.5 18.7 15.5 18.7 12.8Z"
          fill={color}
        />
      </svg>
    ),
  },
  {
    id: 'cyberpunk-hex',
    name: 'Cyberpunk Hexagon',
    renderSvg: (color: string, size: number) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 2L21 7.2V16.8L12 22L3 16.8V7.2L12 2Z"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M12 6L17.2 9V15L12 18L6.8 15V9L12 6Z"
          fill={color}
          fillOpacity="0.4"
        />
        <circle cx="12" cy="12" r="2.5" fill={color} />
      </svg>
    ),
  },
  {
    id: 'linux-tux',
    name: 'Linux Tux',
    renderSvg: (color: string, size: number) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 2C9.5 2 7.5 4 7.5 6.5C7.5 7.5 7.8 8.4 8.3 9.1C6.4 10.3 5 12.5 5 15C5 18 7.5 20 10 20.8C9.5 21.2 8.5 21.5 8 22H16C15.5 21.5 14.5 21.2 14 20.8C16.5 20 19 18 19 15C19 12.5 17.6 10.3 15.7 9.1C16.2 8.4 16.5 7.5 16.5 6.5C16.5 4 14.5 2 12 2Z"
          fill={color}
        />
        <circle cx="10.5" cy="6" r="1" fill="#000" />
        <circle cx="13.5" cy="6" r="1" fill="#000" />
        <polygon points="12,7.5 10.5,9 13.5,9" fill="#FFA500" />
        <ellipse cx="12" cy="15" rx="4" ry="4.5" fill="#FFFFFF" fillOpacity="0.25" />
      </svg>
    ),
  },
  {
    id: 'minimal-diamond',
    name: 'Minimal Diamond',
    renderSvg: (color: string, size: number) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect
          x="12"
          y="2"
          width="14.14"
          height="14.14"
          rx="2"
          transform="rotate(45 12 2)"
          stroke={color}
          strokeWidth="2"
        />
        <rect
          x="12"
          y="6.5"
          width="7.78"
          height="7.78"
          rx="1"
          transform="rotate(45 12 6.5)"
          fill={color}
        />
      </svg>
    ),
  },
  {
    id: 'gaming-rog',
    name: 'ROG Gaming Badge',
    renderSvg: (color: string, size: number) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M21 3L17 11L14 10L17.5 4L5 13L9 14L4 21L19 10L15 9L21 3Z"
          fill={color}
        />
      </svg>
    ),
  },
  {
    id: 'fluent-orb',
    name: 'Fluent Orb',
    renderSvg: (color: string, size: number) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
        <circle cx="12" cy="12" r="6" fill={color} fillOpacity="0.4" />
        <circle cx="12" cy="12" r="3" fill={color} />
      </svg>
    ),
  },
];

export function renderStartButtonSvg(presetId: StartButtonPresetId, color: string, size: number): React.ReactNode {
  const preset = START_BUTTON_PRESETS.find((p) => p.id === presetId) || START_BUTTON_PRESETS[0];
  return preset.renderSvg(color, size);
}

export function getStartButtonSvgMarkup(
  presetId: StartButtonPresetId,
  color: string,
  size: number = 96
): string {
  switch (presetId) {
    case 'win11-minimal':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="9" height="9" rx="1.5" fill="${color}" /><rect x="13" y="2" width="9" height="9" rx="1.5" fill="${color}" /><rect x="2" y="13" width="9" height="9" rx="1.5" fill="${color}" /><rect x="13" y="13" width="9" height="9" rx="1.5" fill="${color}" /></svg>`;
    case 'win98-retro':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 5.5C5.5 3.5 8.5 5 11.5 4.5V11C8.5 11.5 5.5 10 3 12V5.5Z" fill="${color}" fill-opacity="0.9"/><path d="M12.5 4.3C15.5 3.8 18.5 5.5 21 3.5V10C18.5 12 15.5 10.5 12.5 11V4.3Z" fill="${color}"/><path d="M3 13C5.5 11 8.5 12.5 11.5 12V18.5C8.5 19 5.5 17.5 3 19.5V13Z" fill="${color}" fill-opacity="0.8"/><path d="M12.5 11.8C15.5 11.3 18.5 13 21 11V17.5C18.5 19.5 15.5 18 12.5 18.5V11.8Z" fill="${color}" fill-opacity="0.95"/></svg>`;
    case 'apple-glyph':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.5 2C15.5 3.2 14.6 4.3 13.5 4.8C13.2 3.6 14.2 2.4 15.5 2Z" fill="${color}"/><path d="M18.7 12.8C18.7 10.4 20.6 9.2 20.7 9.1C19.6 7.5 17.9 7.3 17.3 7.2C15.8 7.1 14.4 8.1 13.6 8.1C12.8 8.1 11.6 7.2 10.4 7.2C8.8 7.2 7.3 8.2 6.5 9.6C4.8 12.5 6.1 16.9 7.7 19.3C8.5 20.4 9.5 21.7 10.8 21.6C12 21.6 12.5 20.8 14 20.8C15.4 20.8 15.8 21.6 17.1 21.6C18.4 21.6 19.2 20.4 20 19.3C20.9 18 21.3 16.7 21.4 16.6C21.3 16.5 18.7 15.5 18.7 12.8Z" fill="${color}"/></svg>`;
    case 'cyberpunk-hex':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L21 7.2V16.8L12 22L3 16.8V7.2L12 2Z" stroke="${color}" stroke-width="2" stroke-linejoin="round"/><path d="M12 6L17.2 9V15L12 18L6.8 15V9L12 6Z" fill="${color}" fill-opacity="0.4"/><circle cx="12" cy="12" r="2.5" fill="${color}"/></svg>`;
    case 'linux-tux':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C9.5 2 7.5 4 7.5 6.5C7.5 7.5 7.8 8.4 8.3 9.1C6.4 10.3 5 12.5 5 15C5 18 7.5 20 10 20.8C9.5 21.2 8.5 21.5 8 22H16C15.5 21.5 14.5 21.2 14 20.8C16.5 20 19 18 19 15C19 12.5 17.6 10.3 15.7 9.1C16.2 8.4 16.5 7.5 16.5 6.5C16.5 4 14.5 2 12 2Z" fill="${color}"/><circle cx="10.5" cy="6" r="1" fill="#000"/><circle cx="13.5" cy="6" r="1" fill="#000"/><polygon points="12,7.5 10.5,9 13.5,9" fill="#FFA500"/><ellipse cx="12" cy="15" rx="4" ry="4.5" fill="#FFFFFF" fill-opacity="0.25"/></svg>`;
    case 'minimal-diamond':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="12" y="2" width="14.14" height="14.14" rx="2" transform="rotate(45 12 2)" stroke="${color}" stroke-width="2"/><rect x="12" y="6.5" width="7.78" height="7.78" rx="1" transform="rotate(45 12 6.5)" fill="${color}"/></svg>`;
    case 'gaming-rog':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 3L17 11L14 10L17.5 4L5 13L9 14L4 21L19 10L15 9L21 3Z" fill="${color}"/></svg>`;
    case 'fluent-orb':
    default:
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="${color}" stroke-width="1.5"/><circle cx="12" cy="12" r="6" fill="${color}" fill-opacity="0.4"/><circle cx="12" cy="12" r="3" fill="${color}"/></svg>`;
  }
}

export async function rasterizeSvgToPng(
  svgString: string,
  size: number = 96
): Promise<Uint8Array | null> {
  if (
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    (typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom'))
  ) {
    return null;
  }
  return new Promise((resolve) => {
    try {
      const timer = setTimeout(() => {
        resolve(null);
      }, 500);

      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      img.onload = () => {
        clearTimeout(timer);
        try {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(url);
            resolve(null);
          } else {
            ctx.clearRect(0, 0, size, size);
            ctx.drawImage(img, 0, 0, size, size);
            URL.revokeObjectURL(url);
            canvas.toBlob(async (blob) => {
              if (!blob) {
                resolve(null);
                return;
              }
              const buf = await blob.arrayBuffer();
              resolve(new Uint8Array(buf));
            }, 'image/png');
          }
        } catch {
          URL.revokeObjectURL(url);
          resolve(null);
        }
      };
      img.onerror = () => {
        clearTimeout(timer);
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    } catch {
      resolve(null);
    }
  });
}
