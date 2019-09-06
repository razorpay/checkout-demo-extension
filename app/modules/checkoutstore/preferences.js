const defaultState = {};

function Preferences() {
  let preferenceState = _Obj.clone(defaultState);

  this.set = state => {
    preferenceState = _Obj.extend(preferenceState, state);
  };

  this.get = () => preferenceState;
}

export default new Preferences();
