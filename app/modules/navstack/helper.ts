import { get } from 'svelte/store';
import { lastOf } from 'utils/array';
import {
  elementRef,
  elements,
  overlays,
  overlaysRef,
  isSessionControlled,
} from './store';

type backSubscriberData = { isOverlay: boolean; stackCount: number };

function triggerPopStackSubscriber(data: backSubscriberData) {
  backSubscriber.forEach((fn) => fn(data));
}

const backSubscriber: Array<(data: backSubscriberData) => void> = [];
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
    triggerPopStackSubscriber({
      isOverlay: false,
      stackCount: _elements.length + _overlays.length,
    });
    if (!_elements.length) {
      elementRef.set(null);
    }
  }

  if (overlaysUpdated) {
    overlaysRef.update((existing) => existing.slice(0, _overlays.length));
    overlays.set(_overlays);
    if (!elementsUpdated) {
      triggerPopStackSubscriber({
        isOverlay: true,
        stackCount: _elements.length + _overlays.length,
      });
    }
  }
}

export function isStackPopulated() {
  const _elements = get(elements);
  const _overlays = get(overlays);
  return !!(_elements.length + _overlays.length);
}

export function isMainStackPopulated() {
  const _elements = get(elements);
  return !!_elements.length;
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

function lastRef() {
  return lastOf(get(overlaysRef)) || get(elementRef);
}

export function backPressed() {
  const last = lastRef();
  if (last) {
    if (!last.preventBack || !last.preventBack()) {
      popStack();
    }
  }
}

export function getPayload() {
  const last = lastRef();
  if (last && last.getPayload) {
    return last.getPayload();
  }
}

export function onPopStack(cb: (data: backSubscriberData) => void) {
  const index = backSubscriber.push(cb);
  return () => {
    backSubscriber[index] = () => {
      return;
    };
    return true;
  };
}

/**
 * Helper function to take the render control to session.js
 */
export function moveControlToSession(shouldMove: boolean) {
  isSessionControlled.set(shouldMove);
}

export function controlledViaSession() {
  return get(isSessionControlled);
}

/**
 * Navstack helper function to clear the stack elements
 * The function clears all the elements and set the reference to null
 */
export function clearStack() {
  elementRef.set(null);
  elements.set([]);
}
