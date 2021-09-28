/* global CheckoutBridge */

import Analytics from 'analytics';
import { checkDowntime } from 'checkoutframe/downtimes';
import { getDowntimes } from 'checkoutstore';
import { VPA_REGEX } from 'common/constants';
export {
  parseUPIIntentResponse,
  didUPIIntentSucceed,
} from 'common/upi_helpers';
export const GOOGLE_PAY_PACKAGE_NAME = 'com.google.android.apps.nbu.paisa.user';
export const PHONE_PE_PACKAGE_NAME = 'com.phonepe.app';
// Not the real package name. We're using this because api returns 'cred' instead of the real package name
// TODO: get this fixed
export const CRED_PACKAGE_NAME = 'cred';

export function isVpaValid(vpa) {
  return VPA_REGEX.test(vpa);
}

/**
 * Returns the package name corresponding to the app shortcode.
 * @param {string} shortcode
 *
 * @returns {string | undefined}
 */
export function getPackageNameFromShortcode(shortcode) {
  const app = getAllApps() |> _Arr.find((app) => app.shortcode === shortcode);

  if (app) {
    return app.package_name;
  }
}

/**
 * Returns the app corresponding to the package name.
 * @param {string} shortcode
 *
 * @returns {string | undefined}
 */
export function getAppFromPackageName(packageName) {
  const app =
    getAllApps() |> _Arr.find((app) => app.package_name === packageName);

  return app;
}

