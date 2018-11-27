import EMIPlansView from 'templates/screens/emiplans.svelte';

const TARGET_QS = '#emi-plan-screen-wrapper';

export default function emiPlansView(session) {
  this.session = session;
}

emiPlansView.prototype = {
  setPlans: function({ plans, actions = {}, on = {} }) {
    const target = _Doc.querySelector(TARGET_QS);

    _El.clearContents(target);

    this.onSelect = on.select || _Func.noop;
    this.back = on.back || _Func.noop;

    on.select = plan => {
      this.selectedPlan = plan;
      _Doc.querySelector('#body') |> _El.addClass('sub');
    };

    new EMIPlansView({
      target,

      data: {
        on,
        plans,
        actions,
      },
    });
  },

  submit: function() {
    this.onSelect(this.selectedPlan.value);
  },
};
