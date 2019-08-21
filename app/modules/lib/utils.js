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
}

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
  var scrollTop;
  var parent = el.offsetParent || el.parentElement;

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
}
