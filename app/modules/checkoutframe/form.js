export const shake = () => {
  const modal = _Doc.querySelector('#modal-inner');
  if (modal) {
    modal |> _El.removeClass('shake');
    modal |> _El.offsetWidth; // force reflow
    modal |> _El.addClass('shake');
  }

  try {
    global.navigator.vibrate(200);
  } catch (err) {}
};

const getActiveForm = () => _Doc.querySelector('.tab-content.screen.drishy');

export const validateForm = () => {
  const invalid = getActiveForm()?.querySelector('[name]:invalid');
  if (invalid) {
    invalid.focus();
    return;
  }
  return true;
};
