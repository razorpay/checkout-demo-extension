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
    const eligiblePlans = _Arr.filter(plans, plan => plan.min_amount <= amount);

    if (eligiblePlans.length) {
      eligible[bank] = eligiblePlans;
    }
  });

  return eligible;
}

/**
 * Returns the lowest minimum amount from the list of plans
 * @param {Array} plans List of plans
 *
 * @returns {number}
 */
export function getMinimumAmountFromPlans(plans = []) {
  let minimum = Infinity;

  _Arr.loop(plans, plan => {
    if (plan.min_amount < minimum) {
      minimum = plan.min_amount;
    }
  });

  return minimum;
}
