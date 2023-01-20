import * as _El from 'utils/DOM';
import { isValidHexColorCode } from 'utils/color';
/*
 * All color inspection/manipulation functions go here
 */

// rendering color on canvas as user may
// give color like "red" or color with
// alpha value. need to render on canvas to find
// resultant color
const canvas = _El.create('canvas') as HTMLCanvasElement,
  ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

// canvas.getImageData().data returns a Uint8Array with length 4 (r,g,b,a),
// However, in Brave Browser, if device recognition is blocked,
// the length of this array will be zero.
const canvasFingerprintingBlocked = () => {
  try {
    return ctx.getImageData(0, 0, 1, 1).data.length === 0;
  } catch (error) {
    return true;
  }
};

const getPixelDataFallback = (color: string) => {
  const d = document.createElement('div');
  d.style.color = color;
  document.body.appendChild(d);
  const computedColor = window.getComputedStyle(d).color;
  document.body.removeChild(d);
  return stringToColor(computedColor);
};

const getPixelData = (color: string) => {
  if (canvasFingerprintingBlocked()) {
    return getPixelDataFallback(color);
  }
  // reset background to white
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, 1, 1);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);

  const pixelData = ctx.getImageData(0, 0, 1, 1).data,
    { 0: red, 1: green, 2: blue } = pixelData,
    alpha = pixelData[3] / 255;

  return {
    red,
    green,
    blue,
    alpha,
  };
};

/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
export const rgbToHsb = (r: number, g: number, b: number) => {
  (r /= 255), (g /= 255), (b /= 255);

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0;
  const v = max;

  const d = max - min;
  const s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0; // achromatic
  } else {
    // max can be one of rgb
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

  return { hue: h, saturation: s, brightness: v };
};

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
function hsbToRgb(h: number, s: number, v: number) {
  let r = 0,
    g = 0,
    b = 0;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = v;
      (r = v), (g = t), (b = p);
      break;
    case 1:
      (r = q), (g = v), (b = p);
      break;
    case 2:
      (r = p), (g = v), (b = t);
      break;
    case 3:
      (r = p), (g = q), (b = v);
      break;
    case 4:
      (r = t), (g = p), (b = v);
      break;
    case 5:
      (r = v), (g = p), (b = q);
      break;
  }

  return { red: r * 255, green: g * 255, blue: b * 255 };
}

export const getColorProperties = ((colorCache: {
  [x: string]: ReturnType<typeof getPixelData>;
}) => {
  /*
   * Different function ask for color propeties of same color
   * storing values in cache
   */
  return (color: string) => {
    if (colorCache[color]) {
      return colorCache[color];
    }

    return (colorCache[color] = getPixelData(color));
  };
})({});

export const getHSB = ((colorCache: {
  [color: string]: ReturnType<typeof rgbToHsb>;
}) => {
  return (color: string) => {
    if (colorCache[color]) {
      return colorCache[color];
    }

    const rgb = getColorProperties(color),
      hsb = rgbToHsb(rgb.red, rgb.green, rgb.blue);

    return (colorCache[color] = hsb);
  };
})({});

const getColorChannelWithGamma = (channelVal: number) => {
  return channelVal <= 10
    ? channelVal / 3294
    : Math.pow(channelVal / 269 + 0.0513, 2.4);
};

/*
 * ref: https://ux.stackexchange.com/questions/82056/how-to-measure-the-contrast-between-any-given-color-and-white
 */
export const getRelativeLuminanceWithWhite = ((colorCache: {
  [color: string]: number;
}) => {
  return (color: string) => {
    if (colorCache[color]) {
      return colorCache[color];
    }

    const { red, green, blue } = getColorProperties(color);

    const redWithGamma = getColorChannelWithGamma(red),
      blueWithGamma = getColorChannelWithGamma(blue),
      greenWithGamma = getColorChannelWithGamma(green);

    return (colorCache[color] =
      0.2126 * redWithGamma + 0.7152 * greenWithGamma + 0.0722 * blueWithGamma);
  };
})({});

export const isDark = (color: string) => {
  const relativeLuminosity = getRelativeLuminanceWithWhite(color);

  // tested , and found black text would look good on values < 0.5
  return relativeLuminosity < 0.5;
};

const getColorString = (
  red: number,
  green: number,
  blue: number,
  alpha: number
) => {
  return `rgba(${Math.round(red)}, ${Math.round(green)}, ${Math.round(
    blue
  )}, ${alpha})`;
};

// Convert "rgba(255, 255, 255, 1)" to an object.
const stringToColor = (string: string) => {
  const color = {
    red: 0,
    green: 0,
    blue: 0,
    alpha: 1,
  };
  if (string && string.length > 4) {
    const rgb = string.match(/\d+/g);
    if (rgb && rgb.length === 3) {
      color.red = +rgb[0];
      color.green = +rgb[1];
      color.blue = +rgb[2];
    }
  }
  return color;
};

