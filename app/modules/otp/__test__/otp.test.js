import { render, fireEvent, waitFor } from '@testing-library/svelte';
import OTP from 'otp/ui/OtpScreen.svelte';
import Analytics from 'analytics';
import { setupPreferences } from 'tests/setupPreferences';
import {
  allowResend,
  allowSkip,
  loading,
  resendTimeout,
} from 'checkoutstore/screens/otp';
import { screensHistory } from 'one_click_checkout/routing/History';
import otp from 'one_click_checkout/common/otpConfig';

screensHistory.setConfig({ otp });

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: jest.fn(),
  getMode: jest.fn(),
};

jest.mock('checkoutstore/theme', () => ({
  getThemeColor: jest.fn(),
}));

jest.mock('one_click_checkout/sessionInterface', () => ({
  getTheme: jest.fn(() => ({ backgroundColor: 'black' })),
}));

const skipOTPHandle = jest.fn();

describe('OTP', () => {
  beforeEach(() => {
    setupPreferences('basic', razorpayInstance);
    Analytics.setR(razorpayInstance);
  });

  it('Should not show input when state is loading', () => {
    loading.set(true);
    const { queryByTestId } = render(OTP);
    expect(queryByTestId('async-loader')).toBeInTheDocument();
  });

  it('Should not show skip button when allowSkip is false', () => {
    allowSkip.set(false);
    const { queryByTestId } = render(OTP);
    expect(queryByTestId('otp-sec-skip-btn')).not.toBeInTheDocument();
  });

  it('Should not show resend button when countdown is ongoing', () => {
    loading.set(false);
    allowResend.set(true);
    resendTimeout.set(Date.now() + 10 * 1000);
    const { queryByText } = render(OTP);
    expect(queryByText('Resend')).not.toBeInTheDocument();
  });

  it('Should show countdown when resend timer is ongoing', () => {
    loading.set(false);
    allowResend.set(true);
    resendTimeout.set(Date.now() + 10 * 1000);
    const { getByTestId } = render(OTP);
    expect(getByTestId('countdown-text')).toBeInTheDocument();
  });

  test('Clicking skip button', () => {
    loading.set(false);
    allowSkip.set(true);
    const { getByTestId } = render(OTP, { skipOTPHandle });
    fireEvent.click(getByTestId('otp-sec-skip-btn'));
    expect(skipOTPHandle).toHaveBeenCalledTimes(1);
  });

  test('Resend button rendered after countdown ends', async () => {
    loading.set(false);
    allowResend.set(true);
    resendTimeout.set(Date.now() + 2 * 1000);
    const { getByText } = render(OTP);
    await waitFor(
      () => {
        expect(getByText('Resend OTP')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
