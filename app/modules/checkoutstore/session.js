const defaultState = {};

function Session() {
  let sessionState = _Obj.clone(defaultState);

  this.set = state => {
    sessionState = _Obj.extend(sessionState, state);
  };

  this.get = () => sessionState;
}

export default new Session();
