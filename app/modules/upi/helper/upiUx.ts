import { getAllPaymentInstances } from 'payment/history';

const lastErroredUpiUxPayment = (
  _errorReason?: Payment.PaymentHistoryInstance['errorReason']
) => {
  const allPayments = getAllPaymentInstances();
  return [...allPayments].reverse().find((payment) => {
    const { status, params = {}, errorReason } = payment;
    const { additionalInfo: { referrer } = {} } =
      params as Payment.PaymentParams;
    const result = referrer === 'UPI_UX' && status !== 'success';

    return _errorReason ? result && errorReason === _errorReason : result;
  });
};

export const getLastUpiUxErroredPaymentApp = (
  errorReason?: Payment.PaymentHistoryInstance['errorReason']
): UPI.AppConfiguration => {
  const lastErroredPayment = lastErroredUpiUxPayment(errorReason);

  if (lastErroredPayment?.status) {
    const { params: { additionalInfo: { config = {} } = {} } = {} } =
      lastErroredPayment;
    const { app } = config as UPI.PaymentProcessConfiguration;
    return app as UPI.AppConfiguration;
  }
  return {} as UPI.AppConfiguration;
};
