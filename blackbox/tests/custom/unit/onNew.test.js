const initCustomCheckout = require('blackbox/tests/custom/init.js');
const mockAPI = require('blackbox/tests/custom/mockApi.js');

let context;

describe('onNew - Custom Checkout UT', () => {
  beforeEach(async () => {
    context = await initCustomCheckout({ page });
  });
  afterEach(async () => {
    page.removeAllListeners('request');
  });
  test('get Preferences', async () => {
    /**
     * Expected preference response in callback
     */
    const preferencesPromise = page.evaluate(async () => {
      const rp = window.rp;
      return await new Promise(resolve => {
        rp.onNew('ready', preference => {
          resolve(preference);
        });
      });
    });
    await context.expectRequest(req => {});
    await context.respondJSONP(mockAPI.preferences());
    const preferences = await preferencesPromise;
    // Check mode test
    expect(preferences.mode).toBe('test');
    // check method exist
    expect(preferences.hasOwnProperty('methods')).toBeTruthy();
  });
});
