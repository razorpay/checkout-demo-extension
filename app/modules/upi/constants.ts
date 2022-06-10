import upiIcon from 'ui/icons/payment-methods/upi';

export const OTHER_INTENT_APPS: UPI.AppConfiguration = {
  package_name: 'other_intent_apps',
  app_name: 'Others',
  handles: [],
  name: 'Others',
  shortcode: 'others',
  app_icon: upiIcon('#949494', '#DADADA'),
};

export const GOOGLE_PAY_PACKAGE_NAME = 'com.google.android.apps.nbu.paisa.user';
export const PHONE_PE_PACKAGE_NAME = 'com.phonepe.app';
// Not the real package name. We're using this because api returns 'cred' instead of the real package name
// TODO: get this fixed
export const CRED_PACKAGE_NAME = 'cred';

export const UPI_APPS: {
  preferred: Array<UPI.AppConfiguration>;
  whitelist: Array<Partial<UPI.AppConfiguration>>;
  blacklist: Array<Partial<UPI.AppConfiguration>>;
} = {
  /**
   * Preferred apps.
   * There are apps that were built for UPI.
   */
  preferred: [
    {
      app_name: 'Google Pay',
      package_name: GOOGLE_PAY_PACKAGE_NAME,
      app_icon: 'https://cdn.razorpay.com/app/googlepay.svg',
      handles: ['okhdfcbank', 'okicici', 'okaxis', 'oksbi'],
      /**
       * Call CheckoutBridge to verify that the user is registered on the app
       * and only display if they are.
       */
      verify_registration: true,
      shortcode: 'google_pay',
    },
    {
      package_name: 'com.phonepe.app',
      app_icon: 'https://cdn.razorpay.com/checkout/phonepe.png',
      shortcode: 'phonepe',
      app_name: 'PhonePe',
      handles: ['ybl'],
    },
    {
      name: 'PayTM',
      app_name: 'PayTM UPI',
      package_name: 'net.one97.paytm',
      shortcode: 'paytm',
      app_icon: 'https://cdn.razorpay.com/app/paytm.svg',
      handles: ['paytm'],
    },
    {
      package_name: 'in.org.npci.upiapp',
      shortcode: 'bhim',
      app_icon: 'https://cdn.razorpay.com/app/bhim.svg',
      app_name: 'Bhim',
      handles: ['upi'],
    },
  ],

  /**
   * Whitelisted apps.
   * Should not contain any apps that are mentioned in preferred.
   */
  whitelist: [
    {
      name: 'WhatsApp Business',
      app_name: 'WhatsApp Business UPI',
      package_name: 'com.whatsapp.w4b',
      shortcode: 'whatsapp-biz',
      handles: ['icicibank'],
      app_icon: 'https://cdn.razorpay.com/app/whatsapp.svg',
    },
    {
      package_name: 'com.csam.icici.bank.imobile',
      shortcode: 'imobile',
    },
    {
      package_name: 'com.sbi.upi',
      shortcode: 'sbi',
      handles: ['sbi'],
    },
    {
      package_name: 'com.upi.axispay',
      shortcode: 'axispay',
    },
    {
      package_name: 'com.samsung.android.spaymini',
      shortcode: 'samsung-mini',
    },
    {
      package_name: 'com.samsung.android.spay',
      shortcode: 'samsung',
    },
    {
      package_name: 'com.snapwork.hdfc',
      shortcode: 'hdfc-bank',
    },
    {
      package_name: 'com.fss.pnbpsp',
      shortcode: 'pnb-bank',
    },
    {
      package_name: 'com.icicibank.pockets',
      shortcode: 'icici-pocket',
    },
    {
      package_name: 'com.bankofbaroda.upi',
      shortcode: 'bank-of-baroda',
    },
    {
      package_name: 'com.freecharge.android',
      shortcode: 'freecharge',
    },
    {
      package_name: 'com.fss.unbipsp',
      shortcode: 'united-upi',
    },
    {
      package_name: 'com.axis.mobile',
      shortcode: 'axis',
    },
    {
      package_name: 'com.mycompany.kvb',
      shortcode: 'kvb',
    },
    {
      package_name: 'com.fss.vijayapsp',
      shortcode: 'vijaya',
    },
    {
      package_name: 'com.dena.upi.gui',
      shortcode: 'dena',
    },
    {
      package_name: 'com.fss.jnkpsp',
      shortcode: 'jk-upi',
    },
    {
      package_name: 'com.olive.kotak.upi',
      shortcode: 'kotak',
    },
    {
      package_name: 'com.enstage.wibmo.hdfc',
      shortcode: 'payzapp',
    },
    {
      package_name: 'com.bsb.hike',
      shortcode: 'hike',
    },
    {
      package_name: 'com.fss.idfcpsp',
      shortcode: 'idfc',
    },
    {
      package_name: 'com.YesBank',
      shortcode: 'yes-bank',
    },
    {
      package_name: 'com.abipbl.upi',
      shortcode: 'abpb',
    },
    {
      package_name: 'com.microsoft.mobile.polymer',
      shortcode: 'microsoft-kaizala',
    },
    {
      package_name: 'com.finopaytech.bpayfino',
      shortcode: 'fino',
    },
    {
      package_name: 'com.mgs.obcbank',
      shortcode: 'oriental',
    },
    {
      package_name: 'com.upi.federalbank.org.lotza',
      shortcode: 'lotza',
    },
    {
      package_name: 'com.mgs.induspsp',
      shortcode: 'induspay',
    },
    {
      package_name: 'ai.wizely.android',
      shortcode: 'wizely',
    },
    {
      package_name: 'com.olive.dcb.upi',
      shortcode: 'dcb-bank',
    },
    {
      package_name: 'com.mgs.yesmerchantnative.prod',
      shortcode: 'yesmerchantnative',
    },
    {
      package_name: 'com.dbs.in.digitalbank',
      shortcode: 'digibank',
    },
    {
      package_name: 'com.rblbank.mobank',
      shortcode: 'rbl-mobank',
    },
    {
      package_name: 'in.chillr',
      shortcode: 'chillr',
    },
    {
      package_name: 'money.bullet',
      shortcode: 'bullet',
    },
    {
      package_name: 'com.SIBMobile',
      shortcode: 'sibmirror',
    },
    {
      package_name: 'in.amazon.mShop.android.shopping',
      shortcode: 'amazon',
      app_icon: 'https://cdn.razorpay.com/app/amazonpay.svg',
    },
    {
      package_name: 'com.mipay.in.wallet',
      shortcode: 'mipay',
    },
    {
      package_name: 'com.mipay.wallet.in',
      shortcode: 'mipay_2',
    },
    {
      package_name: 'com.dreamplug.androidapp',
      shortcode: 'cred',
    },
    {
      package_name: 'in.bajajfinservmarkets.app',
      shortcode: 'finserv',
      handles: ['abfspay'],
    },
    {
      package_name: 'in.bajajfinservmarkets.app.uat',
      shortcode: 'finserv-uat',
    },
    {
      package_name: 'com.fampay.in',
      shortcode: 'fampay',
    },
    {
      package_name: 'com.mobikwik_new',
      shortcode: 'mobikwik',
    },
  ],

  /**
   * Blacklisted apps.
   * Apps that listen for UPI intent but are evil.
   */
  blacklist: [
    {
      package_name: 'com.whatsapp',
      shortcode: 'whatsapp',
    },
    {
      package_name: 'com.truecaller',
      shortcode: 'truecaller',
    },
    {
      package_name: 'com.olacabs.customer',
    },
    {
      package_name: 'com.myairtelapp',
      shortcode: 'airtel',
    },
    {
      package_name: 'com.paytmmall',
    },
    {
      package_name: 'com.gbwhatsapp',
    },
    {
      package_name: 'com.msf.angelmobile',
    },
    {
      package_name: 'com.fundsindia',
    },
    {
      package_name: 'com.muthootfinance.imuthoot',
    },
    {
      package_name: 'com.angelbroking.angelwealth',
    },
    {
      package_name: 'com.citrus.citruspay',
      shortcode: 'lazypay',
    },
  ],
};

