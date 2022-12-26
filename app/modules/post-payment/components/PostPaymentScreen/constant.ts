export const methodNameMapping = {
  card: 'Card',
  emi: 'Card EMI',
  netbanking: 'NetBanking',
  wallet: 'Wallet',
  upi: 'UPI',
  cardless_emi: 'Cardless EMI',
  paylater: 'Paylater',
  emandate: 'Emandate',
  cred: 'Cred',
} as const;

export const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const ANALYTICS_EVENTS = {
  RENDER_TRANSITIONARY_SCREEN: 'transitionary_screen',
  CLICK_SUPPORT_LINK: 'click:support_link',
  CLICK_COPY_PAYMENT_ID: 'click:copy_payment_id',
};

export const SUPPORT_URL = {
  url: 'https://razorpay.com/support/',
  text: 'razorpay.com/support',
};
