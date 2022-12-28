import {
  formatLineItems,
  getCartItemAnalyticsPayload,
  isCartTruthy,
} from 'one_click_checkout/cart/helpers.js';
import { cartAmount } from 'one_click_checkout/charges/store';
import { getCurrentScreen } from 'one_click_checkout/analytics/helpers.ts';

jest.mock('one_click_checkout/analytics/helpers.ts', () => {
  return { getCurrentScreen: jest.fn() };
});

describe('FormatLineItems', () => {
  test('should match with the expected output', () => {
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
    expect(formatLineItems(line_items_input)).toEqual(items);
  });
});

describe('getCartItemAnalyticsPayload', () => {
  test('should match with the expected output', () => {
    const item = {
      name: 'Joggers',
      price: 4000,
      quantity: 1,
      image_url: 'https://assets.therowdy.club/1657018535624humatee.jpg',
    };
    const output = {
      item_name: 'Joggers',
      item_image_url: 'https://assets.therowdy.club/1657018535624humatee.jpg',
      item_price: '40',
      item_quantity: 1,
      count_of_items_shown: 1,
      count_of_items_hidden: 1,
      screen_name: 'summary_screen',
      total_items_in_the_cart: 2,
    };
    expect(
      getCartItemAnalyticsPayload(item, {
        itemsShown: 1,
        totalItems: 2,
        screenName: 'summary_screen',
      })
    ).toEqual(output);
    getCurrentScreen.mockReturnValue('summary_screen');
    expect(
      getCartItemAnalyticsPayload(item, {
        itemsShown: 1,
        totalItems: 2,
      })
    ).toEqual(output);
  });
});

describe('isCartTruthy', () => {
  test('should be true when all the fields are there and cartAmount is equal to line_items_amount', () => {
    const items = [
      {
        name: 'item 1',
        price: '1000',
        offer_price: 0,
        quantity: '1',
        image_url: 'https://assets.therowdy.club/1649677174873appolive12.jpg',
        variant_id: '1649842209479.307',
        sku: '1649842208776.2551-rowdy-force-joggers',
      },
      {
        name: 'item 2',
        price: '2000',
        offer_price: 1000,
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
    cartAmount.set(4000);
    expect(isCartTruthy(items)).toBeTruthy();
  });
  test('should be false when all the fields of the item is not there', () => {
    const items = [
      {
        name: 'item 1',
        price: '1000',
        offer_price: 0,
        quantity: '1',
        variant_id: '1649842209479.307',
        sku: '1649842208776.2551-rowdy-force-joggers',
      },
      {
        name: 'item 2',
        price: '2000',
        offer_price: 1000,
        quantity: '1',
        image_url: 'https://assets.therowdy.club/1657018535624humatee.jpg',
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
        sku: '1657097457775.3232-rowdy-humani-tee',
      },
    ];
    cartAmount.set(4000);
    expect(isCartTruthy(items)).toBeFalsy();
  });
  test('should be false when cartAmount is not eqaul to line_items_amount', () => {
    const items = [
      {
        name: 'item 1',
        price: '1000',
        offer_price: 0,
        quantity: '1',
        image_url: 'https://assets.therowdy.club/1649677174873appolive12.jpg',
        variant_id: '1649842209479.307',
        sku: '1649842208776.2551-rowdy-force-joggers',
      },
      {
        name: 'item 2',
        price: '2000',
        offer_price: 1000,
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
    cartAmount.set(6000);
    expect(isCartTruthy(items)).toBeFalsy();
  });
  test('should be false when empty cart is passed', () => {
    const items = [];
    cartAmount.set(0);
    expect(isCartTruthy(items)).toBeFalsy();
  });
});
