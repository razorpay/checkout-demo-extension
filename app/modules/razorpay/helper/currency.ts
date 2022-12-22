import type { Preferences } from 'razorpay/types/Preferences';
import { entityWithAmount } from '../constant';
import { getOption, getPreferences } from './base';
import { hasFeature } from './preferences';

const i18nRegions = ['MY', 'IN'];
/** currency related */
export const getCurrency = (): string => {
  const entityWithAmountData =
    (entityWithAmount as any).find((entity: keyof Preferences) =>
      getPreferences(entity)
    ) || {};
  return entityWithAmountData?.currency || getOption('currency');
};

/**
 * We are updating isInternational() as we expand to regions outside India,
 * now we will treat payment as international when:
 * 1) merchant currency and payment currency mismatch
 * 2) if merchant is from outside of supported regions
 */
export function isInternational() {
  const merchantBaseCurrency = getPreferences('merchant_currency') || 'INR';
  const merchantCountryCode: string =
    getPreferences('merchant_country') || 'IN';

  return (
    getOption('currency') !== merchantBaseCurrency ||
    !i18nRegions.includes(merchantCountryCode)
  );
}

export function isIndianCurrency() {
  const merchantBaseCurrency = getPreferences('merchant_currency') || 'INR';
  // if option currency is INR
  // or if option currency is not defined then we pick merchant base currency
  return (
    getOption('currency') === 'INR' ||
    (!getOption('currency') && merchantBaseCurrency === 'INR')
  );
}

export function isDCCEnabled() {
  return hasFeature('dcc', false);
}

/** end of currency related fn */
