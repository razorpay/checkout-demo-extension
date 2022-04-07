/* global templates, showOverlay, hideEmi, Event */
import EmiView from 'ui/components/emi.svelte';
import { getSession } from 'sessionmanager';
import { getEMIBanks } from 'checkoutstore/methods';
import * as _El from 'utils/DOM';
import { querySelector } from 'utils/doc';

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

export default function emiView() {
  const session = getSession();
  const opts = {
    banks: getEMIBanks(),
  };

  const amount = (opts.amount = session.get('amount')),
    offer = session.getAppliedOffer(),
    discountedAmount = session.getDiscountedAmount();

  if (
    !(
      opts.banks.AMEX &&
      (!session.isOfferApplicableOnIssuer('amex', offer) ||
        discountedAmount > opts.banks.AMEX.min_amount)
    )
  ) {
    delete opts.banks.AMEX;
  }

  opts.discountedAmount = discountedAmount;

  this.opts = opts;
  this.listeners = [];
  this.render();
}

emiView.prototype = {
  render() {
    const wrap = querySelector('#emi-wrap');
    const banks = useBankOverrides(this.opts.banks);

    let defaultBank = _Obj.keys(banks)[0];

    this.view = new EmiView({
      target: wrap,
      props: {
        banks,
        selected: defaultBank,
      },
    });
  },

  on: function (event, sel, listener) {
    const el = querySelector(sel);

    this.listeners.push(el |> _El.on(event, listener));
  },
};
