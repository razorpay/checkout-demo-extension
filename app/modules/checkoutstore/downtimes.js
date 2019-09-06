const defaultState = {};

function Downtimes() {
  let downtimeState = _Obj.clone(defaultState);

  this.set = state => {
    downtimeState = _Obj.extend(downtimeState, state);
  };

  this.get = () => downtimeState;
}

export default new Downtimes();
