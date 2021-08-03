import { getCustomSubtextForMethod } from 'checkoutstore';

import { getAppProviderSubtext } from 'i18n';

export function getAppInstrumentSubtext(
  provider: string,
  locale: string
): string {
  return (
    getCustomSubtextForMethod(provider) ||
    getAppProviderSubtext(provider, locale)
  );
}
