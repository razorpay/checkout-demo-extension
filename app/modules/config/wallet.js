import FLOWS from './FLOWS';

export default {
  paytm: {
    [FLOWS.POPUP_IFRAME]: true,
  },
  paypal: {
    [FLOWS.DISABLE_WALLET_AMOUNT_CHECK]: true,
  }
};
