import { VPA_REGEX } from 'common/constants';
import { getUPIAppDataFromHandle } from 'common/upi';
import { getUPIIntentApps } from 'checkoutstore/native';
import {
  getCustomerCountryISOCode,
  personalisationVersionId,
} from 'checkoutstore/screens/home';
import fetch from 'utils/fetch';
import { getAmount } from 'razorpay';
import { setRTBVariant } from 'rtb/helper';
import * as ObjectUtils from 'utils/object';
import * as _ from 'utils/_';

import { makeAuthUrl } from 'common/helper';
import { getSession } from 'sessionmanager';

import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import { isDesktop } from 'common/useragent';
import {
  isCustomerWithIntlPhone,
  getCustomerContactNumber,
} from 'common/international';

import { DEFAULT_PHONEPE_P13N_V2_INSTRUMENT } from './constants';
import { P13NTracker } from 'misc/analytics/events';

/**
 * this object is a key/value pair of contact and p13n api data
 * contact key contains the contact number and login status. [0]
 * value is p13n api response for a contact number
 *
 * [0] ->  key is a combination of contact and login status because p13n api response differ based on
 * whether customer is logged in or not. When a customer is logged in p13n block needs to be updated
 * If we don't split these 2 states as separate keys, i.e. by keeping only contact as key,
 * it will be a CACHE HIT and p13n block will not be updated when user state is switched to logged in and vice-versa.
 *
 */
const PREFERRED_INSTRUMENTS_CACHE = {};

const cacheKey = (customer) =>
  `${customer.contact}_${customer.logged ? 'LOGGED_IN' : 'LOGGED_OUT'}`;

export const removeDuplicateApiInstruments = (instruments) => {
  const result = [];

  instruments.forEach((instrument) => {
    const uniqueInstrumentsIds = result.map(
      (x) => x.method + '-' + x.instrument
    );
    const instrumentId = instrument.method + '-' + instrument.instrument;

    if (!uniqueInstrumentsIds.includes(instrumentId)) {
      result.push(instrument);
    }
  });

  if (result.length !== instruments.length) {
    Analytics.track('p13n:api_non_unique_error', {
      type: AnalyticsTypes.METRIC,
      data: {
        received: instruments.length,
        unique: result.length,
      },
    });
  }

  return result;
};

export const overrideAPIInstruments = (instruments) => {
  return instruments.map((instrument) => {
    if (
      instrument?.method === 'wallet' &&
      instrument.instrument === 'phonepe'
    ) {
      return DEFAULT_PHONEPE_P13N_V2_INSTRUMENT;
    }
    return instrument;
  });
};

/**
 * Sets instruments for customer
 * @param {Customer} customer
 * @param {Array<ApiInstrument>} instruments
 *
 * @returns {Promise<Object>>}
 *  @prop {boolean} identified
 *  @prop {Array<StorageInstrument>} instruments
 */
export function setInstrumentsForCustomer(
  customer,
  instruments,
  identified = true
) {
  const transformedInstruments = overrideAPIInstruments(instruments).map(
    (instrument) =>
      transformInstrumentToStorageFormat(instrument, {
        upiApps: getUPIIntentApps().filtered,
      })
  );

  PREFERRED_INSTRUMENTS_CACHE[cacheKey(customer)] = Promise.resolve({
    identified,
    instruments: transformedInstruments,
  });

  return getInstrumentsForCustomer(customer);
}

/**
 * Makes an API call to fetch instruments for the given customer
 * @param {Customer} customer
 *
 * @returns {Promise<Object>>}
 *  @prop {boolean} identified
 *  @prop {Array<StorageInstrument>} instruments
 */
function getInstrumentsFromApi(customer) {
  const session = getSession();

  const countryISOCode = getCustomerCountryISOCode();
  const isIntlPhone = isCustomerWithIntlPhone(countryISOCode);
  const customerContact = isIntlPhone
    ? getCustomerContactNumber(customer.contact)
    : customer.contact;

  const url = _.appendParamsToUrl(makeAuthUrl(session.r, 'personalisation'), {
    contact: customerContact,
    amount: getAmount(),
    country_code: countryISOCode.toLocaleLowerCase(),
  });

  const p13nFetchStart = new Date();
  P13NTracker.P13N_INITIATED();
  const promise = new Promise((resolve) => {
    fetch({
      url,
      callback: function (response) {
        personalisationVersionId.set(
          response?.preferred_methods?.[customerContact]?.versionID || ''
        );
        Analytics.track('p13n:api_data', {
          type: AnalyticsTypes.METRIC,
          data: {
            response,
            time: new Date() - p13nFetchStart,
          },
        });

        if (response.error) {
          P13NTracker.P13N_CALL_FAILED({
            error: {
              description: response.error?.description,
              category: response.error?.code,
            },
          });
        }

        // Empty objects are arrays in PHP
        if (_.isArray(response)) {
          response = {
            preferred_methods: {},
          };
        }

        const data = response.preferred_methods || {};
        setRTBVariant(response.rtb_experiment || {});
        trackP13nMeta(data);
        // default instruments may be provided based on the merchant and amount details

        const identified = !data.default;

        let apiInstrumentsData = data.default || {
          instruments: [],
        };

        // preference is given to customer specific data
        if (customer && customerContact) {
          apiInstrumentsData = data[customerContact] || apiInstrumentsData;
        }
        const apiInstruments = removeDuplicateApiInstruments(
          apiInstrumentsData.instruments
        );

        resolve(
          setInstrumentsForCustomer(customer, apiInstruments, identified)
        );
      },
    });
  });

  PREFERRED_INSTRUMENTS_CACHE[cacheKey(customer)] = promise;

  return promise;
}

