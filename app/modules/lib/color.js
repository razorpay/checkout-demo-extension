/*
 * All color inspection/manipulation functions go here
 */
import { isString } from 'lib/_';

const canvas = document.createElement('canvas'),
  ctx = canvas.getContext('2d');

const getColorProperties = color => {
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
    alpha
  };
};

const getColorChannelWithGamma = channelVal => {
  return channelVal <= 10
    ? channelVal / 3294
    : Math.pow(channelVal / 269 + 0.0513, 2.4);
};

/*
 * ref: https://ux.stackexchange.com/questions/82056/how-to-measure-the-contrast-between-any-given-color-and-white
 */
const getRelativeLuminanceWithWhite = color => {
  const { red, blue, green } = getColorProperties(color),
    redWithGamma = getColorChannelWithGamma(red),
    blueWithGamma = getColorChannelWithGamma(blue),
    greenWithGamma = getColorChannelWithGamma(green);

  return (
    0.2126 * redWithGamma + 0.7152 * greenWithGamma + 0.0722 * blueWithGamma
  );
};

export const isDark = color => {
  if (!isString(color)) {
    return;
  }

  const relativeLuminosity = getRelativeLuminanceWithWhite(color);

  // tested , and found black text would look good on values < 0.4
  return relativeLuminosity < 0.4;
};
