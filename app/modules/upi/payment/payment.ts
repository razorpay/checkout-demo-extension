import { UPI_POLL_URL, PENDING_PAYMENT_TS } from 'common/constants';
import RazorpayStore, { getPreferences } from 'razorpay';
import { getSession } from 'sessionmanager';
import { trackTrace, TRACES } from 'upi/events';
import { getNewIosBridge } from 'bridge';
import { handleFeeBearer } from 'upi/helper/fee-bearer';
import { creatUPIPaymentV2, setFlowInPayload } from './prePaymentHandlers';
import { resetCallbackOnUPIAppForPay } from 'upi/helper/upi';
import {
  handleDeeplinkAction,
  responseHandler,
  startUpiPaymentPolling,
} from './postPayment/postPaymentHandlers';
import { adoptSessionUI } from './postPayment/adoptSessionUI';

function handleUPIPayments(
  config: UPI.PaymentProcessConfiguration,
  onResponse?: UPI.PaymentResponseHandler,
  skipHandlers?: UPI.PaymentHandlerConfiguration
) {
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
    if (getPreferences('experiments.reuse_upi_paymentId')) {
      basePayload.persistentMode = true;
    }
  }
  if (config.action === 'paymentRequestAPI' && config.app) {
    // basePayload.method = 'app';
    // basePayload.provider = config?.app?.shortcode;
    basePayload.upi_app = config?.app?.package_name;
    setFlowInPayload(basePayload, 'intent');
    if (getPreferences('experiments.reuse_upi_paymentId')) {
      basePayload.persistentMode = true;
    }
  }
  if (config.action === 'none' && config.qrFlow) {
    setFlowInPayload(basePayload, 'qr');
    if (config.qrFlow.qrv2) {
      basePayload['_[checkout_order]'] = '1';
    }
  }

  const { paymentPayload, paymentParams } = creatUPIPaymentV2(basePayload, {
    config,
    referrer:
      config.action === 'none' && config.qrFlow
        ? 'QR_V2'
        : config.action && config.action !== 'none'
        ? 'UPI_UX'
        : undefined,
  });

  if (paymentParams.feesRedirect) {
    /**
     * Here the fee redirect screen has to be controlled
     *
     */
    delete paymentPayload.persistentMode;
    trackTrace(TRACES.FEE_MODAL_WAITING_FOR_USER);
    handleFeeBearer(paymentPayload, ({ amount, fee }) => {
      trackTrace(TRACES.FEE_MODAL_USER_CONSENT_TAKEN);
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

  // before we create the payment,
  // since no callbacks are pending reset if any
  resetCallbackOnUPIAppForPay();

  /**
   * This is needed to use the session driven UI control
   */
  const rzpInstanceWithPayment = RazorpayStore.razorpayInstance
    .createPayment(paymentPayload, paymentParams)
    .on(
      'payment.success',
      responseHandler({
        status: 'success',
        onResponse,
        skipHandlers,
      })
    )
    .on(
      'payment.error',
      responseHandler({
        status: 'error',
        onResponse,
        skipHandlers,
      })
    )
    .on(
      'payment.cancel',
      responseHandler({
        status: 'cancel',
        onResponse,
        skipHandlers,
      })
    )
    .on(
      'payment.upi.coproto_response',
      function (response: {
        request: { url: any };
        data: { intent_url: any };
      }) {
        getSession().setParamsInStorage({
          [UPI_POLL_URL]: response.request.url,
          [PENDING_PAYMENT_TS]: Date.now().toString(),
        });
        if (config.qrFlow && config.qrFlow.onPaymentCreate) {
          startUpiPaymentPolling();
          config.qrFlow.onPaymentCreate(response.data as any);
        } else if (!paymentPayload.upi_app && response.data.intent_url) {
          /**
           * When the payment response is for intent mweb using deeplink (without specific app)
           * Invoke the flow where upi intent url is opened using deeplink
           */
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
  adoptSessionUI(rzpInstanceWithPayment, session, config);
}

export { handleUPIPayments };
