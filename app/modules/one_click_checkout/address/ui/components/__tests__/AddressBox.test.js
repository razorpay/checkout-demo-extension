import { render } from '@testing-library/svelte';
import { getSingleShippingExpVariant } from 'razorpay';
import AddressBoxSvelte from '../AddressBox.svelte';

const DEFAULT_ADDRESS = {
  source_type: 'pp',
  serviceability: true,
  formattedLine1: 'SJR Cyber Laskar',
  formattedLine2: 'Hosur Road',
  formattedLine3: 'Adugodi',
  name: 'Razor',
  type: 'pp',
  line1: 'SJR Cyber Laskar',
  line2: 'Hosur Road',
  zipcode: 'Adugodi',
  city: 'Benglauru',
  state: 'Karnataka',
  tag: 'Home',
  landmark: 'Opp Adugodi police station',
  country: 'IN',
  contact: '+919353231953',
};

const shipping_methods = [
  {
    id: 'id2',
    name: 'Standard Delivery',
    description: '4-5 days delivery',
    shipping_fee: 500,
    cod: true,
    cod_fee: 500,
  },
  {
    id: 'id3',
    name: 'Test Delivery',
    description: '2 days delivery',
    shipping_fee: 800,
    cod: true,
    cod_fee: 800,
  },
];

jest.mock('razorpay', () => ({
  ...jest.requireActual('razorpay'),
  __esModule: true,
  getSingleShippingExpVariant: jest.fn(),
}));

describe('Address box tests: Renders address', () => {
  it('should render shimmer when loading: true', async () => {
    const el = render(AddressBoxSvelte, {
      loading: true,
      address: DEFAULT_ADDRESS,
    });

    const node = await el.findByTestId('address-shimmer');
    expect(node).toBeInTheDocument();

    const addressBoxNode = el.findByTestId('address-box');
    await expect(addressBoxNode).rejects.toThrow(
      'Unable to find an element by: [data-testid="address-box"]'
    );
  });

  it('should render address when loading: false', async () => {
    const el = render(AddressBoxSvelte, {
      loading: false,
      address: DEFAULT_ADDRESS,
    });

    const node = await el.findByTestId('address-box');
    expect(node).toBeInTheDocument();

    const shimmerNode = el.findByTestId('address-shimmer');
    await expect(shimmerNode).rejects.toThrow(
      'Unable to find an element by: [data-testid="address-shimmer"]'
    );
  });

  it('should render edit icon when isEditable: true', async () => {
    const el = render(AddressBoxSvelte, {
      loading: false,
      address: DEFAULT_ADDRESS,
      isEditable: true,
    });

    const node = await el.findByTestId('address-edit-cta');

    expect(node).toBeInTheDocument();
  });

  it('should render error message when address is unserviceable', async () => {
    const el = render(AddressBoxSvelte, {
      loading: false,
      address: {
        ...DEFAULT_ADDRESS,
        serviceability: false,
      },
      isEditable: true,
    });

    const node = await el.findByTestId('address-box-unserviceability');

    expect(node).toBeInTheDocument();
  });

  it('should render the delivery charge banner when only one shipping option is present', async () => {
    getSingleShippingExpVariant.mockImplementation(() => 'VARIANT_A');
    const address = {
      ...DEFAULT_ADDRESS,
      shipping_methods: [shipping_methods[0]],
    };
    const el = render(AddressBoxSvelte, {
      loading: false,
      address,
      isEditable: true,
    });
    const node = await el.findByTestId('shipping-banner');
    expect(node).toBeInTheDocument();
  });

  it('should not render the delivery charge banner when more than one shipping option is present', () => {
    getSingleShippingExpVariant.mockImplementation(() => 'VARIANT_A');
    const address = { ...DEFAULT_ADDRESS, shipping_methods };
    const el = render(AddressBoxSvelte, {
      loading: false,
      address,
      isEditable: true,
    });
    const node = el.queryByTestId('shipping-banner');
    expect(node).not.toBeInTheDocument();
  });

  it('should not  render the delivery charge banner if exp variant is B and description not present', () => {
    getSingleShippingExpVariant.mockImplementation(() => 'VARIANT_B');
    const { description, ...optWithoutDesc } = shipping_methods[0];
    const address = { ...DEFAULT_ADDRESS, shipping_methods: [optWithoutDesc] };
    const el = render(AddressBoxSvelte, {
      loading: false,
      address,
      isEditable: true,
    });
    const node = el.queryByTestId('shipping-banner');
    expect(node).not.toBeInTheDocument();
  });

  it('should render the delivery charge banner if exp variant is A and description not present', () => {
    getSingleShippingExpVariant.mockImplementation(() => 'VARIANT_A');
    const { description, ...optWithoutDesc } = shipping_methods[0];
    const address = { ...DEFAULT_ADDRESS, shipping_methods: [optWithoutDesc] };
    const el = render(AddressBoxSvelte, {
      loading: false,
      address,
      isEditable: true,
    });
    const node = el.queryByTestId('shipping-banner');
    expect(node).toBeInTheDocument();
  });
});
