import Store from 'checkoutframe/store';
import SavedCardsScreen from 'templates/screens/savedcards.svelte';

export default function setView(params) {
  _Obj.extend(this, params);

  this.render();
}

setView.prototype = {
  render() {
    this.view = new SavedCardsScreen({
      target: this.target,

      store: Store,
    });
  },
};
