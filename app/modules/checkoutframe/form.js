import * as _El from 'utils/DOM';
import { querySelector } from 'utils/doc';

export const shake = (selector = '#modal-inner', animation = 'shake') => {
  try {
    const modal = querySelector(selector);
    if (modal) {
      _El.removeClass(modal, animation);
      _El.offsetWidth(modal); // force reflow
      _El.addClass(modal, animation);
      setTimeout(() => {
        _El.removeClass(modal, animation);
      }, 400);
    }
  } catch (e) {
    // No need to capture as no impact in UI
  }

  try {
    global.navigator.vibrate(200);
  } catch (err) {}
};

const getActiveForm = () => querySelector('.tab-content.screen.drishy');

export const validateForm = () => {
  const invalid = getActiveForm()?.querySelector('[name]:invalid');
  if (invalid) {
    invalid.focus();
    return;
  }
  return true;
};
