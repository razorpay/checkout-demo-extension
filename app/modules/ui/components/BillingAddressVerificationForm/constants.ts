/**
 * This component renders two types of forms:
 * AVS: [address line 1] [address line 2] [city] [state] [postal code] [country]
 * N_AVS: [first name] [last name] [address line 1] [address line 2] [city] [state] [postal code] [country]
 */
import { FORM_FIELDS, FORM_TYPE } from './types';

export const SPACIAL_CHAR_REGEX =
  /^[\s`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]*$/;

export const FORM_FIELDS_TYPE_MAPPING = {
  [FORM_TYPE.AVS]: [
    FORM_FIELDS.line1,
    FORM_FIELDS.line2,
    [FORM_FIELDS.city, FORM_FIELDS.postal_code],
    [FORM_FIELDS.country, FORM_FIELDS.state],
  ],
  [FORM_TYPE.N_AVS]: [
    [FORM_FIELDS.first_name, FORM_FIELDS.last_name],
    FORM_FIELDS.line1,
    FORM_FIELDS.line2,
    [FORM_FIELDS.city, FORM_FIELDS.postal_code],
    [FORM_FIELDS.country, FORM_FIELDS.state],
  ],
};
