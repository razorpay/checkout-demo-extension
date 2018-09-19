import { SHOWN_CLASS } from 'common/constants';
/* global templates */

const defaultOptions = {
  position: 'top',
  onHide: () => {},
  layout: 'ltr',
  onPositiveClick: _Func.noop,
  onNegativeClick: _Func.noop,
};

var listeners = [];

function on(event, sel, listener) {
  var el = _Doc.querySelector(sel);
  /* _El.on returns a function to removeEventListener */
  listeners.push(el |> _El.on(event, listener));
}

function unbind() {
  _Arr.loop(listeners, function(delistener) {
    delistener();
  });
  listeners = [];
}

let hideCallback;

export let isConfirmShown = false;

export function hide(invokeCallback = false) {
  if (!isConfirmShown) {
    return;
  }

  if (!_El.hasClass(_Doc.querySelector('#error-message'), SHOWN_CLASS)) {
    _Doc.querySelector('#overlay') |> _El.removeClass(SHOWN_CLASS);
    setTimeout(() => {
      _Doc.querySelector('#overlay') |> _El.setStyle('display', '');
    }, 300);
  }

  _Doc.querySelector('#confirmation-dialog') |> _El.removeClass('animate');
  setTimeout(() => {
    _Doc.querySelector('#confirmation-dialog') |> _El.removeClass(SHOWN_CLASS);
  }, 300);

  isConfirmShown = false;

  if (invokeCallback && hideCallback) {
    hideCallback();
  }
}

export function show(options) {
  options = _Obj.extend(defaultOptions, options);

  if (listeners.length) {
    unbind();
  }

  var confirmationDialog = _Doc.querySelector('#confirmation-dialog');
  var overlay = _Doc.querySelector('#overlay');
  _El.setContents(confirmationDialog, templates.confirm(options));

  on('click', '.confirm-container #positiveBtn', () => {
    hide();
    options.onPositiveClick();
  });
  on('click', '.confirm-container #negativeBtn', () => {
    hide();
    options.onNegativeClick();
  });

  _El.setStyle(overlay, 'display', 'block');
  _El.addClass(overlay, SHOWN_CLASS);

  _El.addClass(confirmationDialog, SHOWN_CLASS);
  _El.addClass(confirmationDialog, 'confirm-position-' + options.position);

  setTimeout(() => {
    _El.addClass(confirmationDialog, 'animate');
  }, 10);

  isConfirmShown = true;
  hideCallback = options.onHide;
}
