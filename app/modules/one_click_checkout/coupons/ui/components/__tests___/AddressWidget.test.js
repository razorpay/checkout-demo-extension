import { render, fireEvent } from '@testing-library/svelte';
import AddressWidget from 'one_click_checkout/coupons/ui/components/AddressWidget.svelte';
import { savedAddresses } from 'one_click_checkout/address/store';
import { selectedAddressId } from 'one_click_checkout/address/shipping_address/store';
import { getServiceability } from 'one_click_checkout/address/controller';
import { isBillingAddressEnabled } from 'razorpay';

jest.mock('razorpay', () => {
  const originalModule = jest.requireActual('razorpay');
  return {
    ...originalModule,
    isBillingAddressEnabled: jest.fn(),
  };
});

const address = [
  {
    cit: 'Bengaluru',
    contact: '+919123456789',
    country: 'in',
    formattedLine1: 'test test',
    formattedLine2: 'test test',
    formattedLine3: 'test test',
    id: 'ISXW2w9b7WcgMA',
    landmark: 'test test',
    line1: 'test test',
    line2: 'test test',
    name: 'Razorpay',
    serviceability: true,
    source_type: null,
    state: 'Karnataka',
    tag: 'Home',
    type: 'shipping_address',
    zipcode: '560001',
  },
  {
    cit: 'Bengaluru',
    contact: '+919123456788',
    country: 'in',
    formattedLine1: 'test test 2',
    formattedLine2: 'test test 2',
    formattedLine3: 'test test 2',
    id: 'JCxhRdbhHL4Qrw',
    landmark: 'test test',
    line1: 'test test',
    line2: 'test test',
    name: 'Razorpay2',
    serviceability: true,
    source_type: null,
    state: 'Karnataka',
    tag: 'Home',
    type: 'shipping_address',
    zipcode: '560001',
  },
];
describe('Address Widgit', () => {
  test('should have first address in the document', async () => {
    savedAddresses.set(address);
    selectedAddressId.set(address[0].id);
    const { getByText } = render(AddressWidget);
    expect(getByText('Razorpay')).toBeInTheDocument();
    expect(getByText('+91 9123456789')).toBeInTheDocument();
  });
  test('should not have 2nd address in the document', () => {
    const { queryByText } = render(AddressWidget);
    expect(queryByText('Razorpay 2')).not.toBeInTheDocument();
    expect(queryByText('+91 9123456788')).not.toBeInTheDocument();
  });
  test('should have the following components', async () => {
    const { getByText } = render(AddressWidget);
    expect(getByText('Delivery Address')).toBeInTheDocument();
    expect(getByText('(2 saved)')).toBeInTheDocument();
  });
  test('checking the working of Add/Change button', async () => {
    const onClick = jest.fn();
    const { getByText } = render(AddressWidget);
    const button = getByText('Add / Change');
    button.onclick = onClick;
    await fireEvent.click(button);
    expect(onClick.mock.calls.length).toBe(1);
  });
  test('checking the working of checkbox', async () => {
    isBillingAddressEnabled.mockReturnValue(true);
    const onClick = jest.fn();
    const { getByText } = render(AddressWidget);
    const checkbox = getByText('Billing address same as delivery address');
    checkbox.onclick = onClick;
    await fireEvent.click(checkbox);
    expect(onClick.mock.calls.length).toBe(1);
  });
});
