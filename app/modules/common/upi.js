/* global CheckoutBridge */

import Analytics from 'analytics';
import { VPA_REGEX } from 'common/constants';

export const GOOGLE_PAY_PACKAGE_NAME = 'com.google.android.apps.nbu.paisa.user';

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
  const app = getAllApps() |> _Arr.find(app => app.shortcode === shortcode);

  if (app) {
    return app.package_name;
  }
}

const UPI_APPS = {
  /**
   * Preferred apps.
   * There are apps that were built for UPI.
   */
  preferred: [
    {
      app_name: 'Google Pay (Tez)',
      package_name: GOOGLE_PAY_PACKAGE_NAME,
      app_icon: 'https://cdn.razorpay.com/checkout/gpay.png',
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
    },
    {
      name: 'PayTM',
      app_name: 'PayTM UPI',
      package_name: 'net.one97.paytm',
      shortcode: 'paytm',
    },
    {
      package_name: 'in.org.npci.upiapp',
      shortcode: 'bhim',
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
    },
    {
      package_name: 'com.csam.icici.bank.imobile',
      shortcode: 'imobile',
    },
    {
      package_name: 'com.sbi.upi',
      shortcode: 'sbi',
    },
    {
      package_name: 'com.upi.axispay',
    },
    {
      package_name: 'com.samsung.android.spaymini',
    },
    {
      package_name: 'com.samsung.android.spay',
    },
    {
      package_name: 'com.snapwork.hdfc',
    },
    {
      package_name: 'com.fss.pnbpsp',
    },
    {
      package_name: 'com.icicibank.pockets',
    },
    {
      package_name: 'com.bankofbaroda.upi',
    },
    {
      package_name: 'com.freecharge.android',
    },
    {
      package_name: 'com.fss.unbipsp',
    },
    {
      package_name: 'com.axis.mobile',
    },
    {
      package_name: 'com.mycompany.kvb',
    },
    {
      package_name: 'com.fss.vijayapsp',
    },
    {
      package_name: 'com.dena.upi.gui',
    },
    {
      package_name: 'com.fss.jnkpsp',
    },
    {
      package_name: 'com.olive.kotak.upi',
    },
    {
      package_name: 'com.enstage.wibmo.hdfc',
    },
    {
      package_name: 'com.bsb.hike',
    },
    {
      package_name: 'com.fss.idfcpsp',
    },
    {
      package_name: 'com.YesBank',
    },
    {
      package_name: 'com.abipbl.upi',
    },
    {
      package_name: 'com.microsoft.mobile.polymer',
    },
    {
      package_name: 'com.finopaytech.bpayfino',
    },
    {
      package_name: 'com.mgs.obcbank',
    },
    {
      package_name: 'com.upi.federalbank.org.lotza',
    },
    {
      package_name: 'com.mgs.induspsp',
    },
    {
      package_name: 'ai.wizely.android',
    },
    {
      package_name: 'com.olive.dcb.upi',
    },
    {
      package_name: 'com.mgs.yesmerchantnative.prod',
    },
    {
      package_name: 'com.dbs.in.digitalbank',
    },
    {
      package_name: 'com.rblbank.mobank',
    },
    {
      package_name: 'in.chillr',
    },
    {
      package_name: 'com.citrus.citruspay',
    },
    {
      package_name: 'com.SIBMobile',
    },
    {
      package_name: 'in.amazon.mShop.android.shopping',
      shortcode: 'amazon',
    },
    {
      package_name: 'com.mipay.in.wallet',
    },
    {
      package_name: 'com.mipay.wallet.in',
    },
    {
      package_name: 'com.dreamplug.androidapp',
    },
    {
      package_name: 'in.bajajfinservmarkets.app',
    },
    {
      package_name: 'in.bajajfinservmarkets.app.uat',
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
  ],
};

/**
 * Order of apps.
 */
const UPI_APPS_ORDER = ['preferred', 'whitelist'];

export const otherAppsIcon =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNNCA4aDRWNEg0djR6bTYgMTJoNHYtNGgtNHY0em0tNiAwaDR2LTRINHY0em0wLTZoNHYtNEg0djR6bTYgMGg0di00aC00djR6bTYtMTB2NGg0VjRoLTR6bS02IDRoNFY0aC00djR6bTYgNmg0di00aC00djR6bTAgNmg0di00aC00djR6IiBmaWxsPSIjYjBiMGIwIi8+PHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==';

export const topUpiApps = [
  {
    text: 'Google Pay',
    icon: 'https://cdn.razorpay.com/app/googlepay.svg',
    id: 'gpay',
    psp: ['okhdfcbank', 'okicici', 'okaxis', 'oksbi'],
  },

  {
    text: 'PhonePe',
    icon: 'https://cdn.razorpay.com/app/phonepe.svg',
    id: 'phonepe',
    psp: 'ybl',
  },
  {
    text: 'BHIM',
    icon: 'https://cdn.razorpay.com/app/bhim.svg',
    id: 'bhim',
    psp: 'upi',
  },
  {
    text: 'Paytm',
    icon: 'https://cdn.razorpay.com/app/paytm.svg',
    id: 'paytm',
    psp: 'paytm',
  },
  {
    text: 'Airtel',
    icon: 'https://cdn.razorpay.com/app/airtel.svg',
    id: 'airtel',
    psp: 'airtel',
  },
  {
    text: 'Other Apps',
    icon: otherAppsIcon,
    id: null,
    psp: '',
  },
];

/**
 * Parses the response from UPI Intent.
 * @param {Object} intentResponse Response from Intent.
 *
 * @return {Object}
 */
export const parseUPIIntentResponse = intentResponse => {
  let response = {};

  if (intentResponse.response) {
    if (_.isNonNullObject(intentResponse.response)) {
      response = intentResponse.response;
    } else if (_.isString(intentResponse.response)) {
      // Convert the string response into a JSON object.
      let split = intentResponse.response.split('&');

      for (let i = 0; i < split.length; i++) {
        let pair = split[i].split('=');

        if (pair[1] === '' || pair[1] === 'undefined' || pair[1] === 'null') {
          response[pair[0]] = null;
        } else {
          response[pair[0]] = pair[1];
        }
      }
    }
  }

  return response;
};

/**
 * Tells whether the payment using UPI Intent was successful or not.
 * @param {Object} parsedResponse Parsed Intent Response from the PSP UPI app.
 *
 * @return {Boolean}
 */
export const didUPIIntentSucceed = parsedResponse =>
  Boolean(parsedResponse.txnId) ||
  (parsedResponse.Status || parsedResponse.status || '')
    .toLowerCase()
    .indexOf('suc') === 0;

/**
 * Returns a list containing the package names of all apps passed to the list.
 * @param {Array} list
 *
 * @return {String}
 */
const getPackageNames = list => {
  const arr = [];
  _Arr.loop(list, app => arr.push(app.package_name));
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

  _Arr.loop(UPI_APPS_ORDER, group => {
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

  _Arr.loop(_Obj.keys(UPI_APPS), group => {
    apps = _Arr.merge(UPI_APPS[group], apps);
  });

  return apps;
};

export const isPreferredApp = packageName =>
  doesAppExist(packageName, UPI_APPS.preferred);

/**
 * Returns a list of sorted apps to use.
 * @param {Array} allApps `upi_intents_data` from handleMessage, sent by Android SDK
 *
 * @return {Array}
 */
export const getSortedApps = allApps => {
  allApps = _Obj.clone(allApps);

  const isAppInstalled = package_name =>
    allApps.some(app => app.package_name === package_name);

  // Get list of package names
  let usableApps = getUsableApps();

  // Filter out apps which are installed, but the user isn't registered on them.
  // The check is only performed if verify_registration is true for the app.
  // See UPI_APPS.whitelist.
  if (CheckoutBridge && CheckoutBridge.isUserRegisteredOnUPI) {
    usableApps = _Arr.filter(usableApps, app => {
      // Only check for user registration if app is installed.
      if (app.verify_registration && isAppInstalled(app.package_name)) {
        return CheckoutBridge.isUserRegisteredOnUPI(app.package_name);
      }
      return true;
    });
  }

  const usablePackages = _Arr.map(usableApps, app => app.package_name);

  // Remove blacklisted apps
  allApps = _Arr.filter(
    allApps,
    app => usablePackages.indexOf(app.package_name) >= 0
  );

  // Sort remaining apps
  _Arr.sort(
    allApps,
    (a, b) =>
      usablePackages.indexOf(a.package_name) -
      usablePackages.indexOf(b.package_name)
  );

  // Transform apps to set new name (eg: WhatsApp => WhatsApp UPI).
  _Arr.loop(allApps, (app, i) => {
    const index = usablePackages.indexOf(app.package_name);

    allApps[i] = _Obj.extend(allApps[i], usableApps[index]);
  });

  return allApps;
};

/**
 * Looks for apps that are not known to Checkout and reports them.
 * @param {Array} allApps
 */
export const findAndReportNewApps = allApps => {
  const usablePackages = _Arr.map(getUsableApps(), app => app.package_name);
  const blacklistedPackages = _Arr.map(
    UPI_APPS.blacklist,
    app => app.package_name
  );

  _Arr.loop(allApps, app => {
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
export const getNumberOfAppsByCategory = allApps => {
  const count = {};
  const existingPackages = _Arr.map(allApps, app => app.package_name);

  _Obj.loop(UPI_APPS, (apps, key) => {
    count[key] = _Arr.filter(
      apps,
      app => existingPackages.indexOf(app.package_name) >= 0
    ).length;
  });

  return count;
};

const handleData = [
  {
    handles: ['okhdfcbank', 'okicici', 'okaxis', 'oksbi'],
    icon: 'https://cdn.razorpay.com/app/googlepay.svg',
    package_name: GOOGLE_PAY_PACKAGE_NAME,
  },
  {
    handles: ['ybl'],
    icon: 'https://cdn.razorpay.com/app/phonepe.svg',
  },
  {
    handles: ['icicibank'],
    icon: 'https://cdn.razorpay.com/app/whatsapp.svg',
  },
  {
    handles: ['upi'],
    icon: 'https://cdn.razorpay.com/app/bhim.svg',
  },
];

/**
 * get icon url from handle
 *
 * @param {String} handle eg. okaxis, ybl
 *
 * @returns string url to the app icon
 */
export const getUPIAppDataFromHandle = handle => {
  let data = {};
  handleData.forEach(handleSet => {
    if (_Arr.contains(handleSet.handles, handle)) {
      data = handleSet;
    }
  });

  return data;
};

/**
 * Track failure of UPI intent.
 *
 * @param {String} packageName
 */
export const trackUPIIntentFailure = packageName => {
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
export const trackAppImpressions = allApps => {
  if (_Arr.find(allApps, app => app.package_name === 'com.truecaller')) {
    Analytics.track('upi:app:truecaller:show');
  }
};

export const upiBackCancel = {
  '_[method]': 'upi',
  '_[flow]': 'intent',
  '_[reason]': 'UPI_INTENT_BACK_BUTTON',
};
