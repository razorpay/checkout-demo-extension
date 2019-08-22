/**
 * Svelte store mimic for Preference.
 */
function Preferences() {
  let preferenceState = {};

  this.set = state => {
    preferenceState = state;
  };

  this.get = () => preferenceState;
}

export default new Preferences();
