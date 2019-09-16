import CardlessEMIScreen from 'templates/screens/cardlessemi.svelte';

const TARGET_QS = '#emi-options-wrapper';

export default function emiOptionsView() {}

emiOptionsView.prototype = {
  setOptions: function(props) {
    if (!this.view) {
      this.view = new CardlessEMIScreen({
        target: _Doc.querySelector(TARGET_QS),
        props,
      });
    } else {
      this.view.$set(props);
    }
  },
};
