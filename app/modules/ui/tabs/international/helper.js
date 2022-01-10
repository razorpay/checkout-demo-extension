import {
  AVS_FORM_ADDRESS_LINE_1,
  AVS_FORM_ADDRESS_LINE_2,
  AVS_FORM_ZIP_CODE,
  AVS_FORM_COUNTRY,
  AVS_FORM_STATE,
  AVS_FORM_CITY,
  AVS_COUNTRY_ALL,
  AVS_COUNTRY_SEARCH_TITLE,
  AVS_STATE_SEARCH_TITLE,
  AVS_STATE_ALL,
} from 'ui/labels/card';

import { NVS_FIRST_NAME, NVS_LAST_NAME } from 'ui/labels/international';

import { makeAuthUrl } from 'common/helper';

import { toTitleCase } from 'lib/utils';

import Analytics, { Track } from 'analytics';

export const createNVSFormInputs = (t) => {
  return [
    [
      {
        id: 'first_name',
        placeholder: t(NVS_FIRST_NAME),
        required: true,
      },
      {
        id: 'last_name',
        placeholder: t(NVS_LAST_NAME),
        required: true,
      },
    ],
    {
      id: 'line1',
      placeholder: t(AVS_FORM_ADDRESS_LINE_1),
      required: true,
    },
    {
      id: 'line2',
      placeholder: t(AVS_FORM_ADDRESS_LINE_2),
    },
    [
      {
        id: 'city',
        placeholder: t(AVS_FORM_CITY),
        required: true,
      },
      {
        id: 'postal_code',
        placeholder: t(AVS_FORM_ZIP_CODE),
        required: true,
      },
    ],
    [
      {
        id: 'country',
        type: 'search',
        placeholder: t(AVS_FORM_COUNTRY),
        required: true,
      },
      {
        id: 'state',
        type: 'search',
        placeholder: t(AVS_FORM_STATE),
        required: true,
      },
    ],
  ];
};

export const createSearchModalProps = (t) => {
  return {
    country: {
      title: t(AVS_COUNTRY_SEARCH_TITLE),
      placeholder: t(AVS_COUNTRY_SEARCH_TITLE),
      data: [],
      keys: ['label'],
      all: t(AVS_COUNTRY_ALL),
    },
    state: {
      title: t(AVS_STATE_SEARCH_TITLE),
      placeholder: t(AVS_STATE_SEARCH_TITLE),
      keys: ['label'],
      data: [],
      all: t(AVS_STATE_ALL),
    },
  };
};

export const updateSearchModalCountries = (props, countries) => {
  if (countries && countries.length) {
    props.country.data = countries.map((country) => ({
      label: country.countryName,
      type: 'country',
      _key: country.countryCode,
    }));
  }
  return props;
};

export const updateSearchModalStates = (props, states) => {
  if (states && states.length) {
    props.state.data = states.slice(0).map((state) => ({
      label: state.stateName,
      _key: state.stateCode,
      type: 'state',
    }));
  }
  return props;
};

export const getAllCountries = (rzpInstance) => {
  let url = makeAuthUrl(rzpInstance, 'countries');

  const requestPayload = {
    '_[source]': Track.props.library,
  };

  url = _.appendParamsToUrl(url, requestPayload);

  return new Promise((resolve, reject) => {
    fetch({
      url,
      callback: (response) => {
        if (response.error) {
          Analytics.track('countries:fetch:failure', {
            data: {
              error: response.error,
            },
          });
          return reject(response.error);
        }

        resolve(
          response && Array.isArray(response)
            ? response.map((country) => {
                return {
                  countryName: toTitleCase(country.countryName),
                  countryCode: country.countryAlpha2Code.toUpperCase(),
                  countryAlpha3Code: country.countryAlpha3Code,
                };
              })
            : []
        );

        Analytics.track('countries:fetch:success', {
          data: {
            success: true,
          },
        });
      },
    });
  });
};

export const getStatesWithCountryCode = (rzpInstance, countryCode) => {
  let url = makeAuthUrl(rzpInstance, `states/${countryCode}`);

  const requestPayload = {
    '_[source]': Track.props.library,
  };

  url = _.appendParamsToUrl(url, requestPayload);

  return new Promise((resolve, reject) => {
    fetch({
      url,
      callback: (response) => {
        if (response.error) {
          Analytics.track('states:fetch:failure', {
            data: {
              countryCode,
              error: response.error,
            },
          });
          return reject(response.error);
        }

        resolve(
          response
            ? response.states.map((state) => {
                return {
                  stateName: toTitleCase(state.stateName),
                  stateCode: state.stateCode,
                };
              })
            : []
        );

        Analytics.track('states:fetch:success', {
          data: {
            countryCode,
            success: true,
          },
        });
      },
    });
  });
};

/**
 * Check if international providers are in preferred instrument.
 * @param {*} instrument
 * @returns boolean
 */
export const isInternationalInPreferredInstrument = (instrument = {}) => {
  const { method, providers = [] } = instrument;
  return (
    ['app', 'international'].includes(method) &&
    providers.length > 0 &&
    (providers.includes('trustly') || providers.includes('poli'))
  );
};

/**
 * Get provider name from instrument.
 * @param {*} instrument
 * @returns
 */
export const getInternationalProviderName = (instrument = {}) => {
  const { providers = [] } = instrument;
  return Array.isArray(providers) ? providers[0] : null;
};

/**
 * Update international providers method name to international
 * @param {*} instruments
 * @returns
 */
export const updateInternationalProviders = (instruments) => {
  return instruments.map((instrument) => {
    if (isInternationalInPreferredInstrument(instrument)) {
      instrument.method = 'international';
    }

    return instrument;
  });
};
