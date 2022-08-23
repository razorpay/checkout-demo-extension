import { get } from 'svelte/store';
import { getCurrencies as getCurrenciesData, getCurrency } from 'razorpay';
import { amountAfterOffer } from 'offers/store/store';

export const getCurrencies = ({
  iin,
  tokenId,
  cardNumber,
  walletCode,
  amount,
  provider,
}) => {
  return getCurrenciesData({
    iin,
    tokenId,
    cardNumber,
    walletCode,
    amount: amount || get(amountAfterOffer),
    currency: getCurrency(), // Entity currency
    provider,
  });
};
