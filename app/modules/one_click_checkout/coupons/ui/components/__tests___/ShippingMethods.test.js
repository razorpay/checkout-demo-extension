import { render, fireEvent } from '@testing-library/svelte';
import ShippingMethods from 'one_click_checkout/coupons/ui/components/ShippingMethods.svelte';

const options = [
  {
    id: 'id1',
    name: 'Express Delivery',
    description: '1 day delivery',
    shipping_fee: 200,
    cod: true,
    cod_fee: 200,
  },
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

jest.mock('sessionmanager', () => ({
  getSession: jest.fn(() => ({
    setAmount: jest.fn(),
  })),
}));

describe('ShippingMethods widget tests', () => {
  it('Should render only 2 options by default', () => {
    const { getByText, queryByText } = render(ShippingMethods, {
      options,
    });

    expect(
      getByText((content) => content.startsWith(options[1].name))
    ).toBeInTheDocument();
    expect(getByText(options[1].description)).toBeInTheDocument();
    expect(queryByText(options[2].name)).not.toBeInTheDocument();
    expect(queryByText(options[2].description)).not.toBeInTheDocument();
    expect(getByText('View more delivery options')).toBeInTheDocument();
  });

  it('Should show all options when expanded', async () => {
    const { getByText } = render(ShippingMethods, {
      options,
    });

    const expandCta = getByText('View more delivery options');
    await fireEvent.click(expandCta);

    expect(
      getByText((content) => content.startsWith(options[1].name))
    ).toBeInTheDocument();
    expect(getByText(options[1].description)).toBeInTheDocument();
    expect(
      getByText((content) => content.startsWith(options[2].name))
    ).toBeInTheDocument();
    expect(getByText(options[2].description)).toBeInTheDocument();
    expect(getByText('View less')).toBeInTheDocument();
  });
});
