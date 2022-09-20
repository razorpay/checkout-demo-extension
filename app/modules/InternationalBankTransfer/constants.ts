export const TAB_NAME = 'intl_bank_transfer';

export const METHOD_NAMES = ['va_usd', 'va_eur', 'va_cad', 'va_gbp'];

export const METHOD_ICON_MAPPING: { [key in string]: string } = {
  va_usd: 'us.png',
  va_eur: 'eu.png',
  va_cad: 'ca.svg',
  va_gbp: 'gb.svg',
};

export const MEHTOD_CURRENCY_MAPPING: { [key in string]: string } = {
  va_usd: 'USD',
  va_eur: 'EUR',
  va_cad: 'CAD',
  va_gbp: 'GBP',
};

export const HELP_TEXT_MAPPING = {
  note: 'intl_bank_transfer.help_texts.note',
  title: 'intl_bank_transfer.help_texts.title',
  loading: 'intl_bank_transfer.help_texts.loading',
  heading: 'intl_bank_transfer.help_texts.heading',
  content1: 'intl_bank_transfer.help_texts.content1',
  content2: 'intl_bank_transfer.help_texts.content2',
  routingCode: 'intl_bank_transfer.help_texts.routing_code',
  routingType: 'intl_bank_transfer.help_texts.routing_type',
  roundOffCallout: 'intl_bank_transfer.help_texts.round_off_callout',
  noteLabel: 'intl_bank_transfer.help_texts.note_label',
};

export const VIEWS_MAP = {
  LIST: 'LIST',
  DETAILS: 'DETAILS',
};