export const transparentify = (color: string, alphaPercentage = 0) => {
  const { red, green, blue } = getColorProperties(color);

  return getColorString(red, green, blue, alphaPercentage / 100);
};

export const brighten = (color: string, brightenPercentage: number) => {
  const { red, green, blue, alpha } = getColorProperties(color);
  const hsb = rgbToHsb(red, green, blue);
  const { hue, saturation } = hsb;
  let { brightness } = hsb;

  brightness += brightness * (brightenPercentage / 100);

  const rgb = hsbToRgb(hue, saturation, brightness);

  return getColorString(rgb.red, rgb.green, rgb.blue, alpha);
};

export const getColorVariations = ((colorCache: {
  [color: string]: { foregroundColor: string; backgroundColor: string };
}) => {
  return (color: string) => {
    if (colorCache[color]) {
      return colorCache[color];
    }

    let bgColorBrightness = 0,
      fgColorBrightness = 0;
    const relativeLuminance = getRelativeLuminanceWithWhite(color);

    if (relativeLuminance >= 0.9) {
      fgColorBrightness = -50;
      bgColorBrightness = -30;
    } else if (relativeLuminance >= 0.7 && relativeLuminance < 0.9) {
      fgColorBrightness = -55;
      bgColorBrightness = -30;
    } else if (relativeLuminance >= 0.6 && relativeLuminance < 0.7) {
      fgColorBrightness = -50;
      bgColorBrightness = -15;
    } else if (relativeLuminance >= 0.5 && relativeLuminance < 0.6) {
      fgColorBrightness = -45;
      bgColorBrightness = -10;
    } else if (relativeLuminance >= 0.4 && relativeLuminance < 0.5) {
      fgColorBrightness = -40;
      bgColorBrightness = -5;
    } else if (relativeLuminance >= 0.3 && relativeLuminance < 0.4) {
      fgColorBrightness = -35;
      bgColorBrightness = 0;
    } else if (relativeLuminance >= 0.2 && relativeLuminance < 0.3) {
      fgColorBrightness = -30;
      bgColorBrightness = 20;
    } else if (relativeLuminance >= 0.1 && relativeLuminance < 0.2) {
      fgColorBrightness = -20;
      bgColorBrightness = 60;
    } else if (relativeLuminance >= 0 && relativeLuminance < 0.1) {
      fgColorBrightness = 0;
      bgColorBrightness = 80;
    }

    return (colorCache[color] = {
      foregroundColor: brighten(color, fgColorBrightness),
      backgroundColor: brighten(color, bgColorBrightness),
    });
  };
})({});

export function getColorDistance(color: string) {
  const rgb = getColorProperties(color),
    hsb = rgbToHsb(rgb.red, rgb.green, rgb.blue),
    saturation = hsb.saturation * 100,
    brightness = hsb.brightness * 100;

  return Math.sqrt(
    Math.pow(100 - saturation, 2) + Math.pow(100 - brightness, 2)
  );
}

export function getHighlightColor(color: string, defaultColor: string) {
  const colorDistance = getColorDistance(color);

  if (colorDistance > 90) {
    return defaultColor;
  }

  const hsb = getHSB(color),
    saturation = hsb.saturation * 100,
    colorVariations = getColorVariations(color);

  if (saturation <= 50) {
    return colorVariations.backgroundColor;
  }

  return colorVariations.foregroundColor;
}

export function getHoverStateColor(
  color: string,
  variation: string,
  defaultColor: string
) {
  const colorDistance = getColorDistance(color);

  if (colorDistance > 90) {
    return transparentify(defaultColor, 3);
  }

  const hsb = getHSB(color),
    brightness = hsb.brightness * 100;

  let opacity = 3;

  if (brightness > 50) {
    opacity = 6;
  }

  return transparentify(variation, opacity);
}

export function getActiveStateColor(
  color: string,
  variation: string,
  defaultColor: string
) {
  const colorDistance = getColorDistance(color);

  if (colorDistance > 90) {
    return transparentify(defaultColor, 6);
  }

  const hsb = getHSB(color),
    brightness = hsb.brightness * 100;

  let opacity = 6;

  if (brightness > 50) {
    opacity = 9;
  }

  return transparentify(variation, opacity);
}

/**
 * https://stackoverflow.com/a/51567564/1303585
 * @param {string } color hex color
 * @returns {boolean}
 */
export function isLightColor(color: string) {
  let hex = color.replace('#', '');
  if (!isValidHexColorCode(color)) {
    return false;
  }
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(function (hex) {
        return hex + hex;
      })
      .join('');
  }
  const cR = parseInt(hex.substring(0, 0 + 2), 16);
  const cG = parseInt(hex.substring(2, 2 + 2), 16);
  const cB = parseInt(hex.substring(4, 4 + 2), 16);
  const brightness = (cR * 299 + cG * 587 + cB * 114) / 1000;
  return brightness > 230;
}
