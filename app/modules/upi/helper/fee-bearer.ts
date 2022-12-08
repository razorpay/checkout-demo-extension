import showFeeBearer from 'ui/components/FeeBearer';
import type { FeeBearerResponse } from 'ui/components/FeeBearer/type';
import { trackTrace, TRACES } from 'upi/events';

export const handleFeeBearer = (
  originalPaymentData: Partial<UPI.UPIPaymentPayload>,
  callback: (feeData: FeeBearerResponse['input']) => void
) => {
  /**
   * API Doesn't accept upi_app param
   */
  const { upi_app, ...paymentData } = originalPaymentData;
  trackTrace(TRACES.FEE_MODAL_TRIGGERED);
  showFeeBearer({
    paymentData,
    onContinue: function (bearer: FeeBearerResponse['input']) {
      callback(bearer);
    },
  });
};
