import * as ObjectUtils from 'utils/object';
import * as _ from 'utils/_';

type styleProps = keyof HTMLElement['style'];
export const ElementConstructor = global.Element;

/**
 * Creates an element using a tag name.
 * @param {string} tagName
 *
 * @returns {Element}
 */
export const create = (tagName: string) =>
  document.createElement(tagName || 'div');

/**
 * Gets the parent element of the given element.
 * @param {Element} element
 *
 * @returns {Element}
 */
export const parent = (element: Element) => element.parentNode;

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
export const appendTo = _.curry2(
  element2((childNode: Element, parentNode: Element) => {
    // returns child
    return parentNode.appendChild(childNode);
  })
);

/**
 * Appends a node to the given node.
 * @param {Element} parentNode
 * @param {Element} childNode
 *
 * @returns {Element} parentNode
 */
export const append = _.curry2(
  element2((parentNode: Element, childNode: Element) => {
    appendTo(childNode, parentNode);
    return parentNode;
  })
);

/**
 * Prepends a node to another node.
 * @param {Element} childNode
 * @param {Element} parentNode
 *
 * @returns {Element} childNode
 */
export const prependTo = _.curry2(
  element2((childNode: Element, parentNode: Element) => {
    const firstChild = parentNode.firstElementChild;
    if (firstChild) {
      parentNode.insertBefore(childNode, firstChild);
    } else {
      appendTo(childNode, parentNode);
    }
    return childNode;
  })
);

/**
 * Prepends a node to another node.
 * @param {Element} parentNode
 * @param {Element} childNode
 *
 * @returns {Element} parentNode
 */
export const prepend = _.curry2(
  element2((parentNode: Element, childNode: Element) => {
    prependTo(childNode, parentNode);
    return parentNode;
  })
);

/**
 * Removes the node from DOM.
 * @param {Element} childNode
 *
 * @returns {Element} childNode
 */
export const detach = element1((childNode: Element) => {
  const parentNode = parent(childNode);
  if (parentNode) {
    parentNode.removeChild(childNode);
  }
  return childNode;
});

export const selectionStart = element1(_.prop('selectionStart'));
export const selectionEnd = element1(_.prop('selectionEnd'));

/**
 * Moves caret for an element between the given positions
 * @param {HTMLInputElement} el
 * @param {number} position
 *
 * @returns {HTMLInputElement}
 */
export const moveCaret = _.curry2(
  _.validateArgs(
    _.isElement,
    _.isNumber
  )((el: HTMLInputElement, position: number) => {
    el.selectionStart = el.selectionEnd = position;
    return el;
  })
);

/**
 * Call submit method on the given element.
 * @param {HTMLFormElement} el
 *
 * @returns {Element}
 */
export const submit = element1((el: HTMLFormElement) => {
  el.submit();
  return el;
});

/**
 * Checks if the given element has the given class.
 * @param {Element} el
 * @param {string} className
 *
 * @returns {boolean}
 */
export const hasClass = _.curry2(
  elementString((el: Element, className: string) => {
    return (' ' + el.className + ' ').includes(' ' + className + ' ');
  })
);

/**
 * Adds a class to the given element.
 * @param {Element} el
 * @param {string} className
 *
 * @returns {Element}
 */
export const addClass = _.curry2(
  elementString((el: Element, className: string) => {
    if (!el.className) {
      el.className = className;
    } else if (!hasClass(el, className)) {
      el.className += ' ' + className;
    }
    return el;
  })
);

/**
 * Removes a class from the given element.
 * @param {Element} el
 * @param {string} className
 *
 * @returns {Element}
 */
export const removeClass = _.curry2(
  elementString((el: Element, className: string) => {
    className = (' ' + el.className + ' ')
      .replace(' ' + className + ' ', ' ')
      .replace(/^ | $/g, '');

    if (el.className !== className) {
      el.className = className;
    }
    return el;
  })
);

/**
 * Removes the class if it is attached.
 * Adds a class if it is not attached.
 * @param {Element} el
 * @param {string} className
 *
 * @returns {Element}
 */
export const toggleClass = _.curry2(
  elementString((el: Element, className: string) => {
    if (hasClass(el, className)) {
      removeClass(el, className);
    } else {
      addClass(el, className);
    }

    return el;
  })
);

/**
 * Adds or removes class based on `keep`
 * @param {Element} el
 * @param {string} className
 * @param {boolean} keep
 *
 * @returns {Element}
 */
export const keepClass = _.curry3(
  elementString((el: Element, className: string, keep: boolean) => {
    if (keep) {
      addClass(el, className);
    } else {
      removeClass(el, className);
    }

    return el;
  })
);

/**
 * Gets attribute of the given element.
 * @param {Element} el
 * @param {string} attr
 *
 * @returns {string}
 */
