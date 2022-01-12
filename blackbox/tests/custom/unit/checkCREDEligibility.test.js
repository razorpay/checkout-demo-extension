const initCustomCheckout = require('blackbox/tests/custom/init.js');
const mockAPI = require('blackbox/tests/custom/mockApi.js');

let context;

const credEligible = ['+919740445948'];
const credInEligible = ['+918888888888'];

describe('checkCREDEligibility - Custom Checkout UT', () => {
  beforeEach(async () => {
    context = await initCustomCheckout({ page });
  });
  afterEach(async () => {
    page.removeAllListeners('request');
  });

  describe.each(credEligible)('Eligible Contact', (contact) => {
    test(`validate input ${contact}`, async () => {
      const checkCREDEligibilityPromise = page.evaluate(async (contact) => {
        return await window.rp.checkCREDEligibility(contact);
      }, contact);
      await context.expectRequest((req) => {});
      await context.respondJSON(mockAPI.credEligibleResponse(contact));
      const response = await checkCREDEligibilityPromise;
      expect(response.success).toBeTruthy();
      expect(response.data.state).toBe('ELIGIBLE');
    });
  });

  describe.each(credInEligible)('invalid VPA', (contact) => {
    test(`validate input ${contact}`, async () => {
      const checkCREDEligibilityPromise = page.evaluate(async (contact) => {
        let response;
        try {
          response = await window.rp.checkCREDEligibility(contact);
        } catch (e) {
          response = e;
        }
        return response;
      }, contact);
      await context.expectRequest((req) => {});
      await context.respondJSON(mockAPI.credInEligibleResponse());
      const response = await checkCREDEligibilityPromise;
      expect(response.success).toBeFalsy();
      expect(response.error.code).toBe('BAD_REQUEST_ERROR');
      expect(response.error.description).toBe(
        `You're currently not a CRED member. Become a CRED member to pay via CRED Pay and earn special perks. To proceed for now, try a different payment method.`
      );
    });
  });
});
