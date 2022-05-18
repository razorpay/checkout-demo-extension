import { format } from 'i18n';
import { getSession } from 'sessionmanager';
import { enableUPITiles } from '../features';
import { definePlatform } from '../helper/upi';
import { tryOpeningIntentUrl } from '../helper/intent/resolver';
import { captureTrace, trackIntentFailure, TRACES } from 'upi/events';

const startUpiPaymentPolling = () => {
  // emit success response and trigger polling
  getSession().r.emit('payment.upi.intent_success_response');
};

const processIntentOnMWeb = (intentUrl: string) => {
  const session = getSession();
  void tryOpeningIntentUrl(intentUrl).then((response) => {
    captureTrace(TRACES.INTENT_PROMISE_RESOLVED, { promiseResponse: response });
    const { canProceed, reason } =
      typeof response === 'object'
        ? (response as any)
        : { canProceed: response, reason: null };

    if (canProceed) {
      session.showLoadError();
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
  } else {
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
}

function adoptSessionUI(
  paymentInstance: any,
  session: any,
  config: UPI.PaymentProcessConfiguration
) {
  (document.querySelector('#error-message .link') as HTMLElement).textContent =
    format('misc.cancel_action');
  /**
   * Start a general loader with cancel action
   */
  if (!config.qrFlow) {
    session.showLoadError();
  }

  paymentInstance.on('payment.upi.noapp', function (data: any) {
    session.showLoadError(format('upi.intent_no_apps_error'), true);

    session.body.addClass('upi-noapp');
  });

  paymentInstance.on('payment.upi.selectapp', function (data: any) {
    session.showLoadError(format('upi.intent_select_app'), false);
  });

  paymentInstance.on('payment.upi.pending', function (data: { flow: string }) {
    if (data && data.flow === 'upi-intent') {
      return session.showLoadError(format('misc.payment_waiting_confirmation'));
    }
    session.showLoadError(format('upi.intent_accept_request'));
  });
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

function clearPaymentRequest(reason: string) {
  getSession().r.emit('payment.cancel', {
    '_[reason]': reason,
  });
}
export {
  adoptSessionUI,
  handleDeeplinkAction,
  processIntentOnMWeb,
  responseHandler,
  startUpiPaymentPolling,
  clearPaymentRequest,
};