/**
 * Returns instruments for customer
 * @param {Customer} customer
 *
 * @returns {Promise<Array<StorageInstrument>>}
 */
export function getInstrumentsForCustomer(customer) {
  const cached = PREFERRED_INSTRUMENTS_CACHE[cacheKey(customer)];

  if (cached) {
    return cached;
  }
  return getInstrumentsFromApi(customer);
}

function formatInstrumentByType(instrument, type, fallbackValue) {
  instrument[type] = instrument.instrument;
  // adding fallback only if present to preserve existing values for methods
  if (!instrument[type] && fallbackValue) {
    instrument[type] = fallbackValue;
  }
  delete instrument.instrument;
}

// changes needed to translate api format instruments to storage format
// instrument.instrument contains the primary payment instrument data
const API_INSTRUMENT_PAYMENT_ADDONS = {
  upi: (instrument) => {
    if (!instrument.instrument) {
      // API sends null
      // Keep a sanity value allow this to go forward.
      // The filtering logic in filters.js will remove this instrument.
      instrument.instrument = '';
      return;
    }

    formatInstrumentByType(instrument, 'vpa');
    const validVpa = VPA_REGEX.test(instrument.vpa);
    if (validVpa) {
      // valid collect instrument
      instrument['_[flow]'] = 'directpay';
    } else {
      // if not a valid vpa, the instrument is expected to be an intent app handle (@okaxis, @ybl)
      const app = getUPIAppDataFromHandle(instrument.vpa?.slice(1));
      if (app.package_name) {
        instrument['_[flow]'] = 'intent';
        instrument['upi_app'] = app.package_name;

        // to show intent instrument on desktop `vendor_vpa` is used to diffrentiate
        // from normal intent instrument that'd only show on phone
        if (isDesktop()) {
          instrument['vendor_vpa'] = instrument.vpa;
        }
      } else {
        // If no valid app is found for the handle, track it
        Analytics.track('p13n:app_missing_for_handle', {
          type: AnalyticsTypes.METRIC,
          data: {
            instrument: instrument,
          },
        });
      }
    }
  },
  wallet: (instrument) => {
    formatInstrumentByType(instrument, 'wallet');
  },
  netbanking: (instrument) => {
    formatInstrumentByType(instrument, 'bank');
  },
  fpx: (instrument) => {
    formatInstrumentByType(instrument, 'bank');
  },
  card: (instrument) => {
    // Use a dummy value if API returns `null` as this value needs to be truthy to
    // act as a saved card instrument
    formatInstrumentByType(instrument, 'token_id', 'token_dummy');
  },
  app: (instrument) => {
    formatInstrumentByType(instrument, 'provider');
  },
  cardless_emi: (instrument) => {
    formatInstrumentByType(instrument, 'provider');
  },
  intl_bank_transfer: (instrument) => {
    formatInstrumentByType(instrument, 'provider');
  },
};

// EMI is the same as Card
API_INSTRUMENT_PAYMENT_ADDONS.emi = API_INSTRUMENT_PAYMENT_ADDONS.card;

/**
 * To consume the backend representation of the p13n instruments, we need to, currently, convert them into the existing, supported p13n instrument format which is consumed in configurability.
 * With this, the translation flow looks like Backend format -> localStorage format -> Configurability, which seems fine in the short run.
 * In the longer run though, when we decide to deprecate v1, it should get consumed directly by configurability.
 * @param {Object} instrument An instrument recieved from the api
 * @param {Object} data Any extra data that is needed to transform
 */
export function transformInstrumentToStorageFormat(instrument, data = {}) {
  if (API_INSTRUMENT_PAYMENT_ADDONS[instrument.method]) {
    API_INSTRUMENT_PAYMENT_ADDONS[instrument.method](instrument, data);
  } else {
    // if an instrument cannot be transformed to a format supported by FE, return undefined
    return undefined;
  }
  return instrument;
}

export function trackP13nMeta(data) {
  // sanity checkout for missing data
  if (!data) {
    return;
  }
  const eventData = [];
  //adding eventDataV2 for analytics revamp
  const eventDataV2 = {};
  ObjectUtils.loop(
    data,
    (
      {
        instruments,
        is_customer_identified,
        user_aggregates_available,
        versionID,
      },
      contact
    ) => {
      if (instruments) {
        eventData.push({
          contact,
          is_customer_identified,
          user_aggregates_available,
          versionID,
          count: instruments && instruments.length,
        });
        eventDataV2.versionID = versionID;
        eventDataV2.instruments = instruments.reduce((list, item, index) => {
          list[index] = {
            method: { name: item.method },
          };
          return list;
        }, {});
      }
    }
  );
  Analytics.track('p13n:api_data_meta', {
    type: AnalyticsTypes.METRIC,
    data: {
      instrument_data_meta: eventData,
    },
  });
  P13NTracker.P13N_RESPONSE(eventDataV2);
}
