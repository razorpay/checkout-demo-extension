import { MERCHANT_TEST_KEY } from '../constant';
import type { OptionObject } from '../../app/modules/razorpay/types/Options';

type NestedPartial<T> = {
  [P in keyof T]?: NestedPartial<T[P]>;
};

const Options = (overrides: NestedPartial<OptionObject> = {}) => {
  let merchantOptions = {
    key: MERCHANT_TEST_KEY,
  };
  if (typeof overrides === 'object' && overrides) {
    merchantOptions = { ...merchantOptions, ...overrides };
  }
  return merchantOptions;
};

export default Options;
