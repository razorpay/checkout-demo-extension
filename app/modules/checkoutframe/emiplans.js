import { tick } from 'svelte';
import EMIPlansView from 'ui/tabs/emi/emiplans.svelte';
import * as TermsCurtain from 'checkoutframe/termscurtain';
import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import { getSession } from 'sessionmanager';
import { INDIAN_CONTACT_REGEX } from 'common/constants';
import { returnAsIs } from 'lib/utils';

const TARGET_QS = '#form-fields';
const AGREEMENT_STORE = {};

const AGREEMENT_HELPER = {
  createUrl: {
    zestmoney: (url, amount, duration) =>
      `${url.replace('http://', 'https://')}${_.obj2query({
        basket_amount: amount,
        emi_duration: duration,
      })}`,
  },

  parseResponse: {
    zestmoney: (response) => {
      if (typeof response !== 'string') {
        Analytics.track('cardless_emi:terms:fetch:error', {
          data: {
            response,
            provider: 'zestmoney',
          },
        });

        return 'An error occurred while fetching the loan agreement.';
      }

      Analytics.track('cardless_emi:terms:fetch:success', {
        data: {
          response,
          provider: 'zestmoney',
        },
      });

      return response;
    },
  },
};

export default function emiPlansView() {}

const viewAgreement = (provider, duration) => {
  let terms = 'An error occurred while fetching the loan agreement.';

  try {
    terms = AGREEMENT_STORE[provider][duration];
  } catch (e) {}

  Analytics.track('cardless_emi:terms:show', {
    type: AnalyticsTypes.BEHAV,
    data: {
      duration,
      provider,
    },
  });

  TermsCurtain.show({
    heading: 'Loan Agreement',
    terms,
  });
};

const fetchAgreements = (provider, loanUrl, plans, amount) => {
  if (loanUrl.indexOf('?') < 0) {
    loanUrl += '?';
  } else {
    loanUrl += '&';
  }

  const createUrlHelper = AGREEMENT_HELPER.createUrl[provider];

  // API sometimes sends loan_url for providers other than the ones that need
  // a loan agreement to be shown. Do not try to fetch the agreement if the
  // helper for the provider is not defined.
  if (!createUrlHelper) {
    return;
  }

  _Arr.loop(plans, (plan) => {
    fetch({
      url: createUrlHelper(loanUrl, amount, plan.duration),

      callback: function (response) {
        if (!AGREEMENT_STORE[provider]) {
          AGREEMENT_STORE[provider] = {};
        }

        // TODO: restructure AGREEMENT_HELPER to make the relationship between
        //  parseResponse and createUrl explicit
        AGREEMENT_STORE[provider][plan.duration] =
          AGREEMENT_HELPER.parseResponse[provider](response);
      },
    });
  });
};

emiPlansView.prototype = {
  setPlans: function ({
    plans,
    bank,
    card,
    contactRequiredForEMI,
    actions = {},
    on = {},
    provider,
    amount,
    loanUrl,
    branding,
    type,
  }) {
    if (loanUrl) {
      fetchAgreements(provider, loanUrl, plans, amount);
    }

    this.onSelect = on.select || returnAsIs;
    this.back = on.back || returnAsIs;
    this.contactRequiredForEMI = contactRequiredForEMI;

    on.select = (event) => {
      const plan = event.detail;
      const session = getSession();

      var offer = session.getAppliedOffer();
      const isNoCostEmi = offer && offer.emi_subvention;

      if (isNoCostEmi && offer.id !== plan.offer_id) {
        return session.showOffersError((offerRemoved) => {
          if (offerRemoved) {
            // Offer is actually removed after `tick`
            // So we need to wait as well
            tick().then(() => {
              on.select(event);
            });
          } else {
            this.view.deselectAll();
          }
        });
      }

      Analytics.track('emi:plan:choose', {
        type: AnalyticsTypes.BEHAV,
        data: {
          bank,
          card,
          provider,
          type,
          value: plan.duration,
        },
      });

      this.selectedPlan = plan;
      _Doc.querySelector('#body') |> _El.addClass('sub');
    };

    on.setContact = (contact) => {
      this.contact = contact;
    };

    on.viewAgreement = () =>
      viewAgreement(provider, this.selectedPlan.duration);

    const props = {
      on,
      plans,
      bank,
      type,
      actions,
      expanded: -1,
      amount,
      provider,
      branding,
    };

    if (!this.view) {
      const target = _Doc.querySelector(TARGET_QS);
      this.view = new EMIPlansView({
        target,
        props,
      });
    } else {
      this.view.$set(props);
    }

    this.view.onShown();
  },

  submit: function () {
    if (!this.selectedPlan) {
      this.view.showPlansView();
      return;
    }

    if (
      this.contactRequiredForEMI &&
      !INDIAN_CONTACT_REGEX.test(this.contact)
    ) {
      this.view.showContactView();
      return;
    }

    this.onSelect(this.selectedPlan.duration, this.contact);
  },
};
