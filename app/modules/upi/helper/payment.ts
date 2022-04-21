import { processInstrument } from 'checkoutframe/personalization';
import { isGpayMergedFlowEnabled } from 'checkoutstore/methods';
import { UPI_POLL_URL, PENDING_PAYMENT_TS } from 'common/constants';
import { format } from 'i18n';
import RazorpayStore from 'razorpay';
import {
  appsThatSupportWebPayments,
  isWebPaymentsApiAvailable,
} from 'common/webPaymentsApi';
import {
  getOption,
  getOptionalObject,
  getPreferences,
  isEmailOptional,
} from 'razorpay';
import { getSession } from 'sessionmanager';
import { GOOGLE_PAY_PACKAGE_NAME, UPI_TAB_CALLBACK_NAME } from 'upi/constants';
import { enableUPITiles, resetCallbackOnUPIAppForPay } from './upi';
import { reward } from 'checkoutstore/rewards';
import { getNewIosBridge } from 'bridge';
import { handleFeeBearer } from './fee-bearer';
import { definePlatform } from './upi';
import { tryOpeningIntentUrl } from './intentResolver';
import { upiPopUpForiOSMWeb } from './upiOniOSMWeb';
import popupContent from './popupContent';
import { captureTrace, trackIntentFailure, TRACES } from 'upi/events';

/**
 * Pass by reference
 * @param {Partial<UPI.UPIPaymentPayload>} data
 * @param { 'intent' | 'collect'} action
 * @param {string} vpa
 * @returns
 */
export const setFlowInPayload = (
  data: Partial<UPI.UPIPaymentPayload>,
  action: 'intent' | 'collect',
  vpa?: string
) => {
  if (!action || !data) {
    return;
  }
  if (data.upi) {
    data.upi.flow = action;
  } else {
    data.upi = {
      flow: action,
    };
  }
  switch (action) {
    case 'intent':
      data['_[flow]'] = 'intent';
      if (data.vpa || typeof data.vpa === 'string') {
        delete data.vpa;
      }
      if (data.upi.vpa || typeof data.upi.vpa === 'string') {
        delete data.upi.vpa;
      }

      // For saved vpa
      if (data.token) {
        delete data.token;
      }

      // For omni channel
      if (data.upi_provider) {
        delete data.upi_provider;
      }

      break;
    case 'collect':
      if (vpa) {
        data.vpa = vpa;
      }
      data['_[flow]'] = 'directpay';
      data.upi.flow = 'collect';
      break;
  }
};

export const processIntentOnMWeb = (intentUrl: string) => {
  const session = getSession();
  tryOpeningIntentUrl(intentUrl).then((response) => {
    captureTrace(TRACES.INTENT_PROMISE_RESOLVED, { promiseResponse: response });
    let { canProceed, reason } =
      typeof response === 'object'
        ? (response as any)
        : { canProceed: response, reason: null };

    if (canProceed) {
      session.showLoadError();
      // emit success response and trigger polling
      session.r.emit('payment.upi.intent_success_response');
    } else {
      const metaParam = { upiNoApp: true };
      // clear the payment and dispatch no upi apps message
      trackIntentFailure(reason || metaParam);
      session.clearRequest(reason || metaParam);
    }
  });
};

function processSessionData(paymentData: UPI.UPIPaymentPayload) {
  const session = getSession();
  if (!session) {
    return;
  }
  session.preferredInstrument = processInstrument(paymentData, {});
  const offer = session.getAppliedOffer();
  // UPI offer applicable to QR also
  if (offer && offer.payment_method === 'upi') {
    paymentData.offer_id = offer.id;
  }
}
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

