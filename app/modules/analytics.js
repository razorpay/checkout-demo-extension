import Track from './tracker';

const META = {
  lastChange: {},
};

/**
 * Set timestamp when any of these meta properties change.
 * We want to track the time diff between the event and when these
 * properties were last changed.
 */
const trackChangeFor = ['screen', 'tab'];

/**
 * We want to track the time diff between the event and when these
 * properties were set.
 */
const trackTimeSinceFor = ['open', 'render'];

/**
 * Delete these properties from the meta object before sending it.
 */
const propertiesToDelete = ['open', 'render', 'lastChange'];

let rInstance;

/**
 * @param {Object} _m
 *
 * @return {Object} m
 */
const calculateMeta = _m => {
  const meta = _Obj.clone(_m);
  const now = Date.now();

  // Set timeSince
  meta.timeSince = {};
  _Arr.loop(trackTimeSinceFor, property => {
    if (meta[property]) {
      meta.timeSince[property] = now - meta[property];
    }
  });
  _Obj.loop(meta.lastChange, (timestamp, property) => {
    meta.timeSince[property] = now - timestamp;
  });

  // Delete properties
  _Arr.loop(propertiesToDelete, property => {
    delete meta[property];
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

    Track(rInstance, name, data, beacon);
  },

  /**
   * @param {String} key
   * @param {Any} val
   */
  setMeta: function(key, val) {
    _Obj.setProp(META, key, val);

    // If we need to track time-diff for this property, save timestamp.
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
