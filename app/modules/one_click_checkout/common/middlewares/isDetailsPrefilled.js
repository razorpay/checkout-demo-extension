import validateEmailAndContact from 'one_click_checkout/common/validators/validateEmailAndContact';
import { views } from 'one_click_checkout/routing/constants';

export default function () {
  const [isContactValid, isEmailValid] = validateEmailAndContact();
  if (!isContactValid || !isEmailValid) {
    return views.DETAILS;
  }
}
