import * as UserAgent from 'common/useragent';

/**
 * Compares versions.
 * https://github.com/substack/semver-compare/blob/master/index.js
 * @param {String} a
 * @param {String} b
 *
 * @return {Integer}
 */
function compareSemver(a, b) {
  var pa = a.split('.');
  var pb = b.split('.');
  for (var i = 0; i < 3; i++) {
    var na = Number(pa[i]);
    var nb = Number(pb[i]);
    if (na > nb) return 1;
    if (nb > na) return -1;
    if (!isNaN(na) && isNaN(nb)) return 1;
    if (isNaN(na) && !isNaN(nb)) return -1;
  }
  return 0;
}

function isDeviceLandscape() {
  return global.screen.width > global.screen.height;
}

/**
 * WebViews on Android Tablets are fixed at 600px height.
 * If the device is in Lanscape mode and the height of the screen
 * is exactly 600px, then some part of the WebView is hidden
 * due to the navigation and status bars.
 *
 * This reduces the height of the `html` tag in case
 * the device is in landscape mode and the height is
 * greater than a given number.
 *
 * This has been fixed since Android SDK v1.5.7.
 */
function decreaseWebViewHeightForAndroidTablets() {
  const fixedFromVersion = '1.5.7';
  const webViewDefaultHeight = 600;
  const osElements = 72;

  const { platform, version, library } = _.getQueryParams();

  const isBuggyVersion =
    platform === 'android' &&
    library === 'checkoutjs' &&
    compareSemver(version, fixedFromVersion) < 0;

  const isDeviceHeightExtra = () =>
    global.screen.height + osElements >= webViewDefaultHeight;

  const reduceHeight = () => {
    const html = _Doc.querySelector('html');
    _El.setStyle(html, 'max-height', `${global.screen.height - osElements}px`);
  };
  const unsetHeight = () => {
    const html = _Doc.querySelector('html');
    _El.setStyle(html, 'max-height', 'unset');
  };
  const updateHeight = () => {
    if (isDeviceLandscape() && isDeviceHeightExtra()) {
      reduceHeight();
    } else {
      unsetHeight();
    }
  };

  if (isBuggyVersion) {
    global.addEventListener('orientationchange', updateHeight);
    updateHeight();
  }
}

/**
 * On iPhone with smaller heights (iPhone 5S),
 * the pay button is not visible on the web.
 *
 * This shifts the pay button to the visible area.
 */
function shiftIosPayButtonOnSmallerHeights() {
  if (UserAgent.iPhone) {
    setTimeout(() => {
      const footer = _Doc.querySelector('#footer');
      if (global.innerHeight <= 512) {
        _El.addClass(footer, 'shift-ios');
      }
    }, 1000);

    if (UserAgent.Safari) {
      global.addEventListener('resize', () => {
        if (global.innerHeight > 550) {
          return;
        }

        const footer = _Doc.querySelector('#footer');

        // Shift pay button
        if (global.screen.height - global.innerHeight >= 56) {
          _El.addClass(footer, 'shift-ios');
        } else {
          _El.removeClass(footer, 'shift-ios');
        }
      });
    }
  }
}

export function initPreRenderHacks() {}

if (!window.performance || !window.performance.now) {
  (window.performance || (window.performance = {})).now = function() {
    return Date.now() - offset;
  };

  var offset =
    (window.performance.timing || (window.performance.timing = {}))
      .navigatorStart ||
    (window.performance.timing.navigationStart = Date.now());
}

export function initPostRenderHacks() {
  shiftIosPayButtonOnSmallerHeights();
  decreaseWebViewHeightForAndroidTablets();
}
