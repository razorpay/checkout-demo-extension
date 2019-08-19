/* global $, isString, toggleInvalid */
import { iPhone } from 'common/useragent';
import Razorpay from 'common/Razorpay';

export function focus(event) {
  $(event.target.parentNode).addClass('focused');
  setTimeout(function() {
    $(event.target).scrollIntoView();
  }, 1000);
  if (iPhone) {
    Razorpay.sendMessage({ event: 'focus' });
  }
}

export function blur(event) {
  $(event.target.parentNode)
    .removeClass('focused')
    .addClass('mature');
  if (iPhone) {
    Razorpay.sendMessage({ event: 'blur' });
  }
}

export function input(event) {
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
