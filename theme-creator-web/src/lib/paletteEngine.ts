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

export function opacityToAlphaHex(opacity: number): string {
  const alphaVal = Math.max(0, Math.min(255, Math.round((opacity / 100) * 255)));
  return alphaVal.toString(16).padStart(2, '0');
}

export function buildLinearGradientBrush(
  startPoint: string,
  endPoint: string,
  bgRgb: RGB,
  accentRgb: RGB,
  secRgb: RGB,
  opacity: number = 97
): string {
  const alphaHex = opacityToAlphaHex(opacity);
  const toHex = (rgb: RGB) =>
    rgb.map((c) => c.toString(16).padStart(2, '0')).join('');
  return `<LinearGradientBrush StartPoint="${startPoint}" EndPoint="${endPoint}"><GradientStop Color="#${alphaHex}${toHex(bgRgb)}" Offset="0.0" /><GradientStop Color="#${alphaHex}${toHex(accentRgb)}" Offset="0.5" /><GradientStop Color="#${alphaHex}${toHex(secRgb)}" Offset="1.0"/></LinearGradientBrush>`;
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

export function hslToRgb(h: number, s: number, l: number): RGB {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  return [
    Math.max(0, Math.min(255, Math.round((r + m) * 255))),
    Math.max(0, Math.min(255, Math.round((g + m) * 255))),
    Math.max(0, Math.min(255, Math.round((b + m) * 255))),
  ];
}

export type ColorHarmonyType = 'custom' | 'analogous' | 'complementary' | 'triadic' | 'monochromatic';

export interface ColorHarmonyResult {
  primary: string;
  secondary: string;
  tertiary?: string;
  accent?: string;
}

export function computeColorHarmonies(accentHex: string, harmony: ColorHarmonyType): ColorHarmonyResult {
  const baseRgb = hexToRgb(accentHex);
  const [h, s, l] = rgbToHsl(baseRgb[0], baseRgb[1], baseRgb[2]);

  switch (harmony) {
    case 'analogous': {
      const secH = (h + 30) % 360;
      const tertH = (h - 30 + 360) % 360;
      return {
        primary: accentHex,
        secondary: rgbToHex(hslToRgb(secH, s, l)),
        tertiary: rgbToHex(hslToRgb(tertH, s, l)),
      };
    }
    case 'complementary': {
      const secH = (h + 180) % 360;
      return {
        primary: accentHex,
        secondary: rgbToHex(hslToRgb(secH, s, l)),
        tertiary: rgbToHex(hslToRgb((secH + 25) % 360, Math.max(0.2, s * 0.8), l)),
      };
    }
    case 'triadic': {
      const secH = (h + 120) % 360;
      const tertH = (h + 240) % 360;
      return {
        primary: accentHex,
        secondary: rgbToHex(hslToRgb(secH, s, l)),
        tertiary: rgbToHex(hslToRgb(tertH, s, l)),
      };
    }
    case 'monochromatic': {
      const secL = l > 0.5 ? Math.max(0.2, l - 0.3) : Math.min(0.85, l + 0.3);
      const tertL = l > 0.5 ? Math.max(0.15, l - 0.45) : Math.min(0.9, l + 0.45);
      return {
        primary: accentHex,
        secondary: rgbToHex(hslToRgb(h, Math.max(0.2, s * 0.8), secL)),
        tertiary: rgbToHex(hslToRgb(h, Math.max(0.15, s * 0.6), tertL)),
      };
    }
    case 'custom':
    default:
      return {
        primary: accentHex,
        secondary: accentHex,
      };
  }
}


export interface ExtractedPalette {
  primary: string;
  secondary: string;
  dominant?: string;
  vibrant?: string;
  darkSurface?: string;
  lightSurface?: string;
  swatches?: string[];
}

export function extractPaletteFromPixels(pixels: Uint8ClampedArray | number[]): ExtractedPalette {
  const numBuckets = 12;
  const buckets: { count: number; rSum: number; gSum: number; bSum: number }[] = Array.from(
    { length: numBuckets },
    () => ({ count: 0, rSum: 0, gSum: 0, bSum: 0 })
  );

  let darkR = 0, darkG = 0, darkB = 0, darkCount = 0;
  let lightR = 0, lightG = 0, lightB = 0, lightCount = 0;
  let totalVibrant = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    if (a < 128) continue;

    const [h, s, l] = rgbToHsl(r, g, b);

    if (l < 0.25) {
      darkR += r; darkG += g; darkB += b; darkCount++;
    } else if (l > 0.8) {
      lightR += r; lightG += g; lightB += b; lightCount++;
    }

    if (s > 0.25 && l > 0.18 && l < 0.85) {
      const bucketIdx = Math.floor((h % 360) / 30);
      buckets[bucketIdx].count++;
      buckets[bucketIdx].rSum += r;
      buckets[bucketIdx].gSum += g;
      buckets[bucketIdx].bSum += b;
      totalVibrant++;
    }
  }

  const darkSurface = darkCount > 0
    ? rgbToHex([Math.round(darkR / darkCount), Math.round(darkG / darkCount), Math.round(darkB / darkCount)])
    : '#12141a';

  const lightSurface = lightCount > 0
    ? rgbToHex([Math.round(lightR / lightCount), Math.round(lightG / lightCount), Math.round(lightB / lightCount)])
    : '#f5f5fa';

  if (totalVibrant === 0) {
    return {
      primary: '#0078D4',
      secondary: '#005A9E',
      dominant: '#0078D4',
      vibrant: '#0078D4',
      darkSurface,
      lightSurface,
      swatches: ['#0078D4', '#005A9E', '#2B88D8', darkSurface, lightSurface],
    };
  }

  const sorted = buckets
    .map((b, idx) => ({ ...b, idx }))
    .filter((b) => b.count > 0)
    .sort((a, b) => b.count - a.count);

  const topBucket = sorted[0];
  const primaryRgb: RGB = [
    Math.round(topBucket.rSum / topBucket.count),
    Math.round(topBucket.gSum / topBucket.count),
    Math.round(topBucket.bSum / topBucket.count),
  ];
  const primary = rgbToHex(primaryRgb);

  const distinctSecondaryBucket = sorted.slice(1).find((b) => {
    const diff = Math.abs(b.idx - topBucket.idx);
    const circularDiff = Math.min(diff, numBuckets - diff);
    return circularDiff >= 2;
  });

  let secondary: string;
  if (distinctSecondaryBucket) {
    const secRgb: RGB = [
      Math.round(distinctSecondaryBucket.rSum / distinctSecondaryBucket.count),
      Math.round(distinctSecondaryBucket.gSum / distinctSecondaryBucket.count),
      Math.round(distinctSecondaryBucket.bSum / distinctSecondaryBucket.count),
    ];
    secondary = rgbToHex(secRgb);
  } else {
    const secRgb = blend(primaryRgb, [0, 0, 0], 0.35);
    secondary = rgbToHex(secRgb);
  }

  const swatches: string[] = [primary, secondary];
  sorted.slice(1).forEach((b) => {
    const hex = rgbToHex([
      Math.round(b.rSum / b.count),
      Math.round(b.gSum / b.count),
      Math.round(b.bSum / b.count),
    ]);
    if (!swatches.includes(hex) && swatches.length < 5) {
      swatches.push(hex);
    }
  });
  if (swatches.length < 5 && !swatches.includes(darkSurface)) swatches.push(darkSurface);
  if (swatches.length < 5 && !swatches.includes(lightSurface)) swatches.push(lightSurface);

  return {
    primary,
    secondary,
    dominant: primary,
    vibrant: primary,
    darkSurface,
    lightSurface,
    swatches,
  };
}

