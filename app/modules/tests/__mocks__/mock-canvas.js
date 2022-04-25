/**
 * Mock canvas apis for jest
 * Code ref take from https://github.com/hustcc/jest-canvas-mock
 */

const CanvasRenderingPrototypeFns = [
  'setLineDash',
  'getLineDash',
  'setTransform',
  'getTransform',
  'getImageData',
  'save',
  'restore',
  'createPattern',
  'createRadialGradient',
  'addHitRegion',
  'arc',
  'arcTo',
  'beginPath',
  'clip',
  'closePath',
  'scale',
  'stroke',
  'clearHitRegions',
  'clearRect',
  'fillRect',
  'strokeRect',
  'rect',
  'resetTransform',
  'translate',
  'moveTo',
  'lineTo',
  'bezierCurveTo',
  'createLinearGradient',
  'ellipse',
  'measureText',
  'rotate',
  'drawImage',
  'drawFocusIfNeeded',
  'isPointInPath',
  'isPointInStroke',
  'putImageData',
  'strokeText',
  'fillText',
  'quadraticCurveTo',
  'removeHitRegion',
  'fill',
  'transform',
  'scrollPathIntoView',
  'createImageData',
];

class CanvasRenderingContext2D {
  constructor(canvas) {
    CanvasRenderingPrototypeFns.forEach((key) => {
      this[key] = jest.fn();
    });
    this._canvas = canvas;
  }
}

export default function mockCanvas() {
  const generatedContexts = new WeakMap();
  const getContext2D = jest.fn(function getContext2d(type) {
    if (type === '2d') {
      if (generatedContexts.has(this)) return generatedContexts.get(this);
      const ctx = new CanvasRenderingContext2D(this);
      generatedContexts.set(this, ctx);
      return ctx;
    }
    try {
      if (!this.dataset.internalRequireTest) require('canvas');
    } catch {
      return null;
    }
    return getContext2D.internal.call(this, type);
  });

  if (!jest.isMockFunction(HTMLCanvasElement.prototype.getContext)) {
    getContext2D.internal = HTMLCanvasElement.prototype.getContext;
  } else {
    getContext2D.internal = HTMLCanvasElement.prototype.getContext.internal;
  }
  HTMLCanvasElement.prototype.getContext = getContext2D;
  const toBlobOverride = jest.fn(function toBlobOverride(callback, mimetype) {
    if (arguments.length < 1)
      throw new TypeError(
        "Failed to execute 'toBlob' on 'HTMLCanvasElement': 1 argument required, but only 0 present."
      );
    if (typeof callback !== 'function')
      throw new TypeError(
        "Failed to execute 'toBlob' on 'HTMLCanvasElement': The callback provided as parameter 1 is not a function."
      );
    switch (mimetype) {
      case 'image/webp':
        break;
      case 'image/jpeg':
        break;
      default:
        mimetype = 'image/png';
    }
    const length = this.width * this.height * 4;
    const data = new Uint8Array(length);
    const blob = new window.Blob([data], { type: mimetype });
    setTimeout(() => callback(blob), 0);
  });

  if (!jest.isMockFunction(HTMLCanvasElement.prototype.toBlob)) {
    toBlobOverride.internal = HTMLCanvasElement.prototype.toBlob;
  } else {
    toBlobOverride.internal = HTMLCanvasElement.prototype.toBlob.internal;
  }
  HTMLCanvasElement.prototype.toBlob = toBlobOverride;
  const toDataURLOverride = jest.fn(function toDataURLOverride(
    type,
    encoderOptions
  ) {
    switch (type) {
      case 'image/jpeg':
        break;
      case 'image/webp':
        break;
      default:
        type = 'image/png';
    }
    return 'data:' + type + ';base64,00';
  });

  if (!jest.isMockFunction(HTMLCanvasElement.prototype.toDataURL)) {
    toDataURLOverride.internal = HTMLCanvasElement.prototype.toDataURL;
  } else {
    toDataURLOverride.internal = HTMLCanvasElement.prototype.toBlob.internal;
  }
  HTMLCanvasElement.prototype.toDataURL = toDataURLOverride;
}
