/*
 * All color inspection/manipulation functions go here
 */

// rendering color on canvas as user may
// give color like "red" or color with
// alpha value. need to render on canvas to find
// resultant color
const canvas = document.createElement('canvas'),
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
function rgbToHsb(r, g, b) {
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
}

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
      alpha
    };

    return (colorCache[color] = colorProps);
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
export const getRelativeLuminanceWithWhite = color => {
  const { red, green, blue } = getColorProperties(color);

  const redWithGamma = getColorChannelWithGamma(red),
    blueWithGamma = getColorChannelWithGamma(blue),
    greenWithGamma = getColorChannelWithGamma(green);

  return (
    0.2126 * redWithGamma + 0.7152 * greenWithGamma + 0.0722 * blueWithGamma
  );
};

export const isDark = color => {
  const relativeLuminosity = getRelativeLuminanceWithWhite(color);

  // tested , and found black text would look good on values < 0.5
  return relativeLuminosity < 0.5;
};

export const brighten = (color, brightenPercentage) => {
  const { red, green, blue, alpha } = getColorProperties(color);

  let { hue, saturation, brightness } = rgbToHsb(red, green, blue);

  brightness += brightness * (brightenPercentage / 100);

  const rgb = hsbToRgb(hue, saturation, brightness);

  return `rgba(${rgb.red},${rgb.green},${rgb.blue},${alpha})`;
};
