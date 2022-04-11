import { iPhone } from 'common/useragent';
import Razorpay from 'common/Razorpay';
import { scrollIntoView } from 'lib/utils';
import * as _El from 'utils/DOM';

function onFocus(event) {
  _El.addClass(event.target.parentNode, 'focused');

  setTimeout(function () {
    scrollIntoView(event.target);
  }, 1000);

  if (iPhone) {
    Razorpay.sendMessage({ event: 'focus' });
  }
}

function onBlur(event) {
  const parent = event.target.parentNode;

  _El.removeClass(parent, 'focused');
  _El.addClass(parent, 'mature');

  if (iPhone) {
    Razorpay.sendMessage({ event: 'blur' });
  }
}

/**
 * Validates value with min and max present on the field
 * @param {Element} el
 *
 * @returns {boolean}
 */
function validateOnMinMax(el) {
  let min = parseFloat(_El.getAttribute(el, 'min'));
  let max = parseFloat(_El.getAttribute(el, 'max'));
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

function onInput(event) {
  const el = event.target;
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

export function focus(node, condition = true) {
  if (!condition) {
    return;
  }
  node.addEventListener('focus', onFocus);

  return {
    destroy: () => node.removeEventListener('focus', onFocus),
  };
}

export function blur(node, condition = true) {
  if (!condition) {
    return;
  }
  node.addEventListener('blur', onBlur);

  return {
    destroy: () => node.removeEventListener('blur', onBlur),
  };
}

export function input(node, condition = true) {
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
