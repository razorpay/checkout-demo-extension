import { querySelector } from 'utils/doc';
import { ownerWindow } from 'common/constants';
import * as UserAgent from 'common/useragent';
import { compareSemver } from 'lib/utils';
import * as _El from 'utils/DOM';
import { hasProp } from 'utils/object';
import * as _ from 'utils/_';

const Orientation = {
  LANDSCAPE: 'landscape',
  PORTRAIT: 'portrait',
};

/**
 * Returns the device orientation.
 *
 * @returns {string}
 */
export function getDeviceOrientation() {
  let angle;

  // Try getting it from the screen object
  if (hasProp(global.screen, 'orientation')) {
    angle = Math.abs(global.screen.orientation.angle || 0);
  }

  // If window.screen.orientation is not supported, try getting it from window
  if (_.isType(angle, 'undefined') && hasProp(global, 'orientation')) {
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
    const html = querySelector('html');
    _El.setStyle(html, 'max-height', `${global.screen.height - osElements}px`);
  };
  const unsetHeight = () => {
    const html = querySelector('html');
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
      setTimeout(() => {
        try {
          ownerWindow.scroll(0, 100);
        } catch (error) {
          // no-op
        }
      });
    }
    if (UserAgent.android) {
      setTimeout(() => global.scroll(0, 100));
    }
  }
}

/**
 * Removes extra padding in landscape mode
 */
function reduceUnneededPaddingIfLandscape() {
  const isLandscape = isDeviceLandscape();
  const isMobile = UserAgent.isMobile();

  if (isLandscape && isMobile) {
    setTimeout(() => {
      const header = querySelector('#header');
      const formCommon = querySelector('#form-common');
      const iosPayFixClassName = 'ios-paybtn-landscape-fix';

      _El.addClass(header, iosPayFixClassName);
      _El.addClass(formCommon, iosPayFixClassName);
    });
  }
}

export function initPreRenderHacks() {}

export function initPostRenderHacks() {
  decreaseWebViewHeightForAndroidTablets();
  reduceUnneededPaddingIfLandscape();
  autoScrollHeaderIfLandscape();

  // overflow: auto; is set on #body as a fix for firefox, which is breaking Checkout on iOS Safari. This is a temporary ~fix~ hack.
  if (UserAgent.iOS && UserAgent.isMobile()) {
    querySelector('#body').style.overflow = 'unset';
  }
}
