import { resetSelectedUPIAppForPay } from 'checkoutstore/screens/upi';
import { setLatestPayment } from 'payment/history';
import { upiUxV1dot1 } from 'upi/experiments';
import type Session from 'session/session';

import { handleErrorModal, isPayloadIsOfQR } from 'session/helper';
import { isQRPaymentActive } from 'upi/helper';

jest.mock('upi/helper', () => ({
  __esModule: true,
  isQRPaymentActive: jest.fn(),
}));

jest.mock('upi/experiments', () => ({
  upiUxV1dot1: {
    enabled: jest.fn(),
  },
}));

jest.mock('checkoutstore/screens/upi', () => ({
  resetSelectedUPIAppForPay: jest.fn(),
}));

jest.mock('payment/');

const defaultErrorMessage = 'There was an error in handling your request.';
const testErrorMessage = 'testMessage';

const sessionMock = {
  showLoadError: jest.fn(),
  switchTab: jest.fn(),
  hideErrorMessage: jest.fn(),
  /**
   * Homscreen
   */
  tab: '',
};
describe(' Session/ helper / #handleErrorModal function tests', () => {
  it('should set the error modal by default', () => {
    (upiUxV1dot1.enabled as jest.Mock).mockReturnValue(false);
    handleErrorModal.call(sessionMock as unknown as Session, testErrorMessage);
    expect(sessionMock.showLoadError).toBeCalledWith(testErrorMessage, true);
  });
  it('should set the error modal by default with default message when no error message passed', () => {
    (upiUxV1dot1.enabled as jest.Mock).mockReturnValue(false);
    handleErrorModal.call(sessionMock as unknown as Session, '');
    expect(sessionMock.showLoadError).toBeCalledWith(defaultErrorMessage, true);
  });
  it('While in Home screen: should reset the UPI UX app, when the latest payment is UPI UX, and if payment is auto-cancelled/api-errored, we should switch the screen and hide-error-message if any', () => {
    (upiUxV1dot1.enabled as jest.Mock).mockReturnValue(true);
    setLatestPayment({
      params: {
        additionalInfo: {
          referrer: 'UPI_UX',
        },
      } as any,
      status: 'error',
      errorReason: 'automatic',
    });

    handleErrorModal.call(sessionMock as unknown as Session, testErrorMessage);
    expect(resetSelectedUPIAppForPay as jest.Mock).toBeCalled();
    expect(sessionMock.switchTab as jest.Mock).toBeCalled();
    expect(sessionMock.hideErrorMessage as jest.Mock).toBeCalled();

    expect(sessionMock.showLoadError).not.toBeCalled();
  });
  it('While in Home screen: should reset the UPI UX app, when the latest payment is UPI UX, and if payment is manual-cancelled, we should NOT switch the screen and DO NOT show any error modal', () => {
    (upiUxV1dot1.enabled as jest.Mock).mockReturnValue(true);
    setLatestPayment({
      params: {
        additionalInfo: {
          referrer: 'UPI_UX',
        },
      } as any,
      status: 'error',
      errorReason: 'manual',
    });

    handleErrorModal.call(sessionMock as unknown as Session, testErrorMessage);
    expect(resetSelectedUPIAppForPay as jest.Mock).toBeCalled();
    expect(sessionMock.switchTab as jest.Mock).not.toBeCalled();
    expect(sessionMock.hideErrorMessage as jest.Mock).not.toBeCalled();
    expect(sessionMock.showLoadError).not.toBeCalled();
  });
  it('While NOT in Home screen (and in UPI screen): should reset the UPI UX app, when the latest payment is UPI UX, and if payment is auto-cancelled/errored, we should NOT switch the screen and DO show any error modal', () => {
    (upiUxV1dot1.enabled as jest.Mock).mockReturnValue(true);
    setLatestPayment({
      params: {
        additionalInfo: {
          referrer: 'UPI_UX',
        },
      } as any,
      status: 'error',
      errorReason: 'automatic',
    });

    handleErrorModal.call(
      { ...sessionMock, tab: 'upi' } as unknown as Session,
      testErrorMessage
    );
    expect(resetSelectedUPIAppForPay as jest.Mock).toBeCalled();
    expect(sessionMock.switchTab as jest.Mock).not.toBeCalled();
    expect(sessionMock.hideErrorMessage as jest.Mock).not.toBeCalled();
    expect(sessionMock.showLoadError).toBeCalledWith(testErrorMessage, true);
  });
  it('While NOT in Home screen (and in UPI screen): should reset the UPI UX app, when the latest payment is UPI UX, and if payment is auto-cancelled/errored, we should NOT switch the screen and DO show any error modal. Modal should have default message no msg passed', () => {
    (upiUxV1dot1.enabled as jest.Mock).mockReturnValue(true);
    setLatestPayment({
      params: {
        additionalInfo: {
          referrer: 'UPI_UX',
        },
      } as any,
      status: 'error',
      errorReason: 'automatic',
    });

    handleErrorModal.call(
      { ...sessionMock, tab: 'upi' } as unknown as Session,
      ''
    );
    expect(resetSelectedUPIAppForPay as jest.Mock).toBeCalled();
    expect(sessionMock.switchTab as jest.Mock).not.toBeCalled();
    expect(sessionMock.hideErrorMessage as jest.Mock).not.toBeCalled();
    expect(sessionMock.showLoadError).toBeCalledWith(defaultErrorMessage, true);
  });
  it('While NOT in Home screen (and in UPI screen): should reset the UPI UX app, when the latest payment is UPI UX, and if payment is manual-cancelled, we should NOT switch the screen and DO NOT show any error modal', () => {
    (upiUxV1dot1.enabled as jest.Mock).mockReturnValue(true);
    setLatestPayment({
      params: {
        additionalInfo: {
          referrer: 'UPI_UX',
        },
      } as any,
      status: 'error',
      errorReason: 'manual',
    });

    handleErrorModal.call(
      { ...sessionMock, tab: 'upi' } as unknown as Session,
      testErrorMessage
    );
    expect(resetSelectedUPIAppForPay as jest.Mock).toBeCalled();
    expect(sessionMock.switchTab as jest.Mock).not.toBeCalled();
    expect(sessionMock.hideErrorMessage as jest.Mock).not.toBeCalled();
    expect(sessionMock.showLoadError).not.toBeCalled();
  });

  it('when in Home screen and payment attempt is from QR-V2 and the payment is manually cancelled, then DO NOT show error modal', () => {
    (upiUxV1dot1.enabled as jest.Mock).mockReturnValue(false);
    setLatestPayment({
      params: {
        additionalInfo: {
          referrer: 'QR_V2',
        },
      } as any,
      status: 'error',
      errorReason: 'automatic',
    });

    handleErrorModal.call(sessionMock as unknown as Session, testErrorMessage);
    expect(sessionMock.showLoadError).toBeCalled();
  });

  it('when NOT in Home screen, (and in UPI screen) and payment attempt is from QR-V2 and the payment is NOT manually cancelled, then DO show error modal', () => {
    (upiUxV1dot1.enabled as jest.Mock).mockReturnValue(true);
    setLatestPayment({
      params: {
        additionalInfo: {
          referrer: 'QR_V2',
        },
      } as any,
      status: 'error',
      errorReason: 'automatic',
    });

    handleErrorModal.call(
      { ...sessionMock, tab: 'upi' } as unknown as Session,
      testErrorMessage
    );
    expect(resetSelectedUPIAppForPay as jest.Mock).not.toBeCalled();
    expect(sessionMock.switchTab as jest.Mock).not.toBeCalled();
    expect(sessionMock.hideErrorMessage as jest.Mock).not.toBeCalled();
    expect(sessionMock.showLoadError).toBeCalled();
  });
});

describe('test #isPayloadIsOfQR', () => {
  test('UPI is active & payload is of Payment create QR', () => {
    (isQRPaymentActive as jest.Mock).mockReturnValueOnce(true);
    expect(
      isPayloadIsOfQR({
        '_[upiqr]': '1',
      })
    ).toBeTruthy();
  });

  test('UPI is active & payload is of Checkout Order QR', () => {
    (isQRPaymentActive as jest.Mock).mockReturnValueOnce(true);
    expect(
      isPayloadIsOfQR({
        '_[checkout_order]': '1',
      })
    ).toBeTruthy();
  });

  test('UPI is inactive & payload is of Checkout Order QR (in case qr failed)', () => {
    (isQRPaymentActive as jest.Mock).mockReturnValueOnce(false);
    expect(
      isPayloadIsOfQR({
        '_[checkout_order]': '1',
      })
    ).toBeTruthy();
  });

  test('UPI is inactive & payload is of Payment create QR', () => {
    (isQRPaymentActive as jest.Mock).mockReturnValueOnce(false);
    expect(
      isPayloadIsOfQR({
        '_[upiqr]': '1',
      })
    ).toBeFalsy();
  });
});
