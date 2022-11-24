import { Events, MetaProperties } from 'analytics';
import { ContextProperties, EventsV2 } from 'analytics-v2';
import { contact, email } from 'checkoutstore/screens/home';
import {
  getExperimentsFromStorage,
  getRegisteredExperiments,
} from 'experiments';
import { getAmount, getOrderId } from 'razorpay';
import type { CustomObject } from 'types';
import { getQueryParams } from 'utils/_';

/**
 * transforms experiment values received from preferences, based on the below mapping
 * falsy => 0
 * string => string
 * any truthy except string => 1
 * @param {object} experiments
 * @returns {object}
 */
function formatPrefExperiments(
  experiments: CustomObject<string | boolean | number>
): object {
  try {
    return Object.keys(experiments).reduce(
      (acc: CustomObject<string | boolean | number>, curr) => {
        const exp = experiments[curr];
        if (exp) {
          if (typeof exp !== 'string') {
            acc[curr] = 1;
          } else {
            acc[curr] = exp;
          }
        } else {
          acc[curr] = 0;
        }
        return acc;
      },
      {}
    );
  } catch {
    return {};
  }
}

/**
 * sets meta/context properties for Events post prefs call
 * @param preferences
 */
export function updateAnalyticsFromPreferences(
  preferences: CustomObject<unknown>
) {
  EventsV2.setContext(ContextProperties.AMOUNT, getAmount());

  Events.setMeta(MetaProperties.FEATURES, preferences.features);
  EventsV2.setContext(ContextProperties.FEATURES, preferences.features);
  if (preferences && preferences.merchant_id) {
    Events.setMeta(MetaProperties.MERCHANT_ID, preferences.merchant_id);
    EventsV2.setContext(ContextProperties.MERCHANT_ID, preferences.merchant_id);
  }
  if (preferences && preferences.merchant_key) {
    Events.setMeta(MetaProperties.MERCHANT_KEY, preferences.merchant_key);
    EventsV2.setContext(
      ContextProperties.MERCHANT_KEY,
      preferences.merchant_key
    );
  }

  if (preferences?.merchant_name) {
    EventsV2.setContext(
      ContextProperties.MERCHANT_NAME,
      preferences.merchant_name
    );
  }

  if (preferences?.mode) {
    EventsV2.setContext(ContextProperties.MODE, preferences.mode);
  }

  if (getOrderId()) {
    EventsV2.setContext(ContextProperties.ORDER_ID, getOrderId());
  }

  EventsV2.setContext(ContextProperties.EXPERIMENTS, {
    ...getExperimentsFromStorage(),
    ...formatPrefExperiments(
      preferences.experiments as CustomObject<string | boolean | number>
    ),
  });

  const registeredExperiments = getRegisteredExperiments();
  const experimentConfigs = Object.keys(registeredExperiments).reduce(
    (acc, expKey) => {
      acc[expKey] = registeredExperiments[expKey].rolloutValue;
      return acc;
    },
    {} as Record<string, number | undefined>
  );
  EventsV2.setContext(ContextProperties.EXP_CONFIGS, experimentConfigs);

  // Set optional fields in meta
  const optionalFields = preferences.optional;
  if (Array.isArray(optionalFields)) {
    const isContactOptional = optionalFields.includes('contact');
    const isEmailOptional = optionalFields.includes('email');
    Events.setMeta(MetaProperties.OPTIONAL_CONTACT, isContactOptional);
    Events.setMeta(MetaProperties.OPTIONAL_EMAIL, isEmailOptional);
    EventsV2.setContext(ContextProperties.OPTIONAL_CONTACT, isContactOptional);
    EventsV2.setContext(ContextProperties.OPTIONAL_EMAIL, isEmailOptional);
  }

  contact.subscribe((val) => {
    EventsV2.setContext(ContextProperties.TRAITS_CONTACT, val);
  });

  email.subscribe((val) => {
    EventsV2.setContext(ContextProperties.TRAITS_EMAIL, val);
  });
}

export function isMagicShopifyFlow() {
  return Boolean(getQueryParams().magic_shopify_key);
}
