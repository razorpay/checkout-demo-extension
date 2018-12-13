const ua = navigator.userAgent;

export function check(ua_regex) {
  return ua_regex.test(ua);
}

export const internetExplorer = check(/MSIE |Trident\//);
export const iPhone = check(/iPhone/);
export const iOS = iPhone || check(/iPad/);
export const android = check(/Android/);
export const Safari = check(/Safari/);

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

export const androidBrowser = android && (chromeVersion || check(/firefox/)); // Chrome or firefox on Android
