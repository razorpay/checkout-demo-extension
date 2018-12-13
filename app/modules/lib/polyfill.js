/* global DOMTokenList */

/**
 * Object.entries polyfill
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
 *
 */
if (!Object.entries) {
  Object.entries = function(obj) {
    var ownProps = Object.keys(obj),
      i = ownProps.length,
      resArray = new Array(i); // preallocate the Array
    while (i--) {
      resArray[i] = [ownProps[i], obj[ownProps[i]]];
    }
    return resArray;
  };
}

/**
 * Because classList.toggle is broken in IE10 and IE11.
 * https://caniuse.com/#feat=classlist
 */
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
