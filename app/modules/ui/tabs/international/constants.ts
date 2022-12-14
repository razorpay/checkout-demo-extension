import { INTERNATIONAL_APPS } from 'common/international';

export const NVS_COUNTRY_MAP = {
  [INTERNATIONAL_APPS.TRUSTLY]: [
    'AT',
    'BE',
    'CZ',
    'DK',
    'EE',
    'Fl',
    'DE',
    'LV',
    'LT',
    'NL',
    'NO',
    'PL',
    'SK',
    'ES',
    'SE',
    'GB',
  ],
  [INTERNATIONAL_APPS.POLI]: ['AU'],
  [INTERNATIONAL_APPS.SOFORT]: ['AT', 'BE', 'DE', 'IT', 'NL', 'PL', 'ES'],
  [INTERNATIONAL_APPS.GIROPAY]: ['DE'],
} as const;

export const VIEWS_MAP = {
  SELECT_PROVIDERS: 'SELECT_PROVIDERS',
  NVS_FORM: 'NVS_FORM',
} as const;
