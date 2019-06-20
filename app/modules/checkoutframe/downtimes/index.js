/**
 * Checks downtime for provided severity or scheduled,
 * and decides to disable.
 *
 * @param {Array} severity List of severities for which to disable
 * @param {Boolean} scheduled Value of scheduled to disable on
 *
 * @return {Function} Says whether or not to disable method.
 *  @param {Object} downtime
 *
 *  @return {Boolean}
 */
function disableBasedOnSeverityOrScheduled(severity = [], scheduled = true) {
  return function disable(downtime) {
    return (
      _Arr.contains(severity, downtime.severity) ||
      downtime.scheduled === scheduled
    );
  };
}

const DISABLE_METHOD = {
  // upi: disableBasedOnSeverityOrScheduled(['high'], true),
  // qr: disableBasedOnSeverityOrScheduled(['high'], true),
  // gpay: disableBasedOnSeverityOrScheduled(['high'], true),
};

/**
 * Gets the list of methods to be disabled.
 * @param {Object} downtimes
 *  @key {String} method
 *  @value {Array} downtimes Downtimes of the method
 *
 * @return {Array}
 */
function getDisabledMethods(downtimes) {
  const disabled = [];

  // Loop through all methods
  _Obj.loop(downtimes, (methodDowntimes, method) => {
    // If we don't have a function to eval downtime for the method, do nothing
    if (!DISABLE_METHOD[method]) {
      return;
    }

    // Check if the method's downtime checker function eval to true for any of the downtimes for the method
    const isMethodDown = Boolean(
      _Arr.find(methodDowntimes, downtime => DISABLE_METHOD[method](downtime))
    );

    if (isMethodDown) {
      disabled.push(method);
    }
  });

  return disabled;
}

const DOWNTIME_METHOD_COPY_MAP = {
  qr: 'upi',
  gpay: 'upi',
};

/**
 * Copy downtimes between methods if needed.
 * @param {Object} downtimes
 *
 * @return {Object}
 */
function copyMethodsIfNeeded(downtimes) {
  _Obj.loop(DOWNTIME_METHOD_COPY_MAP, (target, dest) => {
    if (downtimes[target]) {
      downtimes[dest] = downtimes[target];
    }
  });

  return downtimes;
}

/**
 * Get downtimes from preferences.
 * @param {Object} preferences
 *
 * @return {Object}
 */
export function getDowntimes(preferences) {
  let downtimes = {
    disabled: [],
  };

  // if (!preferences || !preferences.downtime) {
  //   return downtimes;
  // }

  // downtimes = _Obj.clone(preferences.downtime);

  // downtimes = copyMethodsIfNeeded(downtimes);
  // downtimes.disabled = getDisabledMethods(downtimes);

  return downtimes;
}