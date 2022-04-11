import * as _El from 'utils/DOM';
import { querySelector } from 'utils/doc';

export const shake = () => {
  const modal = querySelector('#modal-inner');
  if (modal) {
    modal |> _El.removeClass('shake');
    modal |> _El.offsetWidth; // force reflow
    modal |> _El.addClass('shake');
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
