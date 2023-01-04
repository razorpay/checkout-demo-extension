import RazorpayConfig from 'common/RazorpayConfig';
import * as ObjectUtils from 'utils/object';
import * as Bridge from 'bridge';
import type { Wallet, WalletCode } from 'wallet/types';
import { list } from 'wallet/constants';

const cdnUrl = RazorpayConfig.cdn;

const prefix = cdnUrl + 'wallet/';
const sqPrefix = cdnUrl + 'wallet-sq/';

/**
 * Order to sort the wallets in
 */
const WALLET_SORT_ORDER = [
  'phonepe',
  'amazonpay',
  'mobikwik',
  'freecharge',
  'airtelmoney',
  'olamoney',
  'jiomoney',
  'paytm',
  'paypal',
] as const;

/**
 * Returns a sorted list of wallets
 * @param {Array<Wallet>} wallet
 *
 * @returns {Array<Wallet>}
 */
export function getSortedWallets(
  wallets: Array<
    Omit<Wallet, 'code'> & { code: typeof WALLET_SORT_ORDER[number] }
  >
) {
  return wallets.sort((a, b) => {
    const containsA = WALLET_SORT_ORDER.includes(a.code);
    const containsB = WALLET_SORT_ORDER.includes(b.code);

    const indexA = WALLET_SORT_ORDER.indexOf(a.code);
    const indexB = WALLET_SORT_ORDER.indexOf(b.code);

    if (containsA && containsB) {
      return indexA - indexB;
    } else if (containsA) {
      return -1;
    } else if (containsB) {
      return 1;
    }

    return 0;
  });
}

const powerWallets = ['mobikwik', 'freecharge', 'payumoney'];

export const wallets = ObjectUtils.map(list, (details, code: WalletCode) => ({
  power: powerWallets.indexOf(code) !== -1,
  name: details[0],
  h: details[1],
  code,
  logo: prefix + code + '.png',
  sqLogo: sqPrefix + code + '.png',
}));

export const isPowerWallet = (code: WalletCode) =>
  wallets[code] && wallets[code].power;
export const getWallet = (code: WalletCode) => wallets[code];

const walletToIntent = {
  phonepe: 'com.phonepe.app',
};

/**
 * Returns the app corresponding to the wallet
 * @param {string} wallet
 *
 * @returns {string}
 */
export const getPackageNameForWallet = (wallet: string) =>
  walletToIntent[wallet as keyof typeof walletToIntent];

/**
 * We want to turn some wallets into intent.
 * @param {string} wallet Selected wallet
 * @param {Array<Object>} apps List of available apps
 *
 * @returns {boolean}
 */
export const shouldTurnWalletToIntent = (wallet: string, apps = []) => {
  /**
   * On iOS, PhonePe exists but doesn't support intent on wallet.
   * Do not allow intent in this case.
   */
  if (Bridge.checkout.platform === 'ios') {
    return false;
  }

  // Web Payments api are treated as intent and each available web payment app is added as a valid intent app
  // Since wallets cannot be used through intent on browsers,
  // do not turn wallets to intent if native intent is not available
  if (!(global.CheckoutBridge && global.CheckoutBridge.callNativeIntent)) {
    return false;
  }

  const walletPackage = getPackageNameForWallet(wallet);

  if (walletPackage) {
    return apps.some(
      (app: UPI.AppConfiguration) => app.package_name === walletPackage
    );
  }

  return false;
};
