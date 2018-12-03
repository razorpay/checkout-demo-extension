import EMIPlansView from 'templates/screens/emiplans.svelte';
import * as TermsCurtain from 'checkoutframe/termscurtain.js';

const TARGET_QS = '#emi-plan-screen-wrapper';
const AGREEMENT_STORE = {};

const AGREEMENT_HELPER = {
  createUrl: {
    zestmoney: (url, amount, duration) =>
      `${url}${_.obj2query({
        bucket_amount: amount,
        emi_duration: duration,
      })}`,
  },

  parseResponse: {
    zestmoney: response => {
      if (typeof response !== 'string') {
        return 'An error occurred while fetching the loan agreement.';
      }

      return response;
    },
  },
};

export default function emiPlansView(session) {
  this.session = session;
}

const viewAgreement = (provider, duration) => {
  let terms = 'An error occurred while fetching the loan agreement.';

  try {
    terms = AGREEMENT_STORE[provider][duration];
  } catch (e) {}

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
      url: AGREEMENT_HELPER.createUrl[provider](loanUrl, amount, plan.value),

      callback: function(response) {
        if (!AGREEMENT_STORE[provider]) {
          AGREEMENT_STORE[provider] = {};
        }

        AGREEMENT_STORE[provider][plan.value] = AGREEMENT_HELPER.parseResponse[
          provider
        ](response);

        console.log(AGREEMENT_STORE);
      },
    });
  });
};

emiPlansView.prototype = {
  setPlans: function({
    plans,
    actions = {},
    on = {},
    provider,
    amount,
    loanUrl,
  }) {
    if (loanUrl) {
      fetchAgreements(provider, loanUrl, plans, amount);
    }

    this.onSelect = on.select || _Func.noop;
    this.back = on.back || _Func.noop;

    on.select = plan => {
      this.selectedPlan = plan;
      _Doc.querySelector('#body') |> _El.addClass('sub');
    };

    on.viewAgreement = () => viewAgreement(provider, this.selectedPlan.value);

    const data = {
      on,
      plans,
      actions,
      expanded: -1,
    };

    if (!this.view) {
      const target = _Doc.querySelector(TARGET_QS);
      this.view = new EMIPlansView({
        target,
        data,
      });
    } else {
      this.view.set(data);
    }
  },

  submit: function() {
    this.onSelect(this.selectedPlan.value);
  },
};
