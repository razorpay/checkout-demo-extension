import {
  validateAndFetchPrefilledWallet,
  showPowerWallet,
} from 'wallet/helper';
import * as razorpay from 'razorpay';
import * as walletMeta from 'common/wallet';

const walletsEnabledForMerchant = [
  {
    power: false,
    name: 'PhonePe',
    h: 20,
    code: 'phonepe',
    logo: 'https://cdn.razorpay.com/wallet/phonepe.png',
    sqLogo: 'https://cdn.razorpay.com/wallet-sq/phonepe.png',
  },
  {
    power: false,
    name: 'Amazon Pay',
    h: 28,
    code: 'amazonpay',
    logo: 'https://cdn.razorpay.com/wallet/amazonpay.png',
    sqLogo: 'https://cdn.razorpay.com/wallet-sq/amazonpay.png',
  },
  {
    power: true,
    name: 'Mobikwik',
    h: 20,
    code: 'mobikwik',
    logo: 'https://cdn.razorpay.com/wallet/mobikwik.png',
    sqLogo: 'https://cdn.razorpay.com/wallet-sq/mobikwik.png',
  },
  {
    power: true,
    name: 'Freecharge',
    h: 18,
    code: 'freecharge',
    logo: 'https://cdn.razorpay.com/wallet/freecharge.png',
    sqLogo: 'https://cdn.razorpay.com/wallet-sq/freecharge.png',
  },
  {
    power: false,
    name: 'Airtel Money',
    h: 32,
    code: 'airtelmoney',
    logo: 'https://cdn.razorpay.com/wallet/airtelmoney.png',
    sqLogo: 'https://cdn.razorpay.com/wallet-sq/airtelmoney.png',
  },
  {
    power: false,
    name: 'Ola Money (Postpaid + Wallet)',
    h: 22,
    code: 'olamoney',
    logo: 'https://cdn.razorpay.com/wallet/olamoney.png',
    sqLogo: 'https://cdn.razorpay.com/wallet-sq/olamoney.png',
  },
  {
    power: false,
    name: 'JioMoney',
    h: 68,
    code: 'jiomoney',
    logo: 'https://cdn.razorpay.com/wallet/jiomoney.png',
    sqLogo: 'https://cdn.razorpay.com/wallet-sq/jiomoney.png',
  },
  {
    power: false,
    name: 'Paytm',
    h: 18,
    code: 'paytm',
    logo: 'https://cdn.razorpay.com/wallet/paytm.png',
    sqLogo: 'https://cdn.razorpay.com/wallet-sq/paytm.png',
  },
  {
    power: false,
    name: 'PayZapp',
    h: 24,
    code: 'payzapp',
    logo: 'https://cdn.razorpay.com/wallet/payzapp.png',
    sqLogo: 'https://cdn.razorpay.com/wallet-sq/payzapp.png',
  },
];

jest.mock('checkoutstore/methods', () => ({
  getWallets: jest.fn(() => {
    return walletsEnabledForMerchant;
  }),
}));

jest.mock('razorpay', () => ({
  getOption: jest.fn(),
  getPreferences: jest.fn(),
}));

jest.mock('common/wallet', () => ({
  isPowerWallet: jest.fn(),
}));

const mockAjaxRouteNotSupportedGetter = jest.fn();

jest.mock('common/useragent', () => ({
  get ajaxRouteNotSupported() {
    return mockAjaxRouteNotSupportedGetter();
  },
}));

const getOption = razorpay.getOption as unknown as jest.MockedFunction<
  typeof razorpay.getOption
>;

const getPreferences = razorpay.getPreferences as jest.MockedFunction<
  typeof razorpay.getPreferences
>;

const isPowerWallet = walletMeta.isPowerWallet as jest.MockedFunction<
  typeof walletMeta.isPowerWallet
>;

