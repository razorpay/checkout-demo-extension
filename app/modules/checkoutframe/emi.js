/* global templates, showOverlay, hideEmi, Event */
import EmiView from 'templates/views/emi.svelte';
import { AMEX_EMI_MIN } from 'common/constants';
import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';

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
    this.on('click', '#view-emi-plans', function() {
      // TODO: Update showOverlay once session.js is refactored.
      showOverlay({ 0: _Doc.querySelector('#emi-wrap') });

      Analytics.track('emi:plans:all:view', {
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