function adoptSessionUI(paymentInstance: any, session: any) {
  (document.querySelector('#error-message .link') as HTMLElement).innerHTML =
    format('misc.cancel_action');
  /**
   * Start a general loader with cancel action
   */
  session.showLoadError();

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

/**
 * This method adds necessary config to support google pay sdk to process payment
 * Scoped only to standard checkout
 * @param data
 * @param params
 */
const googlePayRequestProcessor = (
  data: UPI.UPIPaymentPayload,
  params: Payment.PaymentParams
) => {
  const { hasGooglePaySdk, googlePayWrapperVersion } = getSession() || {}; //this;
  // For these conditions use google pay card + upi merged flow,
  // so make google pay intent call same as app so that
  // only one thing is managed from here on

  if (
    data.method === 'upi' &&
    data.upi_app === GOOGLE_PAY_PACKAGE_NAME &&
    hasGooglePaySdk &&
    isGpayMergedFlowEnabled() &&
    (googlePayWrapperVersion === Common.GooglePayWrapperVersion.TWO ||
      googlePayWrapperVersion === Common.GooglePayWrapperVersion.BOTH)
  ) {
    data.method = 'app';
    data.provider = 'google_pay';

    delete data.upi;
    delete data.upi_app;
    delete data['_[flow]'];
  }

  // For these condition use google pay upi half screen flow,
  // we are doing so many conditions because we want to
  // have back support for upi half screen flow in
  // multiple scenarios
  if (
    data.method === 'upi' &&
    data.upi_app === GOOGLE_PAY_PACKAGE_NAME &&
    hasGooglePaySdk &&
    (googlePayWrapperVersion === Common.GooglePayWrapperVersion.ONE ||
      (googlePayWrapperVersion === Common.GooglePayWrapperVersion.BOTH &&
        !isGpayMergedFlowEnabled()))
  ) {
    params.external.gpay = true;
    setFlowInPayload(params, 'intent');
  }

  // This is for Google pay card + upi merged flow, so this will
  // always happen via external google pay sdk. Payment started
  // from card screen will always have this method and provider
  // and we are converting upi payment to merged flow and
  // updating method to `app` and provider to `google_pay`
  if (
    hasGooglePaySdk &&
    data.method === 'app' &&
    data.provider === 'google_pay'
  ) {
    params.external.gpay = true;
  }
};

function generateRequestParamsForPayment(): Payment.PaymentParams {
  const session = getSession();
  return {
    feesRedirect: getPreferences('fee_bearer'),
    external: {},
    optional: getOptionalObject(),
    paused: session.get().paused,
  };
}

function creatUPIPaymentV2(basePayload?: Partial<UPI.UPIPaymentPayload>) {
  // const session = getSession();
  const paymentPayload = { ...basePayload } as UPI.UPIPaymentPayload;
  const paymentParams: Payment.PaymentParams =
    generateRequestParamsForPayment();

  // Add bank in payload for TPV orders
  const bank = getPreferences('order.bank');
  if (bank) {
    paymentPayload.bank = bank;
  }

  if (getOption('force_terminal_id')) {
    paymentPayload.force_terminal_id = getOption('force_terminal_id');
  }

  googlePayRequestProcessor(paymentPayload, paymentParams);

  // If there's a package name, the flow is intent.
  if (paymentPayload.upi_app) {
    setFlowInPayload(paymentPayload, 'intent');

    paymentPayload['_[app]'] = String(paymentPayload.upi_app);
  }

  if (
    paymentPayload.method === 'upi' &&
    paymentPayload['_[flow]'] === 'intent' &&
    appsThatSupportWebPayments.find(function (app) {
      return app.package_name === paymentPayload.upi_app;
    }) &&
    isWebPaymentsApiAvailable(String(paymentPayload.upi_app))
  ) {
    paymentParams.gpay = true;
  }

  // added rewardIds to the create payment request
  // var reward = storeGetter(rewardsStore);
  const { reward_id } = (reward || {}) as any;
  if (reward_id && !isEmailOptional()) {
    paymentPayload.reward_ids = [reward_id];
  }

  processSessionData(paymentPayload);

  /**
   * if merchant is on fee bearer we must send fee parameters with updated amount in
   * payment creation request, but if fee is present in the payload, it means we somehow shown the
   * fee bearer ui and collected the fee consent, hence if payload has fee set switch off redirect.
   */
  if (paymentParams?.feesRedirect && typeof paymentPayload?.fee === 'number') {
    paymentParams.feesRedirect = false;
  }

  delete paymentPayload.downtimeSeverity;
  delete paymentPayload.downtimeInstrument;

  return {
    paymentPayload,
    paymentParams,
  };
}

export function handleUPIPayments(config: UPI.PaymentProcessConfiguration) {
  const session = getSession();
  const basePayload: Partial<UPI.UPIPaymentPayload> = {
    ...session.getPayload(),
    method: 'upi',
    /**
     * Since parent payload data is possibly an override, it must be taken after base preparation
     */
    ...config.payloadData,
  };
  if (config.action === 'nativeIntent' && config.app) {
    basePayload.upi_app = config?.app.package_name;
    /**
     * When we pull payload from session, there may be a chance of pulling vpa if user touches the field
     * but here we need to trigger native intent hence
     */

    setFlowInPayload(basePayload, 'intent');
  }
  if (config.action === 'deepLinkIntent') {
    setFlowInPayload(basePayload, 'intent');
  }
  if (config.action === 'paymentRequestAPI' && config.app) {
    // basePayload.method = 'app';
    // basePayload.provider = config?.app?.shortcode;
    basePayload.upi_app = config?.app?.package_name;
    setFlowInPayload(basePayload, 'intent');
  }
  const { paymentPayload, paymentParams } = creatUPIPaymentV2(basePayload);

  if (paymentParams.feesRedirect) {
    /**
     * Here the fee redirect screen has to be controlled
     *
     */
    captureTrace(TRACES.FEE_MODAL_WAITING_FOR_USER);
    handleFeeBearer(paymentPayload, ({ amount, fee }) => {
      captureTrace(TRACES.FEE_MODAL_USER_CONSENT_TAKEN);
      /**
       * Once the fee bearer consent is taken , callback will be hit with fee and amount
       * hence that amount and fee will be carry-forwarded with previously prepared payload
       * with this there will not be any side effect.
       */
      handleUPIPayments({
        ...config,
        payloadData: {
          ...paymentPayload,
          amount,
          fee,
        },
      });
    });
    return;
  }
  session.payload = paymentPayload;

  (global as any).Razorpay.sendMessage({
    event: 'submit',
    data: paymentPayload,
  });

  if (config.action === 'deepLinkIntent' && definePlatform('mWebiOS')) {
    upiPopUpForiOSMWeb.createWindow(
      popupContent(UPI_TAB_CALLBACK_NAME),
      UPI_TAB_CALLBACK_NAME
    );
  }

  // before we create the payment,
  // since no callbacks are pending reset if any
  resetCallbackOnUPIAppForPay();

  /**
   * This is needed to use the session driven UI control
   */
  const rzpInstanceWithPayment = (RazorpayStore.razorpayInstance as any)
    .createPayment(paymentPayload, paymentParams)
    .on('payment.success', session.successHandler.bind(session))
    .on('payment.error', session.errorHandler.bind(session))
    .on('payment.cancel', session.cancelHandler.bind(session))
    .on(
      'payment.upi.coproto_response',
      function (response: {
        request: { url: any };
        data: { intent_url: any };
      }) {
        getSession().setParamsInStorage({
          [UPI_POLL_URL]: response.request.url,
          [PENDING_PAYMENT_TS]: Date.now() + '',
        });

        /**
         * When the payment response is for intent mweb using deeplink (without specific app)
         * Invoke the flow where upi intent url is opened using deeplink
         */
        if (!Boolean(paymentPayload.upi_app) && response.data.intent_url) {
          handleDeeplinkAction(
            response.data.intent_url,
            config.action,
            config.app
          );
        }
      }
    );

  const iosCheckoutBridgeNew = getNewIosBridge();
  const CheckoutBridge = (window as any).CheckoutBridge;

  // When the payment is handled by an external sdk that razorapy sdk interacts with,
  // this passes on the coproto or the payment data to the razorpay sdk

  /**
   * external.amazonpay is related to amazon pay wallet sdk hence we can remove it.
   *
   */
  if (paymentParams.external.amazonpay || paymentParams.external.gpay) {
    rzpInstanceWithPayment.on(
      'payment.externalsdk.process',
      function (data: any) {
        /* invoke external sdk via our SDK */
        if (CheckoutBridge && CheckoutBridge.processPayment) {
          getSession().showLoadError();
          CheckoutBridge.processPayment(JSON.stringify(data));
        } else if (iosCheckoutBridgeNew) {
          iosCheckoutBridgeNew.postMessage({
            action: 'processPayment',
            body: data,
          });
        }
      }
    );
  }
  /**
   * If its using standard checkout then adopt session UI
   */
  adoptSessionUI(rzpInstanceWithPayment, session);
}
