import Track from './tracker';

const META = {
  lastChange: {},
};

const trackChangeFor = ['screen', 'tab'];
const trackTimeSinceFor = ['open', 'render'];
const propertiesToDelete = ['open', 'render', 'lastChange'];

let rInstance;

/**
 * @param {Object} _m
 *
 * @param {Object} m
 */
const calculateMeta = _m => {
  const meta = _Obj.clone(_m);
  const now = Date.now();

  meta.timeSince = {};

  _Arr.loop(trackTimeSinceFor, property => {
    if (meta[property]) {
      meta.timeSince[property] = now - meta[property];
    }
  });
  _Obj.loop(meta.lastChange, (timestamp, property) => {
    meta.timeSince[property] = now - timestamp;
  });

  _Arr.loop(propertiesToDelete, property => {
    delete meta[property];
  });

  return meta;
};

const Analytics = () => ({
  /**
   * @param {Object} meta
   */
  init: function(meta = {}) {
    _Obj.loop(meta, (val, key) => {
      this.setMeta(key, val);
    });

    this.setMeta('init', Date.now());
  },

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

    if (data.meta && _.isNonNullObject(data.meta)) {
      calculatedMeta = _Obj.extend(calculatedMeta, data.meta);
    }

    data.meta = calculatedMeta;

    if (type) {
      name = `${type}:${name}`;
    }

    Track(rInstance, name, data, beacon);
  },

  /**
   * @param {String} key
   * @param {Any} val
   */
  setMeta: function(key, val) {
    _Obj.setProp(META, key, val);

    if (_Arr.contains(trackChangeFor, key)) {
      _Obj.setProp(META.lastChange, key, Date.now());
    }
  },

  /**
   * @return {Object}
   */
  getMeta: function() {
    return _Obj.clone(META);
  },
});

const analytics = Analytics();

export default analytics;
