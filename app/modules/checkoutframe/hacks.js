import * as UserAgent from 'common/useragent';

const Orientation = {
  LANDSCAPE: 'landscape',
  PORTRAIT: 'portrait',
};

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

/**
 * Returns the device orientation.
 *
 * @returns {string}
 */
export function getDeviceOrientation() {
  let angle;

  // Try getting it from the screen object
  if (_Obj.hasProp(global.screen, 'orientation')) {
    angle = Math.abs(global.screen.orientation.angle || 0);
  }

  // If window.screen.orientation is not supported, try getting it from window
  if (_.isType(angle, 'undefined') && _Obj.hasProp(global, 'orientation')) {
    angle = Math.abs(global.orientation || 0);
  }

  // As a last resort, rely on screen height and width
  if (_.isType(angle, 'undefined')) {
    angle = global.screen.width > global.screen.height ? 90 : 0;
  }

  const isLandscape = angle === 90 || angle === 270;
  const orientation = isLandscape
    ? Orientation.LANDSCAPE
    : Orientation.PORTRAIT;

  return orientation;
}

/**
 * Tells whether or not the device is in portrait mode.
 *
 * @returns {boolean}
 */
export function isDevicePortrait() {
  return getDeviceOrientation() === Orientation.PORTRAIT;
}

/**
 * Tells whether or not the device is in landscape mode.
 *
 * @returns {boolean}
 */
export function isDeviceLandscape() {
  return getDeviceOrientation() === Orientation.LANDSCAPE;
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
 * Scrolls the header in landscape mode.
 */
function autoScrollHeaderIfLandscape() {
  const isLandscape = isDeviceLandscape();

  if (isLandscape) {
    if (UserAgent.iOS) {
      setTimeout(() => global.ownerWindow.scroll(0, 100));
    }
    if (UserAgent.android) {
      setTimeout(() => global.scroll(0, 100));
    }
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
      if (!isDeviceLandscape() && global.innerHeight <= 512) {
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
        if (
          !isDeviceLandscape() &&
          global.screen.height - global.innerHeight >= 56
        ) {
          _El.addClass(footer, 'shift-ios');
        } else {
          _El.removeClass(footer, 'shift-ios');
        }
      });
    }
  }
}

/**
 * Removes extra padding in landscape mode
 */
function reduceUnneededPaddingIfLandscape() {
  const isLandscape = isDeviceLandscape();

  if (isLandscape) {
    setTimeout(() => {
      const header = _Doc.querySelector('#header');
      const formCommon = _Doc.querySelector('#form-common');
      const iosPayFixClassName = 'ios-paybtn-landscape-fix';

      _El.addClass(header, iosPayFixClassName);
      _El.addClass(formCommon, iosPayFixClassName);
    });
  }
}

export function initPreRenderHacks() {}

export function initPostRenderHacks() {
  shiftIosPayButtonOnSmallerHeights();
  decreaseWebViewHeightForAndroidTablets();
  reduceUnneededPaddingIfLandscape();
  autoScrollHeaderIfLandscape();
}
