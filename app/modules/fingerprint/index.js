import { hasSessionStorage, hasLocalStorage, hasIndexedDB } from './helpers';

const UNKNOWN = 'unknown',
  NEGATIVE_INDEX = -1,
  EMPTY_STRING = '';

let fingerPrint,
  error = null;

function getFingerprint(done) {
  var components = [
    // User agent:
    navigator.userAgent,

    // Language:
    navigator.language ||
      navigator.userLanguage ||
      navigator.browserLanguage ||
      navigator.systemLanguage ||
      EMPTY_STRING,

    // TImezone Offset:
    new Date().getTimezoneOffset(),

    // Local Storage:
    +hasLocalStorage(),

    // Indexed DB,
    +hasIndexedDB(),

    // Session Storage:
    +hasSessionStorage(),

    // Open Database
    !!window.openDatabase,

    // Navigator Platform
    navigator.platform || UNKNOWN,

    // CPU class
    navigator.cpuClass || UNKNOWN,

    // Hardware Concurrency:
    navigator.hardwareConcurrency || UNKNOWN,

    // Color Depth:
    window.screen.colorDepth || NEGATIVE_INDEX,

    // Device Memory:
    navigator.deviceMemory || NEGATIVE_INDEX
  ];

  return window.btoa(components.join('||'));
}

try {
  fingerPrint = getFingerprint();
} catch (e) {
  error = e;
}

export default () => fingerPrint;
