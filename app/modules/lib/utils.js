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

const map = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};
export function sanitizeHtmlEntities(string) {
  return string.replace(/[&<>"'/]/g, match => map[match]);
}

/**
 * Returns a stringified version of the list with oxford commas
 * @param {Array<string>} list
 *
 * @returns {string}
 */
function oxfordComma(list) {
  const length = list.length;

  switch (length) {
    case 0:
      return '';

    case 1:
      return list[0];

    // We do not use an oxford comma for two items
    case 2:
      return list.join(' and ');

    default:
      return `${list.slice(0, length - 1).join(', ')}, and ${list[length - 1]}`;
  }
}

/**
 * Returns the text with commas or "and" as the separator.
 * Example: list: ['a', 'b', 'c', 'd'], max: 2 - returns "a, b & More"
 * Example: list: ['a', 'b'], max: 2 - returns "a and b"
 * Example: list: ['a', 'b', 'c'], max: 3 - returns "a, b, and c"
 * @param {Array} list
 * @param {Number} max
 *
 * @return {String}
 */
export function generateTextFromList(list, max = Infinity) {
  if (list.length > max) {
    return `${list.slice(0, max - 1).join(', ')} & More`;
  } else {
    return oxfordComma(list);
  }
}

export function toLowerCaseSafe(str) {
  if (!str) {
    return;
  }

  return str.toLowerCase();
}

export function toTitleCase(str) {
  if (!str) {
    return str;
  }

  return str[0].toUpperCase() + str.slice(1);
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

  const elementRect = element.getBoundingClientRect();

  const elementStartsAtX = elementRect.left;
  const elementEndsAtX = elementRect.left + elementRect.width;
  const elementStartsAtY = elementRect.top;
  const elementEndsAtY = elementRect.top + elementRect.height;

  const tabRect = tab.getBoundingClientRect();

  const tabStartsAtX = tabRect.left;
  const tabEndsAtX = tabRect.left + tabRect.width;
  const tabStartsAtY = tabRect.top;
  const tabEndsAtY = tabRect.top + tabRect.height;

  const isHeightContianed =
    elementStartsAtY >= tabStartsAtY && elementEndsAtY <= tabEndsAtY;
  const isWidthContained =
    elementStartsAtX >= tabStartsAtX && elementEndsAtX <= tabEndsAtX;

  const isElementContained = isHeightContianed && isWidthContained;

  return isElementContained;
}
