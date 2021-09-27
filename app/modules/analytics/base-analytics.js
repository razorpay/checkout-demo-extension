import Track from './tracker';

const META = {};
const REQUEST_INDEX = {};

let rInstance;

/**
 * @param {Object} _m
 *
 * @return {Object} m
 */
const calculateMeta = (_m) => {
  const meta = _Obj.flatten(_m);

  _Obj.loop(meta, (val, key) => {
    if (_.isFunction(val)) {
      meta[key] = val.call();
    }
  });

  return meta;
};

const sanitizeEventData = (data) => {
  const keysToMask = ['token'];

  const _data = _Obj.clone(data || {});

  keysToMask.forEach((key) => {
    if (_data[key]) {
      _data[key] = '__REDACTED__';
    }
  });

  return _data;
};

const Analytics = () => ({
  /**
   * @param {Razorpay} r
   */
  setR: function (r) {
    rInstance = r;
    Track.dispatchPendingEvents(r);
  },

  /**
   * @param {String} name
   * @param {Object}
   *  @prop {String} type
   *  @prop {Object} data
   *  @prop {Razorpay} r
   *  @prop {Boolean} immediately
   */
  track: function (
    name,
    { type, data = {}, r = rInstance, immediately = false } = {}
  ) {
    let calculatedMeta = calculateMeta(META);
    data = sanitizeEventData(data);
    if (_.isNonNullObject(data)) {
      data = _Obj.clone(data);
    } else {
      data = {
        data,
      };
    }

    // If data.meta exists, add it to calculatedMeta.
    if (data.meta && _.isNonNullObject(data.meta)) {
      calculatedMeta = _Obj.extend(calculatedMeta, data.meta);
    }

    data.meta = calculatedMeta;

    data.meta.request_index = REQUEST_INDEX[rInstance.id];

    // Add type to the name.
    if (type) {
      name = `${type}:${name}`;
    }

    Track(r, name, data, immediately);
  },

  /**
   * @param {String} key
   * @param {*} val
   */
  setMeta: function (key, val) {
    _Obj.setProp(META, key, val);
  },

  /**
   * @param {String} key
   */
  removeMeta: function (key) {
    _Obj.deleteProp(META, key);
  },

  /**
   * @return {Object}
   */
  getMeta: function () {
    return _Obj.unflatten(META);
  },

  /**
   * Updates & returns the request index
   * @param name
   * @returns {number}
   */
  updateRequestIndex(name) {
    if (!rInstance || !name) {
      return 0;
    }

    if (!_Obj.hasProp(REQUEST_INDEX, rInstance.id)) {
      REQUEST_INDEX[rInstance.id] = {};
    }

    const requestIndex = REQUEST_INDEX[rInstance.id];
    if (!_Obj.hasProp(requestIndex, name)) {
      requestIndex[name] = -1;
    }

    requestIndex[name] += 1;
    return requestIndex[name];
  },
});

const analytics = Analytics();

export { Track };

export default analytics;
