import CardlessEMIScreen from 'templates/screens/cardlessemi.svelte';

const TARGET_QS = '#emi-options-wrapper';

export default function emiOptionsView(session) {
  this.session = session;
}

emiOptionsView.prototype = {
  setOptions: function(data) {
    if (!this.view) {
      this.view = new CardlessEMIScreen({
        target: _Doc.querySelector(TARGET_QS),
        data,
      });
    } else {
      this.view.set(data);
    }
  },
};
