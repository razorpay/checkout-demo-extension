import { render } from '@testing-library/svelte';
import Item from 'one_click_checkout/shipping_options/ui/Item.svelte';

const option = {
  id: 'id3',
  name: 'Test Delivery',
  description: '2 days delivery',
  shipping_fee: 800,
  cod: true,
  cod_fee: 800,
};

jest.mock('razorpay', () => ({
  ...jest.requireActual('razorpay'),
  __esModule: true,
  getCurrency: jest.fn(() => 'INR'),
}));

describe('Shipping methods item tests', () => {
  it('Should render with all details when present', () => {
    const { getByText } = render(Item, {
      option,
    });

    expect(
      getByText((content) => content.startsWith(option.name))
    ).toBeInTheDocument();
    expect(getByText((content) => content.endsWith('8'))).toBeInTheDocument();
    expect(getByText(option.description)).toBeInTheDocument();
  });

  it('Should not render description when not present', () => {
    const { description, ...withoutDescOption } = option;

    const { getByText, queryByText } = render(Item, {
      option: withoutDescOption,
    });

    expect(
      getByText((content) => content.startsWith(option.name))
    ).toBeInTheDocument();
    expect(getByText((content) => content.endsWith('8'))).toBeInTheDocument();
    expect(queryByText(option.description)).not.toBeInTheDocument();
  });

  it('Should show free label when shipping fee is 0', () => {
    option.shipping_fee = 0;

    const { getByText } = render(Item, {
      option,
    });

    expect(
      getByText((content) => content.startsWith(option.name))
    ).toBeInTheDocument();
    expect(
      getByText((content) => content.endsWith('Free'))
    ).toBeInTheDocument();
    expect(getByText(option.description)).toBeInTheDocument();
  });
});
