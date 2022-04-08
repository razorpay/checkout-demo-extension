import * as _ from './_';
import * as _Obj from './_Obj';

export const ElementConstructor = global.Element;

/**
 * Creates an element using a tag name.
 * @param {string} tagName
 *
 * @returns {Element}
 */
export const create = (tagName) => document.createElement(tagName || 'div');

/**
 * Gets the parent element of the given element.
 * @param {Element} element
 *
 * @returns {Element}
 */
export const parent = (element) => element.parentNode;

const element1 = _.validateArgs(_.isElement);
const element2 = _.validateArgs(_.isElement, _.isElement);
const elementString = _.validateArgs(_.isElement, _.isString);
const attrValidator = _.validateArgs(_.isElement, _.isString, () => true);
const elementObject = _.validateArgs(_.isElement, _.isNonNullObject);

/**
 * Appends a child node to the parent node.
 * @param {Element} childNode
 * @param {Element} parentNode
 *
 * @returns {Element} parentNode
 */
export const appendTo =
  ((childNode, parentNode) => {
    // returns child
    return parentNode.appendChild(childNode);
  })
  |> element2
  |> _.curry2;

/**
 * Removes the node from DOM.
 * @param {Element} childNode
 *
 * @returns {Element} childNode
 */
export const detach =
  ((childNode) => {
    var parentNode = parent(childNode);
    if (parentNode) {
      parentNode.removeChild(childNode);
    }
    return childNode;
  }) |> element1;
/**
 * Call submit method on the given element.
 * @param {Element} el
 *
 * @returns {Element}
 */
export const submit =
  ((el) => {
    el.submit();
    return el;
  }) |> element1;

/**
 * Sets attribute of the given element.
 * @param {Element} el
 * @param {string} attr
 * @param {string} value
 *
 * @returns {Object}
 */
export const setAttribute =
  ((el, attr, value) => {
    el.setAttribute(attr, value);
    return el;
  })
  |> attrValidator
  |> _.curry3;

/**
 * Sets multiple attibutes of the given element.
 * @param {Element} el
 * @param {Object} attributes
 *
 * @returns {Object}
 */
export const setAttributes =
  ((el, attributes) => {
    attributes |> _Obj.loop((val, key) => el |> setAttribute(key, val));
    return el;
  })
  |> elementObject
  |> _.curry2;

/**
 * Sets contents of the given element.
 * @param {Element} el
 * @param {string} html
 *
 * @returns {Object}
 */
export const setContents =
  ((el, html) => {
    el.innerHTML = html;
    return el;
  })
  |> elementString
  |> _.curry2;

export const offsetHeight = _.prop('offsetHeight');
