import {
  isOptionIdValid,
  sortShippingOptions,
  getSelectedOptionIndex,
} from 'one_click_checkout/shipping_options/helpers';

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

describe('isOptionValid tests', () => {
  it('Should return true if provided id is present', () => {
    expect(isOptionIdValid('id2', options)).toBe(true);
  });

  it('Should return false if provided id is not present', () => {
    expect(isOptionIdValid('id4', options)).toBe(false);
  });
});

describe('sortShippingOptions tests', () => {
  it('Should return a sorted array as it is', () => {
    expect(sortShippingOptions(options)).toStrictEqual(options);
  });
});

describe('getSelectedOptionIndex tests', () => {
  it('Should return -1 if id is not provided', () => {
    expect(getSelectedOptionIndex('', options)).toBe(-1);
    expect(getSelectedOptionIndex(null, options)).toBe(-1);
  });

  it('Should return -1 if id is not present', () => {
    expect(getSelectedOptionIndex('id4', options)).toBe(-1);
  });

  it('Should return the index from the list', () => {
    expect(getSelectedOptionIndex('id3', options)).toBe(2);
  });
});
