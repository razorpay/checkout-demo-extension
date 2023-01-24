import type { Locator } from 'playwright-chromium';
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
  await page.locator('#card_name').type(inputData.cardName || 'Test user');
  await page.locator('#card_cvv').type(amex ? '7373' : '111');
  await page.waitForTimeout(500);
};

export const selectSavedCard: UtilFunction<{
  index?: number;
  last4?: string;
  fill?: {
    cvv?: string;
  };
  screen?: 'L0' | 'card';
}> = async ({ page, inputData = { index: 0, screen: 'card' } }) => {
  const { index = 0, last4, fill, screen = 'card' } = inputData;
  let selectedSavedCard: Locator;
  if (screen === 'L0') {
    if (last4) {
      selectedSavedCard = page.locator(
        'div[data-block="rzp.preferred"] button.slotted-radio',
        {
          has: page.locator(`text=- ${last4}`),
        }
      );
    } else {
      selectedSavedCard = page
        .locator('div[data-block="rzp.preferred"] button.slotted-radio')
        .nth(index);
    }
  } else {
    if (last4) {
      selectedSavedCard = page.locator('#saved-cards-container .saved-card', {
        has: page.locator(`text=- ${last4}`),
      });
    } else {
      selectedSavedCard = page
        .locator('#saved-cards-container .saved-card')
        .nth(index);
    }
  }
  await selectedSavedCard.click();
  if (fill) {
    if (fill.cvv) {
      await selectedSavedCard.locator('input[name*="cvv"]').type(fill.cvv);
    }
  }
};
