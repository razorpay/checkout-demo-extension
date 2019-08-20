/* global $, isString, toggleInvalid */
import { iPhone } from 'common/useragent';
import Razorpay from 'common/Razorpay';

function onFocus(event) {
  $(event.target.parentNode).addClass('focused');
  setTimeout(function() {
    $(event.target).scrollIntoView();
  }, 1000);
  if (iPhone) {
    Razorpay.sendMessage({ event: 'focus' });
  }
}

function onBlur(event) {
  $(event.target.parentNode)
    .removeClass('focused')
    .addClass('mature');
  if (iPhone) {
    Razorpay.sendMessage({ event: 'blur' });
  }
}

function onInput(event) {
  const el = event.target;
  const value = el.value;
  const required = isString(el.getAttribute('required'));
  const pattern = el.getAttribute('pattern');
  const $parent = $(el.parentNode);

  $parent.toggleClass('filled', value);

  // validity check past this
  if (!(required || pattern)) {
    return;
  }
  var valid = true;
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
  toggleInvalid($parent, valid);
}

export function focus(node) {
  node.addEventListener('focus', onFocus);
  return {
    destroy: _ => node.removeEventListener('focus', onFocus),
  };
}

export function blur(node) {
  node.addEventListener('blur', onBlur);
  return {
    destroy: _ => node.removeEventListener('blur', onBlur),
  };
}

export function input(node) {
  node.addEventListener('input', onInput);
  return {
    destroy: _ => node.removeEventListener('blur', onInput),
  };
}
