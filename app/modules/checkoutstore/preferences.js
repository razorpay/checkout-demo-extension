const defaultState = {};

function Preferences(base) {
  let preferenceState = _Obj.clone(defaultState);

  this.set = state => {
    preferenceState = {} |> _Obj.extend(state) |> _Obj.extend(preferenceState);
  };

  this.get = () => preferenceState;

  this.set(base);
}

export default new Preferences(defaultState);
