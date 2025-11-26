// --- Color Conversion Utilities ---

/**
 * Converts an HSL color value to RGB.
 * @param h The hue
 * @param s The saturation
 * @param l The lightness
 * @returns [r, g, b] array
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Converts an RGB color value to HSL.
 * @param r The red color value
 * @param g The green color value
 * @param b The blue color value
 * @returns [h, s, l] array
 */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}

/**
 * Parses a hex color string (#RRGGBB) into an [r, g, b] array.
 */
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}

// --- Palette Generation ---

const shades = {
  50: 0.95,
  100: 0.9,
  200: 0.75,
  300: 0.6,
  400: 0.45,
  500: 1, // Base color multiplier (is handled differently)
  600: 0.9,
  700: 0.75,
  800: 0.6,
  900: 0.49,
  950: 0.3,
};

/**
 * Generates a 10-shade color palette from a single base hex color.
 * @param baseHex The base hex color (e.g., '#4f46e5')
 * @returns An object with shades from 50 to 950 as RGB strings.
 */
export function generateColorPalette(baseHex: string): Record<string, string> {
  const baseRgb = hexToRgb(baseHex);
  if (!baseRgb) {
    console.error("Invalid base hex color");
    return {};
  }
  
  const [h, s, l] = rgbToHsl(...baseRgb);
  const palette: Record<string, string> = {};

  for (const [shade, lightnessMultiplier] of Object.entries(shades)) {
    let newL: number;
    if (parseInt(shade) < 500) {
      // Lighter shades: blend towards white
      newL = l + (1 - l) * (1 - lightnessMultiplier);
    } else if (parseInt(shade) > 500) {
      // Darker shades: blend towards black
      newL = l * lightnessMultiplier;
    } else {
      // Base shade (500)
      newL = l;
    }
    const newS = parseInt(shade) < 500 ? s * (1 + (1 - lightnessMultiplier)) : s;

    const [r, g, b] = hslToRgb(h, Math.min(1, newS), Math.max(0, Math.min(1, newL)));
    palette[shade] = `${r} ${g} ${b}`;
  }

  return palette;
}

/**
 * Applies a generated color palette to the root document as CSS variables.
 * @param palette A palette object from generateColorPalette.
 */
export function applyPalette(palette: Record<string, string>) {
  const root = document.documentElement;
  for (const [shade, rgbString] of Object.entries(palette)) {
    root.style.setProperty(`--color-primary-${shade}`, rgbString);
  }
}
