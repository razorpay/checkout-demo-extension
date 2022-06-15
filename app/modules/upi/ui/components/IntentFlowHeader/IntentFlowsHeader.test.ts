import { render } from '@testing-library/svelte';
import { IntentFlowsHeader } from '.';
import { getLastUpiUxErroredPaymentApp } from 'upi/helper/upiUx';

jest.mock('upi/experiments', () => ({
  upiUxV1dot1: {
    enabled: () => true,
  },
}));

jest.mock('upi/helper/upiUx', () => ({
  getLastUpiUxErroredPaymentApp: jest.fn(),
}));
describe('IntentFlowsHeader', () => {
  it('should be rendered', async () => {
    (getLastUpiUxErroredPaymentApp as jest.Mock).mockReturnValue({});
    const result = render(IntentFlowsHeader, {
      visible: true,
    });
    expect(result).toBeTruthy();
    expect(
      result.queryByText('You will be redirected to your UPI app')
    ).toBeInTheDocument();
  });
  it('should be rendered with error message when PSP app error is present in UPI UX Payment', async () => {
    (getLastUpiUxErroredPaymentApp as jest.Mock).mockReturnValue({
      name: 'PayTM',
      shortcode: 'paytm',
    });
    const result = render(IntentFlowsHeader, {
      visible: true,
    });
    expect(result).toBeTruthy();

    expect(result.queryByText('PayTM')).toBeInTheDocument();
  });

  it('should be rendered with V2 redirection message', async () => {
    (getLastUpiUxErroredPaymentApp as jest.Mock).mockReturnValue({});
    const result = render(IntentFlowsHeader, {
      visible: true,
      showRedirectV2message: true,
    });
    expect(result).toBeTruthy();

    expect(
      result.queryByText(
        'Choose the app installed on your phone to make the payment directly using the app'
      )
    ).toBeInTheDocument();
  });
});
