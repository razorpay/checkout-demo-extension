/**
 * Checks downtime for provided severity or scheduled,
 * and decides to disable.
 *
 * @param {Array} severity List of severities for which to disable
 * @param {Boolean} scheduled Value of scheduled to disable on
 *
 * @return {function(downtime: Object): boolean} Says whether or not to disable method.
 */
function disableBasedOnSeverityOrScheduled(severity = [], scheduled = true) {
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
const isHighScheduled = disableBasedOnSeverityOrScheduled(['high'], true);

/**
 * Checks if the downtime has high severity or is scheduled.
 *
 * @param {Object} downtime
 * @return {boolean}
 */
const isMediumScheduled = disableBasedOnSeverityOrScheduled(['medium'], true);

/**
 * Checks if the downtime has an instrument. For downtimes without an
 * instrument, API returns an empty array. For ones with an instrument, API
 * returns an object.
 *
 * @param {Object} downtime
 * @returns {boolean}
 */
function withoutInstrument(downtime) {
  return !downtime.instrument || _.isArray(downtime.instrument);
}

// TODO: move to _Func.and
/**
 * Returns a function that ANDs the values returned from f and g
 * @param {function(*): boolean} f
 * @param {function(*): boolean} g
 * @returns {function(*): boolean}
 */
function fAnd(f, g) {
  return function anded(arg) {
    return f(arg) && g(arg);
  };
}

/**
 * Checks if the downtime has low severity and is not scheduled.
 *
 * @param {Object} downtime
 * @return {boolean}
 */
const isLowScheduled = _Func.negate(isHighScheduled);

/**
 * Checks if the downtime has high severity or is scheduled and does not have
 * an instrument.
 *
 * @param {Object} downtime
 * @return {boolean}
 */
const isHighScheduledWithoutInstrument = fAnd(
  isHighScheduled,
  withoutInstrument
);

/**
 * Checks if the downtime has low severity and is not scheduled and does not
 * have an instrument.
 *
 * @param {Object} downtime
 * @return {boolean}
 */
const always = downtime => {
  return downtime.instrument?.vpa_handle === 'ALL';
};

const DISABLE_METHOD = {};

const WARN_METHOD = {
  upi: always,
  upi_otm: always,
  qr: always,
  gpay: always,
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
 * Gets the list of methods that have high and low severity downtimes. Scheduled
 * downtimes are considered as high severity.
 *
 * @param {Object} downtimes
 *  @key {String} method
 *  @value {Array} downtimes Downtimes of the method
 *
 * @param preferences
 *
 * @return {{high: Array, low: Array}}
 */
function getMethodDowntimes(downtimes, preferences) {
  const high = [];
  const low = [];
  const medium = [];

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
      high.push(method);
    } else if (isMethodWarned) {
      low.push(method);
    }
  });

  return { high, low, medium };
}

/**
 * Returns the list of banks with high and low severity downtimes. Scheduled
 * downtimes are considered as high severity.
 *
 * @param downtimes
 * @return {{warn: Array<string>, disable: Array<string>}}
 */
function getBankDowntimes(downtimes) {
  return {
    high: getBanksWithHighSeverityDowntime(downtimes) |> _Arr.removeDuplicates,
    medium:
      getBanksWithMediumSeverityDowntime(downtimes) |> _Arr.removeDuplicates,
    low: getBanksWithLowSeverityDowntimes(downtimes) |> _Arr.removeDuplicates,
  };
}

function getDowntimesByMethod(downtimes, method) {
  const filteredDowntimes = downtimes && downtimes[method];
  let high = [];
  let medium = [];
  let low = [];
  if (filteredDowntimes?.length) {
    filteredDowntimes.forEach(downtime => {
      switch (downtime.severity) {
        case 'high':
          high.push(downtime);
          break;
        case 'medium':
          medium.push(downtime);
          break;
        case 'low':
          low.push(downtime);
          break;
      }
    });
  }
  return { high, medium, low };
}
/**
 * Returns bank names from downtimes after filtering them using predicate
 *
 * @param {Array<Object>} downtimes
 * @param {function(downtime: Object, preferences?: Object): boolean} predicate
 *
 * @return {Array<string>}
 */
