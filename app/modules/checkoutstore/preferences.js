const defaultState = {};

function Preferences(base) {
  let preferenceState = {};

  this.set = state => {
    preferenceState = {} |> _Obj.extend(state) |> _Obj.extend(preferenceState);
  };

  this.get = () => _Obj.extend({}, preferenceState);

  this.set(base);
}

export default new Preferences(defaultState);
