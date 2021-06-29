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

export const Instagram = check(/Instagram/);
export const samsungBrowser = check(/SamsungBrowser/);

// NOTE: this should only be used for analytics
// DON'T USE IT TO CHANGE CHECKOUT'S RENDER BEHAVIOUR
export function isMobileBrowser() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

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
var chromeVersion = ua.match(/Chrome\/(\d+)/);
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
  return global.matchMedia(mobileQuery).matches;
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
export const isBraveBrowser = () => {
  return new Promise(res => {
    if (navigator.brave) {
      navigator.brave.isBrave().then(r => {
        res(r);
      });
    } else {
      res(false);
    }
  });
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
  } else {
    return 'other';
  }
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
  } else {
    return 'desktop';
  }
};
