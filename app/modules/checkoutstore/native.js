import Track from 'tracker';
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
    const allPackageNames = pV.map(app => app.package_name);
    if (allPackageNames.includes(cV.package_name)) {
      return pV;
    }
    return [...pV, cV];
  }, []);
  const unusedApps = _Arr.filter(
    apps,
    app =>
      !_Arr.find(
        filteredUniqueApps,
        filteredApp => filteredApp.package_name === app.package_name
      )
  );

  upiApps = {
    all: _Arr.mergeWith(filteredUniqueApps, unusedApps),
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
  messageTransformers |> _Obj.loop(fn => fn(message, _message));
  return message;
}

const messageTransformers = {
  addOptions: (transfomed, message) => {
    transfomed.options = _Obj.clone(message.options);
  },

  addFeatures: (transfomed, message) => {
    const features = ['activity_recreated', 'embedded', 'params'];
    const options = message.options;

    _Obj.loop(features, feature => {
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

    _Obj.loop(props, prop => {
      if (!(message[prop] |> _.isUndefined)) {
        Track.props[prop] = message[prop];
      }
    });
  },
};
