export const GIFT_CARD_BLOCK = {
  code: 'rzp.giftcard',
  title: 'Voucher/gift card',
  _type: 'block',
  instruments: [
    {
      code: 'giftcard',
      id: 'giftcard',
      method: 'giftcard',
      _type: 'method',
      _ungrouped: [{ _type: 'method', code: 'giftcard', method: 'giftcard' }],
    },
  ],
};

export const GC_NUMBER_REGEX_PATTERN = '^[0-9a-zA-Z@#$%^&*()_ -]{4,32}$';
export const GC_PIN_REGEX_PATTERN = '^[0-9]{4,32}$';
export const GC_NUMBER = 'giftCardNumber';
export const GC_PIN = 'giftCardPin';
export const GC_BASE_URL = '1cc/orders';
export const GC_LOADER_CLASS = 'gift-card';
export const GC_MODAL_CLASS = 'gift-card-modal';
export const GC_REMOVE_CLASS = 'rmv-gc';
export const GC_TOAST_DELAY = 5000;
export const MIN_AMOUNT = 100;
export const OPTIMIZER_GC_SOURCE = 'rzp_optimizer_excess_gc';
export const MANUAL_GC_SOURCE = 'manual';
export const COUPON_GC_SOURCE = 'rzp_coupon_clash';
export const GIFT_CARD_TYPE = 'gift_card';
