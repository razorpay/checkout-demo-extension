import { getSession } from 'sessionmanager';
import * as Confirm from 'checkoutframe/components/confirm';

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

// Analytics imports
import OneCCEvents from 'one_click_checkout/analytics';
import { Events } from 'analytics';
import { getCurrentScreen } from 'one_click_checkout/analytics/helpers';

export const handleModalClose = () => {
  const session = getSession();
  const locale = getCurrentLocale();

  Events.TrackBehav(OneCCEvents.CLOSE_MODAL, {
    screen_name: getCurrentScreen(),
  });

  if (session.r?._payment) {
    session.closeModal();
  } else {
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
  }
};
