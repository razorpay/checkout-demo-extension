import { render, fireEvent } from '@testing-library/svelte';
import ListSvelte from 'one_click_checkout/shipping_options/ui/List.svelte';

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

describe('Shipping methods list tests', () => {
  it('Should show max two options when not expanded', () => {
    const { queryByText } = render(ListSvelte, {
      options,
    });

    expect(queryByText(options[2].name)).not.toBeInTheDocument();
    expect(queryByText(options[2].description)).not.toBeInTheDocument();
  });

  it('Should show all the options when expanded', () => {
    const { getByText } = render(ListSvelte, {
      options,
      expanded: true,
    });

    options.forEach((option) => {
      expect(
        getByText((content) => content.startsWith(option.name))
      ).toBeInTheDocument();
      expect(getByText(option.description)).toBeInTheDocument();
    });
  });

  it('Should show all options when an overlay', () => {
    const { getByText } = render(ListSvelte, {
      options,
      isOverlay: true,
    });

    options.forEach((option) => {
      expect(
        getByText((content) => content.startsWith(option.name))
      ).toBeInTheDocument();
      expect(getByText(option.description)).toBeInTheDocument();
    });
  });

  it('Should render continue cta as overlay', () => {
    const { getByText } = render(ListSvelte, {
      options,
      isOverlay: true,
    });

    expect(getByText('Continue')).toBeInTheDocument();
  });

  it('Should trigger the onContinue prop on cta click', async () => {
    const onContinue = jest.fn();

    const { getByRole } = render(ListSvelte, {
      options,
      isOverlay: true,
      onContinue,
    });

    const cta = getByRole('button');
    await fireEvent.click(cta);
    expect(onContinue).toHaveBeenCalled();
    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
