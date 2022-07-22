import 'promise-polyfill/src/polyfill';
import { internetExplorer } from 'common/useragent';
import './prototypes/object';
import Analytics from 'analytics';
import { getSession } from 'sessionmanager';
import getOwnPropertyDescriptor from './prototypes/getownpropertydescriptors';

// keeping till we convert this file to typescript
// eslint-disable-next-line no-redeclare
/* global DOMTokenList, CSSStyleSheet, Element, CharacterData, DocumentType, CSSStyleDeclaration */

/**
 * Fix for Svelte rest + IE11 issue
 * https://github.com/sveltejs/svelte/issues/4718
 */
(function (elements) {
  elements.forEach(function (el) {
    if (!el.prototype.hasOwnProperty('disabled')) {
      Object.defineProperty(el.prototype, 'disabled', {
        enumerable: true,
        configurable: true,
        get: function () {
          return el.prototype.hasAttribute.call(this, 'disabled');
        },
        set: function (value) {
          if (value) {
            el.prototype.setAttribute.call(this, 'disabled', '');
            return;
          } else {
            el.prototype.removeAttribute.call(this, 'disabled');
            return;
          }
        },
      });
    }
  });
})([HTMLButtonElement, HTMLInputElement]);

/**
 * Because classList.toggle is broken in IE10 and IE11.
 * https://caniuse.com/#feat=classlist
 */
if (internetExplorer && DOMTokenList) {
  DOMTokenList.prototype.toggle = function (val) {
    if (arguments.length > 1) {
      return this[arguments[1] ? 'add' : 'remove'](val), !!arguments[1];
    }
    let oldValue = this.value;
    return (
      this.remove(oldValue),
      oldValue === this.value && (this.add(val), true) /*|| false*/
    );
  };
}

/**
 * Wrap CSSStyleSheet.insertRule execution within try-catch
 * since it throws an error on `@keyframes` insertion on browser
 * versions that require a prefixed `@keyframes` declaration.

 * Svelte uses `@keyframes` insertion.
 * https://github.com/sveltejs/svelte/issues/2358
 */
function trackInsertRuleOverrides() {
  const interval = setInterval(() => {
    const session = getSession();

    if (!session || !session.r) {
      return;
    }

    Analytics.track('polyfill:insert_override');

    clearInterval(interval);
  }, 500);
}

function overrideInsertRule() {
  if (!(CSSStyleSheet && CSSStyleSheet.prototype.insertRule)) {
    return;
  }

  const style = document.createElement('style');
  let shouldPrefixKeyframes = false;

  document.body.appendChild(style);

  try {
    style.sheet.insertRule('@keyframes _ {}');
  } catch (err) {
    shouldPrefixKeyframes = true;

    trackInsertRuleOverrides();
  }

  document.body.removeChild(style);

  if (!shouldPrefixKeyframes) {
    return;
  }

  const originalInsertRule = CSSStyleSheet.prototype.insertRule;

  CSSStyleSheet.prototype.insertRule = function (rule, index) {
    if (rule.indexOf('@keyframes') === 0) {
      rule = rule.replace('@keyframes', '@-webkit-keyframes');
    }

    try {
      originalInsertRule.call(this, rule, index);
    } catch (err) {}
  };

  try {
    if (!CSSStyleDeclaration.prototype.webkitAnimation) {
      CSSStyleDeclaration.prototype.webkitAnimation = '';
    }

    CSSStyleDeclaration.prototype.animation =
      CSSStyleDeclaration.prototype.webkitAnimation;
  } catch (e) {}
}
overrideInsertRule();

/**
 * Element.remove polyfill
 */
(function () {
  [Element.prototype, CharacterData.prototype, DocumentType.prototype].forEach(
    (item) => {
      if (item.hasOwnProperty('remove')) {
        return;
      }

      Object.defineProperty(item, 'remove', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: function remove() {
          if (this.parentNode) {
            this.parentNode.removeChild(this);
          }
        },
      });
    }
  );
})();
/**
 * Polyfill for window.performance.now
 * Source: https://gist.github.com/paulirish/5438650#gistcomment-2940646
 */
(function () {
  if (!window.performance || !window.performance.now) {
    (window.performance || (window.performance = {})).now = function () {
      return Date.now() - offset;
    };

    var offset =
      (window.performance.timing || (window.performance.timing = {}))
        .navigatorStart ||
      (window.performance.timing.navigationStart = Date.now());
  }
})();

if (!_.isFunction(Object.getOwnPropertyDescriptors)) {
  Object.getOwnPropertyDescriptors = getOwnPropertyDescriptor;
}

// https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.find) {
  // eslint-disable-next-line no-extend-native
  Object.defineProperty(Array.prototype, 'find', {
    value: function (predicate) {
      if (this === null) {
        throw TypeError('"this" is null or not defined');
      }

      let o = Object(this);

      let len = o.length >>> 0;

      if (typeof predicate !== 'function') {
        throw TypeError('predicate must be a function');
      }

      let thisArg = arguments[1];

      let k = 0;

      while (k < len) {
        let kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        k++;
      }

      return undefined;
    },
    configurable: true,
    writable: true,
  });
}

if (internetExplorer && !Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector;
}

import './prototypes/native';
import './prototypes/customelements';
import './prototypes/nodelist';
import './prototypes/array';
import './prototypes/string';
