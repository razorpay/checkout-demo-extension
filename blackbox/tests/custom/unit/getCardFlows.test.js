const initCustomCheckout = require('blackbox/tests/custom/init.js');
const mockAPI = require('blackbox/tests/custom/mockApi.js');

let context;

describe('getCardFlows - Custom Checkout UT', () => {
  beforeEach(async () => {
    context = await initCustomCheckout({ page });
  });
  afterEach(async () => {
    page.removeAllListeners('request');
  });
  test('getCardFlows', async () => {
    const cardFlowPromise = page.evaluate(async () => {
      const rp = window.rp;
      return await new Promise(resolve => {
        rp.getCardFlows('41111111111111111', response => {
          resolve(response);
        });
      });
    });
    await context.expectRequest(req => {});
    await context.respondJSONP(mockAPI.iinResponse());
    const cardFlow = await cardFlowPromise;
    expect(cardFlow.recurring).toBeFalsy();
    expect(cardFlow.emi).toBeFalsy();
    expect(cardFlow.iframe).toBeFalsy();
  });

  test('getCardFeatures', async () => {
    const cardFlowPromise = page.evaluate(async () => {
      const rp = window.rp;
      return await rp.getCardFeatures('41111111111111111');
    });
    await context.expectRequest(req => {});
    await context.respondJSONP(mockAPI.iinResponse());
    const cardFlow = await cardFlowPromise;
    expect(cardFlow.recurring).toBeFalsy();
    expect(cardFlow.emi).toBeFalsy();
    expect(cardFlow.iframe).toBeFalsy();
  });
});
