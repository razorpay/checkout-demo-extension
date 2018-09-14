let fingerPrint = '';
const screen = global.screen;

function getFingerprint() {
  var components = [
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
  ];

  sha(components.join());
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

try {
  fingerPrint = getFingerprint();
} catch (e) {}

export default () => fingerPrint;
