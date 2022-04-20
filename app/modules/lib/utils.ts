type anyObject = { [x: string | number]: any };
import * as _El from 'utils/DOM';
/**
 * Scrolls the element into view if it is not completely visible.
 * @param el {Element}
 */
export function scrollIntoView(el: HTMLElement): HTMLElement {
  try {
    if (!isElementCompletelyVisible(el)) {
      bringIntoView(el);
    }
  } catch (e) {}
  return el;
}

/**
 * Checks if the element is completely visible in the viewport.
 * @param el {Element}
 * @return {boolean}
 */
function isElementCompletelyVisible(el: Element) {
  const rect = el.getBoundingClientRect();

  return (
    rect.top + rect.height <= window.innerHeight &&
    rect.left + rect.width <= window.innerWidth
  );
}

/**
 * Brings a Node into the view by scrolling
 * parents until it's in the view.
 * @param {Node} el
 */
function bringIntoView(el: HTMLElement) {
  let scrollTop;
  let parent = (el.offsetParent || el.parentElement) as HTMLElement;

  while (parent && !isElementCompletelyVisible(el)) {
    if (
      parent.id === 'modal' ||
      parent.style.overflow === 'hidden' ||
      parent.style.overflowY === 'hidden'
    ) {
      // Don't scroll div#modal as well as any element that cannot be scrolled back into position by the user.
      parent = (parent.offsetParent || parent.parentElement) as HTMLElement;

      continue;
    }

    scrollTop = el.getBoundingClientRect().y - parent.getBoundingClientRect().y;

    parent.scroll(0, scrollTop);

    parent = (parent.offsetParent || parent.parentElement) as HTMLElement;
  }

  return el;
}

/**
 * Turns A Sentence To Title Case
 * also known as CapitalCase
 * @param {string} sentence
 *
 * @returns {string}
 */
export function toTitleCase(sentence: string) {
  return String(sentence)
    ?.split(' ')
    ?.map(
      (word) =>
        `${word.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}`
    )
    ?.join(' ');
}

/**
 * Checks if an element is completely visible in container
 * @param {Element} element
 * @param {Element} container
 *
 * @returns {boolean}
 */
export function isElementCompletelyVisibleInContainer(
  element: Element,
  container: Element
) {
  const elementRect = element.getBoundingClientRect();

  const elementStartsAtX = elementRect.left;
  const elementEndsAtX = elementRect.left + elementRect.width;
  const elementStartsAtY = elementRect.top;
  const elementEndsAtY = elementRect.top + elementRect.height;

  const containerRect = container.getBoundingClientRect();

  const containerStartsAtX = containerRect.left;
  const containerEndsAtX = containerRect.left + containerRect.width;
  const containerStartsAtY = containerRect.top;
  const containerEndsAtY = containerRect.top + containerRect.height;

  const isHeightContained =
    elementStartsAtY >= containerStartsAtY &&
    elementEndsAtY <= containerEndsAtY;
  const isWidthContained =
    elementStartsAtX >= containerStartsAtX &&
    elementEndsAtX <= containerEndsAtX;

  const isElementContained = isHeightContained && isWidthContained;

  return isElementContained;
}

/**
 * Checks if an element is completely visible in its tab
 * @param {Element} element
 *
 * @returns {boolean}
 */
export function isElementCompletelyVisibleInTab(element: Element) {
  const tab = _El.closest(element, '.tab-content');

  if (!tab) {
    return false;
  }

  return isElementCompletelyVisibleInContainer(element, tab);
}

/**
 * Compares versions.
 * https://github.com/substack/semver-compare/blob/master/index.js
 * @param {String} a
 * @param {String} b
 *
 * @return {Integer}
 */
export function compareSemver(a: string, b: string) {
  var pa = a.split('.');
  var pb = b.split('.');
  for (var i = 0; i < 3; i++) {
    var na = Number(pa[i]);
    var nb = Number(pb[i]);
    if (na > nb) {
      return 1;
    }
    if (nb > na) {
      return -1;
    }
    if (!isNaN(na) && isNaN(nb)) {
      return 1;
    }
    if (isNaN(na) && !isNaN(nb)) {
      return -1;
    }
  }
  return 0;
}

export function luhnCheck(num: number) {
  let sum = 0;
  let digits: string[] = String(num).split('').reverse();

  for (var i = 0; i < digits.length; i++) {
    let digit: string | number = digits[i];
    digit = parseInt(digit, 10);
    if (i % 2) {
      digit *= 2;
    }
    if (digit > 9) {
      digit -= 9;
    }
    sum += digit;
  }

  return sum % 10 === 0;
}

export function getFormattedDateTime(timestamp: number) {
  const today = new Date(timestamp);
  let date = today.toDateString(); // Fri Jun 26 2020
  date = date.replace(/^\w*\s/, ''); // Jun 26 2020

  let time = today.toTimeString(); // 16:59:09 GMT+0530 (India Standard Time)
  time = time.replace(/GMT[^\s]*\s/, ''); // 16:59:09 (India Standard Time)
  time = time.replace('(India Standard Time)', 'IST'); // 16:59:09 IST
  return date + ' ' + time;
}

/**
 * Creates and returns a debounced version of the function.
 * @param {Function} cb
 * @param {number} delay
 *
 * @returns {Function}
 */

export function debounce(cb: (...args: any) => void, delay: number) {
  let timeout: NodeJS.Timeout | number;
  return function (this: any) {
    const context = this;
    const args: any = arguments;
    clearTimeout(timeout as any);
    timeout = setTimeout(cb.bind(context, ...args), delay);
  };
}

/**
 * Returns whatever is passed to it,
 * without doing anything at all.
 * @param {*} _
 *
 * @returns {*} _
 */
export function returnAsIs(_: any) {
  return _;
}

/**
 * given a string, returns safe html representation of it
 * * @param {string} string to sanitize
 *
 * @returns {string} safe html
 */
export function escapeHtml(str: string) {
  var escapeDiv = document.createElement('div');
  escapeDiv.appendChild(document.createTextNode(str));
  return escapeDiv.innerHTML;
}

export function each(
  this: any,
  iteratee: anyObject,
  eachFunc: (i: number | string, args: any) => any,
  thisArg?: any
) {
  var i;
  if (arguments.length < 3) {
    thisArg = this;
  }
  if (iteratee) {
    /**
     * 1. Not using instanceof Array, to iterate over array-like objects
     * 2. Not using `iteratee.length` inside `if` because 0 length arrays will
     *    then be considered as objects.
     * 3. Some browsers like webview on kitkat iterate over the `length`
     *    property of Arrays if iterated by `for-in` loop.
     * http://stackoverflow.com/questions/500504/why-is-using-for-in-with-array-iteration-a-bad-idea#comment315981_500531
     */
    if (typeof iteratee.length !== 'undefined') {
      for (i = 0; i < iteratee.length; i++) {
        eachFunc.call(thisArg, i, (iteratee as anyObject)[i]);
      }
    } else {
      for (i in iteratee) {
        if (iteratee.hasOwnProperty(i)) {
          eachFunc.call(thisArg, i, (iteratee as anyObject)[i]);
        }
      }
    }
  }
}

export function abortAjax(ajax: XMLHttpRequest | null) {
  if (ajax && ajax.abort) {
    ajax.abort();
    ajax = null;
  }
}
