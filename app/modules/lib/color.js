/*
 * All color inspection/manipulation functions go here
 */

// rendering color on canvas as user may
// give color like "red" or color with
// alpha value. need to render on canvas to find
// resultant color
const canvas = _El.create('canvas'),
  ctx = canvas.getContext('2d');

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
export const rgbToHsb = (r, g, b) => {
  (r /= 255), (g /= 255), (b /= 255);

  var max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  var h,
    s,
    v = max;

  var d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0; // achromatic
  } else {
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
function hsbToRgb(h, s, v) {
  var r, g, b;

  var i = Math.floor(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
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

export const getColorProperties = (colorCache => {
  /*
   * Different function ask for color propeties of same color
   * storing values in cache
   */

  return color => {
    if (colorCache[color]) {
      return colorCache[color];
    }

    // reset background to white
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);

    const pixelData = ctx.getImageData(0, 0, 1, 1).data,
      { 0: red, 1: green, 2: blue } = pixelData,
      alpha = pixelData[3] / 255;

    const colorProps = {
      red,
      green,
      blue,
      alpha,
    };

    return (colorCache[color] = colorProps);
  };
})({});

export const getHSB = (colorCache => {
  return color => {
    if (colorCache[color]) {
      return colorCache[color];
    }

    const rgb = getColorProperties(color),
      hsb = rgbToHsb(rgb.red, rgb.green, rgb.blue);

    return (colorCache[color] = hsb);
  };
})({});

const getColorChannelWithGamma = channelVal => {
  return channelVal <= 10
    ? channelVal / 3294
    : Math.pow(channelVal / 269 + 0.0513, 2.4);
};

/*
 * ref: https://ux.stackexchange.com/questions/82056/how-to-measure-the-contrast-between-any-given-color-and-white
 */
export const getRelativeLuminanceWithWhite = (colorCache => {
  return color => {
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

export const isDark = color => {
  const relativeLuminosity = getRelativeLuminanceWithWhite(color);

  // tested , and found black text would look good on values < 0.5
  return relativeLuminosity < 0.5;
};

const getColorString = (red, green, blue, alpha) => {
  return `rgba(${Math.round(red)}, ${Math.round(green)}, ${Math.round(
    blue
  )}, ${alpha})`;
};

export const transparentify = (color, alphaPercentage = 0) => {
  const { red, green, blue, alpha } = getColorProperties(color);

  return getColorString(red, green, blue, alphaPercentage / 100);
};

export const brighten = (color, brightenPercentage) => {
  const { red, green, blue, alpha } = getColorProperties(color);

  let { hue, saturation, brightness } = rgbToHsb(red, green, blue);

  brightness += brightness * (brightenPercentage / 100);

  const rgb = hsbToRgb(hue, saturation, brightness);

  return getColorString(rgb.red, rgb.green, rgb.blue, alpha);
};

export const getColorVariations = (colorCache => {
  return color => {
    if (colorCache[color]) {
      return colorCache[color];
    }

    var bgColorBrightness = 0,
      fgColorBrightness = 0,
      relativeLuminance = getRelativeLuminanceWithWhite(color);

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

export function getColorDistance(color) {
  var rgb = getColorProperties(color),
    hsb = rgbToHsb(rgb.red, rgb.green, rgb.blue),
    saturation = hsb.saturation * 100,
    brightness = hsb.brightness * 100;

  return Math.sqrt(
    Math.pow(100 - saturation, 2) + Math.pow(100 - brightness, 2)
  );
}

export function getHighlightColor(color, defaultColor) {
  var colorDistance = getColorDistance(color);

  if (colorDistance > 90) {
    return defaultColor;
  }

  var hsb = getHSB(color),
    saturation = hsb.saturation * 100,
    colorVariations = getColorVariations(color);

  if (saturation <= 50) {
    return colorVariations.backgroundColor;
  }

  return colorVariations.foregroundColor;
}

export function getHoverStateColor(color, variation, defaultColor) {
  var colorDistance = getColorDistance(color);

  if (colorDistance > 90) {
    return transparentify(defaultColor, 3);
  }

  var hsb = getHSB(color),
    brightness = hsb.brightness * 100;

  var opacity = 3;

  if (brightness > 50) {
    opacity = 6;
  }

  return transparentify(variation, opacity);
}

export function getActiveStateColor(color, variation, defaultColor) {
  var colorDistance = getColorDistance(color);

  if (colorDistance > 90) {
    return transparentify(defaultColor, 6);
  }

  var hsb = getHSB(color),
    brightness = hsb.brightness * 100;

  var opacity = 6;

  if (brightness > 50) {
    opacity = 9;
  }

  return transparentify(variation, opacity);
}
