import { isExtensionError } from 'error-service/helpers';

describe('Test isExtensionError', () => {
  it('Should return true for extention error', () => {
    const error = {
      stack: `TypeError: Cannot read properties of null (reading 'click')
      at chrome-extension://jinjaccalgkegednnccohejagnlnfdag/test%20rapid%20click.user.js#2:12:36
      at window.VMino8uixz04kp7zjssr (chrome-extension://jinjaccalgkegednnccohejagnlnfdag/test%20rapid%20click.user.js#2:16:3)
      at a (chrome-extension://jinjaccalgkegednnccohejagnlnfdag/sandbox/injected-web.js:1:16473)
      at Lt (chrome-extension://jinjaccalgkegednnccohejagnlnfdag/sandbox/injected-web.js:1:16548)
      at set (chrome-extension://jinjaccalgkegednnccohejagnlnfdag/sandbox/injected-web.js:1:16340)
      at chrome-extension://jinjaccalgkegednnccohejagnlnfdag/test%20rapid%20click.user.js#2:1:28`,
    };
    expect(isExtensionError(error)).toBe(true);
  });
  it('Should return false for non extention error', () => {
    const error = {
      stack: `ReferenceError: Intl is not defined
      at https://checkout-static.razorpay.com/build/69dc45b454a9c3c78d3694ff57de6a2bce7f4128/checkout-frame.js:1:201084
      at https://checkout-static.razorpay.com/build/69dc45b454a9c3c78d3694ff57de6a2bce7f4128/checkout-frame.js:1:201702
      at https://checkout-static.razorpay.com/build/69dc45b454a9c3c78d3694ff57de6a2bce7f4128/checkout-frame.js:1:1823605`,
    };
    expect(isExtensionError(error)).toBe(false);
  });
});
