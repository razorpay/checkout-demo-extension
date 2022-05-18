import { popStack, pushOverlay } from 'navstack';
import { formatMessageWithLocale, getCurrentLocale } from 'i18n';
import UserConfirmationOverlay from 'ui/components/overlay/UserConfirmation.svelte';
import { getSession } from 'sessionmanager';

export function showConversionChargesCallout() {
  const locale = getCurrentLocale();

  pushOverlay({
    component: UserConfirmationOverlay,
    props: {
      buttonText: formatMessageWithLocale('cta.continue', locale),
      callout: formatMessageWithLocale(
        'card.international_currency_charges',
        locale
      ),
      onConfirm: () => {
        popStack();
        const session = getSession();
        session.submit();
      },
    },
  });
}
