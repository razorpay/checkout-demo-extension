const defaultState = {};

function Preferences(base) {
  let preferenceState = {};

  this.set = state => {
    preferenceState |> _Obj.extend({} |> _Obj.extend(state));
  };

  this.get = () => _Obj.extend({}, preferenceState);

  this.set(base);
}

export default new Preferences(defaultState);
