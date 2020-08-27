import RazorpayConfig from 'common/RazorpayConfig';

const cdnUrl = RazorpayConfig.cdn;

const prefix = cdnUrl + 'cardless_emi/';
const sqPrefix = cdnUrl + 'cardless_emi-sq/';

const config = {
  bajaj: {
    name: 'Bajaj Finserv',
  },
  earlysalary: {
    name: 'EarlySalary',
  },
  zestmoney: {
    name: 'ZestMoney',
    min_amount: 90000,
  },
  flexmoney: {
    name: 'Cardless EMI by InstaCred',
    headless: false,
  },
};

/**
 * Create an provider object for rendering on Cardless EMI screen.
 * @param {String} code
 *
 * @return {Object}
 */
export const createProvider = code => ({
  data: {
    code,
  },
  icon: 'https://cdn.razorpay.com/cardless_emi-sq/' + code + '.svg',
});

// Generate provider config
const defaultConfig = {
  min_amount: 300000,
  headless: true, // Like PowerWallet, we have a direct integration with them and do not need to open a popup,
  fee_bearer_customer: true, // Allow for `fee-bearer: true` merchants?
};

const providers = _Obj.map(config, (details, code) => {
  return (
    {}
    |> _Obj.extend(defaultConfig)
    |> _Obj.extend({
      code,
      logo: prefix + code + '.svg',
      sqLogo: sqPrefix + code + '.svg',
    })
    |> _Obj.extend(details)
  );
});

export const getProvider = code => providers[code] || {};

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

  providers[provider] = _Obj.extend(providers[provider], updatedConfig);

  return providers[provider];
};

/**
 * Returns the eligible Cardless EMI providers
 * @param {number} amount
 * @param {Object} enabledProviders Providers enabled from API
 *
 * @returns {Object}
 */
export function getEligibleProvidersBasedOnMinAmount(amount, enabledProviders) {
  const eligible = {};

  if (!enabledProviders) {
    return eligible;
  }

  _Obj.loop(enabledProviders, (enabled, provider) => {
    if (
      enabledProviders[provider] &&
      providers[provider] &&
      providers[provider].min_amount <= amount
    ) {
      eligible[provider] = getProvider(provider);
    }
  });

  return eligible;
}

/**
 * Returns the eligible Cardless EMI providers for customer fee bearer
 * @param {number} amount
 * @param {Object} enabledProviders
 *
 * @returns {Object}
 */
export function getEligibleProvidersForFeeBearerCustomer(providers) {
  let eligible = {};

  Object.keys(providers).forEach(provider => {
    if (providers[provider].fee_bearer_customer) {
      eligible[provider] = providers[provider];
    }
  });

  return eligible;
}

/**
 * Tells if the provider is headless.
 * @param {string} provider Provider Code
 *
 * @returns {boolean}
 */
export const isProviderHeadless = provider => {
  const { headless } = getProvider(provider);

  return Boolean(headless);
};

/**
 * Returns the image url fot the given cardless EMI provider
 * @param {string} provider
 * @returns {string}
 */
export const getImageUrl = provider => {
  const { logo } = getProvider(provider);
  return logo;
};
