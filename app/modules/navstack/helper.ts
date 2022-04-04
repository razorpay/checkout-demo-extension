import { get } from 'svelte/store';
import { stack } from './store';

// IMPORTANT: this function should be used to create utilities around stack manipulation
function updater(deleteCount: number, newElement?: NavStack.StackElement) {
  stack.update((value) => {
    const newArray = value.slice(0, -deleteCount);
    if (newElement) {
      newArray.push(newElement);
    }
    return newArray;
  });
}

export function isStackPopulated() {
  return Boolean(get(stack).length);
}

export function pushStack(stackElement: NavStack.StackElement) {
  updater(0, stackElement);
}

export function pushOverlay(stackElement: NavStack.StackElement) {
  updater(0, { ...stackElement, overlay: true });
}

export function popStack(count = 1) {
  updater(count);
}

export function replaceStack(stackElement: NavStack.StackElement) {
  updater(1, stackElement);
}
