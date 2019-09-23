/**
 * Checks downtime for provided severity or scheduled,
 * and decides to disable.
 *
 * @param {Array} severity List of severities for which to disable
 * @param {Boolean} scheduled Value of scheduled to disable on
 *
 * @return {function(downtime: Object): boolean} Says whether or not to disable method.
 *
 *  @return {Boolean}
 */
export function disableBasedOnSeverityOrScheduled(
  severity = [],
  scheduled = true
) {
  return function disable(downtime) {
    return (
      _Arr.contains(severity, downtime.severity) ||
      downtime.scheduled === scheduled
    );
  };
}

/**
 * Checks if the downtime has high severity or is scheduled.
 *
 * @param {Object} downtime
 * @return {boolean}
 */
const isHighSeverityOrScheduled = disableBasedOnSeverityOrScheduled(
  ['high'],
  true
);

/**
 * Checks if the downtime has low severity and is not scheduled.
 *
 * @param {Object} downtime
 * @return {boolean}
 */
const isLowSeverityAndNotScheduled = _Func.negate(isHighSeverityOrScheduled);

const DISABLE_METHOD = {
  upi: isHighSeverityOrScheduled,
  qr: isHighSeverityOrScheduled,
  gpay: isHighSeverityOrScheduled,
  netbanking: function(_, preferences) {
    const netbankingObj = preferences.methods.netbanking || {};
    const banks = _Obj.keys(netbankingObj);
    const downtimes =
      (preferences.payment_downtime && preferences.payment_downtime.items) ||
      [];

    return _Arr.every(banks, bank =>
      _Arr.any(
        downtimes,
        downtime =>
          downtime.method === 'netbanking' &&
          downtime.instrument.bank === bank &&
          isHighSeverityOrScheduled(downtime)
      )
    );
  },
};

const WARN_METHOD = {
  upi: isLowSeverityAndNotScheduled,
  qr: isLowSeverityAndNotScheduled,
  gpay: isLowSeverityAndNotScheduled,
  netbanking: function(_, preferences) {
    const netbankingObj = preferences.methods.netbanking || {};
    const banks = _Obj.keys(netbankingObj);
    const downtimes =
      (preferences.payment_downtime && preferences.payment_downtime.items) ||
      [];

    return _Arr.every(banks, bank =>
      _Arr.any(
        downtimes,
        downtime =>
          downtime.method === 'netbanking' && downtime.instrument.bank === bank
      )
    );
  },
};

/**
 * Gets the list of methods to be disabled and warned.
 * @param {Object} downtimes
 *  @key {String} method
 *  @value {Array} downtimes Downtimes of the method
 *
 * @param preferences
 *
 * @return {{disable: Array, warn: Array}}
 */
function getMethodActions(downtimes, preferences) {
  const disable = [];
  const warn = [];

  // Loop through all methods
  _Obj.loop(downtimes, (methodDowntimes, method) => {
    // Check if the method's downtime checker function eval to true for any of the downtimes for the method
    const isMethodDown = Boolean(
      DISABLE_METHOD[method] &&
        _Arr.find(methodDowntimes, downtime =>
          DISABLE_METHOD[method](downtime, preferences)
        )
    );

    const isMethodWarned = Boolean(
      WARN_METHOD[method] &&
        _Arr.find(methodDowntimes, downtime =>
          WARN_METHOD[method](downtime, preferences)
        )
    );

    if (isMethodDown) {
      disable.push(method);
    } else if (isMethodWarned) {
      warn.push(method);
    }
  });

  return { disable, warn };
}

function getBankActions(downtimes) {
  return {
    disable: getDisabledBanks(downtimes),
    warn: getWarnBanks(downtimes),
  };
}

/**
 *
 * @type {Function}
 */
const getBankNamesFromDowntimes = _.curry2((downtimes, predicate) => {
  const { netbanking: netbankingDowntimes = [] } = downtimes;
  return (
    (netbankingDowntimes
    |> _Arr.filter(predicate)
    |> _Arr.map(downtime => downtime.instrument && downtime.instrument.bank)
    |> _Arr.filter(Boolean))
  );
});

/**
 * Returns the list of banks to be disabled.
 * @param downtimes
 * @return Array<string>
 */
const getDisabledBanks = getBankNamesFromDowntimes(isHighSeverityOrScheduled);

/**
 * Returns the list of banks for which there should be a warning displayed.
 * @param downtimes
 * @return {Array<string>}
 */
const getWarnBanks = getBankNamesFromDowntimes(isLowSeverityAndNotScheduled);

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
 * Takes a list of downtimes
 * and groups them by the method.
 * @param {Array<Object>} allDowntimes
 *
 * @returns {Object<method, Array>} downtimes
 */
function groupDowntimesByMethod(allDowntimes) {
  const downtimes = {};

  _Arr.loop(allDowntimes, downtime => {
    const { method } = downtime;

    if (!_Obj.hasProp(downtimes, method)) {
      downtimes[method] = [];
    }

    downtimes[method].push(downtime);
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
    disable: {
      methods: [],
      banks: [],
    },
    warn: {
      methods: [],
      banks: [],
    },
  };

  const hasDowntimes =
    preferences &&
    preferences.payment_downtime &&
    preferences.payment_downtime.items &&
    preferences.payment_downtime.items.length;

  if (!hasDowntimes) {
    return downtimes;
  }

  downtimes =
    preferences.payment_downtime.items
    |> groupDowntimesByMethod
    |> copyMethodsIfNeeded;

  const downtimeMethodActions = getMethodActions(downtimes, preferences);
  const downtimeBankActions = getBankActions(downtimes);

  downtimes.disable = {};
  downtimes.disable.methods = downtimeMethodActions.disable;
  downtimes.disable.banks = downtimeBankActions.disable;

  downtimes.warn = {};
  downtimes.warn.methods = downtimeMethodActions.warn;
  downtimes.warn.banks = downtimeBankActions.warn;

  return downtimes;
}
