import { get } from 'svelte/store';
import { elements, overlays } from './store';

// IMPORTANT: this function should be used to create utilities around stack manipulation
function updater(deleteCount: number, newElement?: NavStack.StackElement) {
  let elementsUpdated = false;
  let overlaysUpdated = false;

  const _elements = get(elements);
  const _overlays = get(overlays);

  if (deleteCount > 0) {
    if (deleteCount > _overlays.length) {
      _elements.splice(-1, deleteCount - _overlays.length);
      elementsUpdated = true;
    }
    if (_overlays.length) {
      _overlays.splice(-1, deleteCount);
      overlaysUpdated = true;
    }
  }

  if (newElement) {
    if (newElement.overlay) {
      _overlays.push(newElement);
      overlaysUpdated = true;
    } else {
      _elements.push(newElement);
      elementsUpdated = true;
    }
  }

  if (elementsUpdated) {
    elements.set(_elements);
  }

  if (overlaysUpdated) {
    overlays.set(_overlays);
  }
}

export function isStackPopulated() {
  const _elements = get(elements);
  const _overlays = get(overlays);
  return !!(_elements.length + _overlays.length);
}

export function pushStack(stackElement: NavStack.StackElement) {
  updater(0, stackElement);
}

export function pushOverlay(stackElement: NavStack.StackElement) {
  updater(0, {
    ...stackElement,
    overlay: true,
  });
}

export function popStack(count = 1) {
  updater(count);
}

export function replaceStack(stackElement: NavStack.StackElement) {
  updater(1, stackElement);
}

export function isOverlayActive(component?: any): boolean {
  const _overlays = get(overlays);
  if (component) {
    return Boolean(
      _overlays.find((overlay) => overlay.component === component)
    );
  }
  return !!_overlays.length;
}
