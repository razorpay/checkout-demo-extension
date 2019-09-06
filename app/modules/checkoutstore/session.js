const defaultState = {};

function Session(base) {
  let sessionState = {};

  this.set = state => {
    sessionState = {} |> _Obj.extend(state) |> _Obj.extend(sessionState);
  };

  this.get = () => _Obj.extend({}, sessionState);

  this.set(base);
}

export default new Session(defaultState);
