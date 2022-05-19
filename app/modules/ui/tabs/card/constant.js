export const AVS_COUNTRIES = ['CA', 'GB', 'US'];

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
  IDIB: { credit: false, debit: true },
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
  IDIB: {
    credit: [],
    debit: ['VISA', 'MC'],
  },
  IOBA: {
    debit: ['VISA', 'MC'],
    credit: ['VISA'],
  },
  JUPITER: {
    debit: ['VISA'],
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
