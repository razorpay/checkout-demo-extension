import { emiBanks } from 'common/bank';

// convert emiBanks array to map keyed by bank-code
const bankMap = (emiBanks || []).reduce((banks, bankObj) => {
  banks[bankObj.code] = bankObj;
  return banks;
}, {});

export function getEMIBank(code) {
  return bankMap[code];
}

/**
 * Returns the list of eligible banks for the transaction
 * @param {number} amount Amount of the transaction
 * @param {Object} banks Map of banks to available plans
 *
 * @returns {Object}
 */
export function getEligibleBanksBasedOnMinAmount(amount, banks) {
  const eligible = {};

  _Obj.loop(banks, (plans, bank) => {
    if (getEMIBank(bank)) {
      const eligiblePlans = _Arr.filter(
        plans,
        (plan) => plan.min_amount <= amount
      );

      if (eligiblePlans.length) {
        eligible[bank] = eligiblePlans.reduce((o, plan) => {
          o[plan.duration] = plan;
          return o;
        }, {});
      }
    }
  });

  return eligible;
}

/**
 * Returns the lowest minimum amount from the list of plans
 * @param {Object} plans Map of plan durations against plans
 *
 * @returns {number}
 */
export function getMinimumAmountFromPlans(plans = {}) {
  let minimum = Infinity;

  _Obj.loop(plans, (plan) => {
    if (plan.min_amount < minimum) {
      minimum = plan.min_amount;
    }
  });

  return minimum;
}
