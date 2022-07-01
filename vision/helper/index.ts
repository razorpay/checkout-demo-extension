import type { RouterType } from '../core';

type Object<T = any> = { [x: string]: T };

export function setPreference(
  router: RouterType,
  options: Object,
  responseData: Object
) {
  router.get(
    `https://api.razorpay.com/v1/preferences?key_id=${
      options.key
    }&currency%5B0%5D=INR&amount=${options.amount || 100}`,
    responseData,
    { partialMatch: true }
  );
}
