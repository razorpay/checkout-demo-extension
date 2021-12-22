/* global CheckoutBridge */

import RazorpayConfig from 'common/RazorpayConfig';

const cdnUrl = RazorpayConfig.cdn;

const providers = {
  google_pay: {
    code: 'google_pay',
    logo: cdnUrl + 'app/googlepay.svg',
    card_logo: cdnUrl + 'card/googlepay.svg',
    verify_registration: true,
    externalSDK: 'googlepay',
    isCompatibleWithSDK: ({ platform }) => {
      return platform === 'android';
    },
  },
  cred: {
    code: 'cred',
    logo: cdnUrl + 'checkout/cred.png',
    uri: 'credpay', // credpay://
    package_name: 'com.dreamplug.androidapp',
    isCompatibleWithSDK: ({ platform }) => {
      return platform === 'android' || platform === 'ios';
    },
  },
  // international provider
  trustly: {
    code: 'trustly',
    logo: cdnUrl + 'international/trustly.png',
    uri: '',
    package_name: '',
    isCompatibleWithSDK: ({ platform }) => {
      return platform === 'android' || platform === 'ios';
    },
  },
};

export const getProvider = (code) => providers[code] || {};

export const getAppsForMethod = (method) => {
  switch (method) {
    case 'card':
      return [providers.google_pay.code, providers.cred.code];
    case 'international':
      return [providers.trustly];
    default:
      return [];
  }
};

export function getCardApps(sdkMeta, externalSDKs, uriData) {
  const apps = getAppsForMethod('card') |> _Arr.map(getProvider);
  const filteredApps = _Arr.filter(apps, (app) => {
    if (app.externalSDK) {
      if (!_.isNonNullObject(externalSDKs)) {
        return false;
      } else if (!externalSDKs[app.externalSDK]) {
        // Filter out this app as the required external SDK is not available.
        return false;
      }
    }

    if (app.isCompatibleWithSDK && !app.isCompatibleWithSDK(sdkMeta)) {
      // Filter out this app as current platform or version is not compatible.
      return false;
    }

    // Check if app requires user registration
    if (app.verify_registration) {
      if (CheckoutBridge && CheckoutBridge.isUserRegistered) {
        const check = {
          method: 'card',
          code: app.code,
        };
        if (!CheckoutBridge.isUserRegistered(JSON.stringify(check))) {
          // Filter out this app as user is not registered.
          return false;
        }
      } else {
        return false;
      }
    }

    // Check if app is installed
    if (app.uri) {
      if (!uriData || !uriData.length) {
        return false;
      }
      const appData = _Arr.find(uriData, (p) => app.code === p.shortcode);
      if (!appData || appData.uri !== app.uri) {
        return false;
      }
    }

    // All the checks passed, include this app.
    return true;
  });

  return filteredApps |> _Arr.map((app) => app.code);
}
