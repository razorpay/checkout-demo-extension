/**
 * Scrolls the element into view if it is not completely visible.
 * @param el {Element}
 */
export function scrollIntoView(el) {
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
function isElementCompletelyVisible(el) {
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
function bringIntoView(el) {
  let scrollTop;
  let parent = el.offsetParent || el.parentElement;

  while (parent && !isElementCompletelyVisible(el)) {
    if (
      parent.id === 'modal' ||
      parent.style.overflow === 'hidden' ||
      parent.style.overflowY === 'hidden'
    ) {
      // Don't scroll div#modal as well as any element that cannot be scrolled back into position by the user.
      parent = parent.offsetParent || parent.parentElement;

      continue;
    }

    scrollTop = el.getBoundingClientRect().y - parent.getBoundingClientRect().y;

    parent.scroll(0, scrollTop);

    parent = parent.offsetParent || parent.parentElement;
  }

  return el;
}

export function toTitleCase(str) {
  if (!str) {
    return str;
  }

  return str[0].toUpperCase() + str.slice(1);
}

/**
 * Checks if an element is completely visible in container
 * @param {Element} element
 * @param {Element} container
 *
 * @returns {boolean}
 */
export function isElementCompletelyVisibleInContainer(element, container) {
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
export function isElementCompletelyVisibleInTab(element) {
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
export function compareSemver(a, b) {
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

export function luhnCheck(num) {
  let sum = 0;
  let digits = String(num)
    .split('')
    .reverse();

  for (var i = 0; i < digits.length; i++) {
    let digit = digits[i];
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
