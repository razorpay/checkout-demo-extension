// utils
import { getCurrency } from 'razorpay';
import { getCurrencies } from 'card/helper/dcc';
import {
  isDCCAllowedOnIdentifier,
  DCCError,
  sortDCCCurrencies,
} from './helpers';

/**
 * Function to call /flows api which returns all the DCC currencies supported for particular payment method identifier
 *
 * @param param0 DCCProps { entity, identifier, currency }
 */
export const fetchCurrencies = async ({
  entity,
  identifier,
  currency,
  amount,
}: Pick<DCC.Props, 'entity' | 'identifier' | 'currency' | 'amount'>): Promise<{
  error?: string;
  data?: DCC.CurrencyMetaDataType;
}> => {
  try {
    if (!currency) {
      currency = getCurrency();
    }

    if (!isDCCAllowedOnIdentifier(identifier)) {
      throw new DCCError(
        `DCC is not supported on identifier: ${identifier}. To add DCC on ${
          entity ?? 'entity'
        }:${identifier}, update isDCCAllowedOnIdentifier list.`
      );
    }

    const response = await (<Promise<DCC.GetCurrenciesResponseType>>(
      getCurrencies({
        [identifier]: entity,
        amount,
      })
    ));

    if (typeof response !== 'object') {
      throw new DCCError('Invalid /flows response');
    }

    if (response.error) {
      throw new DCCError(response.error);
    }

    let defaultCurrency =
      response.card_currency ||
      response.wallet_currency ||
      response.app_currency;

    let currencies: DCC.CurrencyListType = [];

    let defaultCurrencyAmount = amount;

    if (response.all_currencies) {
      const sortedCurrenciesData = sortDCCCurrencies({
        allCurrencies: response.all_currencies,
        currency,
        defaultCurrency,
      });
      defaultCurrency = sortedCurrenciesData.defaultCurrency;
      defaultCurrencyAmount = sortedCurrenciesData.amount || amount;
      currencies = sortedCurrenciesData.currencies;
    }

    return {
      data: {
        ...response,
        amount: defaultCurrencyAmount,
        currencies,
        selectedCurrency: defaultCurrency,
        originalCurrency: currency,
      },
    };
  } catch (err) {
    return {
      error: (err as DCCError).message,
    };
  }
};
