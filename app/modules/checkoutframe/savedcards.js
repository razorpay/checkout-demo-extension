import SavedCardsScreen from 'templates/screens/savedcards.svelte';

export default function setView(params) {
  params.data = _Obj.clone(params.data);

  _Obj.extend(this, params);

  this.render();
}

setView.prototype = {
  render() {
    this.view = new SavedCardsScreen({
      target: this.target,

      data: {
        cards: this.cards,
      },
    });
  },
};