export async function extractPaletteFromImageUrl(imageUrl: string): Promise<ExtractedPalette> {
  if (typeof window === 'undefined') {
    return {
      primary: '#0078D4',
      secondary: '#005A9E',
      dominant: '#0078D4',
      vibrant: '#0078D4',
      darkSurface: '#12141a',
      lightSurface: '#f5f5fa',
      swatches: ['#0078D4', '#005A9E', '#2B88D8', '#12141a', '#f5f5fa'],
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({
            primary: '#0078D4',
            secondary: '#005A9E',
            dominant: '#0078D4',
            vibrant: '#0078D4',
            darkSurface: '#12141a',
            lightSurface: '#f5f5fa',
            swatches: ['#0078D4', '#005A9E'],
          });
        }
        canvas.width = 64;
        canvas.height = 64;
        ctx.drawImage(img, 0, 0, 64, 64);
        const imageData = ctx.getImageData(0, 0, 64, 64);
        const palette = extractPaletteFromPixels(imageData.data);
        resolve(palette);
      } catch {
        resolve({
          primary: '#0078D4',
          secondary: '#005A9E',
          dominant: '#0078D4',
          vibrant: '#0078D4',
          darkSurface: '#12141a',
          lightSurface: '#f5f5fa',
          swatches: ['#0078D4', '#005A9E'],
        });
      }
    };
    img.onerror = () => {
      resolve({
        primary: '#0078D4',
        secondary: '#005A9E',
        dominant: '#0078D4',
        vibrant: '#0078D4',
        darkSurface: '#12141a',
        lightSurface: '#f5f5fa',
        swatches: ['#0078D4', '#005A9E'],
      });
    };
    img.src = imageUrl;
  });
}


