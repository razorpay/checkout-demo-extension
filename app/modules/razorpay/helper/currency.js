import { entityWithAmount } from '../constant';
import { getOption, getPreferences } from './base';
import { hasFeature } from './preferences';

/** currency related */
export const getCurrency = () => {
  const entityWithAmountData =
    entityWithAmount.find((entity) => getPreferences(entity)) || {};
  return entityWithAmountData?.currency || getOption('currency');
};

export function isInternational() {
  return getOption('currency') !== 'INR';
}

export function isDCCEnabled() {
  return hasFeature('dcc', false);
}

/** end of currency related fn */
