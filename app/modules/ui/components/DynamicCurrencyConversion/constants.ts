/**
 * Show these currencies on the top for DCC
 */
export const TOP_CURRENCIES = ['USD', 'GBP', 'EUR'];

export enum MethodIdentifiers {
  iin = 'iin',
  provider = 'provider',
  tokenId = 'tokenId',
  walletCode = 'walletCode',
}

export enum CardViews {
  SAVED_CARDS = 'saved-cards',
  ADD_CARD = 'add-card',
  HOME_SCREEN = 'home-screen',
}

/**
 * DCC events
 */
export enum EmitEvents {
  /**
   * An event emitted when selectedCurrency is changed on UI
   */
  selectedCurrencyChange = 'selectedCurrencyChange',

  /**
   * Loading event triggered before calling /flows api, if the response is already cached then this event will not be fired.
   */
  currencyMetaLoading = 'currencyMetaLoading',

  /**
   * Triggered after /flows api response successfully, if the response is already cached then this event will not be fired.
   */
  currencyMetaLoaded = 'currencyMetaLoaded',

  /**
   * Triggered when /flows api failed to respond, if the response is already cached then this event will not be fired.
   */
  currencyMetaFailed = 'currencyMetaFailed',
}

export const RAZORPAY_WEBSITE_LINK = 'https://razorpay.com';
