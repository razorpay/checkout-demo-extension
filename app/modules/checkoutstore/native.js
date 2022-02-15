import { Track } from 'analytics';
import { getSortedApps } from 'common/upi';
import {
  getCardApps as getSortedCardApps,
  getAppsForMethod,
} from 'common/apps';

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
  const filteredUniqueApps = sortedApps.reduce((pV, cV) => {
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
  const iOSPlatform = _Obj.getSafely(
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
    version: (qpmap.version || __BUILD_NUMBER__ || 0) + '',
  };
}

export function getUPIIntentApps() {
  return upiApps;
}

export function getCardApps() {
  return cardApps;
}

export function processNativeMessage(_message) {
  message = {};
  messageTransformers |> _Obj.loop((fn) => fn(message, _message));
  return message;
}

const messageTransformers = {
  addOptions: (transfomed, message) => {
    transfomed.options = _Obj.clone(message.options);
  },

  addFeatures: (transfomed, message) => {
    const features = ['activity_recreated', 'embedded', 'params'];
    const options = message.options;

    _Obj.loop(features, (feature) => {
      if (!(message[feature] |> _.isUndefined)) {
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
    var data = message.data;
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
    var props = ['referer', 'integration'];

    _Obj.loop(props, (prop) => {
      if (!(message[prop] |> _.isUndefined)) {
        Track.props[prop] = message[prop];
      }
    });
  },
};
