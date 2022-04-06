import { getSession } from 'sessionmanager';

// i18n imports
import {
  CONFIRM_CANCEL_HEADING,
  CONFIRM_CANCEL_MESSAGE,
} from 'one_click_checkout/misc/i18n/label';
import { formatTemplateWithLocale, getCurrentLocale } from 'i18n';

export const handleModalClose = () => {
  const session = getSession();
  const locale = getCurrentLocale();

  Confirm.show({
    heading: formatTemplateWithLocale(CONFIRM_CANCEL_HEADING, {}, locale),
    message: formatTemplateWithLocale(CONFIRM_CANCEL_MESSAGE, {}, locale),
    onPositiveClick: function () {
      session.closeModal();
    },
  });
};
