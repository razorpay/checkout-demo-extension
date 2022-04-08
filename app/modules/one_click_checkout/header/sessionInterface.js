import { getSession } from 'sessionmanager';

// i18n imports
import {
  CONFIRM_CANCEL_HEADING as CONFIRM_HEADING_ONE_CC,
  CONFIRM_CANCEL_MESSAGE as CONFIRM_MESSAGE_ONE_CC,
} from 'one_click_checkout/misc/i18n/label';
import { formatTemplateWithLocale, getCurrentLocale } from 'i18n';
import {
  CONFIRM_CANCEL_HEADING,
  CONFIRM_CANCEL_MESSAGE,
} from 'ui/labels/confirm';

export const handleModalClose = () => {
  const session = getSession();
  const locale = getCurrentLocale();

  Confirm.show({
    heading: formatTemplateWithLocale(
      session.tab === 'home-1cc'
        ? CONFIRM_HEADING_ONE_CC
        : CONFIRM_CANCEL_HEADING,
      {},
      locale
    ),
    message: formatTemplateWithLocale(
      session.tab === 'home-1cc'
        ? CONFIRM_MESSAGE_ONE_CC
        : CONFIRM_CANCEL_MESSAGE,
      {},
      locale
    ),
    onPositiveClick: function () {
      session.closeModal();
    },
  });
};
