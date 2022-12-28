import { setLineItems } from 'one_click_checkout/cart/sessionInterface.js';
import { get } from 'svelte/store';
import { cartItems } from 'one_click_checkout/cart/store';

const line_items_input = [
  {
    sku: '1649842208776.2551-rowdy-force-joggers',
    name: 'Rowdy Force Joggers',
    price: '1000',
    quantity: '1',
    image_url: 'https://assets.therowdy.club/1649677174873appolive12.jpg',
    variant_id: '1649842209479.307',
  },
  {
    sku: '1657097457775.3232-rowdy-humani-tee',
    name: 'Rowdy Humani Tee',
    price: '2000',
    quantity: '1',
    image_url: 'https://assets.therowdy.club/1657018535624humatee.jpg',
    variant_id: '1657097459121.626',
    offer_price: 0,
  },
  {
    sku: '1649842208776.2551-rowdy-force-joggers',
    name: 'Rowdy Force Joggers',
    price: '3000',
    quantity: '1',
    image_url: 'https://assets.therowdy.club/1649677174873appolive12.jpg',
    variant_id: '1649842209479.307',
  },
  {
    sku: '1649842208776.2551-rowdy-force-joggers',
    name: 'Rowdy Force Joggers',
    price: '4000',
    quantity: '1',
    image_url: 'https://assets.therowdy.club/1649677174873appolive12.jpg',
    variant_id: '1649842209479.307',
    offer_price: 2000,
  },
];
const items = [
  {
    name: 'Rowdy Force Joggers',
    price: '1000',
    quantity: '1',
    image_url: 'https://assets.therowdy.club/1649677174873appolive12.jpg',
    variant_id: '1649842209479.307',
    sku: '1649842208776.2551-rowdy-force-joggers',
  },
  {
    name: 'Rowdy Humani Tee',
    price: '2000',
    quantity: '1',
    image_url: 'https://assets.therowdy.club/1657018535624humatee.jpg',
    variant_id: '1657097459121.626',
    offer_price: 0,
    sku: '1657097457775.3232-rowdy-humani-tee',
  },
  {
    name: 'Rowdy Force Joggers',
    price: '3000',
    quantity: '1',
    image_url: 'https://assets.therowdy.club/1649677174873appolive12.jpg',
    variant_id: '1649842209479.307',
    sku: '1649842208776.2551-rowdy-force-joggers',
  },
  {
    name: 'Rowdy Force Joggers',
    price: '4000',
    quantity: '1',
    image_url: 'https://assets.therowdy.club/1649677174873appolive12.jpg',
    variant_id: '1649842209479.307',
    offer_price: 2000,
    sku: '1649842208776.2551-rowdy-force-joggers',
  },
];

describe('sessionInterface Test', () => {
  test('should match with the value of CartItems', () => {
    setLineItems(line_items_input);
    expect(get(cartItems)).toEqual(items);
  });
});
