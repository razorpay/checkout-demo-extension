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
export const Safari =
  check(/^((?!chrome|android).)*safari/i) || checkVendor(/Apple/);
export const firefox = check(/firefox/);
export const chrome = check(/Chrome/) && checkVendor(/Google Inc/);
export const AndroidWebView = check(/; wv\) |Gecko\) Version\/[^ ]+ Chrome/);

// android webview: /; wv\) |Gecko\) Version\/[^ ]+ Chrome/
// ios non safari: ua_iOS && !check(/Safari/)
// note that chrome-ios also contains "Safari" in ua, but it is covered through "CriOS"
export const shouldRedirect =
  check(
    /; wv\) |Gecko\) Version\/[^ ]+ Chrome|Windows Phone|Opera Mini|UCBrowser|FBAN|CriOS/
  ) ||
  // can't detect webview reliably
  iOS ||
  check(/Android 4/);

export const shouldFixFixed = check(/iPhone/);
var chromeVersion = ua.match(/Chrome\/(\d+)/);
if (chromeVersion) {
  chromeVersion = parseInt(chromeVersion[1], 10);
}

export const androidBrowser = android && (chromeVersion || firefox); // Chrome or firefox on Android

export const mobileQuery =
  '(max-device-height: 450px),(max-device-width: 450px)';

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
    (global.innerWidth && global.innerWidth < 450) ||
    shouldFixFixed ||
    global.matchMedia(mobileQuery).matches
  );
};

// Some stock android browsers that pause the checkout tab
// when we open popup for redirection
export const browsersThatPauseTab = check(/(Vivo|HeyTap|Realme|Oppo)Browser/);

export const stockAndroidBrowser = android && !chrome && !firefox;

export const ajaxRouteNotSupported =
  browsersThatPauseTab || iOS || stockAndroidBrowser;
