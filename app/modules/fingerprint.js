import BrowserStorage from 'browserstorage';

const DEVICE_ID_STORAGE_KEY = 'rzp_device_id';
const DEVICE_ALGO_VERSION = 1; // Increment this when making changes in fingerprint components.

let fingerPrint = '';
let deviceId = '';

const screen = global.screen;

/**
 * Generates fingerprint
 * @returns {PromiseLike<string>}
 */
export function generateFingerprint() {
  const components = [
    // User agent:
    navigator.userAgent,

    // Language:
    navigator.language,

    // TImezone Offset:
    new Date().getTimezoneOffset(),

    // Navigator Platform
    navigator.platform,

    // CPU class
    navigator.cpuClass,

    // Hardware Concurrency:
    navigator.hardwareConcurrency,

    // Color Depth:
    screen.colorDepth,

    // Device Memory:
    navigator.deviceMemory,

    // screen.width and screen.height can be exchanged due to device rotation
    screen.width + screen.height,

    screen.width * screen.height,

    global.devicePixelRatio,

    // If you're adding or removing any component,
    // make sure to increment DEVICE_ALGO_VERSION.
  ];

  return sha(components.join());
}

function sha(str) {
  // We transform the string into an arraybuffer.
  var buffer = new global.TextEncoder('utf-8').encode(str);

  // doesn't work on "http"
  return global.crypto.subtle
    .digest('SHA-1', buffer)
    .then(hash => (fingerPrint = hex(hash)));
}

function hex(buffer) {
  var hexCodes = [];
  var view = new global.DataView(buffer);
  for (var i = 0; i < view.byteLength; i += 4) {
    // Using getUint32 reduces the number of iterations needed (we process 4 bytes each time)
    var value = view.getUint32(i);
    // toString(16) will give the hex representation of the number without padding
    var stringValue = value.toString(16);
    // We use concatenation and slice for padding
    var padding = '00000000';
    var paddedValue = (padding + stringValue).slice(-padding.length);
    hexCodes.push(paddedValue);
  }

  // Join all the hex strings into one
  return hexCodes.join('');
}

/**
 * Generates device ID
 * Format: <version>.<hash>.<timestamp>.<random-number>
 * Details: https://docs.google.com/document/d/1IK-EQrhdAdPX3CMu38Z12bOAOu2dPu25NmCS6r88uWo/edit#heading=h.i3rn67z2j8su
 *
 * @param version
 * @param fingerprint
 * @returns {string}
 */
export function generateDeviceId(fingerprint) {
  if (!fingerprint) {
    // If we failed to generate a fingerprint,
    // don't save dummy device id in local storage.
    return;
  }

  try {
    deviceId = BrowserStorage.getItem(DEVICE_ID_STORAGE_KEY);
  } catch (err) {}

  if (!deviceId) {
    deviceId = [
      DEVICE_ALGO_VERSION,
      fingerprint,
      Date.now(),
      Math.random()
        .toString()
        .slice(-8),
    ].join('.');

    try {
      BrowserStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
    } catch (err) {}
  }
}

try {
  generateFingerprint()
    .then(fp => {
      if (fp) {
        fingerPrint = fp;
        generateDeviceId(fp);
      }
    })
    .catch(Boolean);
} catch (e) {}

export function getFingerprint() {
  return fingerPrint;
}

export function getDeviceId() {
  return deviceId;
}
