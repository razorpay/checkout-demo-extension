import { fireEvent, render } from '@testing-library/svelte';
import { isBillingAddressEnabled } from 'razorpay';
import SameBillingAndShippingSvelte from '../SameBillingAndShipping.svelte';

jest.mock('razorpay', () => {
  const originalModule = jest.requireActual('razorpay');
  return {
    __esModule: true,
    originalModule,
    isBillingAddressEnabled: jest.fn(),
  };
});
describe('SameBillingAndShipping Component tests', () => {
  it('should render checkbox when billing address enabled', () => {
    isBillingAddressEnabled.mockReturnValue(true);

    const el = render(SameBillingAndShippingSvelte);
    const node = el.getByTestId('same-billing-address-checkbox');

    expect(node).toBeInTheDocument();
  });

  it('should fire toggle event on clicking checkbox', async () => {
    isBillingAddressEnabled.mockReturnValue(true);
    const onToggle = jest.fn();

    const el = render(SameBillingAndShippingSvelte);
    el.component.$on('toggle', onToggle);

    const node = el.getByTestId('same-billing-address-checkbox');
    const checkbox = node.querySelector('input');
    await fireEvent.click(checkbox);

    expect(onToggle).toBeCalledTimes(1);
  });
});
