import { getSession } from 'sessionmanager';
import { views } from 'one_click_checkout/routing/constants';
import { screensHistory } from 'one_click_checkout/routing/History';
import { OTP_TEMPLATES } from 'otp/constants';

export function getDefaultOtpTemplate() {
  let template = screensHistory.config[views.OTP].props.smsTemplate;

  const session = getSession();
  if (session.tab !== 'home-1cc') {
    if (session.payload && session.payload.save) {
      template = OTP_TEMPLATES.save_card;
    } else {
      template = OTP_TEMPLATES.access_card;
    }
  }

  return template;
}
