import * as UserAgent from 'common/useragent';

function shiftIosPayButtonOnSmallerHeights() {
  if (UserAgent.iPhone) {
    /**
     * Shift the pay button if the height is low.
     */
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

export function initPostRenderHacks() {
  shiftIosPayButtonOnSmallerHeights();
}
