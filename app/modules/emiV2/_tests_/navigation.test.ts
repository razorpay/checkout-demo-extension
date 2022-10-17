import { screenStore } from 'checkoutstore';
import { attemptCardlessEmiPayment } from 'emiV2/helper/prefillPayment';
import { handleEmiPaymentV2 } from 'emiV2/payment';
import { render } from '@testing-library/svelte';
import { get } from 'svelte/store';
import PhoneNumber from 'emiV2/ui/components/EmiTabsScreen/PhoneNumber.svelte';

jest.mock('razorpay', () => ({
  ...jest.requireActual('razorpay'),
  isEmiV2: () => true,
}));

jest.mock('emiV2/payment', () => ({
  handleEmiPaymentV2: jest.fn(),
}));

describe('Validate: attemptCardlessEmiPayment', () => {
  test('For cardless bank providers emiPlans screen must render', () => {
    attemptCardlessEmiPayment('hdfc');
    let currentScreen = get(screenStore);
    expect(currentScreen).toBe('emiPlans');
    expect(handleEmiPaymentV2).not.toBeCalled();

    const result = render(PhoneNumber);
    expect(result).toBeTruthy();
    expect(result.queryByText('Add Mobile Number')).toBeInTheDocument();
  });

  test('For Axio/Zestmoney payment function must be called', () => {
    attemptCardlessEmiPayment('walnut369');
    expect(handleEmiPaymentV2).toBeCalled();

    attemptCardlessEmiPayment('zestmoney');
    expect(handleEmiPaymentV2).toBeCalled();
  });
});
