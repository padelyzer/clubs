/**
 * LCH Color System
 * Based on Linear's approach to perceptually uniform color generation
 * LCH provides better color consistency across different hues
 */

export interface LCHColor {
  l: number; // Lightness: 0-100
  c: number; // Chroma: 0-150 (saturation)
  h: number; // Hue: 0-360
  a?: number; // Alpha: 0-1
}

export interface RGBColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

/**
 * Convert LCH to RGB
 * Uses D65 illuminant (standard for sRGB)
 */
export function lchToRgb(lch: LCHColor): RGBColor {
  const { l, c, h, a = 1 } = lch;
  
  // Convert to Lab
  const labL = l;
  const labA = c * Math.cos((h * Math.PI) / 180);
  const labB = c * Math.sin((h * Math.PI) / 180);
  
  // Lab to XYZ
  const fy = (labL + 16) / 116;
  const fx = labA / 500 + fy;
  const fz = fy - labB / 200;
  
  const xn = 0.95047;
  const yn = 1.0;
  const zn = 1.08883;
  
  const x = xn * (fx ** 3 > 0.008856 ? fx ** 3 : (fx - 16 / 116) / 7.787);
  const y = yn * (fy ** 3 > 0.008856 ? fy ** 3 : (fy - 16 / 116) / 7.787);
  const z = zn * (fz ** 3 > 0.008856 ? fz ** 3 : (fz - 16 / 116) / 7.787);
  
  // XYZ to RGB
  let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
  let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
  let b = x * 0.0557 + y * -0.2040 + z * 1.0570;
  
  // Gamma correction
  r = r > 0.0031308 ? 1.055 * r ** (1 / 2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * g ** (1 / 2.4) - 0.055 : 12.92 * g;
  b = b > 0.0031308 ? 1.055 * b ** (1 / 2.4) - 0.055 : 12.92 * b;
  
  // Clamp values
  r = Math.max(0, Math.min(1, r));
  g = Math.max(0, Math.min(1, g));
  b = Math.max(0, Math.min(1, b));
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a,
  };
}

/**
 * Convert RGB to LCH
 */
export function rgbToLch(rgb: RGBColor): LCHColor {
  let { r, g, b, a = 1 } = rgb;
  
  // Normalize RGB values
  r = r / 255;
  g = g / 255;
  b = b / 255;
  
  // Gamma expansion
  r = r > 0.04045 ? ((r + 0.055) / 1.055) ** 2.4 : r / 12.92;
  g = g > 0.04045 ? ((g + 0.055) / 1.055) ** 2.4 : g / 12.92;
  b = b > 0.04045 ? ((b + 0.055) / 1.055) ** 2.4 : b / 12.92;
  
  // RGB to XYZ
  const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = r * 0.0193 + g * 0.1192 + b * 0.9505;
  
  // XYZ to Lab
  const xn = 0.95047;
  const yn = 1.0;
  const zn = 1.08883;
  
  const fx = x / xn > 0.008856 ? (x / xn) ** (1 / 3) : (7.787 * x / xn + 16 / 116);
  const fy = y / yn > 0.008856 ? (y / yn) ** (1 / 3) : (7.787 * y / yn + 16 / 116);
  const fz = z / zn > 0.008856 ? (z / zn) ** (1 / 3) : (7.787 * z / zn + 16 / 116);
  
  const labL = 116 * fy - 16;
  const labA = 500 * (fx - fy);
  const labB = 200 * (fy - fz);
  
  // Lab to LCH
  const c = Math.sqrt(labA ** 2 + labB ** 2);
  let h = Math.atan2(labB, labA) * (180 / Math.PI);
  
  if (h < 0) h += 360;
  
  return {
    l: labL,
    c,
    h,
    a,
  };
}

/**
 * Convert LCH to CSS string
 */
export function lchToCss(lch: LCHColor): string {
  const rgb = lchToRgb(lch);
  if (rgb.a !== undefined && rgb.a < 1) {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`;
  }
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

/**
 * Convert hex to LCH
 */
export function hexToLch(hex: string): LCHColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error('Invalid hex color');
  }
  
  const rgb: RGBColor = {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
  
  return rgbToLch(rgb);
}

/**
 * Interpolate between two LCH colors
 */
export function interpolateLch(
  from: LCHColor,
  to: LCHColor,
  t: number
): LCHColor {
  // Handle hue interpolation (shortest path)
  let hDiff = to.h - from.h;
  if (hDiff > 180) hDiff -= 360;
  if (hDiff < -180) hDiff += 360;
  
  return {
    l: from.l + (to.l - from.l) * t,
    c: from.c + (to.c - from.c) * t,
    h: from.h + hDiff * t,
    a: from.a !== undefined && to.a !== undefined
      ? from.a + (to.a - from.a) * t
      : 1,
  };
}

/**
 * Adjust lightness of LCH color
 */
export function adjustLightness(lch: LCHColor, amount: number): LCHColor {
  return {
    ...lch,
    l: Math.max(0, Math.min(100, lch.l + amount)),
  };
}

/**
 * Adjust chroma (saturation) of LCH color
 */
export function adjustChroma(lch: LCHColor, amount: number): LCHColor {
  return {
    ...lch,
    c: Math.max(0, Math.min(150, lch.c + amount)),
  };
}

/**
 * Create a perceptually uniform color scale
 */
export function createColorScale(
  baseLch: LCHColor,
  steps: number = 11
): LCHColor[] {
  const scale: LCHColor[] = [];
  
  for (let i = 0; i < steps; i++) {
    const lightness = 95 - (i * 85) / (steps - 1); // 95 to 10
    const chroma = baseLch.c * (0.3 + (0.7 * i) / (steps - 1)); // Increase chroma for darker colors
    
    scale.push({
      l: lightness,
      c: chroma,
      h: baseLch.h,
    });
  }
  
  return scale;
}