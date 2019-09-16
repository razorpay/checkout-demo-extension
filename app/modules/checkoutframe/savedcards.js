import SavedCardsScreen from 'templates/screens/savedcards.svelte';

const TARGET_QS = '#saved-cards-container';

export default function savedCardsView() {}

savedCardsView.prototype = {
  setCards: function(props) {
    if (!this.view) {
      const target = _Doc.querySelector(TARGET_QS);

      this.view = new SavedCardsScreen({
        target,
        props,
      });
    } else {
      this.view.$set(props);
    }
  },
};
