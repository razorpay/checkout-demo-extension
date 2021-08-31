import Analytics, { ErrorEvents } from 'analytics';

const sendErrorToAnalytics = ({ analytics, error }) => {
  /**
   * Event name to be used for analytics.
   * Defaulting to 'js_error' till we move to the new system of analytics events
   */
  const eventName =
    typeof analytics?.event === 'string'
      ? analytics.event
      : ErrorEvents.JS_ERROR;

  /**
   * Constructing analytics.data property
   */
  const data =
    analytics?.data && typeof analytics.data === 'object'
      ? analytics?.data
      : {};

  /**
   * Intentionally overriding data.error prop to ensure we're following the same structure across all errors reported
   * If there is any data getting lost we should look at restructuring how the data is passed
   */
  data.error = error;

  /**
   * Constructing analytics.immediately property
   * Defaulting to true to ensure we capture all reported errors
   */
  const immediately =
    typeof analytics?.immediately === 'boolean' ? analytics.immediately : true;

  /**
   * Firing the error event
   */
  Analytics.track(eventName, {
    data,
    immediately: immediately,
  });
};

export { sendErrorToAnalytics };
