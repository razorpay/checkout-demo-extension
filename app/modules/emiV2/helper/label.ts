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

const isNoCostPlan = (plan: EmiPlan): boolean => {
  return plan.subvention === 'merchant';
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

  if (!EmiPlans) {
    return false;
  }
  const isNcEmi = Object.keys(EmiPlans).some((plan: string) => {
    const planObject: EmiPlan = EmiPlans[plan];
    return isNoCostPlan(planObject);
  });
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
