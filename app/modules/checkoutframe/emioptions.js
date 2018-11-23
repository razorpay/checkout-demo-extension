import CardlessEMIScreen from 'templates/screens/cardlessemi.svelte';

export default function emiOptionsView(params) {
  this.target = params.target;
  delete params.target;

  this.data = params;

  this.render();
}

emiOptionsView.prototype = {
  render() {
    this.view = new CardlessEMIScreen({
      target: this.target,

      data: this.data,
    });
  },
};
