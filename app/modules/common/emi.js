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
