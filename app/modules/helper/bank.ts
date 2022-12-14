import type { Banks } from 'razorpay/types/Preferences';
import { formatMessageWithLocale, getLongBankName } from 'i18n';
import { locale } from 'svelte-i18n';
import { get } from 'svelte/store';
import { checkOffline } from 'fpx/helper';
import { FPX_OFFLINE_BANK } from 'fpx/i18n/label';
import type { TranslatedBankType } from 'common/types/bank';
import { normalizeBankCode } from 'common/bank';

/**
 * return translated Array of banks for Search dropdown menu
 * @param {Partial<Banks>} banks list of banks
 * @param {boolean} isFpx is method FPX or not
 * @returns {array}
 */
export function computeTranslatedBanks(banks: Partial<Banks>, isFpx = false) {
  return Object.entries(banks).map((entry) => {
    const code = entry[0];
    const name = entry[1] || '';
    const translatedBank: TranslatedBankType = {
      code: code,
      original: name,
      name: getLongBankName(code, get(locale) as string, name),
      _key: code,
    };
    if (isFpx) {
      translatedBank.disabledText = checkOffline(code)
        ? formatMessageWithLocale(FPX_OFFLINE_BANK, get(locale) as string)
        : '';
      translatedBank.logoCode = normalizeBankCode(code);
    }

    return translatedBank;
  });
}
