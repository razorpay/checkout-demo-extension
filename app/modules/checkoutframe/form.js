import * as _El from 'utils/DOM';
import { querySelector } from 'utils/doc';

export const shake = () => {
  const modal = querySelector('#modal-inner');
  if (modal) {
    _El.removeClass(modal, 'shake');
    _El.offsetWidth(modal); // force reflow
    _El.addClass(modal, 'shake');
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
