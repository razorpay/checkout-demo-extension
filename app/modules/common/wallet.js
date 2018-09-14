import { RazorpayConfig } from 'common/Razorpay';

const cdnUrl = RazorpayConfig.cdn;

const prefix = cdnUrl + 'wallet/';
const sqPrefix = cdnUrl + 'wallet-sq/';

const list = {
  amazonpay: ['Amazon Pay', 28],
  paytm: ['Paytm', 18],
  zeta: ['Zeta', 25],
  freecharge: ['Freecharge', 18],
  airtelmoney: ['Airtel Money', 32],
  jiomoney: ['JioMoney', 68],
  olamoney: ['Ola Money', 22],
  mobikwik: ['Mobikwik', 20],
  payumoney: ['PayUMoney', 18],
  payzapp: ['PayZapp', 24],
  citrus: ['Citrus Wallet', 32],
  mpesa: ['Vodafone mPesa', 50],
  sbibuddy: ['SBI Buddy', 22],
};

const otpLengths = {
  freecharge: 4,
};

const powerWallets = ['mobikwik', 'freecharge', 'olamoney', 'payumoney'];

export const wallets = _Obj.map(list, (details, code) => ({
  power: powerWallets.indexOf(code) !== -1,
  name: details[0],
  h: details[1],
  code,
  logo: prefix + code + '.png',
  sqLogo: sqPrefix + code + '.png',
}));

export const isPowerWallet = code => wallets[code] && wallets[code].power;
export const getWallet = code => wallets[code];
