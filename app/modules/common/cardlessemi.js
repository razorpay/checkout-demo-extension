import { RazorpayConfig } from 'common/Razorpay';

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
  },
  flexmoney: {
    name: 'InstaCred Cardless EMI',
  },
};

/**
 * Create an provider object for rendering on Cardless EMI screen.
 * @param {String} code
 * @param {String} title
 *
 * @return {Object}
 */
export const createProvider = (code, title) => ({
  data: {
    code,
  },
  icon: 'https://cdn.razorpay.com/cardless_emi-sq/' + code + '.svg',
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
