import { getOption, getOrderId } from 'razorpay';
import {
  ContextProperties,
  EventsV2,
  INTEGRATION_PLATFORM,
  REFERRER_TYPE,
} from 'analytics-v2';

export function sendToAll(event, payload) {
  if (!window?.ga) {
    return;
  }

  const ga = window.ga;
  const trackers = typeof ga.getAll === 'function' ? ga.getAll() : [];

  for (let i = 0; i < trackers.length; i++) {
    const tracker = trackers[i].get('name') + `.${event}`;
    ga(tracker, payload);
  }
}

/**
 * sets initial context for events
 * @param {obj} rzp razorpay instance
 */
export function setInitialContext() {
  const prefilledContact = getOption('prefill.contact');
  const prefilledEmail = getOption('prefill.email');

  if (prefilledContact) {
    EventsV2.setContext(ContextProperties.TRAITS_CONTACT, prefilledContact);
  }
  if (prefilledEmail) {
    EventsV2.setContext(ContextProperties.TRAITS_EMAIL, prefilledEmail);
  }
  if (getOrderId()) {
    EventsV2.setContext(ContextProperties.ORDER_ID, getOrderId());
  }

  // Add integration details if present
  const integrationName = getOption('_.integration');
  if (integrationName) {
    EventsV2.setContext(ContextProperties.INTEGRATION_NAME, integrationName);
  }

  const integrationVersion = getOption('_.integration_version');
  if (integrationVersion) {
    EventsV2.setContext(
      ContextProperties.INTEGRATION_VERSION,
      integrationVersion
    );
  }

  let referrerType = REFERRER_TYPE.INTEGRATION;
  let integrationPlatform = INTEGRATION_PLATFORM.WEB;

  const integrationType = getOption('_.integration_type');
  if (integrationType) {
    if (integrationType === REFERRER_TYPE.RZP_APP) {
      referrerType = REFERRER_TYPE.RZP_APP;
    } else if (integrationType === INTEGRATION_PLATFORM.PLUGIN) {
      integrationPlatform = INTEGRATION_PLATFORM.PLUGIN;
    }
    EventsV2.setContext(ContextProperties.INTEGRATION_TYPE, integrationType);
  }

  EventsV2.setContext(ContextProperties.REFERRER_TYPE, referrerType);
  EventsV2.setContext(
    ContextProperties.INTEGRATION_PLATFORM,
    integrationPlatform
  );

  const integrationParentVersion = getOption('_.integration_parent_version');
  if (integrationParentVersion) {
    EventsV2.setContext(
      ContextProperties.INTEGRATION_PARENT_VERSION,
      integrationParentVersion
    );
  }
}
