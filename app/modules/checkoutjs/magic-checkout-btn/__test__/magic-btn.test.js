import { render, fireEvent } from '@testing-library/svelte';
import { DEFAULT_BUTTON_LABEL, PAGE_TYPES } from '../constants';
import MagicButton from 'checkoutjs/magic-checkout-btn/ui/MagicButton.svelte';

describe('Magic Checkout Button', () => {
  it('Should render button without props', () => {
    const { getByText } = render(MagicButton);

    const node = getByText(DEFAULT_BUTTON_LABEL);

    expect(node).toBeInTheDocument();
  });

  it('Should render correct text based on page-type', () => {
    const { getByText } = render(MagicButton, {
      props: { pageType: PAGE_TYPES.PRODUCT.page },
    });

    const node = getByText(PAGE_TYPES.PRODUCT.text);

    expect(node).toBeInTheDocument();
  });

  it('Should render border radius as passed in props', async () => {
    const borderRadius = '20px';
    const { getByTestId } = render(MagicButton, { props: { borderRadius } });

    const cta = getByTestId('razorpay-magic-btn');

    expect(cta).toHaveStyle({
      'border-radius': borderRadius,
    });
  });

  it('Should render width as passed in props', async () => {
    const width = '50%';
    const { getByTestId } = render(MagicButton, { props: { width } });

    const cta = getByTestId('razorpay-magic-btn');

    expect(cta).toHaveStyle({
      width,
    });
  });

  it('Should render bg color as passed in props', async () => {
    const bgColor = '#000';
    const { getByTestId } = render(MagicButton, { props: { bgColor } });

    const cta = getByTestId('razorpay-magic-btn');

    expect(cta).toHaveStyle({
      'background-color': bgColor,
    });
  });

  it('Should render title as passed in props', async () => {
    const title = 'Pay now !';
    const { getByText } = render(MagicButton, { props: { title } });

    const cta = getByText(title);

    expect(cta).toBeInTheDocument();
  });

  it('Should trigger on click event', async () => {
    const { component, getByText } = render(MagicButton);

    const onClick = jest.fn();

    const cta = getByText(DEFAULT_BUTTON_LABEL);

    component.$on('click', onClick);
    await fireEvent.click(cta);
    expect(onClick.mock.calls.length).toEqual(1);
  });
});
