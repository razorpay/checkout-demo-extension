const defaultState = {};

function Session(base) {
  let sessionState = _Obj.clone(defaultState);

  this.set = state => {
    sessionState = {} |> _Obj.extend(state) |> _Obj.extend(sessionState);
  };

  this.get = () => sessionState;

  this.set(base);
}

export default new Session(defaultState);
