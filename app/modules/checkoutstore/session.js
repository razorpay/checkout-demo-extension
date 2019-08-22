/**
 * Svelte store mimic for Session.
 */
function Session() {
  let sessionState = {
    screen: '',
  };

  this.set = state => {
    sessionState = state;
  };

  this.get = () => sessionState;
}

export default new Session();
