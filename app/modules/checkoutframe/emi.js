/* global templates, showOverlay, hideEmi, Event */
import EmiView from 'templates/views/emi.svelte';
import Razorpay from 'common/Razorpay';
import { AMEX_EMI_MIN, EMI_HELP_TEXT } from 'common/constants';
import * as OptionsList from 'components/OptionsList';

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
    !(
      amount > AMEX_EMI_MIN &&
      (!session.isOfferApplicableOnIssuer('amex', offer) ||
        discountedAmount > AMEX_EMI_MIN)
    )
  ) {
    delete opts.banks.AMEX;
  }

  this.session = session;
  opts.discountedAmount = discountedAmount;

  this.opts = opts;
  this.listeners = [];
  this.render();
}

emiView.prototype = {
  render() {
    const wrap = _Doc.querySelector('#emi-wrap');

    this.unbind();
    let defaultBank = _Obj.keys(this.opts.banks)[0];

    this.view = new EmiView({
      target: wrap,
      data: {
        selected: defaultBank,
        banks: this.opts.banks,
        session: this.session,
      },
    });

    this.bind();
  },

  on: function(event, sel, listener) {
    const el = _Doc.querySelector(sel);

    this.listeners.push(el |> _El.on(event, listener));
  },

  bind() {
    let session = this.session;

    this.on('change', '#emi_bank', e => {
      let bank = e.target.value;
      let text = '';

      if (bank) {
        text = this.opts.banks[bank].name;
      }

      if (this.prevBank !== bank) {
        _Doc.querySelector('#emi_duration').value = '';
      }

      this.prevBank = bank;
    });

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

    this.on('click', '#view-emi-plans', function() {
      // TODO: Update showOverlay once session.js is refactored.
      showOverlay({ 0: _Doc.querySelector('#emi-wrap') });
    });
  },

  unbind: function() {
    _Arr.loop(this.listeners, function(delistener) {
      delistener();
    });
    this.listeners = [];
  },
};
