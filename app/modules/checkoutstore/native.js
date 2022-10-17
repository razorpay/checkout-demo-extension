import { Track } from 'analytics';
import { getSortedApps } from 'common/upi';
import {
  getCardApps as getSortedCardApps,
  getAppsForMethod,
} from 'common/apps';
import * as ObjectUtils from 'utils/object';
import { BUILD_NUMBER } from 'common/constants';
import { appsThatSupportWebPayments } from 'common/webPaymentsApi';
import { getPreferences } from 'razorpay';
import { android } from 'common/useragent';
import * as _ from 'utils/_';

let message;
let cardApps = { all: getAppsForMethod('card') };

// Store queryParams while bootstrapping as query params could change?
let qpmap = _.getQueryParams();

let upiApps = { all: [], filtered: [] };

/**
 * Sets the list of apps.
 *
 * TODO: Extend the list under `all` and `filtered`,
 *       instead of resetting it every time.
 *
 * @param {Array<Object>} apps
 */
export function setUpiApps(apps) {
  const sortedApps = getSortedApps(apps);

  // Have a unique check in place
  let filteredUniqueApps = sortedApps.reduce((pV, cV) => {
    const allPackageNames = pV.map((app) => app.package_name);
    if (allPackageNames.includes(cV.package_name)) {
      return pV;
    }
    return [...pV, cV];
  }, []);
  const unusedApps = apps.filter(
    (app) =>
      !filteredUniqueApps.find(
        (filteredApp) => filteredApp.package_name === app.package_name
      )
  );

  try {
    if (isUpiUxExperimentSupported('variant_1')) {
      filteredUniqueApps = filteredUniqueApps.filter((a) =>
        appsThatSupportWebPayments.some(
          (b) => a.package_name === b.package_name
        )
      );
    }
    if (shouldAppsReorder()) {
      filteredUniqueApps = upiAppsReorderByPreference(filteredUniqueApps);
    }
  } catch (error) {}

  upiApps = {
    all: [...filteredUniqueApps, ...unusedApps],
    filtered: filteredUniqueApps,
  };
}

/**
 * Get SDK metadata
 * @returns {{library: (string), version: (string), platform: (string)}}
 */
export function getSDKMeta() {
  const iOSPlatform = ObjectUtils.get(
    window,
    'webkit.messageHandlers.CheckoutBridge'
  );
  if (iOSPlatform) {
    return {
      platform: 'ios',
    };
  }
  return {
    platform: qpmap.platform || 'web',
    library: 'checkoutjs',
    // eslint-disable-next-line no-undef
    version: (qpmap.version || BUILD_NUMBER) + '',
  };
}

export function getUPIIntentApps() {
  return upiApps;
}

export function getCardApps() {
  return cardApps;
}

