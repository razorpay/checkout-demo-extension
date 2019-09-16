import EMIScreen from 'templates/screens/emiscreen.svelte';

const TARGET_QS = '#form-emi';

export default function EmiScreenView({ target, props }) {
  const emiScreen = new EMIScreen({
    target: target || _Doc.querySelector(TARGET_QS),
    props,
  });

  this.$on = emiScreen.$on;
  this.$destroy = emiScreen.$destroy;
  this.setPlan = emiScreen.setPlan;
}
