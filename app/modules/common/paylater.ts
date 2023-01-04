import * as ErrorService from 'error-service';
import * as ObjectUtils from 'utils/object';
import {
  config,
  prefix,
  sqPrefix,
  PAYLATER_ORDER,
  defaultConfig,
} from 'ui/tabs/paylater/constants';
import type { ErrorParam } from 'error-service/types';
import type { PaylaterUpdatedConfig } from 'common/types/types';
import type { Provider } from 'ui/tabs/paylater/types';

/**
 * Create an provider object for rendering on PayLater screen.
 * @param {String} code
 * @param {String} title
 *
 * @return {Object}
 */
export const createProvider = (code: Provider, title: string) => {
  return {
    data: {
      code,
    },
    icon: 'https://cdn.razorpay.com/paylater-sq/' + code + '.svg',
    title,
  };
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

export const getProvider = (code: Provider) => providers[code];

/**
 * Extends the config of the given with the updated config
 * @param {string} provider Provider code
 * @param {Object} updatedConfig Config to update
 *
 * @return {Object} New config of the provider
 */
export const extendConfig = (
  provider: Provider,
  updatedConfig: PaylaterUpdatedConfig
) => {
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
export const getImageUrl = (provider: Provider): string => {
  try {
    const { logo } = getProvider(provider);
    return logo;
  } catch (error) {
    ErrorService.capture(error as ErrorParam, {
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
export const getPayLaterProvidersDisplayNames = (providers: Provider[]) => {
  try {
    return PAYLATER_ORDER.filter((provider) =>
      providers.includes(provider)
    ).map((provider) => getProvider(provider)?.display_name);
  } catch (error) {
    ErrorService.capture(error as ErrorParam, {
      severity: ErrorService.SEVERITY_LEVELS.S3,
    });
    const defaultProviders = providers.map((p) => getProvider(p)?.display_name);
    return defaultProviders;
  }
};
