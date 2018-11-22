import CardlessEMIScreen from 'templates/screens/cardlessemi.svelte';

const cardProvider = {
  arrowText: 'Access Cards',
  data: {
    code: 'cards',
  },
  icon: '',
  title: 'EMI on Cards',
};

export default function cardlessEmiView({ on, providers, target }) {
  this.providers = [cardProvider].concat(providers);
  this.target = target;
  this.on = on;

  this.render();
}

cardlessEmiView.prototype = {
  render() {
    this.view = new CardlessEMIScreen({
      target: this.target,

      data: {
        providers: this.providers,
        on: this.on,
      },
    });
  },
};
