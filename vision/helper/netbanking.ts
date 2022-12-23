import type { UtilFunction } from '../core/types';
import type English from '../../app/modules/i18n/bundles/en';

export type BankCodes = keyof typeof English.banks.long;
/**
 * Select Bank from netbanking GRID
 */
export const selectBankFromGrid: UtilFunction<BankCodes> = async ({
  page,
  inputData = 'SBIN',
}) => {
  if (inputData) {
    await page.click(`label[for="bank-radio-${inputData}"]`);
  }
};
