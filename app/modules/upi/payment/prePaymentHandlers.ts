import { processInstrument } from 'checkoutframe/personalization';
import { isGpayMergedFlowEnabled } from 'checkoutstore/methods';
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
import { GOOGLE_PAY_PACKAGE_NAME } from 'upi/constants';
import { reward } from 'checkoutstore/rewards';

const enum GooglePayWrapperVersion {
  ONE = '1',
  TWO = '2',
  BOTH = 'both',
}

/**
 * Pass by reference
 * @param {Partial<UPI.UPIPaymentPayload>} data
 * @param { 'intent' | 'collect'} action
 * @param {string} vpa
 * @returns
 */
const setFlowInPayload = (
  data: Partial<UPI.UPIPaymentPayload>,
  action: 'intent' | 'collect' | 'qr',
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
    case 'qr':
      /**
       * QR flow is similar to intent flow, just we need 1 additional param
       * Hence add additional param and fallback to intent
       */
      data['_[upiqr]'] = '1';
      /**
       * QR flow will fail if save parameter sent
       */
      delete data.save;
      setFlowInPayload(data, 'intent');
      break;
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
    (googlePayWrapperVersion === GooglePayWrapperVersion.TWO ||
      googlePayWrapperVersion === GooglePayWrapperVersion.BOTH)
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
    (googlePayWrapperVersion === GooglePayWrapperVersion.ONE ||
      (googlePayWrapperVersion === GooglePayWrapperVersion.BOTH &&
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

function generateRequestParamsForPayment(
  payload: Partial<UPI.UPIPaymentPayload>
): Payment.PaymentParams {
  const session = getSession();

  const params: Payment.PaymentParams = {
    feesRedirect: getPreferences('fee_bearer'),
    external: {},
    optional: getOptionalObject(),
    paused: session.get().paused,
  };
  if (payload['_[upiqr]']) {
    params.upiqr = true;
  }
  return params;
}

function creatUPIPaymentV2(
  basePayload?: Partial<UPI.UPIPaymentPayload>,
  additionalInfo?: Payment.PaymentParams['additionalInfo']
) {
  // const session = getSession();
  const paymentPayload = { ...basePayload } as UPI.UPIPaymentPayload;
  const paymentParams: Payment.PaymentParams =
    generateRequestParamsForPayment(paymentPayload);

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
  if (additionalInfo) {
    paymentParams.additionalInfo = additionalInfo;
  }
  return {
    paymentPayload,
    paymentParams,
  };
}
export {
  setFlowInPayload,
  processSessionData,
  googlePayRequestProcessor,
  generateRequestParamsForPayment,
  creatUPIPaymentV2,
};
