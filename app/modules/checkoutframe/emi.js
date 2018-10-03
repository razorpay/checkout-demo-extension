/* global templates, showOverlay, hideEmi */

function selectEMIBank(e) {
  const { target } = e;

  if (target |> _El.hasClass('option')) {
    const duration = target |> _El.getAttribute('value');
    const parent = _Doc.querySelector('#emi-check-label');
    const input = parent.querySelector('input[type=checkbox]');
    const active = parent.querySelector('.active');

    input.checked = Boolean(duration);
    active |> _El.removeClass('active');
    target |> _El.addClass('active');

    setTimeout(() => {
      parent.blur();
    });
  }
}

function hideEMIDropdown() {
  const body = _Doc.querySelector('#body');
  const parent = _Doc.querySelector('#emi-check-label');

  if (body |> _El.hasClass('emi-focus')) {
    body |> _El.removeClass('emi-focus');
    parent |> _El.removeClass('focus');
  }
}

function showEMIDropdown() {
  const body = _Doc.querySelector('#body');
  const parent = _Doc.querySelector('#emi-check-label');

  body |> _El.addClass('emi-focus');
  parent |> _El.addClass('focus');
}

export default function emiView(session) {
  const opts = session.emi_options;
  const amount = (opts.amount = session.get('amount')),
    offer = session.getAppliedOffer(),
    discountedAmount = session.getDiscountedAmount();

  if (
    amount >= 5000 * 100 &&
    (!offer ||
      offer.payment_network.toLowerCase() !== 'amex' ||
      discountedAmount >= 5000)
  ) {
    const help = _Doc.querySelector('#elem-emi .help');
    help
      |> _El.setContents(
        help.innerHTML.replace(' & Axis Bank', ', Axis & AMEX')
      );
  } else {
    delete opts.banks.AMEX;
  }

  opts.discountedAmount = discountedAmount;
  opts.offer = offer;

  this.opts = opts;
  this.listeners = [];
  this.render();
}

emiView.prototype = {
  render: function() {
    const wrap = _Doc.querySelector('#emi-wrap');

    this.unbind();
    wrap |> _El.setContents(templates.emi(this.opts));
    this.bind();
  },

  onchange: function(e) {
    this.opts.selected = e.target.value;
    this.render();
  },

  on: function(event, sel, listener) {
    const el = _Doc.querySelector(sel);

    this.listeners.push(el |> _El.on(event, listener));
  },

  bind: function() {
    this.on(
      'click',
      '#emi-check-label',
      function(e) {
        showEMIDropdown();
        return e.stopPropagation();
      },
      true
    );

    this.on(
      'click',
      '#container',
      function(e) {
        if (e.target.id !== 'emi-check-label') {
          hideEMIDropdown();
        }
      },
      true
    );

    this.on('click', '#emi-select', function(e) {
      hideEMIDropdown();
      return e.stopPropagation();
    });

    this.on('mousedown', '#emi-select', selectEMIBank);

    this.on('click', '#view-emi-plans', function() {
      // TODO: Update showOverlay once session.js is refactored.
      showOverlay({ 0: _Doc.querySelector('#emi-wrap') });
    });

    // TODO: Update hideEmi once session.js is refactored.
    this.on('click', '#emi-close', hideEmi);

    this.on('change', '#emi-bank-select', _Func.bind(this.onchange, this));
  },

  unbind: function() {
    _Arr.loop(this.listeners, function(delistener) {
      delistener();
    });
    this.listeners = [];
  },
};
