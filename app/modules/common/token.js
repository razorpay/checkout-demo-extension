import * as Card from 'common/card';
import { AMEX_EMI_MIN } from 'common/constants';

/**
 * @param {Object}
 *  @prop {Number} amount
 *  @prop {Boolean} emi Whether or not EMI method is enabled.
 *  @prop {Object} emiOptions emi_options from preferences
 *  @prop {Array<Object>} tokens
 *
 * @return {Array<Object>}
 */
export const transformForSavedCards = ({
  amount,
  emi,
  emiOptions,
  recurring,
  tokens,
}) => {
  tokens = _Arr.filter(_Obj.clone(tokens), token => token.card);

  let { banks: allBanks, min: minimumAmount } = emiOptions;

  _Arr.loop(tokens, item => {
    const { card } = item;

    let { flows = [], issuer: bank, network } = card;

    let networkCode = Card.findCodeByNetworkName(network);

    if (networkCode === 'amex') {
      bank = 'AMEX';
      minimumAmount = AMEX_EMI_MIN;
    }

    card.networkCode = networkCode;

    item.plans =
      bank && emi && card.emi && amount > minimumAmount && allBanks[bank];
    item.cvvDigits = networkCode === 'amex' ? 4 : 3;
    item.debitPin = !recurring && Boolean(flows.pin);
  });

  return tokens;
};
