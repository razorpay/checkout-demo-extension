const ua = navigator.userAgent;
const vendor = navigator.vendor;

export function check(ua_regex) {
  return ua_regex.test(ua);
}

export function checkVendor(regex) {
  return regex.test(vendor);
}

export const internetExplorer = check(/MSIE |Trident\//);
export const iPhone = check(/iPhone/);
export const iOS = iPhone || check(/iPad/);
export const android = check(/Android/);
export const iPad = check(/iPad/);
export const windows = check(/Windows NT/);
export const linux = check(/Linux/);
export const macOS = check(/Mac OS/);
export const Safari =
  check(/^((?!chrome|android).)*safari/i) || checkVendor(/Apple/);
export const firefox = check(/firefox/);
export const chrome = check(/Chrome/) && checkVendor(/Google Inc/);
export const AndroidWebView = check(/; wv\) |Gecko\) Version\/[^ ]+ Chrome/);
export const iosWebView = check(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/);

export const Instagram = check(/Instagram/);
export const samsungBrowser = check(/SamsungBrowser/);
export let isBrave = false;

/**
 * Facebook User-Agents:
 * src: https://developers.facebook.com/docs/sharing/best-practices#crawl
 *
 * Check for a HTTP User-Agent with the value FB_IAB/FB4A for Android and FBAN/FBIOS for iOS.
 */
const Facebook_Android = check(/FB_IAB/);
const Facebook_iOS = check(/FBAN/);
const Facebook = Facebook_Android || Facebook_iOS;

/**
 * Checks if this is a Facebook WebView.
 * Instagram is owned by Facebook so
 * this holds true for Instagram too.
 */
export function isFacebookWebView() {
  return Facebook || Instagram;
}

// android webview: /; wv\) |Gecko\) Version\/[^ ]+ Chrome/
// ios non safari: ua_iOS && !check(/Safari/)
// note that chrome-ios also contains "Safari" in ua, but it is covered through "CriOS"
export const shouldRedirect =
  check(
    /; wv\) |Gecko\) Version\/[^ ]+ Chrome|Windows Phone|Opera Mini|UCBrowser|CriOS/
  ) ||
  isFacebookWebView() ||
  // can't detect webview reliably
  iOS ||
  check(/Android 4/);

export const shouldFixFixed = check(/iPhone/);
let chromeVersion = ua.match(/Chrome\/(\d+)/);
if (chromeVersion) {
  chromeVersion = parseInt(chromeVersion[1], 10);
}

export const androidBrowser = android && (chromeVersion || firefox); // Chrome or firefox on Android

// The largest screen size that we have found is Samsung Galaxy S10+ - 480px
export const mobileQuery =
  '(max-device-height: 485px),(max-device-width: 485px)';

/**
 * This method works on device width and height to determine is mobile or not
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia Reference}
 * @returns {boolean}
 */
export const isMobileByMediaQuery = () => {
  return global.matchMedia(mobileQuery)?.matches;
};

/**
 * Says whether or not we're on mobile.
 *
 * This is a function instead of a constant because
 * Firefox gives innerWidth as 0 on page load.
 *
 * @returns {boolean}
 */
export const isMobile = () => {
  return (
    (global.innerWidth && global.innerWidth < 485) ||
    shouldFixFixed ||
    isMobileByMediaQuery()
  );
};

// This does not consume user agent because brave uses the same user agent as chrome.
// Brave enough! https://www.reddit.com/r/brave_browser/comments/dueif0/detect_brave_browser/
export const isBraveBrowser = async () => {
  if (navigator.brave) {
    try {
      return await navigator.brave.isBrave();
    } catch (e) {
      return false;
    }
  }
  return false;
};

export const setBraveBrowser = (res = false) => {
  isBrave = res;
};

// Some stock android browsers that pause the checkout tab
// when we open popup for redirection
export const browsersThatPauseTab = check(/(Vivo|HeyTap|Realme|Oppo)Browser/);

export const stockAndroidBrowser = android && !chrome && !firefox;

export const ajaxRouteNotSupported =
  browsersThatPauseTab || iOS || stockAndroidBrowser;

export const getOS = () => {
  if (iPhone || iPad) {
    return 'iOS';
  } else if (android) {
    return 'android';
  } else if (windows) {
    return 'windows';
  } else if (linux) {
    return 'linux';
  } else if (macOS) {
    return 'macOS';
  }
  return 'other';
};

export const getDevice = () => {
  if (iPhone) {
    return 'iPhone';
  } else if (iPad) {
    return 'iPad';
  } else if (android) {
    return 'android';
  } else if (isMobileByMediaQuery()) {
    return 'mobile';
  }
  return 'desktop';
};

export const isDesktop = () => getDevice() === 'desktop';
