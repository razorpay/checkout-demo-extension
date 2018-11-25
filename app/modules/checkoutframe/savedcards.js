import Store from 'checkoutframe/store';
import SavedCardsScreen from 'templates/screens/savedcards.svelte';

const TARGET_QS = '#saved-cards-container';

const deleteContentsOfElem = node => {
  while (node.hasChildNodes()) {
    node.removeChild(node.firstChild);
  }
};

export default function savedCardsView(session) {
  this.session = session;
}

savedCardsView.prototype = {
  setCards: function(data = {}) {
    const target = _Doc.querySelector(TARGET_QS);

    deleteContentsOfElem(target);

    new SavedCardsScreen({
      target,
      data: data,
    });
  },
};
