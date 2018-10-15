import Track from './tracker';

const META = {};

let rInstance;

/**
 * @param {Object} _m
 *
 * @return {Object} m
 */
const calculateMeta = _m => {
  const meta = _Obj.flatten(_m);

  _Obj.loop(meta, (val, key) => {
    if (_.isFunction(val)) {
      meta[key] = val.call();
    }
  });

  return meta;
};

const Analytics = () => ({
  /**
   * @param {Razorpay} r
   */
  setR: function(r) {
    rInstance = r;
  },

  /**
   * @param {String} name
   * @param {Object}
   *  @prop {String} type
   *  @prop {Object} data
   *  @prop {Razorpay} r
   *  @prop {Boolean} beacon
   */
  track: function(name, { type, data = {}, r = rInstance, beacon = false }) {
    let calculatedMeta = calculateMeta(META);

    // If data.meta exists, add it to calculatedMeta.
    if (data.meta && _.isNonNullObject(data.meta)) {
      calculatedMeta = _Obj.extend(calculatedMeta, data.meta);
    }

    data.meta = calculatedMeta;

    // Add type to the name.
    if (type) {
      name = `${type}:${name}`;
    }

    Track(r, name, data, beacon);
  },

  /**
   * @param {String} key
   * @param {Any} val
   */
  setMeta: function(key, val) {
    _Obj.setProp(META, key, val);
  },

  /**
   * @param {String} key
   */
  removeMeta: function(key) {
    _Obj.deleteProp(META, key);
  },

  /**
   * @return {Object}
   */
  getMeta: function() {
    return _Obj.unflatten(META);
  },
});

const analytics = Analytics();

export default analytics;
