import EMIPlansView from 'templates/screens/emiplans.svelte';
import * as TermsCurtain from 'checkoutframe/termscurtain';
import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';

const TARGET_QS = '#emi-plan-screen-wrapper';
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
    zestmoney: response => {
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

  _Arr.loop(plans, plan => {
    fetch({
      url: AGREEMENT_HELPER.createUrl[provider](loanUrl, amount, plan.duration),

      callback: function(response) {
        if (!AGREEMENT_STORE[provider]) {
          AGREEMENT_STORE[provider] = {};
        }

        AGREEMENT_STORE[provider][
          plan.duration
        ] = AGREEMENT_HELPER.parseResponse[provider](response);
      },
    });
  });
};

emiPlansView.prototype = {
  setPlans: function({
    plans,
    bank,
    actions = {},
    on = {},
    provider,
    amount,
    loanUrl,
    branding,
  }) {
    if (loanUrl) {
      fetchAgreements(provider, loanUrl, plans, amount);
    }

    this.onSelect = on.select || _Func.noop;
    this.back = on.back || _Func.noop;

    on.select = event => {
      const plan = event.detail;
      Analytics.track('emi:plan:choose', {
        type: AnalyticsTypes.BEHAV,
        data: {
          value: plan.duration,
        },
      });

      this.selectedPlan = plan;
      _Doc.querySelector('#body') |> _El.addClass('sub');
    };

    on.viewAgreement = () =>
      viewAgreement(provider, this.selectedPlan.duration);

    const props = {
      on,
      plans,
      bank,
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
  },

  submit: function() {
    if (!this.selectedPlan) {
      return;
    }

    this.onSelect(this.selectedPlan.duration);
  },
};