const UPI_APPS = {
  /**
   * Preferred apps.
   * There are apps that were built for UPI.
   */
  preferred: [
    {
      app_name: 'Google Pay',
      package_name: GOOGLE_PAY_PACKAGE_NAME,
      app_icon: 'https://cdn.razorpay.com/checkout/gpay.png',
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

/**
 * Order of apps.
 */
const UPI_APPS_ORDER = ['preferred', 'whitelist'];

export const otherAppsIcon =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNNCA4aDRWNEg0djR6bTYgMTJoNHYtNGgtNHY0em0tNiAwaDR2LTRINHY0em0wLTZoNHYtNEg0djR6bTYgMGg0di00aC00djR6bTYtMTB2NGg0VjRoLTR6bS02IDRoNFY0aC00djR6bTYgNmg0di00aC00djR6bTAgNmg0di00aC00djR6IiBmaWxsPSIjYjBiMGIwIi8+PHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==';

/**
 * Returns a list containing the package names of all apps passed to the list.
 * @param {Array} list
 *
 * @return {String}
 */
const getPackageNames = (list) => {
  const arr = [];
  list.forEach((app) => arr.push(app.package_name));
  return arr;
};

/**
 * Returns whether or not an app exists in a list of apps.
 * @param {String} packageName
 * @param {Array} list Array of apps.
 *
 * @return {Boolean}
 */
export const doesAppExist = (packageName, list) =>
  getPackageNames(list).indexOf(packageName) >= 0;

/**
 * Returns the list of all non-blacklisted apps.
 *
 * @return {Array}
 */
const getUsableApps = () => {
  let apps = [];

  UPI_APPS_ORDER.forEach((group) => {
    apps = _Arr.merge(UPI_APPS[group], apps);
  });

  return apps;
};

/**
 * Returns the list of all apps.
 *
 * @return {Array}
 */
const getAllApps = () => {
  let apps = [];

  Object.keys(UPI_APPS).forEach((group) => {
    apps = _Arr.merge(UPI_APPS[group], apps);
  });

  return apps;
};

export const isPreferredApp = (packageName) =>
  doesAppExist(packageName, UPI_APPS.preferred);

/**
 * Returns a list of sorted apps to use.
 * @param {Array} allApps `getUPIIntentApps().filtered`
 *
 * @return {Array}
 */
export const getSortedApps = (allApps) => {
  allApps = _Obj.clone(allApps);

  const isAppInstalled = (package_name) =>
    allApps.some((app) => app.package_name === package_name);

  // Get list of package names
  let usableApps = getUsableApps();

  allApps.forEach((app, i) => {
    const appConfig = _Arr.find(usableApps, (usableApp) => {
      if (app.package_name) {
        return app.package_name === usableApp.package_name;
      } else if (app.shortcode) {
        return app.shortcode === usableApp.shortcode;
      }
      return false;
    });

    if (appConfig) {
      allApps[i] = _Obj.extend(allApps[i], appConfig);
    }
  });

  // Filter out apps which are installed, but the user isn't registered on them.
  // The check is only performed if verify_registration is true for the app.
  // See UPI_APPS.whitelist.
  if (CheckoutBridge && CheckoutBridge.isUserRegisteredOnUPI) {
    usableApps = _Arr.filter(usableApps, (app) => {
      // Only check for user registration if app is installed.
      if (app.verify_registration && isAppInstalled(app.package_name)) {
        return CheckoutBridge.isUserRegisteredOnUPI(app.package_name);
      }
      return true;
    });
  }

  const usablePackages = _Arr.map(usableApps, (app) => app.package_name);

  // Remove blacklisted apps
  allApps = _Arr.filter(
    allApps,
    (app) => usablePackages.indexOf(app.package_name) >= 0
  );
  allApps = allApps.map((item) => {
    const currDowntime = checkDowntime(
      getDowntimes().upi,
      'psp',
      item.shortcode
    );
    if (currDowntime) {
      item.downtimeSeverity = currDowntime;
      item.downtimeInstrument = item.shortcode;
    }
    return item;
  });

  // Sort remaining apps
  _Arr.sort(
    allApps,
    (a, b) =>
      usablePackages.indexOf(a.package_name) -
      usablePackages.indexOf(b.package_name)
  );

  return allApps;
};

/**
 * Looks for apps that are not known to Checkout and reports them.
 * @param {Array} allApps
 */
export const findAndReportNewApps = (allApps) => {
  const usablePackages = _Arr.map(getUsableApps(), (app) => app.package_name);
  const blacklistedPackages = _Arr.map(
    UPI_APPS.blacklist,
    (app) => app.package_name
  );

  allApps.forEach((app) => {
    if (
      usablePackages.indexOf(app.package_name) < 0 &&
      blacklistedPackages.indexOf(app.package_name) < 0
    ) {
      Analytics.track('upi:unreported_app', {
        data: {
          app_name: app.app_name,
          package_name: app.package_name,
        },
      });
    }
  });
};

/**
 * Returns number of apps by category.
 * @param {Array} allApps
 *
 * @return {Object}
 */
export const getNumberOfAppsByCategory = (allApps) => {
  const count = {};
  const existingPackages = _Arr.map(allApps, (app) => app.package_name);

  _Obj.loop(UPI_APPS, (apps, key) => {
    count[key] = _Arr.filter(
      apps,
      (app) => existingPackages.indexOf(app.package_name) >= 0
    ).length;
  });

  return count;
};

/**
 * get upi app data from handle
 *
 * @param {String} handle eg. okaxis, ybl
 *
 * @returns string url to the app icon
 */
export const getUPIAppDataFromHandle = (handle) => {
  const allUsableApps = getUsableApps();

  return (
    _Arr.find(allUsableApps, (app) => {
      return app.handles && _Arr.contains(app.handles, handle);
    }) || {}
  );
};

/**
 * Track failure of UPI intent.
 *
 * @param {String} packageName
 */
export const trackUPIIntentFailure = (packageName) => {
  Analytics.track('upi:app:intent:cancel', {
    data: {
      package_name: packageName,
    },
  });
};

/**
 * Track app visibility in UPI intent apps list.
 * Only Truecaller is tracked for now.
 * @param {Array} allApps
 */
export const trackAppImpressions = (allApps) => {
  if (_Arr.find(allApps, (app) => app.package_name === 'com.truecaller')) {
    Analytics.track('upi:app:truecaller:show');
  }
};

export const upiBackCancel = {
  '_[method]': 'upi',
  '_[flow]': 'intent',
  '_[reason]': 'UPI_INTENT_BACK_BUTTON',
};

export const suggestionVPA = [
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
