import { render } from '@testing-library/svelte';
import CartItemList from 'one_click_checkout/cart/ui/CartItemList.svelte';

const items = [
  {
    name: 'item 1',
    price: '1000',
    quantity: '1',
    image_url: 'https://assets.therowdy.club/1649677174873appolive12.jpg',
    variant_id: '1649842209479.307',
    sku: '1649842208776.2551-rowdy-force-joggers',
  },
  {
    name: 'item 2',
    price: '2000',
    quantity: '1',
    image_url: 'https://assets.therowdy.club/1657018535624humatee.jpg',
    variant_id: '1657097459121.626',
    sku: '1657097457775.3232-rowdy-humani-tee',
  },
  {
    name: 'item 3',
    price: '1000',
    quantity: '1',
    image_url: 'https://assets.therowdy.club/1649677174873appolive12.jpg',
    variant_id: '1649842209479.307',
    sku: '1649842208776.2551-rowdy-force-joggers',
  },
  {
    name: 'item 4',
    price: '2000',
    quantity: '1',
    image_url: 'https://assets.therowdy.club/1657018535624humatee.jpg',
    variant_id: '1657097459121.626',
    sku: '1657097457775.3232-rowdy-humani-tee',
  },
];

describe('CartItemList test', () => {
  test('should render all the items', () => {
    const { getByText } = render(CartItemList, { items: items });
    expect(getByText('item 1')).toBeInTheDocument();
    expect(getByText('item 2')).toBeInTheDocument();
    expect(getByText('item 3')).toBeInTheDocument();
    expect(getByText('item 4')).toBeInTheDocument();
  });
});
