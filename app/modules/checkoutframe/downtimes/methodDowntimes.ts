/**
 * DUE TO CHANGE IN THE PRODUCT REQUIREMENT, DISABLING METHODS BASED
 * ON THE DOWNTIME IS SEEMS TO BE DEPRECATED. LOGIC RELATED TO ABOVE EXPLAINED
 * CRITERIA IS REMOVED IN https://github.com/razorpay/checkout/pull/2445 THIS PR
 * AND SOME OF THAT LOGIC OF DERIVING METHOD DOWNTIME IS RESTORED FOR QRV2 UPI
 */

import { getPreferences } from 'razorpay';
import {
  checkDowntime,
  copyMethodsIfNeeded,
  getDowntimes,
  groupDowntimesByMethod,
} from '.';

/**
 * Checks downtime for provided severity or scheduled,
 * and decides to disable.
 *
 * @param {Array<Downtime.Severe>} severity List of severities for which to disable
 * @param {Boolean} scheduled Value of scheduled to disable on
 *
 * @return {function(downtime: Object): boolean} Says whether or not to disable method.
 */
function disableBasedOnSeverityOrScheduled(
  severity: Array<Downtime.Severe> = [],
  scheduled = true
): (arg0: Downtime.RawDowntime) => boolean {
  return function disable(downtime) {
    return (
      severity.includes(downtime.severity) || downtime.scheduled === scheduled
    );
  };
}

/**
 * Checks if the downtime has high severity or is scheduled.
 *
 * @param {Downtime.RawDowntime} downtime
 * @return {boolean}
 */
const isHighScheduled = disableBasedOnSeverityOrScheduled(['high'], true);

/**
 * Checks if the downtime has an instrument. For downtimes without an
 * instrument, API returns an empty array. For ones with an instrument, API
 * returns an object.
 *
 * @param {Downtime.RawDowntime} downtime
 * @returns {boolean}
 */
function withoutInstrument(downtime: Downtime.RawDowntime): boolean {
  return (
    Array.isArray(downtime.instrument) ||
    !Object.keys(downtime.instrument || {}).length
  );
}
// Intentional Comment
// /**
//  * Checks if the downtime has low severity and is not scheduled.
//  *
//  * @param {Downtime.RawDowntime} downtime
//  * @return {boolean}
//  */
// const isLowScheduled = !disableBasedOnSeverityOrScheduled(['low'], true);

/**
 * Checks if the downtime has high severity or is scheduled and does not have
 * an instrument.
 *
 * @param {Downtime.RawDowntime} downtime
 * @return {boolean}
 */
const isHighScheduledWithoutInstrument = (
  downtime: Downtime.RawDowntime
): boolean => isHighScheduled(downtime) && withoutInstrument(downtime);

/**
 * @param {Downtime.RawDowntime} downtime
 * @return {boolean}
 */
const allUpiVpaHandles = (downtime: Downtime.RawDowntime): boolean => {
  return downtime.instrument?.vpa_handle === 'ALL';
};

function netBankingDowntimeTester(
  downtime: Downtime.RawDowntime,
  preferences?: {
    methods: {
      netbanking: Common.Object<string>;
    };
  },
  methodDowntimes?: Downtime.RawDowntime[],
  severity?: Downtime.Severe
) {
  const nbBanks: Array<string> = Object.keys(
    (preferences && preferences.methods && preferences.methods.netbanking) || {}
  );

  return nbBanks.every(
    (bank) =>
      methodDowntimes &&
      methodDowntimes.some((methodDowntime) => {
        let bankDown =
          methodDowntime &&
          methodDowntime.instrument &&
          methodDowntime.instrument.bank &&
          methodDowntime.instrument.bank === bank;
        if (severity) {
          bankDown = methodDowntime.severity === severity;
        }
        return bankDown;
      })
  );
}

const DISABLE_METHOD: Common.Object<Downtime.DowntimeCheckerType> = {
  upi: isHighScheduledWithoutInstrument,
  qr: isHighScheduledWithoutInstrument,
  netbanking: netBankingDowntimeTester,
};

const WARN_METHOD: Common.Object<Downtime.DowntimeCheckerType> = {
  upi: allUpiVpaHandles,
  qr: allUpiVpaHandles,
  gpay: allUpiVpaHandles,
  netbanking: netBankingDowntimeTester,
};

/**
 * Gets the list of methods that have high and low severity downtimes. Scheduled
 * downtimes are considered as high severity.
 *
 * @param {Downtime.RawDowntime} downtimes
 *  @key {String} method
 *  @value {Array} downtimes Downtimes of the method
 *
 * @param preferences
 *
 * @return {{high: Array, low: Array}}
 */
export function getMethodDowntimes() {
  //#region Newly added code to remove dependency
  const preferences = getPreferences();
  const downtimeItems: Downtime.RawDowntime[] =
    ((preferences &&
      preferences.payment_downtime &&
      preferences.payment_downtime
        .items) as unknown as Downtime.RawDowntime[]) || [];

  const groupedDowntimes: Common.Object<Downtime.RawDowntime[]> =
    copyMethodsIfNeeded(groupDowntimesByMethod(downtimeItems));

  //#endregion

  // Loop through all methods
  return Object.keys(groupedDowntimes).reduce(
    (resp: { high: string[]; low: string[] }, method: string) => {
      const methodDowntimes = groupedDowntimes[method];

      // Check if the method's downtime checker function eval to true for any of the downtimes for the method
      const isMethodDown = Boolean(
        DISABLE_METHOD[method] &&
          methodDowntimes.find((downtime) =>
            DISABLE_METHOD[method](
              downtime,
              preferences,
              methodDowntimes,
              'high'
            )
          )
      );

      const isMethodWarned = Boolean(
        WARN_METHOD[method] &&
          methodDowntimes.find((downtime) =>
            WARN_METHOD[method](downtime, preferences, methodDowntimes, 'low')
          )
      );

      if (isMethodDown) {
        resp.high.push(method);
      } else if (isMethodWarned) {
        resp.low.push(method);
      }
      return resp;
    },
    { high: [], low: [] }
  );
}

/**
 * Get downtimes severity for a method
 * @param {Method} method
 * @param {String} selectedInstrument
 * @param {String} selectedInstrumentValue
 *
 * @return {Downtime.Severe} severity - low, medium, high or ''
 */
export const getDowntimesSeverity = (
  method = '',
  selectedInstrument = 'bank',
  selectedInstrumentValue = ''
) => {
  const downtimes: { [unit: string]: object } = getDowntimes();
  const currentMethodDowntimes = downtimes[method];
  const currentDowntimeSeverity = checkDowntime(
    currentMethodDowntimes,
    selectedInstrument,
    selectedInstrumentValue
  );

  return currentDowntimeSeverity ? currentDowntimeSeverity : '';
};
