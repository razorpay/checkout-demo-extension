import * as Card from 'common/card';
import { getEMIBankPlans } from 'checkoutstore/methods';

const transformerByMethod = {
  /**
   * @param {Object} token
   * @param {Object} data
   *  @prop {Number} amount
   *  @prop {Boolean} emi
   *  @prop {Boolean} recurring
   *
   * @return {Object}
   */
  card: (token, { amount, emi, recurring }) => {
    const { card } = token;
    let { flows = [], issuer: bank, network } = card;
    let networkCode = Card.findCodeByNetworkName(network);

    if (networkCode === 'amex') {
      token.card.issuer = 'AMEX'; // Set issuer explicitly
      bank = 'AMEX';
    }
    card.networkCode = networkCode;

    token.plans = bank && emi && card.emi && getEMIBankPlans(bank);

    token.cvvDigits = networkCode === 'amex' ? 4 : 3;

    token.debitPin = !recurring && Boolean(flows.pin);

    return token;
  },
};

/**
 * @param {Array} tokens
 * @param {Object} data
 *  @prop {Number} amount
 *  @prop {Boolean} emi
 *  @prop {Boolean} recurring
 *
 * @return {Array}
 */
export const transform = (tokens, { amount, emi, recurring }) => {
  _Arr.loop(tokens, token => {
    if (token.method && transformerByMethod[token.method]) {
      token = transformerByMethod[token.method](token, {
        amount,
        emi,
        recurring,
      });
    }
  });

  return tokens;
};

const filterTokensByMethod = method => {
  return _Arr.filter(token => token.method === method);
};

/**
 * Filter out all the saved cards from tokens.
 *
 * @param {Array} tokens
 *
 * @return {Array}
 */
export const getSavedCards = tokens => {
  if (!tokens) {
    return [];
  }
  return _Arr.filter(tokens, token => token.method === 'card');
};

/**
 * Filter out all the saved cards from tokens.
 *
 * @param {Array} tokens
 *
 * @return {Array}
 */
export const filterUPITokens = filterTokensByMethod('upi');