const getFilteredBankNamesFromDowntimes = _.curry2((downtimes, predicate) => {
  const { netbanking: netbankingDowntimes = [] } = downtimes;
  return (
    netbankingDowntimes
    |> _Arr.filter(predicate)
    |> _Arr.map(downtime => downtime.instrument && downtime.instrument.bank)
    |> _Arr.filter(Boolean)
  );
});

/**
 * Returns the list of banks to be disabled.
 * @param downtimes
 * @return Array<string>
 */
const getBanksWithHighSeverityDowntime = getFilteredBankNamesFromDowntimes(
  isHighScheduled
);

/**
 * Returns the list of banks with medium downtime
 * @param downtimes
 * @return Array<string>
 */
const getBanksWithMediumSeverityDowntime = getFilteredBankNamesFromDowntimes(
  isMediumScheduled
);

/**
 * Returns the list of banks for which there should be a warning displayed.
 * @param downtimes
 * @return {Array<string>}
 */
const getBanksWithLowSeverityDowntimes = getFilteredBankNamesFromDowntimes(
  isLowScheduled
);

/**
 * Returns the list of UPI with high downtime.
 * @param downtimes
 * @return Array<string>
 */
const getUPIWithHighSeverityDowntime = function() {};

/**
 * Returns the list of UPI with medium downtime
 * @param downtimes
 * @return Array<string>
 */
const getUPIWithMediumSeverityDowntime = function() {};

/**
 * Returns the list of banks for which there should be a warning displayed.
 * @param downtimes
 * @return {Array<string>}
 */
const getUPIWithLowSeverityDowntimes = function() {};

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
  const hasDowntimes =
    preferences &&
    preferences.payment_downtime &&
    preferences.payment_downtime.items &&
    preferences.payment_downtime.items.length;

  let downtimeItems;

  if (hasDowntimes) {
    downtimeItems = preferences.payment_downtime.items;
  } else {
    downtimeItems = [];
  }

  const groupedDowntimes =
    downtimeItems |> groupDowntimesByMethod |> copyMethodsIfNeeded;

  const methodDowntimes = getMethodDowntimes(groupedDowntimes, preferences);
  const bankDowntimes = getBankDowntimes(groupedDowntimes);
  return {
    cards: { ...getDowntimesByMethod(groupedDowntimes, 'card') },
    upi: { ...getDowntimesByMethod(groupedDowntimes, 'upi'), ...getDowntimesByMethod(groupedDowntimes, 'upi_otm') },
    netbanking: { ...getDowntimesByMethod(groupedDowntimes, 'netbanking') },
    high: {
      methods: methodDowntimes.high,
      banks: bankDowntimes.high,
    },
    medium: {
      methods: methodDowntimes.medium,
      banks: bankDowntimes.medium,
    },
    low: {
      methods: methodDowntimes.low,
      banks: bankDowntimes.low,
    },
  };
}

const filterDowntimeArr = (downtimeArr, instrumentKey, value) => {
  return downtimeArr.filter(item => {
    if (
      item.instrument &&
      item.instrument[instrumentKey]?.toLowerCase() === value.toLowerCase()
    ) {
      return item;
    }
    if(instrumentKey === 'vpa_handle' || instrumentKey === 'psp_handle') {
      item[instrumentKey] === 'all'
      return item
    }
  });
};

export const checkDowntime = (downtime, instrumentKey, value) => {
  if (filterDowntimeArr(downtime.high, instrumentKey, value)?.length > 0) {
    return 'high';
  } else if (
    filterDowntimeArr(downtime.medium, instrumentKey, value)?.length > 0
  ) {
    return 'medium';
  }
  if (filterDowntimeArr(downtime.low, instrumentKey, value)?.length > 0) {
    return 'low';
  }
  return false;
};
