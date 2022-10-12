import { PHONE_NUMBER_LENGTH_INDIA } from 'common/constants';
import {
  CONTACT_ERROR_LABEL,
  INDIA_CONTACT_ERROR_LABEL,
} from 'one_click_checkout/address/i18n/labels';

export function getIndErrLabel(phone: string) {
  return phone.length === PHONE_NUMBER_LENGTH_INDIA || !phone
    ? CONTACT_ERROR_LABEL
    : INDIA_CONTACT_ERROR_LABEL;
}
