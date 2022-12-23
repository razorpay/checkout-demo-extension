import type { methodNameMapping } from './constant';

export interface PostPaymentScreenProps {
  onComplete: () => void;
  data: {
    response: {
      razorpay_payment_id?: string;
      error?: any;
    };
    requestPayload: {
      method: keyof typeof methodNameMapping;
      fee?: number;
    };
  };
}