describe('verify prefill wallet value', () => {
  test('wallet prefill present and wallet is enabled for merchant', () => {
    getOption.mockReturnValue('olamoney');
    const finalPrefilledWallet = validateAndFetchPrefilledWallet();
    expect(finalPrefilledWallet).toEqual('olamoney');
  });

  test('wallet prefill present and wallet is not enabled for merchant', () => {
    getOption.mockReturnValue('paypal');
    const finalPrefilledWallet = validateAndFetchPrefilledWallet();
    expect(finalPrefilledWallet).toEqual('');
  });

  test('wallet prefill present and is not correct value', () => {
    getOption.mockReturnValue('olamoney Postpaid+');
    const finalPrefilledWallet = validateAndFetchPrefilledWallet();
    expect(finalPrefilledWallet).toEqual('');
  });
});

describe('verify show power wallet value', () => {
  test('Should NOT show power wallet when dynamic wallet flow enabled, ajax route not supported and wallet is power wallet', () => {
    getPreferences.mockReturnValue(true);
    mockAjaxRouteNotSupportedGetter.mockReturnValue(true);
    isPowerWallet.mockReturnValue(true);
    const isShowPowerWallet = showPowerWallet('freecharge');
    expect(isShowPowerWallet).toEqual(false);
  });

  test('Should show power wallet when dynamic wallet flow enabled, ajax route not supported and wallet is not power wallet', () => {
    getPreferences.mockReturnValue(true);
    mockAjaxRouteNotSupportedGetter.mockReturnValue(true);
    isPowerWallet.mockReturnValue(false);
    const isShowPowerWallet = showPowerWallet('phonepe');
    expect(isShowPowerWallet).toEqual(true);
  });

  test('Should show power wallet when dynamic wallet flow enabled, ajax route supported and wallet is power wallet', () => {
    getPreferences.mockReturnValue(true);
    mockAjaxRouteNotSupportedGetter.mockReturnValue(false);
    isPowerWallet.mockReturnValue(true);
    const isShowPowerWallet = showPowerWallet('phonepe');
    expect(isShowPowerWallet).toEqual(true);
  });

  test('Should show power wallet when dynamic wallet flow enabled, ajax route supported and wallet is not power wallet', () => {
    getPreferences.mockReturnValue(true);
    mockAjaxRouteNotSupportedGetter.mockReturnValue(false);
    isPowerWallet.mockReturnValue(false);
    const isShowPowerWallet = showPowerWallet('phonepe');
    expect(isShowPowerWallet).toEqual(true);
  });

  test('Should show power wallet when dynamic wallet flow disabled, ajax route not supported and wallet is power wallet', () => {
    getPreferences.mockReturnValue(false);
    mockAjaxRouteNotSupportedGetter.mockReturnValue(true);
    isPowerWallet.mockReturnValue(true);
    const isShowPowerWallet = showPowerWallet('phonepe');
    expect(isShowPowerWallet).toEqual(true);
  });

  test('Should show power wallet when dynamic wallet flow disabled, ajax route not supported and wallet is not power wallet', () => {
    getPreferences.mockReturnValue(false);
    mockAjaxRouteNotSupportedGetter.mockReturnValue(true);
    isPowerWallet.mockReturnValue(false);
    const isShowPowerWallet = showPowerWallet('phonepe');
    expect(isShowPowerWallet).toEqual(true);
  });

  test('Should show power wallet when dynamic wallet flow disabled, ajax route supported and wallet is power wallet', () => {
    getPreferences.mockReturnValue(false);
    mockAjaxRouteNotSupportedGetter.mockReturnValue(false);
    isPowerWallet.mockReturnValue(true);
    const isShowPowerWallet = showPowerWallet('phonepe');
    expect(isShowPowerWallet).toEqual(true);
  });

  test('Should show power wallet when dynamic wallet flow disabled, ajax route supported and wallet is not power wallet', () => {
    getPreferences.mockReturnValue(false);
    mockAjaxRouteNotSupportedGetter.mockReturnValue(false);
    isPowerWallet.mockReturnValue(false);
    const isShowPowerWallet = showPowerWallet('phonepe');
    expect(isShowPowerWallet).toEqual(true);
  });
});
