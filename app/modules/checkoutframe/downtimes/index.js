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

/**
 * Returns the downtime description for the given method.
 * @param {String} method
 * @param {Object} param1
 *  @prop {Array} availableMethods
 */
export function getMethodDowntimeDescription(method, { availableMethods }) {
  let prefix = method[0].toUpperCase() + method.slice(1);

  switch (method) {
    case 'card':
    case 'credit_card':
    case 'debit_card':
      prefix = 'Cards';
      break;

    case 'netbanking':
    case 'emandate':
      prefix = 'Netbanking';
      break;

    case 'emi':
    case 'cardless_emi':
      prefix = 'EMI';
      break;

    case 'qr':
      prefix = 'QR';
      break;

    case 'upi':
      prefix = 'UPI';
      break;

    case 'wallet':
      prefix = 'Wallets';
      break;

    case 'tez':
      prefix = 'Google Pay';
      break;
  }

  const sentences = [];
  const pluralPrefix = prefix[prefix.length - 1].toLowerCase() === 's';

  sentences.push(
    `${prefix} ${
      pluralPrefix ? 'are' : 'is'
    } facing temporary issues right now.`
  );

  // If there's another method available, ask user to select it.
  if (
    availableMethods &&
    availableMethods.length &&
    availableMethods.length > 1
  ) {
    sentences.push('Please select another method.');
  }

  return sentences.join(' ');
}
