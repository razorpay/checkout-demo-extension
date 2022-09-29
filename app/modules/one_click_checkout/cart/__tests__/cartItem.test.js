import { render } from '@testing-library/svelte';

import CartItem from 'one_click_checkout/cart/ui/CartItem.svelte';
import { scriptCouponApplied } from 'razorpay';
import { FREE_LABEL } from 'summary_modal/i18n/labels';

const item = {
  name: 'Joggers',
  price: 4000,
  quantity: 1,
  image_url: 'https://assets.therowdy.club/1657018535624humatee.jpg',
};

jest.mock('razorpay', () => ({
  ...jest.requireActual('razorpay'),
  scriptCouponApplied: jest.fn(),
}));

describe('CartItem tests', () => {
  test('render item with proper details', () => {
    scriptCouponApplied.mockReturnValue(false);
    const component = render(CartItem, {
      props: item,
    });

    const nameNode = component.getByText(item.name);
    const priceNode = component.getByText(item.price / 100);

    expect(nameNode).toBeInTheDocument();
    expect(priceNode).toBeInTheDocument();
    expect(component.getByText('Quantity: 1')).toBeInTheDocument();
  });

  test('should show offer_price if provided and script editor enabled', () => {
    scriptCouponApplied.mockReturnValue(true);
    const component = render(CartItem, {
      props: { ...item, offer_price: 2000 },
    });

    expect(component.getByText(20)).toBeInTheDocument();
  });

  test('should show free label for 0 offer_price', () => {
    scriptCouponApplied.mockReturnValue(true);
    const component = render(CartItem, {
      props: { ...item, offer_price: 0 },
    });

    expect(component.getByText('FREE')).toBeInTheDocument();
  });
});
