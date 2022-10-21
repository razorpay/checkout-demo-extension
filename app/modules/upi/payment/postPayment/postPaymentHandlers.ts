import { getSession } from 'sessionmanager';
import { enableUPITiles } from '../../features';
import { definePlatform } from '../../helper/upi';
import { tryOpeningIntentUrl } from '../../helper/intent/resolver';
import { trackTrace, trackIntentFailure, TRACES } from 'upi/events';
import { reusePaymentIdExperimentEnabled } from 'razorpay';

const startUpiPaymentPolling = () => {
  // emit success response and trigger polling
  getSession().r.emit('payment.upi.intent_success_response');
};
let isLoadingScreenVisible = true;

function handleVisibleChange() {
  const session = getSession();
  if (document.visibilityState === 'hidden' && session.r._payment) {
    // user redirected from app back to checkout show loader
    session.showLoadError();
    isLoadingScreenVisible = true;
  }
}

function onFocus() {
  const container = document.getElementById('container') as HTMLDivElement;
  function clearPayment() {
    if (!isLoadingScreenVisible && document.visibilityState !== 'hidden') {
      clearPaymentRequest('clear persistent payment', true);
    }
    container?.removeEventListener('touchstart', clearPayment);
  }
  /** cleanup touchstart listener before setup */
  container?.removeEventListener('touchstart', clearPayment);
  /**
   * after getting focus when we touch
   * then we cancel the payment if exist
   */
  container?.addEventListener('touchstart', clearPayment);
  /** cleanup focus listener we want focus event only for one time */
  window.removeEventListener('focus', onFocus);
}

const processIntentOnMWeb = (intentUrl: string) => {
  const session = getSession();
  void tryOpeningIntentUrl(intentUrl).then((response) => {
    trackTrace(TRACES.INTENT_PROMISE_RESOLVED, { promiseResponse: response });
    const { canProceed, reason } =
      typeof response === 'object'
        ? (response as any)
        : { canProceed: response, reason: null };

    if (canProceed) {
      if (reusePaymentIdExperimentEnabled() && definePlatform('mWebiOS')) {
        session.hideOverlayMessage();
        isLoadingScreenVisible = false;
        // detect app installed
        /** cleanup any old lister */
        window.removeEventListener('focus', onFocus);
        document.removeEventListener('visibilitychange', handleVisibleChange);
        /**
         * setup the focus check
         * in case like chrome when it doesn't ask permission and app is not available
         * it doesn't show any error in UI so this check will
         */
        if (document.hasFocus()) {
          /** if still in focus probably most-probably app is not available */
          onFocus();
        } else {
          window.addEventListener('focus', onFocus);
        }
        document.addEventListener('visibilitychange', handleVisibleChange);
      } else {
        session.showLoadError();
      }
      startUpiPaymentPolling();
    } else {
      const metaParam = { upiNoApp: true };
      // clear the payment and dispatch no upi apps message
      trackIntentFailure(reason || metaParam);
      session.clearRequest(reason || metaParam);
    }
  });
};

function handleDeeplinkAction(
  intentUrl: string,
  action: UPI.AppTileAction,
  app?: UPI.AppConfiguration
) {
  if (!intentUrl || action !== 'deepLinkIntent') {
    return;
  }
  const [, queryParams] = intentUrl.split('?');

  let appUrlScheme = '';
  /**
   * handleDeeplinkAction directly depends on the url-scheme provided as a part of
   * enableUPITiles feature config, if feature is absent, app specific url trigger not required.
   */
  const upiTileFeature = enableUPITiles();

  let apps: UPI.AppConfiguration[] = [];
  if (upiTileFeature.status && upiTileFeature.config) {
    apps = upiTileFeature.config.apps;
  }

  const { url_schema } =
    apps?.find(({ shortcode }) => shortcode === app?.shortcode) || {};

  if (typeof url_schema === 'object') {
    const platform = definePlatform('mWebAndroid')
      ? 'android'
      : definePlatform('mWebiOS')
      ? 'ios'
      : undefined;
    appUrlScheme = platform ? url_schema[platform] : '';
  } else {
    appUrlScheme = String(url_schema);
  }

  if (!appUrlScheme) {
    processIntentOnMWeb(intentUrl);
    throw new Error('App Specific URL not found falling back to original');
  }
  processIntentOnMWeb(`${appUrlScheme}?${queryParams}`);
}

function responseHandler(params: {
  status: Payment.PaymentStatus;
  onResponse?: UPI.PaymentResponseHandler;
  skipHandlers?: UPI.PaymentHandlerConfiguration;
}) {
  const { status, onResponse, skipHandlers } = params;
  return (response: any) => {
    if (onResponse) {
      onResponse(status, response);
    }
    const session = getSession();
    /**
     * session.cancelHandler
     * session.errorHandler
     * session.successHandler
     */
    if (!skipHandlers || (skipHandlers && skipHandlers[status] !== false)) {
      session[`${status}Handler`].call(session, response);
    }
  };
}

function clearPaymentRequest(reason: string, silent = false) {
  getSession().r.emit('payment.cancel', {
    '_[reason]': reason,
    _silent: silent,
  });
  document.removeEventListener('visibilitychange', handleVisibleChange);
}
export {
  handleDeeplinkAction,
  processIntentOnMWeb,
  responseHandler,
  startUpiPaymentPolling,
  clearPaymentRequest,
};
