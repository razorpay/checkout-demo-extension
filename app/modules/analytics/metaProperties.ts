export default {
  LOGGEDIN: 'loggedIn',
  DOWNTIME_ALERTSHOWN: 'downtime.alertShown',
  DOWNTIME_CALLOUTSHOWN: 'downtime.calloutShown',
  TIME_SINCE_OPEN: 'timeSince.open',
  TIME_SINCE_INIT_IFRAME: 'timeSince.initIframe',
  NAVIGATOR_LANGUAGE: 'navigator.language',
  NETWORK_TYPE: 'network.type',
  NETWORK_DOWNLINK: 'network.downlink',
  SDK_PLATFORM: 'sdk.platform',
  SDK_VERSION: 'sdk.version',
  BRAVE_BROWSER: 'brave_browser',
  AFFORDABILITY_WIDGET_FID: 'affordability_widget_fid',
  REWARD_IDS: 'reward_ids',
  REWARD_EXP_VARIANT: 'reward_exp_variant',
  FEATURES: 'features',
  MERCHANT_ID: 'merchant_id',
  MERCHANT_KEY: 'merchant_key',
  OPTIONAL_CONTACT: 'optional.contact',
  OPTIONAL_EMAIL: 'optional.email',
  P13N: 'p13n',
  P13N_USERIDENTIFIED: 'p13n.userIdentified',
  P13N_EXPERIMENT: 'p13n.experiment',
  /** user has saved card {Boolean} */
  HAS_SAVED_CARDS: 'has.savedCards',
  /** Store Saved Card Count {Number} */
  SAVED_CARD_COUNT: 'count.savedCards',

  HAS_SAVED_ADDRESSES: 'has.savedAddresses',

  /** does user have saved card - added during status check API {Boolean} */
  HAS_SAVED_CARDS_STATUS_CHECK: 'hasSavedCards',
  /** AVS FORM DATA */
  AVS_FORM_DATA: 'avsFormData',
  /** NVS FORM DATA */
  NVS_FORM_DATA: 'nvsFormData',
  RTB_EXPERIMENT_VARIANT: 'rtb_experiment_variant',
  CUSTOM_CHALLAN: 'custom_challan',
  /** does user has affordablility widget enabled - depends on whether affordability fingerprint id is there */
  IS_AFFORDABILITY_WIDGET_ENABLED: 'is_affordability_widget_enabled',
  DCC_DATA: 'dccData',
} as const;