export const getAttribute = _.curry2(
  elementString((el: Element, attr: string) => el.getAttribute(attr))
);

/**
 * Sets attribute of the given element.
 * @param {Element} el
 * @param {string} attr
 * @param {string} value
 *
 * @returns {Object}
 */
export const setAttribute = _.curry3(
  attrValidator((el: Element, attr: string, value: string) => {
    el.setAttribute(attr, value);
    return el;
  })
);

/**
 * Sets style of the given element.
 * @param {Element} el
 * @param {string} cssProp
 * @param {string} value
 *
 * @returns {Object}
 */
export const setStyle = _.curry3(
  attrValidator((el: HTMLElement, cssProp: styleProps, value: string) => {
    el.style[cssProp as any] = value;
    return el;
  })
);

/**
 * Sets multiple attibutes of the given element.
 * @param {Element} el
 * @param {Object} attributes
 *
 * @returns {Object}
 */
export const setAttributes = _.curry2(
  elementObject((el: Element, attributes: { [x: string]: string }) => {
    ObjectUtils.loop(attributes, (val: string, key: string) =>
      setAttribute(el, key, val)
    );
    return el;
  })
);

/**
 * Sets multiple styles of the given element.
 * @param {Element} el
 * @param {Object} styles
 *
 * @returns {Object}
 */
export const setStyles = _.curry2(
  elementObject((el: Element, styles: { [K in styleProps]: string }) => {
    ObjectUtils.loop(styles, (val: string, key: styleProps) =>
      setStyle(el, key, val)
    );
    return el;
  })
);

/**
 * Sets contents of the given element.
 * @param {Element} el
 * @param {string} html
 *
 * @returns {Object}
 */
export const setContents = _.curry2(
  elementString((el: Element, html: string) => {
    el.innerHTML = html; // nosemgrep : https://semgrep.dev/s/lJpo
    return el;
  })
);

/**
 * Sets the display style of the given element.
 * @param {Element} el
 * @param {string} value
 *
 * @returns {Object}
 */
export const setDisplay = _.curry2(
  elementString((el: Element, value: string) => setStyle(el, 'display', value))
);

export const displayNone = setDisplay('none');
export const displayBlock = setDisplay('block');
export const displayInlineBlock = setDisplay('inline-block');
export const offsetWidth = _.prop('offsetWidth');
export const offsetHeight = _.prop('offsetHeight');

/**
 * Gets the size of an element and its position relative to the viewport
 * @param {Element} el
 *
 * @returns {Object}
 */
export const bbox = element1((el: Element) => el.getBoundingClientRect());

/**
 * Gets the first Child of the given element.
 * @param {Element} el
 *
 * @returns {Object}
 */
export const firstChild = element1((el: Element) => el.firstChild);

/* https://developer.mozilla.org/en/docs/Web/API/Element/matches */
const elementProto = _.prototypeOf(ElementConstructor);
const matchesSelector =
  elementProto.matches ||
  elementProto.matchesSelector ||
  elementProto.webkitMatchesSelector ||
  elementProto.mozMatchesSelector ||
  elementProto.msMatchesSelector ||
  elementProto.oMatchesSelector;

/**
 * Checks if the given element and the selector matches.
 * @param {Element} el
 * @param {string} selector
 *
 * @returns {Object}
 */
export const matches = _.curry2(
  elementString((el: Element, selector: string) => {
    return matchesSelector.call(el, selector);
  })
);

// always curried
export const on = (
  event: string,
  callback: (e: unknown) => void,
  delegate: string | boolean,
  useCapture: boolean
) => {
  if (_.is(event, ElementConstructor)) {
    return console.error(
      "use _El.til.on(e, cb)(el) [import * as _El from 'utils/DOM';]"
    );
  }
  return (el: Element) => {
    let attachedCallback = callback;
    if (_.isString(delegate)) {
      attachedCallback = function (e: any) {
        let target = e.target;
        while (!matches(target, delegate) && target !== el) {
          target = parent(target);
        }
        if (target !== el) {
          e.delegateTarget = target;
          callback(e);
        }
      };
    } else {
      useCapture = delegate as boolean;
    }

    // cast to boolean
    useCapture = !!useCapture;
    el.addEventListener(event, attachedCallback, useCapture);

    // return off-switch for this listener
    return () => el.removeEventListener(event, attachedCallback, useCapture);
  };
};

/**
 * Returns the closest parent element
 * that matches the given selector
 * @param {Element} node
 * @param {string} selector
 *
 * @returns {Element}
 */
export const closest = _.curry2((node: Element, selector: string) => {
  let current = node;

  while (_.isElement(current)) {
    if (matches(current, selector)) {
      return current;
    }

    current = parent(current) as Element;
  }

  return null;
});
