import { truncateString } from 'utils/strings';

describe('truncateString tests', () => {
  test('should correctly truncate string', () => {
    expect(truncateString('Razorpay Checkout', 3)).toBe('Raz...');
    expect(truncateString('Razorpay Checkout', 9)).toBe('Razorpay ...');
    expect(truncateString('Razorpay Checkout', 0)).toBe('...');
    expect(truncateString('Razorpay Checkout', 17)).toBe('Razorpay Checkout');
  });
});
