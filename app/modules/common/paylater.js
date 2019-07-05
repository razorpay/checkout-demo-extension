import { RazorpayConfig } from 'common/Razorpay';

const cdnUrl = RazorpayConfig.cdn;

const prefix = cdnUrl + 'paylater/';
const sqPrefix = cdnUrl + 'paylater-sq/';

const config = {
  epaylater: {
    name: 'ePayLater',
  }
};

/**
 * Create an provider object for rendering on PayLater screen.
 * @param {String} code
 * @param {String} title
 *
 * @return {Object}
 */
export const createProvider = (code, title) => ({
  data: {
    code,
  },
  // icon: 'https://cdn.razorpay.com/paylater-sq/' + code + '.svg',
  icon: 'https://www.epaylater.in/assets/LogoWithCircle.svg', // TODO: upload logo on cdn
  title,
});

// Generate provider config
const defaultConfig = {
  min_amount: 300000,
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

export const getProvider = code => providers[code];

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
    if (providers[provider] && providers[provider].min_amount <= amount) {
      eligible[provider] = true;
    }
  });

  return eligible;
}
