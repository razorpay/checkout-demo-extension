import { getSession } from 'sessionmanager';
import { screensHistory } from 'one_click_checkout/routing/History';
import { OTP_TEMPLATES } from 'one_click_checkout/otp/constants';
import { isOneClickCheckout } from 'razorpay/helper';

export function getDefaultOtpTemplate() {
  let template = screensHistory.config[views.OTP].props.otpReason;

  const session = getSession();
  if (session.tab !== 'home-1cc' && isOneClickCheckout()) {
    if (session.payload && session.payload.save) {
      template = OTP_TEMPLATES.save_card;
    } else {
      template = OTP_TEMPLATES.access_card;
    }
  }

  return template;
}