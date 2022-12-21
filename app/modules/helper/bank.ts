import type { Banks } from 'razorpay/types/Preferences';
import { formatMessageWithLocale, getLongBankName } from 'i18n';
import { locale } from 'svelte-i18n';
import { get } from 'svelte/store';
import { checkOffline } from 'fpx/helper';
import { FPX_OFFLINE_BANK } from 'fpx/i18n/label';
import type { TranslatedBankType } from 'common/types/bank';
import { normalizeBankCode } from 'common/bank';
import { getDowntimesSeverity } from 'checkoutframe/downtimes/methodDowntimes';
import { METHODS } from 'checkoutframe/constants';

/**
 * return translated Array of banks for Search dropdown menu
 * @param {Partial<Banks>} banks list of banks
 * @param {string} paymentMethod has values like fpx, emandate
 * @returns {array}
 */
export function computeTranslatedBanks(
  banks: Partial<Banks>,
  paymentMethod: string
) {
  return Object.entries(banks).map((entry) => {
    const code = entry[0];
    const name = entry[1] || '';
    const translatedBank: TranslatedBankType = {
      code: code,
      original: name,
      name: getLongBankName(code, get(locale) as string, name),
      _key: code,
    };
    if (paymentMethod === METHODS.FPX) {
      translatedBank.disabledText = checkOffline(code)
        ? formatMessageWithLocale(FPX_OFFLINE_BANK, get(locale) as string)
        : '';
      translatedBank.logoCode = normalizeBankCode(code);
    }

    if (paymentMethod === METHODS.EMANDATE) {
      translatedBank.downtimeSeverity = getDowntimesSeverity(
        METHODS.EMANDATE,
        'bank',
        code
      );
    }

    return translatedBank;
  });
}
