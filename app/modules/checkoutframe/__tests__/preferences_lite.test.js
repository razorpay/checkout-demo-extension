import Razorpay from 'common/Razorpay';
import browserstorage from 'browserstorage';
import {
  fetchPreferencesLite,
  getCachedValue,
} from 'checkoutframe/preferences_lite';

jest.mock('common/Razorpay', () => ({
  __esModule: true,
  default: {
    payment: {
      getPrefs: jest.fn(),
    },
  },
}));

const TEST_KEY = 'rzp_test_key';
const response = {
  options: {
    theme: {
      color: '#000000',
    },
    image: null,
    remember_customer: true,
  },
  fee_bearer: false,
  version: 1,
  language_code: 'en',
  merchant_key: 'rzp_live_doOidGOxQnkbe5',
  merchant_name: 'Nexxbase Marketing Private Limited i',
  merchant_brand_name: 'Nexxbase Marketing Private Limited i',
  mode: 'live',
  magic: true,
  blocked: false,
  activated: true,
  global: true,
  features: {
    google_pay: true,
    google_pay_omnichannel: true,
    save_vpa: true,
    one_click_checkout: true,
    one_cc_merchant_dashboard: true,
    one_cc_mandatory_login: true,
    one_cc_ga_analytics: true,
    one_cc_fb_analytics: true,
    redirect_to_zestmoney: true,
  },
  '1cc': {
    configs: {
      one_click_checkout: true,
      one_cc_ga_analytics: true,
      one_cc_fb_analytics: true,
      cod_intelligence: false,
      one_cc_capture_billing_address: false,
      one_cc_international_shipping: false,
      manual_control_cod_order: false,
      one_cc_capture_gstin: false,
      one_cc_capture_order_instructions: false,
      one_cc_auto_fetch_coupons: false,
      one_cc_buy_now_button: false,
    },
  },
  org: {
    isOrgRazorpay: true,
    checkout_logo_url:
      'https://rzp-1415-prod-dashboard-activation.s3.amazonaws.com/org_100000razorpay/checkout_logo/phpmeNFmd',
  },
  rtb: true,
  rtb_experiment: {
    experiment: false,
  },
  '1cc_experiment': null,
  '1cc_city_autopopulate_disable': null,
  '1cc_cart_items_exp': 'VARIANT_B',
  '1cc_address_flow_exp': null,
  experiments: {
    checkout_redesign_v1_5: true,
    upi_ux: 'existing_variant',
    emi_ux_revamp: true,
    upi_qr_v2: false,
    cb_redesign_v1_5: false,
    recurring_redesign_v1_5: true,
    reuse_upi_paymentId: true,
    recurring_upi_intent_qr: false,
    recurring_upi_all_psp: false,
    banking_redesign_v15: false,
  },
  show_donation: false,
  '1cc_coupon_drop_off_exp': null,
};

describe('Preferences Lite tests', () => {
  describe('getCachedValue tests', () => {
    it('should return null, when flush_cache=true', () => {
      const cache = getCachedValue(TEST_KEY, true);

      expect(cache).toBeFalsy();
    });

    it('should return null when TTL is expired', () => {
      browserstorage.setItem(
        `preferences_lite_updated_at[${TEST_KEY}]`,
        Date.now() - 120 * 60 * 1000
      );
      browserstorage.setItem(
        `preferences_lite[${TEST_KEY}]`,
        JSON.stringify(response)
      );

      const cache = getCachedValue(TEST_KEY);

      expect(cache).toBeFalsy();
    });

    it('should return null when cache is not present', () => {
      const cache = getCachedValue(TEST_KEY);

      expect(cache).toBeFalsy();
    });

    it('should return preferences when cache exists', () => {
      browserstorage.setItem(
        `preferences_lite_updated_at[${TEST_KEY}]`,
        Date.now()
      );
      browserstorage.setItem(
        `preferences_lite[${TEST_KEY}]`,
        JSON.stringify(response)
      );

      const cache = getCachedValue(TEST_KEY);

      expect(cache).toMatchObject(response);
    });
  });

  describe('fetchPreferencesLite method', () => {
    it('should not call preferencs if cache exists', async () => {
      browserstorage.setItem(
        `preferences_lite_updated_at[${TEST_KEY}]`,
        Date.now()
      );
      browserstorage.setItem(
        `preferences_lite[${TEST_KEY}]`,
        JSON.stringify(response)
      );

      try {
        const preferences_lite = await fetchPreferencesLite({
          key_id: TEST_KEY,
        });
        expect(preferences_lite).toMatchObject(response);
        expect(Razorpay.payment.getPrefs).not.toBeCalled();
      } catch (e) {
        console.log(e);
      }
    });

    it("should call preferences if cache doesn't exist", async () => {
      browserstorage.removeItem(`preferences_lite_updated_at[${TEST_KEY}]`);
      browserstorage.removeItem(`preferences_lite[${TEST_KEY}]`);

      Razorpay.payment.getPrefs.mockImplementation((data, callback) => {
        callback(response);
      });

      const preferences_lite = await fetchPreferencesLite({
        key_id: TEST_KEY,
      });

      expect(Razorpay.payment.getPrefs.mock.calls[0][0]).toMatchObject({
        '_[agent][device]': 'desktop',
        '_[agent][os]': 'other',
        '_[agent][platform]': 'web',
        '_[build]': '123456789',
        '_[library]': 'checkoutjs',
        '_[platform]': 'browser',
        checkcookie: 1,
        currency: ['INR'],
        key_id: 'rzp_test_key',
      });
      expect(preferences_lite).toMatchObject(response);
    });

    it('should call reject if preferences fails', async () => {
      const error = {
        message: 'Something went wrong',
      };

      browserstorage.removeItem(`preferences_lite_updated_at[${TEST_KEY}]`);
      browserstorage.removeItem(`preferences_lite[${TEST_KEY}]`);

      Razorpay.payment.getPrefs.mockImplementation((data, callback) => {
        callback({ error });
      });

      try {
        await fetchPreferencesLite({
          key_id: TEST_KEY,
        });
      } catch (e) {
        expect(Razorpay.payment.getPrefs.mock.calls[0][0]).toMatchObject({
          '_[agent][device]': 'desktop',
          '_[agent][os]': 'other',
          '_[agent][platform]': 'web',
          '_[build]': '123456789',
          '_[library]': 'checkoutjs',
          '_[platform]': 'browser',
          checkcookie: 1,
          currency: ['INR'],
          key_id: 'rzp_test_key',
        });
        expect(e).toMatchObject(error);
      }
    });
  });
});
