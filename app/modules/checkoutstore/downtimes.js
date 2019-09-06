const defaultState = {};

function Downtimes(base) {
  let downtimeState = _Obj.clone(defaultState);

  this.set = state => {
    downtimeState = {} |> _Obj.extend(state) |> _Obj.extend(downtimeState);
  };

  this.get = () => downtimeState;

  this.set(base);
}

export default new Downtimes(defaultState);
