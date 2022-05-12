import { getOption, getPreferences } from 'razorpay';

export function getAuthType() {
  return getPreferences('order.auth_type') || getOption('prefill.auth_type');
}

const bankDetailsKeys = [
  'ifsc',
  'name',
  'account_number',
  'account_type',
] as const;
export function getPrefillBankDetails(key: string) {
  const returnOptions: { [key: string]: string } = {};
  bankDetailsKeys.forEach((dataPoints) => {
    returnOptions[`prefill.bank_account[${dataPoints}]`] =
      getPreferences(`order.bank_account.${dataPoints}`) ||
      getOption(`prefill.bank_account[${dataPoints}]`);
  });
  if (!key) {
    return returnOptions;
  }
  return returnOptions[`prefill.bank_account[${key}]`];
}

export function getPrefillBank() {
  return getPreferences('order.bank') || getOption('prefill.bank');
}
