export type RGB = [number, number, number];

export function hexToRgb(hexStr: string): RGB {
  const cleanHex = hexStr.replace(/^#/, '');
  let fullHex = cleanHex;
  if (cleanHex.length === 3) {
    fullHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const num = parseInt(fullHex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function rgbToHex(rgb: RGB): string {
  return '#' + rgb.map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('');
}

export function blend(rgb1: RGB, rgb2: RGB, factor: number): RGB {
  return [
    Math.max(0, Math.min(255, Math.round(rgb1[0] + (rgb2[0] - rgb1[0]) * factor))),
    Math.max(0, Math.min(255, Math.round(rgb1[1] + (rgb2[1] - rgb1[1]) * factor))),
    Math.max(0, Math.min(255, Math.round(rgb1[2] + (rgb2[2] - rgb1[2]) * factor))),
  ];
}

export interface AccentPaletteResult {
  colors: RGB[];
  bytes: number[];
  hexString: string;
  accentDwordHex: string;
  accentDwordInt: number;
  colorizationHex: string;
  colorizationInt: number;
}

export function computeAccentPalette(accentHex: string, secondaryHex?: string | null): AccentPaletteResult {
  const baseRgb = hexToRgb(accentHex);
  const white: RGB = [255, 255, 255];
  const black: RGB = [0, 0, 0];

  // 8 shades matching Windows 11 AccentPalette specification
  const c0 = blend(baseRgb, white, 0.75); // Lightest
  const c1 = blend(baseRgb, white, 0.50);
  const c2 = blend(baseRgb, white, 0.25);
  const c3: RGB = [baseRgb[0], baseRgb[1], baseRgb[2]]; // Normal accent
  const c4 = blend(baseRgb, black, 0.20);
  const c5 = blend(baseRgb, black, 0.40);
  const c6 = blend(baseRgb, black, 0.60); // Darkest

  let c7: RGB;
  if (secondaryHex) {
    c7 = hexToRgb(secondaryHex);
  } else {
    c7 = [
      (baseRgb[1] + 128) % 256,
      (baseRgb[2] + 128) % 256,
      (baseRgb[0] + 128) % 256,
    ];
  }

  const colors: RGB[] = [c0, c1, c2, c3, c4, c5, c6, c7];
  const bytes: number[] = [];
  for (const rgb of colors) {
    bytes.push(rgb[0], rgb[1], rgb[2], 0);
  }

  const hexString = bytes.map((b) => b.toString(16).padStart(2, '0')).join(',');

  // DWM DWORD: 0xAABBGGRR
  const bHex = baseRgb[2].toString(16).padStart(2, '0');
  const gHex = baseRgb[1].toString(16).padStart(2, '0');
  const rHex = baseRgb[0].toString(16).padStart(2, '0');
  const accentDwordHex = `ff${bHex}${gHex}${rHex}`;
  const accentDwordInt = parseInt(accentDwordHex, 16);

  // ColorizationColor: 0xAARRGGBB
  const colorizationHex = `c4${rHex}${gHex}${bHex}`;
  let colorizationInt = parseInt(colorizationHex, 16);
  if (colorizationInt >= 0x80000000) {
    colorizationInt -= 0x100000000;
  }

  return {
    colors,
    bytes,
    hexString,
    accentDwordHex,
    accentDwordInt,
    colorizationHex,
    colorizationInt,
  };
}

export function buildLinearGradientBrush(
  startPoint: string,
  endPoint: string,
  bgRgb: RGB,
  accentRgb: RGB,
  secRgb: RGB
): string {
  const toHex = (rgb: RGB) =>
    rgb.map((c) => c.toString(16).padStart(2, '0')).join('');
  return `<LinearGradientBrush StartPoint="${startPoint}" EndPoint="${endPoint}"><GradientStop Color="#f8${toHex(bgRgb)}" Offset="0.0" /><GradientStop Color="#f8${toHex(accentRgb)}" Offset="0.5" /><GradientStop Color="#f8${toHex(secRgb)}" Offset="1.0"/></LinearGradientBrush>`;
}
