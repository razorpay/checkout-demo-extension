import { UPI_POLL_URL, PENDING_PAYMENT_TS } from 'common/constants';
import RazorpayStore from 'razorpay';
import { getSession } from 'sessionmanager';
import { UPI_TAB_CALLBACK_NAME } from 'upi/constants';
import { captureTrace, TRACES } from 'upi/events';
import { getNewIosBridge } from 'bridge';
import { handleFeeBearer } from 'upi/helper/fee-bearer';
import { creatUPIPaymentV2, setFlowInPayload } from './prePaymentHandlers';
import { definePlatform, resetCallbackOnUPIAppForPay } from 'upi/helper/upi';
import popupContent from 'upi/helper/intent/popupContent';
import { upiPopUpForiOSMWeb } from 'upi/helper/intent/upiOniOSMWeb';
import {
  adoptSessionUI,
  handleDeeplinkAction,
  responseHandler,
  startUpiPaymentPolling,
} from './postPaymentHandlers';

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
  }
  if (config.action === 'paymentRequestAPI' && config.app) {
    // basePayload.method = 'app';
    // basePayload.provider = config?.app?.shortcode;
    basePayload.upi_app = config?.app?.package_name;
    setFlowInPayload(basePayload, 'intent');
  }
  if (config.action === 'none' && config.qrFlow) {
    setFlowInPayload(basePayload, 'qr');
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
        } else if (
          !Boolean(paymentPayload.upi_app) &&
          response.data.intent_url
        ) {
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
