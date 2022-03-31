export function clickOutside(node) {
  const handleClick = (event) => {
    if (node && !node.contains(event.target) && !event.defaultPrevented) {
      node.dispatchEvent(new CustomEvent('click_outside', node));
    }
  };

  document.addEventListener('click', handleClick, true);

  return {
    destroy() {
      document.removeEventListener('click', handleClick, true);
    },
  };
}

export function isElementUnscrollable(element, scrollableValue = 5) {
  const { scrollHeight, offsetHeight } = element || {};
  // Assuming the element is scrollable if the scrollHeight height is more than 5px compared to offsetHeight
  if (scrollHeight - offsetHeight <= scrollableValue) {
    return true;
  }
}

export function screenScrollTop(element) {
  if (element) {
    element.scrollTop = 0;
  }
}
export const isScrollable = (node) => {
  const hasScrollableContent = node.scrollHeight > node.clientHeight;

  const overflowYStyle = window.getComputedStyle(node).overflowY;
  const isOverflowHidden = overflowYStyle.indexOf('hidden') !== -1;

  return hasScrollableContent && !isOverflowHidden;
};

export const getScrollableParent = (node) => {
  if (node === null) {
    return null;
  }

  if (isScrollable(node)) {
    return node;
  } else {
    return getScrollableParent(node.parentNode);
  }
};
