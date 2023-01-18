import type { UtilFunction } from '../core/types';
import type { list } from '../../app/modules/wallet/constants';

/**
 * Select Wallet from wallet list
 * It will work only in L1 wallet screen
 */
export const selectWallet: UtilFunction<keyof typeof list> = async ({
  page,
  inputData = 'phonepe',
}) => {
  if (inputData) {
    await page.locator(`#form-wallet #wallet-radio-${inputData}`).click();
  }
};
