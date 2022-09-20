import type { EMIPayload } from 'emiV2/payment/types/payment';
import showFeeBearer from 'ui/components/FeeBearer';

type FeeData = { amount: number; fee: number };

export const handleFeeBearer = (
  paymentData: EMIPayload,
  callback: (feeData: FeeData) => void
) => {
  showFeeBearer({
    paymentData,
    onContinue: function (bearer: FeeData) {
      callback(bearer);
    },
  });
};
