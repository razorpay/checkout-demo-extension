import showFeeBearer from 'ui/components/FeeBearer';
import { captureTrace, TRACES } from 'upi/events';

type FeeData = { amount: number; fee: number };

export const handleFeeBearer = (
  originalPaymentData: Partial<UPI.UPIPaymentPayload>,
  callback: (feeData: FeeData) => void
) => {
  /**
   * API Doesn't accept upi_app param
   */
  const { upi_app, ...paymentData } = originalPaymentData;
  captureTrace(TRACES.FEE_MODAL_TRIGGERED);
  showFeeBearer({
    paymentData,
    onContinue: function (bearer: FeeData) {
      callback(bearer);
    },
  });
};
