import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import { getSession } from 'sessionmanager';
import { hideCta, showCtaWithDefaultText } from 'checkoutstore/cta';
import { getEMandateBanks, getEMandateAuthTypes } from 'checkoutstore/methods';
import { selectedBank } from 'checkoutstore/screens/netbanking';

import EmandateView from 'ui/tabs/emandate/index.svelte';

/* global fillData */

const emandateTabTitles = {
  'emandate-details': 'Account Details',
  'emandate-auth-selection': 'Select Auth',
};

export default function emandateView() {
  const session = getSession();

  this.history = [];
  this.session = session;

  /* Prefill */
  this.prefill = {
    /* bank is the bank code for a particular bank */
    bank: session.get('prefill.bank'),
    /* auth_type that the merchant wants to enforce */
    auth_type: session.get('prefill.auth_type'),
  };

  this.banks = getEMandateBanks();

  this.setTabTitles();
  this.render();
}

emandateView.prototype = {
  onShown: function() {
    this.view.onShown();
  },

  onBack: function() {
    return this.view.onBack();
  },

  render: function() {
    const target = _Doc.querySelector('#emandate-wrapper');
    this.view = new EmandateView({
      target,
    });
  },

  setTabTitles: function() {
    _Obj.loop(emandateTabTitles, (v, k) => {
      this.session.tab_titles[k] = v;
    });
  },

  getPayload: function() {
    return this.view.getPayload();
  },
};
