import { iPhone } from 'common/useragent';
import { scrollIntoView } from 'lib/utils';
import * as _El from 'utils/DOM';
import * as _ from 'utils/_';

function onFocus(event: FocusEvent) {
  const target = event.target as HTMLElement;

  _El.addClass(target.parentNode, 'focused');

  setTimeout(function () {
    scrollIntoView(target);
  }, 1000);

  if (iPhone) {
    global.Razorpay.sendMessage({ event: 'focus' });
  }
}

function onBlur(event: FocusEvent) {
  const parent = (event.target as HTMLElement).parentNode;

  _El.removeClass(parent, 'focused');
  _El.addClass(parent, 'mature');

  if (iPhone) {
    global.Razorpay.sendMessage({ event: 'blur' });
  }
}

/**
 * Validates value with min and max present on the field
 * @param {Element} el
 *
 * @returns {boolean}
 */
function validateOnMinMax(el: HTMLInputElement) {
  const min = parseFloat(_El.getAttribute(el, 'min'));
  const max = parseFloat(_El.getAttribute(el, 'max'));
  const parsed = parseFloat(el.value);

  if (!isNaN(parsed) && (!isNaN(min) || !isNaN(max))) {
    if (!isNaN(min)) {
      if (parsed < min) {
        return false;
      }
    }

    if (!isNaN(max)) {
      if (parsed > max) {
        return false;
      }
    }

    return true;
  }

  return true;
}

function onInput(event: Event | { target: HTMLInputElement }) {
  const el = event.target as HTMLInputElement;
  const value = el.value;
  const required = _.isString(el.getAttribute('required'));
  const pattern = el.getAttribute('pattern');
  const parent = el.parentNode;

  _El.keepClass(parent, 'filled', value);

  // validity check past this
  if (!(required || pattern)) {
    return;
  }

  let valid = true;

  if (required && !value) {
    valid = false;
  }

  if (!required && !value) {
    valid = true;
  } else {
    if (valid && pattern) {
      valid = new RegExp(pattern).test(value);
    }
  }

  valid = valid && validateOnMinMax(el);

  _El.keepClass(parent, 'invalid', !valid);
}

export function focus(node: HTMLInputElement, condition = true) {
  if (!condition) {
    return;
  }
  node.addEventListener('focus', onFocus);

  return {
    destroy: () => node.removeEventListener('focus', onFocus),
  };
}

export function blur(node: HTMLInputElement, condition = true) {
  if (!condition) {
    return;
  }
  node.addEventListener('blur', onBlur);

  return {
    destroy: () => node.removeEventListener('blur', onBlur),
  };
}

export function input(node: HTMLInputElement, condition = true) {
  if (!condition) {
    return;
  }
  node.addEventListener('input', onInput);

  if (node.value) {
    onInput({
      target: node,
    });
  }

  return {
    destroy: () => node.removeEventListener('input', onInput),
  };
}
