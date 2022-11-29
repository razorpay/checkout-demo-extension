import { get } from 'svelte/store';
import { getCurrencies as getCurrenciesData, getCurrency } from 'razorpay';
import { amountAfterOffer } from 'offers/store/store';
import type { CurrenciesPayload } from 'card/types';

/**
 * Fetch all DCC currencies with /flows api
 *
 * @param {{[key in string]?: any}} param0
 * @returns
 */
export const getCurrencies = ({
  iin,
  tokenId,
  cardNumber,
  walletCode,
  amount,
  provider,
}: CurrenciesPayload) =>
  getCurrenciesData({
    iin,
    tokenId,
    cardNumber,
    walletCode,
    amount: amount || get(amountAfterOffer),
    currency: getCurrency(), // Entity currency
    provider,
  });