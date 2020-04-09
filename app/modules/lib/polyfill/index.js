import { internetExplorer } from 'common/useragent';
import Analytics from 'analytics';
import { getSession } from 'sessionmanager';
import getOwnPropertyDescriptor from './getownpropertydescriptors';

/* global DOMTokenList, CSSStyleSheet, Element, CharacterData, DocumentType, CSSStyleDeclaration */

/**
 * Because classList.toggle is broken in IE10 and IE11.
 * https://caniuse.com/#feat=classlist
 */
if (internetExplorer && DOMTokenList) {
  DOMTokenList.prototype.toggle = function(val) {
    if (arguments.length > 1) {
      return this[arguments[1] ? 'add' : 'remove'](val), !!arguments[1];
    }
    var oldValue = this.value;
    return (
      this.remove(oldValue),
      oldValue === this.value && (this.add(val), true) /*|| false*/
    );
  };

  if (typeof Object.assign !== 'function') {
    Object.assign = function(target) {
      'use strict';
      if (target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      target = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];
        if (source !== null) {
          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }
      }
      return target;
    };
  }
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

  CSSStyleSheet.prototype.insertRule = function(rule, index) {
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
(function() {
  _Arr.loop(
    [Element.prototype, CharacterData.prototype, DocumentType.prototype],
    item => {
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
(function() {
  if (!window.performance || !window.performance.now) {
    (window.performance || (window.performance = {})).now = function() {
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

import './native';
import './customelements';
// import './getownpropertydescriptors';
