import type { UtilFunction } from '../core/types';

/**
 * Helper function to fill card details
 */
export const enterCardDetails: UtilFunction<{
  cardType?: 'VISA' | 'RUPAY' | 'AMEX';
  nativeOtp?: boolean;
  cardNumber?: string;
  cardName?: string;
  cardExpiry?: string;
}> = async ({ page, inputData = { cardType: 'VISA' } }) => {
  const amex = inputData.cardType === 'AMEX';
  const bepg = inputData.nativeOtp && inputData.cardType === 'RUPAY';
  let cardNumber = inputData.cardNumber || '4111111111111111';

  if (!inputData.cardNumber && bepg) {
    cardNumber = '7878780000000001';
  } else if (!inputData.cardName && amex) {
    cardNumber = '374251018720018';
  }

  await page.locator('#card_number').type(cardNumber);
  await page.locator('#card_expiry').type(inputData.cardExpiry || '12/55');
  await page.locator('#card_name').type(inputData.cardName || 'SakshiJain');
  await page.locator('#card_cvv').type(amex ? '7373' : '111');
  await page.waitForTimeout(500);
};
