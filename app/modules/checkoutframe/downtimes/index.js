import { getPreferences } from 'razorpay';
/**
 * Copy downtimes between methods if needed.
 * @param {Array<Object>} downtimes
 * @param {Method} method
 *
 * @return {Object}
 */
function getDowntimesByMethod(downtimes, method) {
  const downtimeBySeverity = { high: [], medium: [], low: [] };
  downtimes[method]?.forEach((downtime) =>
    downtimeBySeverity[downtime.severity].push(downtime)
  );
  return downtimeBySeverity;
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
 * Takes a list of downtimes
 * and groups them by the method.
 * @param {Array<Object>} allDowntimes
 *
 * @returns {Object<method, Array>} downtimes
 */
function groupDowntimesByMethod(allDowntimes) {
  const downtimes = {};

  allDowntimes.forEach((downtime) => {
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
 *
 * @return {{ upi, netbanking, cards}}
 */
export function getDowntimes() {
  const hasDowntimes = getPreferences('payment_downtime.items.length');

  let downtimeItems;

  if (hasDowntimes) {
    downtimeItems = getPreferences('payment_downtime.items');
  } else {
    downtimeItems = [];
  }

  const groupedDowntimes =
    downtimeItems |> groupDowntimesByMethod |> copyMethodsIfNeeded;

  return {
    cards: { ...getDowntimesByMethod(groupedDowntimes, 'card') },
    upi: { ...getDowntimesByMethod(groupedDowntimes, 'upi') },
    netbanking: { ...getDowntimesByMethod(groupedDowntimes, 'netbanking') },
  };
}

const filterDowntimeArr = (downtimeArr, instrumentKey, value) => {
  return downtimeArr.filter((item) => {
    if (
      item.instrument &&
      item.instrument[instrumentKey]?.toLowerCase() === value.toLowerCase()
    ) {
      return item;
    }
    if (
      (instrumentKey === 'vpa_handle' || instrumentKey === 'psp') &&
      item.instrument['vpa_handle'] === 'all'
    ) {
      return item;
    }
  });
};

export const checkDowntime = (downtime, instrumentKey, value) => {
  if (!value) {
    return false;
  }
  for (const key in downtime) {
    if (filterDowntimeArr(downtime[key], instrumentKey, value)?.length > 0) {
      return key;
    }
  }
  return false;
};
