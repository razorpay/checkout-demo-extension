import * as Card from 'common/card';
import { AMEX_EMI_MIN } from 'common/constants';

const transformerByMethod = {
  /**
   * @param {Object} token
   * @param {Object} data
   *  @prop {Number} amount
   *  @prop {Boolean} emi
   *  @prop {Object} emiOptions
   *  @prop {Boolean} recurring
   *
   * @return {Object}
   */
  card: (token, { amount, emi, emiOptions, recurring }) => {
    const { card } = token;
    let { banks: allBanks, min: minimumAmount } = emiOptions;
    let { flows = [], issuer: bank, network } = card;
    let networkCode = Card.findCodeByNetworkName(network);

    if (networkCode === 'amex') {
      bank = 'AMEX';
      minimumAmount = AMEX_EMI_MIN;
    }
    card.networkCode = networkCode;

    token.plans =
      bank &&
      emi &&
      card.emi &&
      amount > minimumAmount &&
      allBanks[bank] &&
      allBanks[bank].plans;

    token.cvv = '';
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
 *  @prop {Object} emiOptions
 *  @prop {Boolean} recurring
 *
 * @return {Array}
 */
export const transform = (tokens, { amount, emi, emiOptions, recurring }) => {
  _Arr.loop(tokens, token => {
    if (token.method && transformerByMethod[token.method]) {
      token = transformerByMethod[token.method](token, {
        amount,
        emi,
        emiOptions,
        recurring,
      });
    }
  });

  return tokens;
};
