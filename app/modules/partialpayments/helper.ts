import {
  PARTIAL_AMOUNT_HELP_INVALID,
  PARTIAL_AMOUNT_HELP_LOWER,
  PARTIAL_AMOUNT_HELP_HIGHER,
} from 'ui/labels/home';

import { formatAmountWithCurrency } from 'helper/currency';

export const getErrorTextData = (
  value: number,
  maxAmount: number,
  minAmount: number
) => {
  let errorTextLabel: string;
  let errorTextAmount: string;
  let showValidations = false;
  if (!value) {
    errorTextLabel = PARTIAL_AMOUNT_HELP_INVALID;
    errorTextAmount = formatAmountWithCurrency(maxAmount);
    if (showValidations) {
      showValidations = true;
    }
  } else if (value < minAmount) {
    errorTextLabel = PARTIAL_AMOUNT_HELP_LOWER;
    errorTextAmount = formatAmountWithCurrency(minAmount);
    showValidations = true;
  } else if (value > maxAmount) {
    errorTextLabel = PARTIAL_AMOUNT_HELP_HIGHER;
    errorTextAmount = formatAmountWithCurrency(maxAmount);
    showValidations = true;
  } else {
    showValidations = false;
    errorTextAmount = '';
    errorTextLabel = '';
  }
  return { errorTextLabel, errorTextAmount, showValidations };
};
