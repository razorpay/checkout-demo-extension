export const PROVIDERS = {
  TRUSTLY: 'trustly',
  POLI: 'poli',
};

export const NVS_COUNTRY_MAP = {
  [PROVIDERS.TRUSTLY]: [
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
  [PROVIDERS.POLI]: ['AU'],
};

export const VIEWS_MAP = {
  SELECT_PROVIDERS: 'SELECT_PROVIDERS',
  NVS_FORM: 'NVS_FORM',
};

export const INTERNATIONAL_PROVIDERS = [PROVIDERS.TRUSTLY, PROVIDERS.POLI];

export const DCC_VIEW_FOR_PROVIDERS = ['paypal', ...INTERNATIONAL_PROVIDERS];