const messageTransformers = {
  addOptions: (transfomed, message) => {
    transfomed.options = ObjectUtils.clone(message.options);
  },

  addFeatures: (transfomed, message) => {
    const features = [
      'activity_recreated',
      'embedded',
      'params',
      'pdf_download_supported',
    ];
    const options = message.options;

    ObjectUtils.loop(features, (feature) => {
      if (!_.isUndefined(message[feature])) {
        transfomed[feature] = message[feature];
      }
    });

    /* Share link option on ePOS App */
    if (options && options.epos_build_code >= 3) {
      transfomed.epos_share_link = true;
    }
  },

  addExternalSdks: (transfomed, message) => {
    if (_.isNonNullObject(message.external_sdks)) {
      transfomed.hasAmazonpaySdk = message.external_sdks.amazonpay;
      transfomed.hasGooglePaySdk = message.external_sdks.googlepay;

      /**
       * NOTE:
       * Razorpay android SDK(version: > 1.6.11) ships with new wrapper code for google-pay,
       * i.e, Razorpay SDK(version: > 1.6.11) = SDK code + Wrapper Library v2 code
       * For Google pay cards, we had to release a Google pay wrapper v1 separately, that
       * was used along with Razorpay SDK to communicate with Google pay SDK and support
       * google pay cards feature on checkout. But now, when google pay cards and UPI is
       * merged (calling it merged flow) we decided to not ship a separate wrapper library v2
       * and decided to put the code that we would have put in wrapper lib v2 in Razorpay SDK itself
       * The following code is only for the back support for merchants using
       *      - google-pay wrapper library v1 (old)
       *      - have not upgraded to the newer Razorpay sdk.
       * We are doing this so that the existing implementation of UPI half screen flow doesn't break
       * because UPI half screen payment also happens with Google pay SDK and is being used by few merchants.
       * This new Razorpay SDK has parameter (since the involvement of Wrapper Library v2 code)
       *      - `googlepay_wrapper_version` which can contain '2' or 'both' as values
       *          (can't send 1 because wrapper lib v1 is already released, so can't update now)
       *      - `external_sdks.googlepay` will  always be `true` when wrapper v1 is present
       * For older versions of Razorpay SDK
       *      - `googlepay_wrapper_version` will be `undefined` for the older sdk version when
       *         wrapper library v1 is not present
       */
      if (['2', 'both'].includes(message.googlepay_wrapper_version)) {
        transfomed.googlePayWrapperVersion = message.googlepay_wrapper_version;
      } else if (message.external_sdks.googlepay) {
        transfomed.googlePayWrapperVersion = '1';
      } else {
        transfomed.googlepay_wrapper_version = null;
      }
    }
    // Build filtered cardApps array after getting the available external sdks
    // Because some apps might have external dependencies.
    cardApps.all = getSortedCardApps(
      getSDKMeta(),
      message.external_sdks,
      message.uri_data
    );
  },

  addSmsHash: (o, message) => {
    if (message.sms_hash) {
      o.sms_hash = message.sms_hash;
    }
  },

  addUpiIntentsData: (transfomed, message) => {
    // @TODO: update better names for these variables
    if (message.upi_intents_data && message.upi_intents_data.length) {
      // TODO: Send from here itself
      setUpiApps(message.upi_intents_data);
    }
  },

  addPreviousData: (transfomed, message) => {
    let data = message.data;
    if (data) {
      if (_.isString(data)) {
        try {
          data = JSON.parse(data);
        } catch (e) {}
      }
      if (_.isNonNullObject(data)) {
        transfomed.data = data;
      }
    }
  },

  useTrackingProps: (transfomed, message) => {
    let props = ['referer', 'integration'];

    ObjectUtils.loop(props, (prop) => {
      if (!_.isUndefined(message[prop])) {
        Track.props[prop] = message[prop];
      }
    });
  },
};

export function processNativeMessage(_message) {
  message = {};
  ObjectUtils.loop(messageTransformers, (fn) => fn(message, _message));
  return message;
}

export function isUpiUxExperimentSupported(variantName = null) {
  try {
    const sdkMeta = getSDKMeta();
    const supportedPlatform =
      (sdkMeta.platform === 'web' && android) ||
      sdkMeta.platform === 'android' ||
      sdkMeta.platform === 'ios';

    if (!supportedPlatform) {
      return false;
    }

    if (variantName && variantName === getPreferences('experiments.upi_ux')) {
      return true;
    }
    if (
      !variantName &&
      (getPreferences('experiments.upi_ux') === 'variant_1' ||
        getPreferences('experiments.upi_ux') === 'variant_2')
    ) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

function shouldAppsReorder() {
  const sdkMeta = getSDKMeta();
  if (isUpiUxExperimentSupported()) {
    return true;
  } else if (sdkMeta.platform === 'android') {
    return true;
  }
  return false;
}

const APP_PREFERENCE_ORDER = ['phonepe', 'google_pay', 'paytm', 'bhim'];
function upiAppsReorderByPreference(paymentApps) {
  let preferredApp = [];
  APP_PREFERENCE_ORDER.forEach((appShortCode) => {
    const app = paymentApps.find((app) => app.shortcode === appShortCode);
    if (app) {
      preferredApp.push(app);
    }
  });
  return [
    ...preferredApp,
    ...paymentApps.filter((app) => preferredApp.indexOf(app) === -1),
  ];
}
