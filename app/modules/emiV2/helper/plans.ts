/*
  Return the plans based on bank and tab selected
  @returns {Array<EmiPlans>}
*/

import { getSelectedEmiBank } from 'emiV2/store';
import { selectedTab } from 'components/Tabs/tabStore';
import { get } from 'svelte/store';
import { getEligiblePlansBasedOnMinAmount } from 'checkoutstore/methods';
import { isCardlessTab } from 'emiV2/helper/tabs';
import { isOtherCardEmiProvider } from 'emiV2/helper/helper';
import { cardlessEmiPlansChecker } from 'emiV2/helper/eligibility';

import type {
  CardlessEMIStore,
  EMIBANKS,
  EmiPlan,
  EmiPlans,
} from 'emiV2/types';
import { isDebitIssuer } from 'common/bank';
import {
  AXIS_CONVENINENCE_FEE,
  CITI_BANK_EMI,
  CONVENIENCE_FEE_MSG,
  EMI_MIN_BALANCE,
  FULL_AMOUNT_EMI_MESSAGE,
  ICICI_BANK_EMI,
} from 'ui/labels/emi';
import { banksWithConvenienveFee, EmiBanksCode } from 'emiV2/constants';
import { formatTemplateWithLocale } from 'i18n';
import { getMerchantMethods } from 'razorpay';
import { capture, SEVERITY_LEVELS } from 'error-service';

/**
 * Helper function to get the processing fee to be shown in emi plans description
 * As of now most banks have ₹99
 * Except RBL and Kotak DC bank they have ₹199 processing fee
 * @param {string} bank name of the bank to get processing fee for
 */
export const getProcessingFeeForEmi = (bank: string): string => {
  const { RBL_BANK_CODE, KOTAK_DEBIT_CODE } = EmiBanksCode;
  if ([RBL_BANK_CODE, KOTAK_DEBIT_CODE].includes(bank)) {
    return '199';
  }
  return '99';
};

/**
 * Returns the EMI plans for the given bank.
 *
 * @param {string} code the code for the bank
 * @param {string} cardType the type of the card (credit or debit)
 * @param {boolean} noCostEmi whether to include no cost EMI plans
 * @return {Array<Object>|undefined}
 */
export function getEMIBankPlans(code: string, tab = 'credit') {
  const options = getMerchantMethods().emi_options;

  if (!options) {
    return [];
  }

  if (tab === 'debit' && !code.endsWith('_DC')) {
    // For Banks with EMI on Debit Cards,
    // code will end with "_DC".
    // Example: If the issuer is HDFC and card type is debit
    // Then use "HDFC_DC" plans and not "HDFC" plans.
    // If code is "HDFC_DC" then don't append "_DC" at the end.
    const debitCode = code + '_DC';
    if (isDebitIssuer(debitCode)) {
      code = debitCode;
    } else {
      return;
    }
  }

  const plans: EmiPlans = options[code];

  if (!plans) {
    return [];
  }

  return plans.sort((a: EmiPlan, b: EmiPlan) => a.duration - b.duration);
}

export const getEmiPlans = () => {
  const tab = get(selectedTab);
  const bankCode: string = getSelectedBankCode();
  // if current tab is cardless tab get the plans from svelte store
  if (isCardlessTab() && !isOtherCardEmiProvider()) {
    const emiPlansForContact: CardlessEMIStore | null =
      cardlessEmiPlansChecker();
    if (
      emiPlansForContact &&
      emiPlansForContact.providerCode &&
      emiPlansForContact.plans
    ) {
      const provider = emiPlansForContact.providerCode;
      const emiPlans = emiPlansForContact.plans[provider];
      return emiPlans;
    }
  }

  if (!isCardlessTab() || isOtherCardEmiProvider()) {
    // if tab is credit or debit get the credit card plans from merchant methods
    // or if selected provider has emi plans present in emi_options (Eg: bajaj/onecard)
    const plans = getEMIBankPlans(bankCode, tab);
    try {
      const emiPlans: EmiPlans = getEligiblePlansBasedOnMinAmount(plans);
      return emiPlans;
    } catch (e: any) {
      capture(e.message, { severity: SEVERITY_LEVELS.S2, unhandled: true });
      return [];
    }
  }

  return [];
};

export const getSelectedBankCode = () => {
  const tab = get(selectedTab);

  const selectedEmiBank = getSelectedEmiBank() as EMIBANKS;

  // if tab is credit get the credit card plans
  let bankCode: string = selectedEmiBank.code;

  if (selectedEmiBank.code === 'bajaj') {
    bankCode = 'BAJAJ';
  } else if (tab === 'debit') {
    bankCode = `${selectedEmiBank.code}_DC`;
  }

  return bankCode;
};

/**
 * Helper function to decide the description to be shown on expanding the emi plan card
 * In EMI UX revamp we will rendering li elements for plan description
 * Therefore we can iterate over the array returned in the UI and render text
 * * @returns {Array<String>}
 */

export const handlePlanDescription = (
  bank: string,
  amount: string,
  amountPerMonth: string,
  locale: string
) => {
  const descriptionText: string[] = [];
  // Adding the plan description split as provided by product team
  if (isDebitIssuer(bank)) {
    const debitCardDescriptionText = formatTemplateWithLocale(
      EMI_MIN_BALANCE,
      {
        amount: amountPerMonth,
      },
      locale
    );
    descriptionText.push(debitCardDescriptionText);
  } else if (bank === EmiBanksCode.CITI_BANK_CODE) {
    descriptionText.push(
      formatTemplateWithLocale(
        CITI_BANK_EMI,
        {
          amount,
        },
        locale
      )
    );
  } else if (bank === EmiBanksCode.ICICI_BANK_CODE) {
    descriptionText.push(
      formatTemplateWithLocale(ICICI_BANK_EMI, { amount }, locale)
    );
  } else {
    descriptionText.push(
      formatTemplateWithLocale(FULL_AMOUNT_EMI_MESSAGE, { amount }, locale)
    );
  }
  // Adding the convenience fee message
  // For Axis bank the message is different
  if (bank === EmiBanksCode.AXIS_BANK_CODE) {
    descriptionText.push(
      formatTemplateWithLocale(AXIS_CONVENINENCE_FEE, {}, locale)
    );
  } else if (banksWithConvenienveFee.includes(bank)) {
    descriptionText.push(
      formatTemplateWithLocale(
        CONVENIENCE_FEE_MSG,
        {
          fee: getProcessingFeeForEmi(bank),
        },
        locale
      )
    );
  }

  return descriptionText;
};

export const isCardlessPlanNoCost = (plan: EmiPlan): boolean => {
  return plan.interest === 'No-Cost EMI';
};
