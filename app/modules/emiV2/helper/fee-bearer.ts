import type { EMIPayload } from 'emiV2/payment/types/payment';
import showFeeBearer from 'ui/components/FeeBearer';
import type { FeeBearerResponse } from 'ui/components/FeeBearer/type';

export const handleFeeBearer = (
  paymentData: EMIPayload,
  callback: (feeData: FeeBearerResponse['input']) => void
) => {
  showFeeBearer({
    paymentData,
    onContinue: function (bearer) {
      callback(bearer);
    },
  });
};
