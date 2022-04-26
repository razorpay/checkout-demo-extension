import { getOption } from 'razorpay';
import {
  currencies,
  formatAmount as currencyFormat,
  getCurrencyConfig,
} from 'common/currency';

export function formatAmount(amount: number) {
  const displayCurrency = getOption('display_currency');
  const currency = getOption('currency');
  return currencyFormat(amount, displayCurrency || currency);
}

export function formatAmountWithCurrency(amount: number): string {
  const amountFigure = formatAmount(amount);
  const displayCurrency = getOption('display_currency');
  const displayAmount = getOption('display_amount');
  const currency = getOption('currency');

  let returnAmount = '';
  if (displayCurrency && displayAmount) {
    returnAmount = (currencies as any)[displayCurrency] + ' ' + displayAmount;
  } else {
    returnAmount = (currencies as any)[currency] + ' ' + amountFigure;
  }

  return returnAmount;
}

export function formatAmountWithCurrencyInMinor(amount: number) {
  const currency = getOption('currency');
  const config: any = getCurrencyConfig(currency);
  const multiplier = Math.pow(10, config.decimals);

  const value = parseInt((amount * multiplier).toFixed(config.decimals));

  return formatAmountWithCurrency(value);
}
