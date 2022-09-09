import { getCardFeaturesFromCache } from 'common/card';
import * as _ from 'utils/_';

const Flows = {
  PIN: 'pin',
  OTP: 'otp',
  RECURRING: 'recurring',
};

/**
 * @param {Object} flows
 * @param {String} flow
 *
 * @return {Boolean}
 */
const isFlowApplicable = _.curry2((flows, flow) => Boolean(flows[flow]));

/**
 * Get the flows applicable for the payment.
 * @param {Object} paymentData
 * @param {Array} tokens
 *
 * @return {Object}
 */
function getFlowsForPayment(paymentData, tokens = []) {
  // Cards
  const cardNumber = paymentData['card[number]'];
  const token = paymentData['token'];

  if (token) {
    const cardToken = tokens.find((t) => t.token === token);

    if (cardToken && cardToken.card && cardToken.card.flows) {
      return cardToken.card.flows;
    }
  } else if (cardNumber) {
    const { flows } = getCardFeaturesFromCache(cardNumber) || {};

    if (flows) {
      return flows;
    }
  }

  return {};
}

/**
 * Tells whether or not Native OTP is to be used for the card payment.
 *
 * OTP flow needs to enabled and the card has to be either
 * a MasterCard or a Visa.
 *
 * @param {Object} paymentData Data that will be used for payment creation
 * @param {Array} tokens List of tokens
 *
 * @return {Boolean}
 */
export function shouldUseNativeOtpForCardPayment(paymentData, tokens) {
  const flowPresent =
    getFlowsForPayment(paymentData, tokens) |> isFlowApplicable(Flows.OTP);

  return flowPresent;
}
