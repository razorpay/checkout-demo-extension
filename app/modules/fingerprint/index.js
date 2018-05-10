let fingerPrint = '';

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
    navigator.deviceMemory
  ];

  sha(components.join(''));
}

function sha(str) {
  // We transform the string into an arraybuffer.
  var buffer = new TextEncoder('utf-8').encode(str);

  // doesn't work on "http"
  return window.crypto.subtle
    .digest('SHA-1', buffer)
    .then(hash => (fingerPrint = hex(hash)));
}

function hex(buffer) {
  var hexCodes = [];
  var view = new DataView(buffer);
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
