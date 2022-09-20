import RazorpayConfig from 'common/RazorpayConfig';
import * as ErrorService from 'error-service';
import * as ObjectUtils from 'utils/object';

const cdnUrl = RazorpayConfig.cdn;

const prefix = cdnUrl + 'paylater/';
const sqPrefix = cdnUrl + 'paylater-sq/';

const config = {
  epaylater: {
    name: 'ePayLater',
    display_name: 'ePayLater',
  },
  getsimpl: {
    name: 'Simpl',
    display_name: 'Simpl',
  },
  icic: {
    name: 'ICICI Bank PayLater',
    display_name: 'ICICI',
  },
  hdfc: {
    name: 'FlexiPay by HDFC Bank',
    display_name: 'FlexiPay',
  },
  lazypay: {
    name: 'LazyPay',
    display_name: 'LazyPay',
  },
  kkbk: {
    name: 'kkbk',
    display_name: 'Kotak Mahindra Bank',
  },
};

// Order in which the paylater providers should come
const PAYLATER_ORDER = [
  'getsimpl',
  'lazypay',
  'icic',
  'hdfc',
  'epaylater',
  'kkbk',
];

/**
 * Create an provider object for rendering on PayLater screen.
 * @param {String} code
 * @param {String} title
 *
 * @return {Object}
 */
export const createProvider = (code, title) => {
  return {
    data: {
      code,
    },
    icon: 'https://cdn.razorpay.com/paylater-sq/' + code + '.svg',
    title,
  };
};

// Generate provider config
const defaultConfig = {
  min_amount: 300000,
};

const providers = ObjectUtils.map(config, (details, code) => {
  return Object.assign(
    {},
    defaultConfig,
    {
      code,
      logo: prefix + code + '.svg',
      sqLogo: sqPrefix + code + '.svg',
    },
    details
  );
});

export const getProvider = (code) => providers[code];

/**
 * Extends the config of the given with the updated config
 * @param {string} provider Provider code
 * @param {Object} updatedConfig Config to update
 *
 * @return {Object} New config of the provider
 */
export const extendConfig = (provider, updatedConfig) => {
  if (!providers[provider]) {
    return;
  }

  providers[provider] = Object.assign(providers[provider], updatedConfig);

  return providers[provider];
};

/**
 * Returns the image URL for the given paylater provider
 * @param {string} provider
 * @returns {string}
 */
export const getImageUrl = (provider) => {
  try {
    const { logo } = getProvider(provider);
    return logo;
  } catch (error) {
    ErrorService.capture(error, {
      severity: ErrorService.SEVERITY_LEVELS.S3,
    });
    return '';
  }
};

/**
 * Returns the Display name for Paylater providers
 * Sorted by in the order of PAYLATER_ORDER
 * @param {Array<string>} providers
 * @returns {Array<string>}
 */
export const getPayLaterProvidersDisplayNames = (providers) => {
  try {
    return PAYLATER_ORDER.filter((provider) =>
      providers.includes(provider)
    ).map((provider) => getProvider(provider)?.display_name);
  } catch (error) {
    ErrorService.capture(error, {
      severity: ErrorService.SEVERITY_LEVELS.S3,
    });
    const defaultProviders = providers.map((p) => getProvider(p)?.display_name);
    return defaultProviders;
  }
};
