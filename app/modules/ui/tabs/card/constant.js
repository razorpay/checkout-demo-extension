export const AVS_COUNTRY_MAP = {
  CA: 'Canada',
  GB: 'United Kingdom',
  US: 'United States of America',
};

export const STATE_MAP = {
  US: [
    'Alabama',
    'Alaska',
    'American Samoa',
    'Arizona',
    'Arkansas',
    'California',
    'Colorado',
    'Connecticut',
    'Delaware',
    'District of Columbia',
    'Florida',
    'Georgia',
    'Guam',
    'Hawaii',
    'Idaho',
    'Illinois',
    'Indiana',
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
    'Montana',
    'Nebraska',
    'Nevada',
    'New Hampshire',
    'New Jersey',
    'New Mexico',
    'New York',
    'North Carolina',
    'North Dakota',
    'Northern Mariana Islands',
    'Ohio',
    'Oklahoma',
    'Oregon',
    'Pennsylvania',
    'Puerto Rico',
    'Rhode Island',
    'South Carolina',
    'South Dakota',
    'Tennessee',
    'Texas',
    'United States Minor Outlying Islands',
    'Utah',
    'Vermont',
    'Virgin Islands',
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

/**
 * Hard coding merchant keys for which allow_billdesk_sihub feature is enabled
 * TODO: Add allow_billdesk_sihub feature in preference API features, (Planned in coming sprint)
 */
export const merchantsEnabledOnSIHub = [
  'rzp_live_9Qu1tSl2h2N1DZ',
  'rzp_live_BYGeDqibuIvHiA',
  'rzp_live_AszWiojo0lJxxX',
];
export const cardWithRecurringSupport = {
  CIUB: { credit: true, debit: true },
  ESFB: { credit: false, debit: true },
  HSBC: { credit: true, debit: false },
  KVBL: { credit: true, debit: true },
  PUNB: { credit: true, debit: false },
  IOBA: { credit: true, debit: true },
  // OneCard exclusive banks - start
  IDFB: { credit: true, debit: false },
  SIBL: { credit: true, debit: false },
  STCB: { credit: true, debit: false, prepaid: true },
  FDRL: { credit: true, debit: false },
  // OneCard exclusive banks - end
  // NIYO PAY Global Cards - start
  DCBL: { credit: true, debit: false },
  YESB: { credit: true, debit: false },
  // NIYO PAY Global Cards - end
};
export const cobrandingPartners = [
  'ONE_CARD',
  'SLICE',
  'RAZORPAYX',
  'JUPITER',
  'NIYO',
];
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
  IOBA: {
    debit: ['VISA', 'MC'],
    credit: ['VISA'],
  },
  KVBL: {
    credit: ['VISA'],
    debit: ['VISA', 'MC'],
  },
  NIYO: {
    credit: ['VISA', 'MC'],
  },
  ONE_CARD: {
    credit: ['VISA'],
    debit: [],
  },
  PUNB: {
    credit: ['VISA'],
    debit: [],
  },
  RAZORPAYX: {
    credit: ['VISA'],
    debit: [],
  },
  SLICE: {
    credit: [],
    debit: [],
    super_cards: ['VISA'],
  },
};
