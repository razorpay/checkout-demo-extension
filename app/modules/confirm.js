const defaultOptions = {
  position: 'top',
  onHide: () => {},
  layout: 'ltr',
  onPositiveClick: _Func.noop,
  onNegativeClick: _Func.noop,
};

var listeners = [];

function on(event, sel, listener) {
  var $el = $(sel);
  /* $el.on return a function to removeEventListener */
  listeners.push($el.on(event, listener));
}

function unbind() {
  invokeEach(listeners);
  listeners = [];
}

let hideCallback;

export let isConfirmShown = false;

export function hide(invokeCallback = false) {
  if (!isConfirmShown) {
    return;
  }

  if (!$('#error-message').hasClass(shownClass)) {
    $('#overlay').removeClass(shownClass);
    setTimeout(() => {
      $('#overlay').css('display', '');
    }, 300);
  }
  $('#confirmation-dialog').removeClass('animate');
  setTimeout(() => {
    $('#confirmation-dialog').removeClass(shownClass);
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

  var $confirmationDialog = $('#confirmation-dialog');
  var $overlay = $('#overlay');
  $confirmationDialog[0].innerHTML = templates.confirm(options);

  on('click', '.confirm-container #positiveBtn', () => {
    hide();
    options.onPositiveClick();
  });
  on('click', '.confirm-container #negativeBtn', () => {
    hide();
    options.onNegativeClick();
  });

  $overlay.css('display', 'block');
  $overlay.addClass(shownClass);

  $confirmationDialog.addClass(shownClass);
  $confirmationDialog.addClass('confirm-position-' + options.position);

  setTimeout(() => {
    $confirmationDialog.addClass('animate');
  }, 10);

  isConfirmShown = true;
  hideCallback = options.onHide;
}
