/* global templates, showOverlay, hideEmi, Event */
import EmiView from 'templates/views/emi.svelte';
import { AMEX_EMI_MIN } from 'common/constants';
import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';

const bankOverrides = {
  SBIN: {
    name: 'SBI Credit Card',
  },
};

/**
 * Adds overrides to banks.
 * @param {Object} allBanks Object containting key-value pairs of banks.
 *
 * @return {Object}
 */
function useBankOverrides(allBanks) {
  const banks = _Obj.clone(allBanks);

  _Obj.loop(bankOverrides, (val, code) => {
    if (banks[code]) {
      banks[code] = _Obj.extend(banks[code], bankOverrides[code]);
    }
  });

  return banks;
}

function hideEMIDropdown() {
  const body = _Doc.querySelector('#body');

  if (body |> _El.hasClass('emi-focus')) {
    body |> _El.removeClass('emi-focus');
  }
}

function showEMIDropdown() {
  const body = _Doc.querySelector('#body');

  body |> _El.addClass('emi-focus');
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
    const banks = useBankOverrides(this.opts.banks);

    this.unbind();

    let defaultBank = _Obj.keys(banks)[0];

    this.view = new EmiView({
      target: wrap,
      data: {
        banks,
        selected: defaultBank,
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
    this.on('click', '#view-emi-plans', function() {
      // TODO: Update showOverlay once session.js is refactored.
      showOverlay({ 0: _Doc.querySelector('#emi-wrap') });

      Analytics.track('emi:plans:view:all', {
        type: AnalyticsTypes.BEHAV,
      });
    });
  },

  unbind: function() {
    _Arr.loop(this.listeners, function(delistener) {
      delistener();
    });
    this.listeners = [];
  },
};
