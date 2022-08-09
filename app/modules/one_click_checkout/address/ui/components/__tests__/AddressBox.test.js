import { render } from '@testing-library/svelte';
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
});
