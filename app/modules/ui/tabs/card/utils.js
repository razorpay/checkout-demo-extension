import { getCustomSubtextForMethod } from 'checkoutstore';

import { getAppProviderSubtext } from 'i18n';

export function getAppInstrumentSubtext(provider, locale) {
  return (
    getCustomSubtextForMethod(provider) ||
    getAppProviderSubtext(provider, locale)
  );
}
