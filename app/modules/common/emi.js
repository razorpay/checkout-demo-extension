import { hasFeature } from 'razorpay';
import { emiBanks } from 'common/bank';
import * as ObjectUtils from 'utils/object';

// convert emiBanks array to map keyed by bank-code
export const bankMap = (emiBanks || []).reduce((banks, bankObj) => {
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

  ObjectUtils.loop(banks, (plans, bank) => {
    if (getEMIBank(bank)) {
      const eligiblePlans = plans.filter((plan) => plan.min_amount <= amount);

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

  ObjectUtils.loop(plans, (plan) => {
    if (plan.min_amount < minimum) {
      minimum = plan.min_amount;
    }
  });

  return minimum;
}

export function shouldRedirectZestMoney() {
  return hasFeature('redirect_to_zestmoney', false);
}
