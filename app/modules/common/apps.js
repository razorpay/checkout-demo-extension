/* global CheckoutBridge */

import RazorpayConfig from 'common/RazorpayConfig';

const cdnUrl = RazorpayConfig.cdn;

const providers = {
  google_pay_cards: {
    code: 'google_pay_cards',
    logo: cdnUrl + 'app/googlepay.svg',
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
};

export const getProvider = code => providers[code] || {};

export const getAppsForMethod = method => {
  switch (method) {
    case 'card':
      return [providers.google_pay_cards.code, providers.cred.code];
    default:
      return [];
  }
};

export function getCardApps(sdkMeta, externalSDKs, uriData) {
  const apps = getAppsForMethod('card') |> _Arr.map(getProvider);
  const filteredApps = _Arr.filter(apps, app => {
    if (
      app.externalSDK &&
      _.isNonNullObject(externalSDKs) &&
      !externalSDKs[app.externalSDK]
    ) {
      // Filter out this app as the required external SDK is not available.
      return false;
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
      const appData = _Arr.find(uriData, p => app.code === p.shortcode);
      if (!appData || appData.uri !== app.uri) {
        return false;
      }
    }

    // All the checks passed, include this app.
    return true;
  });

  return filteredApps |> _Arr.map(app => app.code);
}
