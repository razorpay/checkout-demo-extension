import RazorpayConfig from 'common/RazorpayConfig';
import { getInternationalAppsConfig } from 'common/international';
import * as _ from 'utils/_';

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
  ...getInternationalAppsConfig(),
};

export const getProvider = (code) => providers[code] || {};

export const getAppsForMethod = (method) => {
  switch (method) {
    case 'card':
      return [providers.google_pay.code, providers.cred.code];
    case 'international':
      return [
        providers.trustly,
        providers.poli,
        providers.sofort,
        providers.giropay,
      ];
    default:
      return [];
  }
};

export function getCardApps(sdkMeta, externalSDKs, uriData) {
  const apps = getAppsForMethod('card').map(getProvider);
  const filteredApps = apps.filter((app) => {
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
      if (global.CheckoutBridge && global.CheckoutBridge.isUserRegistered) {
        const check = {
          method: 'card',
          code: app.code,
        };
        if (!global.CheckoutBridge.isUserRegistered(JSON.stringify(check))) {
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
      const appData = uriData.find((p) => app.code === p.shortcode);
      if (!appData || appData.uri !== app.uri) {
        return false;
      }
    }

    // All the checks passed, include this app.
    return true;
  });

  return filteredApps.map((app) => app.code);
}
