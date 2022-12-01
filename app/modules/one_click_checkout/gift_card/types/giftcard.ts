export type appliedGiftCardsType = {
  giftCardNumber: string;
  giftCardValue: number;
  appliedAmt: number;
  balanceAmt: number;
};

export type removeGCPayload = {
  gift_card_numbers: string[];
};

export type applyGCPayload = {
  gift_card_number: string;
  pin?: string;
  contact: string;
  email?: string;
};

export type applyGCRes = {
  gift_card_promotion: {
    gift_card_number: string;
    allowedPartialRedemption: 0 | 1;
    balance?: string | number;
  };
};

export type applyGCParams = {
  giftCardValue: Record<string, string>;
  contact: string;
  email?: string;
};

export type validateGCParams = {
  id: string;
  isFieldValueValid: boolean;
  value: string | undefined;
};

export type fieldErr = Record<string, string | null>;

export type removeGCToastData = {
  amount: string;
  code?: string;
};

export type couponType = {
  code: string;
  source: string;
};

export type removeGCAnalyticsData = {
  event: string;
  selectedGiftCards: string[];
  rmvSource: string;
  extraProperty?: {
    [key: string]: string | boolean | number;
  };
};

export type handleInputType = (
  id: string,
  value: string,
  pattern: string
) => void;
export type handleBlurType = (id: string) => void;
export type errorType = string | null;
export type valueType = string | undefined;
export type labelFuncType = () => string | void;
export type cartItemType = Array<{
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  variant_id: string;
  description: string;
  gift_card?: boolean;
}>;
