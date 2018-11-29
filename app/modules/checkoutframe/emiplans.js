import EMIPlansView from 'templates/screens/emiplans.svelte';

const TARGET_QS = '#emi-plan-screen-wrapper';

export default function emiPlansView(session) {
  this.session = session;
}

emiPlansView.prototype = {
  setPlans: function({ plans, actions = {}, on = {} }) {
    this.onSelect = on.select || _Func.noop;
    this.back = on.back || _Func.noop;

    on.select = plan => {
      this.selectedPlan = plan;
      _Doc.querySelector('#body') |> _El.addClass('sub');
    };

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
