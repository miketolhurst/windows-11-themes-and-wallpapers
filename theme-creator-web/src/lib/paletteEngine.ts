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

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
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

export interface ExtractedPalette {
  primary: string;
  secondary: string;
}

export function extractPaletteFromPixels(pixels: Uint8ClampedArray | number[]): ExtractedPalette {
  const numBuckets = 12;
  const buckets: { count: number; rSum: number; gSum: number; bSum: number }[] = Array.from(
    { length: numBuckets },
    () => ({ count: 0, rSum: 0, gSum: 0, bSum: 0 })
  );

  let totalVibrant = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    if (a < 128) continue;

    const [h, s, l] = rgbToHsl(r, g, b);

    if (s > 0.25 && l > 0.18 && l < 0.85) {
      const bucketIdx = Math.floor((h % 360) / 30);
      buckets[bucketIdx].count++;
      buckets[bucketIdx].rSum += r;
      buckets[bucketIdx].gSum += g;
      buckets[bucketIdx].bSum += b;
      totalVibrant++;
    }
  }

  if (totalVibrant === 0) {
    return { primary: '#0078D4', secondary: '#005A9E' };
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

  return { primary, secondary };
}

export async function extractPaletteFromImageUrl(imageUrl: string): Promise<ExtractedPalette> {
  if (typeof window === 'undefined') {
    return { primary: '#0078D4', secondary: '#005A9E' };
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({ primary: '#0078D4', secondary: '#005A9E' });
        }
        canvas.width = 64;
        canvas.height = 64;
        ctx.drawImage(img, 0, 0, 64, 64);
        const imageData = ctx.getImageData(0, 0, 64, 64);
        const palette = extractPaletteFromPixels(imageData.data);
        resolve(palette);
      } catch {
        resolve({ primary: '#0078D4', secondary: '#005A9E' });
      }
    };
    img.onerror = () => {
      resolve({ primary: '#0078D4', secondary: '#005A9E' });
    };
    img.src = imageUrl;
  });
}

