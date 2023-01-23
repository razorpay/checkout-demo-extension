import { getSession } from 'sessionmanager';
import { views } from 'one_click_checkout/routing/constants';
import { screensHistory } from 'one_click_checkout/routing/History';
import { OTP_TEMPLATES } from 'otp/constants';
import type { History } from 'types/types';
import { isOneClickCheckout } from 'razorpay';

export function getDefaultOtpTemplate() {
  let template = (screensHistory as History).config[views.OTP].props
    .smsTemplate;

  const session = getSession();
  if (session.tab !== 'home-1cc') {
    if (session.payload && session.payload.save) {
      template = isOneClickCheckout()
        ? OTP_TEMPLATES.save_card
        : OTP_TEMPLATES.save_card_v2;
    } else {
      template = isOneClickCheckout()
        ? OTP_TEMPLATES.access_card
        : OTP_TEMPLATES.access_card_v2;
    }
  }

  return template;
}