export const suggestionVPA: string[] = [
  'apl',
  'abfspay',
  'fbl',
  'axisb',
  'yesbank',
  'okaxis',
  'oksbi',
  'okicici',
  'okhdfcbank',
  'hdfcbankjd',
  'kmbl',
  'icici',
  'myicici',
  'ikwik',
  'ybl',
  'paytm',
  'rmhdfcbank',
  'pingpay',
  'barodapay',
  'idfcbank',
  'upi',
];

export const upiBackCancel = {
  '_[method]': 'upi',
  '_[flow]': 'intent',
  '_[reason]': 'UPI_INTENT_BACK_BUTTON',
};

export const TIMER_UPDATE_FREQUENCY = 1000; // 1000 ms
export const POLL_FREQUENCY = 3000; //3000ms

/**
 * Timeouts for Deeplink on iOS Safari
 */
export const APP_DETECTION_OR_MANUAL_CANCEL_TIMEOUT = 1000;

export const APP_DETECTED_FURTHER_STEPS_TIMEOUT =
  APP_DETECTION_OR_MANUAL_CANCEL_TIMEOUT + 2000;

export const USER_CONSENT_FOR_NAVIGATION_TIMEOUT = 4000;

export const UPI_TAB_CALLBACK_NAME = 'fromPopup';

/**
 * Why 5 seconds early?
 * Since we cannot tag/classify the payments if failed,
 * we will cancel 5 seconds early to tag a proper reason to the same.
 * Confirmed from Product as well
 * after the timer expiry we cannot mark the payment with cancel reason
 */
export const QR_EXPIRE_TIME = (12 * 60 - 5) * 1000;
export const QR_OFF_SCREEN_POLL_DELAY_BY = 3;
export const QR_IMAGE_DEFAULT_SIZE = 165;
