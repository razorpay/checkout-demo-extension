import Track from './tracker';
import * as ObjectUtils from 'utils/object';
import * as _ from 'utils/_';
import { constructErrorObject } from 'error-service/helpers';
import { SEVERITY_LEVELS } from 'error-service/models';
import ErrorEvents from 'analytics/errors/events';

const META = {};
const REQUEST_INDEX = {};

let rInstance;

/**
 * @param {Object} _m
 *
 * @return {Object} m
 */
const calculateMeta = (_m) => {
  const meta = ObjectUtils.flatten(_m);

  ObjectUtils.loop(meta, (val, key) => {
    if (_.isFunction(val)) {
      meta[key] = val.call();
    }
  });

  return meta;
};

const sanitizeEventData = (data) => {
  const keysToMask = ['token'];

  const _data = ObjectUtils.clone(data || {});

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
    { type, data = {}, r = rInstance, immediately = false, isError } = {}
  ) {
    try {
      // when we get any error on mount of script we don't have r instance
      // due to that we are unable to track those events
      if (isError && !r) {
        // in those case of error we need logs
        // mock r
        r = {
          id: Track.id,
          getMode: () => 'live',
          get: (arg) => {
            if (typeof arg === 'string') {
              return false;
            }
            return {};
          },
        };
      }
      let calculatedMeta = calculateMeta(META);
      data = sanitizeEventData(data);
      if (_.isNonNullObject(data)) {
        data = ObjectUtils.clone(data);
      } else {
        data = {
          data,
        };
      }

      // If data.meta exists, add it to calculatedMeta.
      if (data.meta && _.isNonNullObject(data.meta)) {
        calculatedMeta = Object.assign(calculatedMeta, data.meta);
      }

      data.meta = calculatedMeta;

      data.meta.request_index = r ? REQUEST_INDEX[r.id] : null;

      // Add type to the name.
      if (type) {
        name = `${type}:${name}`;
      }

      Track(r, name, data, immediately);
    } catch (e) {
      /**
       * not using error-service (capture) here as it creates a circular dependency.
       */
      Track(
        r,
        ErrorEvents.JS_ERROR,
        {
          data: {
            error: constructErrorObject(e, {
              severity: SEVERITY_LEVELS.S2,
              unhandled: false,
            }),
          },
        },
        true
      );
    }
  },

  /**
   * @param {String} key
   * @param {*} val
   */
  setMeta: function (key, val) {
    META[key] = val;
  },

  /**
   * @param {String} key
   */
  removeMeta: function (key) {
    delete META[key];
  },

  /**
   * @return {Object}
   */
  getMeta: function () {
    return ObjectUtils.unflatten(META);
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

    if (!ObjectUtils.hasProp(REQUEST_INDEX, rInstance.id)) {
      REQUEST_INDEX[rInstance.id] = {};
    }

    const requestIndex = REQUEST_INDEX[rInstance.id];
    if (!ObjectUtils.hasProp(requestIndex, name)) {
      requestIndex[name] = -1;
    }

    requestIndex[name] += 1;
    return requestIndex[name];
  },
});

const analytics = Analytics();

export { Track };

export default analytics;
