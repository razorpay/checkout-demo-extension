import { iPhone } from 'common/useragent';
import Razorpay from 'common/Razorpay';
import { scrollIntoView } from 'lib/utils';

function onFocus(event) {
  _El.addClass(event.target.parentNode, 'focused');

  setTimeout(function() {
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
