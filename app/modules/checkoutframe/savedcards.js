import SavedCardsScreen from 'templates/screens/savedcards.svelte';

export default function setView(params) {
  params.tokens = _Obj.clone(params.tokens);

  _Obj.extend(this, params);

  this.transformTokens();
  this.render();
}

setView.prototype = {
  render() {
    this.view = new SavedCardsScreen({
      target: this.target,

      data: {
        amount: this.amount,
        emi: this.emi,
        emiOptions: this.emiOptions,
        recurring: this.recurring,
        tokens: this.tokens.items,
      },
    });
  },

  transformTokens() {
    this.tokens.items = _Arr.filter(this.tokens.items, token => token.card);
    this.tokens.count = this.tokens.items.count;
  },
};
