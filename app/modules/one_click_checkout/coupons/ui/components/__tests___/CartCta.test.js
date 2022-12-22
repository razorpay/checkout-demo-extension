import { render, fireEvent } from '@testing-library/svelte';
import CartCta from 'one_click_checkout/coupons/ui/components/CartCta.svelte';
import { setLineItems } from 'one_click_checkout/cart/sessionInterface';

const lineItems = [
  {
    sku: '1649842208776.2551-rowdy-force-joggers',
    name: 'Rowdy Force Joggers',
    price: '69000',
    quantity: '1',
    image_url: 'https://assets.therowdy.club/1649677174873appolive12.jpg',
    variant_id: '1649842209479.307',
  },
  {
    sku: '1657097457775.3232-rowdy-humani-tee',
    name: 'Rowdy Humani Tee',
    price: '63000',
    offer_price: 0,
    quantity: '1',
    image_url: 'https://assets.therowdy.club/1657018535624humatee.jpg',
    variant_id: '1657097459121.626',
  },
  {
    sku: '1657097457775.3232-rowdy-humani-tee',
    name: 'Rowdy Humani Tee',
    price: '63000',
    offer_price: 0,
    quantity: '1',
    image_url: 'https://assets.therowdy.club/1657018535624humatee.jpg',
    variant_id: '1657097459121.626',
  },
];
setLineItems(lineItems);

describe('CartCta', () => {
  test('the button component should be present', () => {
    const { queryByTestId } = render(CartCta);
    expect(queryByTestId('cartCta')).toBeInTheDocument();
  });
  test('should check the initial lable', () => {
    const { queryByText } = render(CartCta);
    expect(queryByText('View 1 more item')).toBeInTheDocument();
  });
  test('should change the lable once the button is clicked', async () => {
    const { getByTestId, queryByText } = render(CartCta);
    const button = getByTestId('cartCta');
    expect(button).not.toBeNull();
    await fireEvent.click(button);
    expect(queryByText('View less')).toBeInTheDocument();
  });
  test('should call the mock function', async () => {
    const onClick = jest.fn();
    const { getByTestId } = render(CartCta);
    const button = getByTestId('cartCta');
    button.onclick = onClick;
    await fireEvent.click(button);
    expect(onClick.mock.calls.length).toBe(1);
  });
});
