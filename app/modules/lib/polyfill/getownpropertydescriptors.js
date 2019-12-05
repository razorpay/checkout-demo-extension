/*!
 * object-descriptors v0.2.0
 * (c) Vitor Luiz Cavalcanti <vitorluizc@outlook.com> (https://vitorluizc.github.io)
 * Released under the MIT License.
 *
 * Source: https://github.com/VitorLuizC/object-descriptors
 */
/**
 * Get a collection of keys from an object.
 * @param object
 */
var getKeys = function(object) {
  return Object.getOwnPropertyNames(object);
};
/**
 * Get an object with all object property descriptors.
 * @param object
 */

var getDescriptors = function(object) {
  if (object === null || object === undefined) {
    throw new TypeError('Cannot convert undefined or null to object');
  }
  return getKeys(object).reduce(function(descriptors, key) {
    var descriptor = Object.getOwnPropertyDescriptor(object, key);
    if (descriptor) {
      descriptors[key] = descriptor;
    }
    return descriptors;
  }, {});
};

export default getDescriptors;
