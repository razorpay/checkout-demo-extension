import SavedCardsScreen from 'templates/screens/savedcards.svelte';

const TARGET_QS = '#saved-cards-container';

export default function savedCardsView(session) {
  this.session = session;
}

savedCardsView.prototype = {
  setCards: function(data = {}) {
    const target = _Doc.querySelector(TARGET_QS);

    _El.clearContents(target);

    new SavedCardsScreen({
      target,
      data: data,
    });
  },
};
