import EMIScreen from 'templates/screens/emiscreen.svelte';

const TARGET_QS = '#form-emi';

function setPlan(plan) {
  this.fire('setplan', plan);
}

export default function EmiScreenView({ target, data }) {
  const emiScreen = new EMIScreen({
    data,
    target: target || _Doc.querySelector(TARGET_QS),
  });

  this.on = emiScreen.on.bind(emiScreen);
  this.destroy = emiScreen.destroy.bind(emiScreen);

  this.setPlan = setPlan.bind(emiScreen);
}
