import { MERCHANT_TEST_KEY } from '../constant';

const Options = (overrides: Record<string, any> = {}) => {
  let merchantOptions = {
    key: MERCHANT_TEST_KEY,
  };
  if (typeof overrides === 'object' && overrides) {
    merchantOptions = { ...merchantOptions, ...overrides };
  }
  return merchantOptions;
};

export default Options;
