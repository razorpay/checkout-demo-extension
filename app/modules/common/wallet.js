import RazorpayConfig from 'common/RazorpayConfig';

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
  olamoney: ['Ola Money (Postpaid + Wallet)', 22],
  mobikwik: ['Mobikwik', 20],
  payumoney: ['PayUMoney', 18],
  payzapp: ['PayZapp', 24],
  citrus: ['Citrus Wallet', 32],
  // mpesa: ['Vodafone mPesa', 50],
  sbibuddy: ['SBI Buddy', 22],
  phonepe: ['PhonePe', 20],
  paypal: ['PayPal', 20],
};

const otpLengths = {
  freecharge: 4,
};

const powerWallets = ['mobikwik', 'freecharge', 'payumoney'];

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

const walletToIntent = {
  phonepe: 'com.phonepe.app',
};

/**
 * Returns the app corresponding to the wallet
 * @param {string} wallet
 *
 * @returns {string}
 */
export const getPackageNameForWallet = wallet => walletToIntent[wallet];

/**
 * We want to turn some wallets into intent.
 * @param {string} wallet Selected wallet
 * @param {Array<Object>} apps List of available apps
 *
 * @returns {boolean}
 */
export const shouldTurnWalletToIntent = (wallet, apps = []) => {
  const walletPackage = getPackageNameForWallet(wallet);

  if (walletPackage) {
    return _Arr.any(apps, app => app.package_name === walletPackage);
  }

  return false;
};
