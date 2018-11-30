import SavedCardsScreen from 'templates/screens/savedcards.svelte';

const TARGET_QS = '#saved-cards-container';

export default function savedCardsView(session) {
  this.session = session;
}

savedCardsView.prototype = {
  setCards: function(data = {}) {
    if (!this.view) {
      const target = _Doc.querySelector(TARGET_QS);

      this.view = new SavedCardsScreen({
        target,
        data: data,
      });
    } else {
      this.view.set(data);
    }
  },
};
