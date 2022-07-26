import { getUpiIntentAppName } from 'i18n';
import { t } from 'svelte-i18n';
import { get } from 'svelte/store';
import { APPS_SINGULAR, APPS_PLURAL, FACING_ISSUES } from 'upi/i18n/labels';

export const getCustomDowntimeMessage = (
  appShortCodes: string[] = [],
  locale: string
) => {
  if (!appShortCodes.length) {
    return '';
  }
  const appNames = appShortCodes
    .map((app) => getUpiIntentAppName(app, locale, ''))
    .filter(Boolean)
    .join(', ');
  const verb = appShortCodes.length > 1 ? APPS_PLURAL : APPS_SINGULAR;
  const _t = get(t);
  // <!-- Label: Google Pay is facing issues.  Please use other UPI apps.  -->
  // <!-- Label: Google Pay, PayTM are facing issues.  Please use other UPI apps.  -->

  return `${appNames} ${_t(verb, { locale })} ${_t(FACING_ISSUES, {
    locale,
  })}`;
};
