import type { Preferences } from 'razorpay/types/Preferences';
import { entityWithAmount } from '../constant';
import { getOption, getPreferences } from './base';
import { hasFeature } from './preferences';

/** currency related */
export const getCurrency = (): string => {
  const entityWithAmountData =
    (entityWithAmount as any).find((entity: keyof Preferences) =>
      getPreferences(entity)
    ) || {};
  return entityWithAmountData?.currency || getOption('currency');
};

export function isInternational() {
  return getOption('currency') !== 'INR';
}

export function isDCCEnabled() {
  return hasFeature('dcc', false);
}

/** end of currency related fn */
