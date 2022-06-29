const paymentsStack: Payment.PaymentHistoryInstance[] = [];

export const setLatestPayment = (
  data: Payment.PaymentHistoryInstance,
  init = false
) => {
  paymentsStack.push(init ? { ...data, errorReason: 'automatic' } : data);
};

export const updateLatestPaymentErrorReason = (
  errorReason: Payment.PaymentHistoryInstance['errorReason']
) => {
  if (!errorReason) {
    return;
  }
  const latestPayment = paymentsStack.pop();
  setLatestPayment({
    ...latestPayment,
    errorReason,
  });
};
export const updateLatestPaymentStatus = (
  status: Payment.PaymentHistoryInstance['status'],
  statusData?: any
) => {
  const latestPayment = paymentsStack.pop();
  setLatestPayment({
    ...latestPayment,
    statusData,

    /**
     * On Cancel as well, code will trigger error at the end. hence avoid it.
     */
    status:
      latestPayment && latestPayment.status === 'cancel' && status === 'error'
        ? latestPayment.status
        : status,
  });
};
export const getLatestPayment = () => {
  if (!paymentsStack.length) {
    return {};
  }
  return paymentsStack[paymentsStack.length - 1];
};

export const getAllPaymentInstances = () => {
  return paymentsStack;
};

export const matchLatestPaymentWith = (dataToMatch: {
  /** Validate referrer */
  referrer: Payment.PaymentReferer;
  /**
   * Statuses array to check for
   * P.S: Anyone match will be considered
   */
  inStatuses: Payment.PaymentStatus[];
  /** if given, will be used to validate against id */
  paymentId?: string;
  errorReason?: Payment.PaymentHistoryInstance['errorReason'];
}) => {
  try {
    const { status, statusData, params = {}, errorReason } = getLatestPayment();
    const { additionalInfo: { referrer = undefined } = {} } =
      params as Payment.PaymentParams;
    const result: boolean[] = [];
    if (
      typeof dataToMatch !== 'object' ||
      Object.keys(dataToMatch).length < 1
    ) {
      return;
    }
    if (dataToMatch.referrer) {
      result.push(referrer === 'UPI_UX');
    }
    if (Array.isArray(dataToMatch.inStatuses)) {
      result.push(
        dataToMatch.inStatuses.includes(status as Payment.PaymentStatus)
      );
    }
    if (dataToMatch.errorReason) {
      result.push(dataToMatch.errorReason === errorReason);
    }
    if (dataToMatch.paymentId) {
      result.push(
        Boolean(
          statusData &&
            statusData.error &&
            statusData.error.metadata &&
            statusData.error.metadata.payment_id === dataToMatch.paymentId
        )
      );
    }
    return result.reduce(
      (prevResult, currentCheckResult) => prevResult && currentCheckResult,
      true
    );
  } catch (e) {}
};
