import * as Card from 'common/card';
import { getEMIBankPlans } from 'checkoutstore/methods';
import type { Flows } from 'razorpay/types/Preferences';
import type { TransformParam, CardType } from 'common/types/types';
import type { Tokens, EmiPlans } from 'emiV2/types';

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
  card: (token: Tokens, { emi, recurring }: Partial<TransformParam>) => {
    const { card } = token;
    const { flows = [], network, type, cobranding_partner } = card;
    let { issuer: bank } = card;
    const networkCode = Card.findCodeByNetworkName(network);

    if (networkCode === 'amex') {
      token.card.issuer = 'AMEX'; // Set issuer explicitly
      bank = 'AMEX';
    }
    card.networkCode = networkCode;

    // If co branding partner is present we need to fetch emi plans
    // wrt to co branding partner and not card issuer
    // therefore setting bank to co_branding value
    if (cobranding_partner) {
      bank = cobranding_partner;
    }

    token.plans = (bank &&
      emi &&
      card.emi &&
      getEMIBankPlans(bank, type)) as EmiPlans;

    token.cvvDigits = networkCode === 'amex' ? 4 : 3;

    token.debitPin = !recurring && Boolean((flows as Flows).pin);

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
export const transform = (
  tokens: Tokens[],
  { amount, emi, recurring }: TransformParam
) => {
  tokens.forEach((token) => {
    if (token.method && transformerByMethod[token.method as CardType]) {
      token = transformerByMethod[token.method as CardType](token, {
        amount,
        emi,
        recurring,
      });
    }
  });

  return tokens;
};

/**
 * Filter out all the saved cards from tokens.
 *
 * @param {Array} tokens
 *
 * @return {Array}
 */
export const getSavedCards = (tokens: Tokens[]) => {
  if (!tokens) {
    return [];
  }
  return tokens.filter((token) => token.method === 'card');
};
