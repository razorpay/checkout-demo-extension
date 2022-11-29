import CheckoutOptions from 'common/options';
import { amount } from 'one_click_checkout/charges/store';
describe('getAppFromPackageName', () => {
  const dummy_options = {
    show_address: false,
    show_coupons: true,
    one_click_checkout: false,
    mandatory_login: false,
    enable_ga_analytics: false,
    enable_fb_analytics: false,
    key: 'rzp_live_ILgsfZCZoFIKMb',
    amount: 100,
    method: {
      netbanking: true,
      card: true,
    },
    theme: {
      color: null,
    },
    remember_customer: true,
    external: {},
    prefill: {
      name: 'Harshil Mathur',
      email: 'v@gmail.co',
    },
    modal: {},
  };
  it('should generate unique uuid everytime', () => {
    const options = new CheckoutOptions(dummy_options);
    expect(options.get('amount')).toBe(100);
    options.set('amount', 500);
    expect(options.get('amount')).toBe(500);
    options.unset('amount');
    expect(options.get('amount')).toBe(100);
  });
});
