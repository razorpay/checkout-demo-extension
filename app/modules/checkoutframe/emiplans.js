import EMIPlansView from 'templates/screens/emiplans.svelte';

const TARGET_QS = '#emi-plan-screen-wrapper';

const deleteContentsOfElem = node => {
  while (node.hasChildNodes()) {
    node.removeChild(node.firstChild);
  }
};

export default function emiPlansView(session) {
  this.session = session;
}

emiPlansView.prototype = {
  setPlans: function({ plans, onSelect, onBack, onViewAll, onPayWithoutEmi }) {
    const EMI_Plans_Wrapper = _Doc.querySelector(TARGET_QS);

    deleteContentsOfElem(EMI_Plans_Wrapper);

    const on = {
      select: plan => {
        this.selectedPlan = plan;
      },
      viewAll: onViewAll,
      payWithoutEmi: onPayWithoutEmi,
    };

    new EMIPlansView({
      target: EMI_Plans_Wrapper,

      data: {
        on,
        plans,
      },
    });

    this.back = onBack;
    this.onSelect = onSelect;
  },

  submit: function() {
    this.onSelect(this.selectedPlan.value);
  },
};
