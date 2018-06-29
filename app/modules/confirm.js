var listeners = [];

function on(event, sel, listener) {
  var $el = $(sel);
  listeners.push($el.on(event, listener));
}

function unbind() {
  invokeEach(this.listeners);
  this.listeners = [];
}

export function hide() {
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
}

export function show(options) {
  if (listeners.length) {
    unbind();
  }

  var $confirmationDialog = $('#confirmation-dialog');
  var $overlay = $('#overlay');
  $confirmationDialog[0].innerHTML = templates.confirm(options);
  options.onPositiveClick = options.onPositiveClick || _Func.noop;
  options.onNegativeClick = options.onNegativeClick || _Func.noop;

  on('click', '.confirm #positiveBtn', () => {
    hide();
    options.onPositiveClick();
  });
  on('click', '.confirm #negativeBtn', () => {
    hide();
    options.onNegativeClick();
  });

  $overlay.css('display', 'block');
  $overlay.addClass(shownClass);

  $confirmationDialog.addClass(shownClass);

  setTimeout(() => {
    $confirmationDialog.addClass('animate');
  }, 10);
}
