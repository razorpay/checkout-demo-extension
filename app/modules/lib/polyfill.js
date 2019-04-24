import { internetExplorer } from 'common/useragent';
import Analytics from 'analytics';
import { getSession } from 'sessionmanager';

/* global DOMTokenList, Element, CharacterData, DocumentType */

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
