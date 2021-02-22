const initCustomCheckout = require('blackbox/tests/custom/init.js');
const mockAPI = require('blackbox/tests/custom/mockApi.js');

let context;

const validVPA = ['rzp@ybl', 'rzp@okaxis', 'rzp@paytm'];
const inValidVPA = ['rzp@aybl', 'rzp@okrbl', 'rzp@amigo'];

describe('verifyVPA - Custom Checkout UT', () => {
  beforeEach(async () => {
    context = await initCustomCheckout({ page });
  });
  afterEach(async () => {
    page.removeAllListeners('request');
  });

    describe.each(validVPA)('valid VPA', vpa => {
      test(`validate input ${vpa}`, async () => {
        const verifyVPAPromise = page.evaluate(async vpaInput => {
          return await window.rp.verifyVpa(vpaInput);
        }, vpa);
        await context.expectRequest(req => {});
        await context.respondJSON(mockAPI.validVPAResponse(vpa));
        const vpaResponse = await verifyVPAPromise;
        expect(vpaResponse.success).toBeTruthy();
        expect(vpaResponse.vpa).toBe(vpa);
      });
    });

  describe.each(inValidVPA)('invalid VPA', vpa => {
    test(`validate input ${vpa}`, async () => {
      const verifyVPAPromise = page.evaluate(async vpaInput => {
        let response;
        try {
          response = await window.rp.verifyVpa(vpaInput);
        } catch (e) {
          response = e;
        }
        return response;
      }, vpa);
      await context.expectRequest(req => {});
      await context.respondJSON(mockAPI.invalidVPAResponse());
      const vpaResponse = await verifyVPAPromise;
      expect(vpaResponse.success).toBeFalsy();
      expect(vpaResponse.error.code).toBe('BAD_REQUEST_ERROR');
      expect(vpaResponse.error.description).toBe(
        'Invalid VPA. Please enter a valid Virtual Payment Address'
      );
    });
  });
});
