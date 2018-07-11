// const cdnUrl = RazorpayConfig.cdn
const cdnUrl = '';

const prefix = cdnUrl + 'wallet/';
const sqPrefix = cdnUrl + 'wallet-sq/';

const names = {
  amazonpay: 'Amazon Pay',
  paytm: 'Paytm',
  zeta: 'Zeta',
  freecharge: 'Freecharge',
  airtelmoney: 'Airtel Money',
  jiomoney: 'JioMoney',
  olamoney: 'Ola Money',
  mobikwik: 'Mobikwik',
  payumoney: 'PayUMoney',
  payzapp: 'PayZapp',
  citrus: 'Citrus Wallet',
  mpesa: 'Vodafone mPesa',
  sbibuddy: 'SBI Buddy',
};

const otpLengths = {
  freecharge: 4,
};

const powerWallets = ['mobikwik', 'freecharge', 'olamoney'];

const wallets = _Obj.map(names, (name, code) => ({
  power: powerWallets.indexOf(walletCode) !== -1,
  name,
  logo: prefix + code + '.png',
  sqLogo: sqPrefix + code + '.png',
}));

export const isPowerWallet = code => wallets[code].powerwallet;
export const getWallet = code => wallets[code];
