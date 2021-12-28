export const AVS_COUNTRY_MAP = {
  CA: 'Canada',
  GB: 'United Kingdom',
  US: 'United States of America',
};

export const STATE_MAP = {
  US: [
    'Alabama',
    'Alaska',
    'Arizona',
    'Arkansas',
    'California',
    'Colorado',
    'Connecticut',
    'Delaware',
    'Florida',
    'Georgia',
    'Hawaii',
    'Idaho',
    'IllinoisIndiana',
    'Iowa',
    'Kansas',
    'Kentucky',
    'Louisiana',
    'Maine',
    'Maryland',
    'Massachusetts',
    'Michigan',
    'Minnesota',
    'Mississippi',
    'Missouri',
    'MontanaNebraska',
    'Nevada',
    'New Hampshire',
    'New Jersey',
    'New Mexico',
    'New York',
    'North Carolina',
    'North Dakota',
    'Ohio',
    'Oklahoma',
    'Oregon',
    'PennsylvaniaRhode Island',
    'South Carolina',
    'South Dakota',
    'Tennessee',
    'Texas',
    'Utah',
    'Vermont',
    'Virginia',
    'Washington',
    'West Virginia',
    'Wisconsin',
    'Wyoming',
  ],
  GB: [
    'Scotland',
    'Northern Ireland',
    'Wales',
    'North East',
    'North West',
    'Yorkshire and the Humber',
    'West Midlands',
    'East Midlands',
    'South West',
    'South East',
    'East of England',
    'Greater London',
  ],
  CA: [
    'Alberta',
    'British Columbia',
    'Manitoba',
    'New Brunswick',
    'Newfoundland',
    'Northwest Territories',
    'Nova Scotia',
    'Nunavut',
    'Ontario',
    'Prince Edward Island',
    'Quebec',
    'Saskatchewan',
    'Yukon',
  ],
};

export const Views = {
  SAVED_CARDS: 'saved-cards',
  ADD_CARD: 'add-card',
  AVS: 'avs-card',
  CARD_APP: 'card-app',
  HOME_SCREEN: 'home-screen',
};

export const banksUnderOneCard = ['IDFB', 'SIBL', 'STCB', 'FDRL'];

export const cardWithRecurringSupport = {
  CIUB: { credit: true, debit: true },
  ESFB: { credit: false, debit: true },
  HSBC: { credit: true, debit: false },
  KVBL: { credit: true, debit: true },
  // OneCard exclusive banks - start
  IDFB: { credit: true, debit: false },
  SIBL: { credit: true, debit: false },
  STCB: { credit: true, debit: false, prepaid: true },
  FDRL: { credit: true, debit: false },
  // OneCard exclusive banks - end
};
export const cobrandingPartners = ['ONE_CARD', 'SLICE'];
export const supportedNetworksAndProviders = {
  CIUB: {
    credit: [],
    debit: ['VISA', 'MC'],
  },
  ESFB: {
    credit: [],
    debit: ['VISA', 'MC'],
  },
  HSBC: {
    credit: ['VISA', 'MC'],
    debit: [],
  },
  KVBL: {
    credit: ['VISA'],
    debit: ['VISA', 'MC'],
  },
  ONE_CARD: {
    credit: ['VISA'],
    debit: [],
  },
  SLICE: {
    credit: [],
    debit: [],
    super_cards: ['VISA'],
  },
};
