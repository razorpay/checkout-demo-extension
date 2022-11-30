import { DEBIT_EMI_BANKS, DEBIT_EMI_ISSUERS } from 'common/bank';
import { getEligibleBanksBasedOnMinAmount } from 'common/emi';
import type {
  EmiPlan,
  EmiPlans,
  EmiPlanObject,
  EmiBankPlans,
  EmiOptions,
} from 'emiV2/types';
import { getMerchantMethods } from 'razorpay';
import { getAmount } from 'ui/components/MainModal/helper';

/**
 * Returns interest rate emi is starting at
 *
 * @returns {Number}
 */
export function getEMIStartingAt(plans: EmiPlanObject | EmiPlans) {
  const startingAt = Object.values(plans).map((plan: EmiPlan) =>
    Number(plan.interest)
  );
  return Math.min(...startingAt);
}

export const isNoCostPlan = (plan: EmiPlan): boolean => {
  return plan.subvention === 'merchant';
};

/**
 * Helper function that takes in emi plan object and return whether
 * a no cost emi plan is present or not
 * @param plans
 * @returns
 */
export const fincNoCostEmiPlan = (plans: EmiPlanObject): boolean => {
  return Object.keys(plans).some((plan: string) => {
    return isNoCostPlan(plans[plan]);
  });
};

/**
 * Returns whether the bank offers no cost EMI
 * @returns {Boolean}
 */
export function isNoCostEMI(amount: number, providerCode: string) {
  const emiOptions: EmiOptions = getMerchantMethods().emi_options;
  const banks: EmiBankPlans = getEligibleBanksBasedOnMinAmount(
    amount || Number(getAmount()),
    emiOptions
  ) as EmiBankPlans;

  const EmiPlans = banks[providerCode];

  let isNcEmi = false;

  // Check for NC EMI offer in credit emi plans
  if (EmiPlans) {
    isNcEmi = fincNoCostEmiPlan(EmiPlans);
  }

  // if there is no nocost emi plan in credit emi plan
  // check in debit emi plans if debit emi exists
  const debitProviderCode = `${providerCode}_DC`;
  const debitEmiPlans = banks[debitProviderCode];

  if (!isNcEmi && debitEmiPlans) {
    isNcEmi = fincNoCostEmiPlan(debitEmiPlans);
  }
  return isNcEmi;
}

/**
 * Returns whether the saved token has no cost EMI plan
 * Since for token we send in plans Array therefore
 * needed a seperate helper function
 * @returns {Boolean}
 */
export const isNoCostAVailableForToken = (plans: EmiPlans): boolean => {
  if (!plans) {
    return false;
  }

  const isNcEmi = plans.some((plan: EmiPlan) => {
    return isNoCostPlan(plan);
  });

  return isNcEmi;
};
