import RazorpayConfig from 'common/RazorpayConfig';

const cdnUrl = RazorpayConfig.cdn;

const prefix = cdnUrl + 'paylater/';
const sqPrefix = cdnUrl + 'paylater-sq/';

const config = {
  epaylater: {
    name: 'ePayLater',
  },
  getsimpl: {
    name: 'Simpl',
  },
  icic: {
    name: 'ICICI Bank PayLater',
  },
};

/**
 * Create an provider object for rendering on PayLater screen.
 * @param {String} code
 * @param {String} title
 *
 * @return {Object}
 */
export const createProvider = (code, title) => {
  // TODO: get icici.svg renamed to icic.svg and remove if condition
  let iconCode = code;

  if (code === 'icic') {
    iconCode = 'icici';
  }

  return {
    data: {
      code,
    },
    icon: 'https://cdn.razorpay.com/paylater-sq/' + iconCode + '.svg',
    title,
  };
};

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
 * Returns the image URL for the given paylater provider
 * @param {string} provider
 * @returns {string}
 */
export const getImageUrl = provider => {
  const { logo } = getProvider(provider);
  return logo;
};
