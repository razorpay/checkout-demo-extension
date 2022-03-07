import './prototypes/object';
import './prototypes/nodelist';
import './prototypes/nativecommon';
/**
 * Polyfill for Array.prototype.includes
 */
(function () {
  if (!Array.prototype.includes) {
    Array.prototype.includes = function () {
      return Array.prototype.indexOf.apply(this, arguments) !== -1;
    };
  }
})();
