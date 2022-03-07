import { getPayoutContact, getDisplayAmount, getOption } from 'razorpay';

import { getSession } from 'sessionmanager';
import Analytics from 'analytics';
import { formatMessageWithLocale } from 'i18n';

import {
  createFundAccount,
  makeTrackingDataFromAccount,
} from 'checkoutframe/payouts';
import PayoutInstruments from 'ui/tabs/payout/payout-instruments.svelte';
import updateScore from 'analytics/checkoutScore';

export default function ({ topbar }) {
  const session = getSession();
  const contact = getPayoutContact();
  const accounts = (contact && contact.fund_accounts) || [];
  const upiAccounts = accounts.filter((a) => a.account_type === 'vpa');
  const bankAccounts = accounts.filter(
    (a) => a.account_type === 'bank_account'
  );

  const payoutsView = new PayoutInstruments({
    target: _Doc.querySelector('#form-fields'),
    props: {
      topbar,
      amount: getDisplayAmount(),
      upiAccounts: upiAccounts,
      bankAccounts: bankAccounts,
      onSubmit,
    },
  });

  return payoutsView;
}

function onSubmit(data) {
  const existing = data.id;
  const session = getSession();
  Analytics.track('payout:create:start');
  updateScore('timeToSubmit');
  Analytics.track('submit', {
    data: {
      account: makeTrackingDataFromAccount(data),
      existing,
    },
    immediately: true,
  });

  if (existing) {
    successHandler(data, true);
  } else {
    data.contact_id = getOption('contact_id');
    session.showLoadError(formatMessageWithLocale('misc.processing'));
    const verifyVpa = data.vpa
      ? session.verifyVpa(data.vpa.address)
      : Promise.resolve();
    verifyVpa
      .then(() => createFundAccount(data))
      .then(successHandler)
      .catch(session.errorHandler.bind(session));
  }
}

function successHandler(data, existing) {
  Analytics.track('payout:create:success', {
    data: {
      account: makeTrackingDataFromAccount(data),
      existing,
    },
    immediately: true,
  });

  getSession().successHandler({
    razorpay_fund_account_id: data.id,
  });
}
