/**
 * Svelte store mimic for Downtime
 */
function Downtimes() {
  let downtimeState = {};

  this.set = state => {
    downtimeState = state;
  };

  this.get = () => downtimeState;
}

export default new Downtimes();
