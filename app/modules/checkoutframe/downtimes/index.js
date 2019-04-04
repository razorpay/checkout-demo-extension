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
  upi: disableBasedOnSeverityOrScheduled(['high'], true),
  qr: disableBasedOnSeverityOrScheduled(['high'], true),
};

/**
 * Gets the list of methods to be disabled.
 * @param {Object} downtimes
 *
 * @return {Array}
 */
function getDisabledMethods(downtimes) {
  const disabled = [];

  _Obj.loop(downtimes, (methodDowntimes, method) => {
    if (!DISABLE_METHOD[method]) {
      return;
    }

    if (
      _Arr.find(methodDowntimes, downtime => DISABLE_METHOD[method](downtime))
    ) {
      disabled.push(method);
    }
  });

  return disabled;
}

const DOWNTIME_METHOD_COPY_MAP = {
  qr: 'upi',
  tez: 'upi',
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
  let downtimes = {};

  if (!preferences || !preferences.downtimes || !preferences.downtimes.count) {
    return downtimes;
  }

  _Arr.loop(_Obj.clone(preferences.downtimes.items), downtime => {
    const { method } = downtime;

    if (!downtimes[method]) {
      downtimes[method] = [];
    }

    downtimes[method].push(downtime);
  });

  downtimes = copyMethodsIfNeeded(downtimes);
  downtimes.disabled = getDisabledMethods(downtimes);

  return downtimes;
}
