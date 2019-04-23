import { internetExplorer } from 'common/useragent';

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
