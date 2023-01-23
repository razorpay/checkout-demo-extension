import { isElement } from './../utils/_';
/**
 * returns the opacity of the Element
 * @param {HTMLDivElement} node
 *
 */

export const getElementOpacity = (node: HTMLDivElement) => {
  if (!isElement(node)) {
    return null;
  }
  return window.getComputedStyle(node).opacity;
};
