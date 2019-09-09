const defaultState = {};

function Session(base) {
  let sessionState = {};

  this.set = state => {
    sessionState |> _Obj.extend({} |> _Obj.extend(state));
  };

  this.get = () => _Obj.extend({}, sessionState);

  this.set(base);
}

export default new Session(defaultState);
