const defaultState = {};

function Downtimes(base) {
  let downtimeState = {};

  this.set = state => {
    downtimeState = {} |> _Obj.extend(state) |> _Obj.extend(downtimeState);
  };

  this.get = () => _Obj.extend({}, downtimeState);

  this.set(base);
}

export default new Downtimes(defaultState);
