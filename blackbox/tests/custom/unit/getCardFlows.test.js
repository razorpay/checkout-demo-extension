const initCustomCheckout = require('blackbox/tests/custom/init.js');
const mockAPI = require('blackbox/tests/custom/mockApi.js');

let context;

const cardNumber = '41111111111111111';

describe('getCardFlows - Custom Checkout UT', () => {
  beforeEach(async () => {
    context = await initCustomCheckout({ page });
  });
  afterEach(async () => {
    page.removeAllListeners('request');
  });
  test('getCardFlows', async () => {
    const cardFlowPromise = page.evaluate(async (card) => {
      return await new Promise(resolve => {
        window.rp.getCardFlows(card, response => {
          resolve(response);
        });
      });
    }, cardNumber);
    await context.expectRequest(req => {});
    await context.respondJSONP(mockAPI.iinResponse());
    const cardFlow = await cardFlowPromise;
    expect(cardFlow.recurring).toBeFalsy();
    expect(cardFlow.emi).toBeFalsy();
    expect(cardFlow.iframe).toBeFalsy();
  });

  test('getCardFeatures', async () => {
    const cardFlowPromise = page.evaluate(async (card) => {
      const rp = window.rp;
      return await rp.getCardFeatures(card);
    }, cardNumber);
    await context.expectRequest(req => {});
    await context.respondJSONP(mockAPI.iinResponse());
    const cardFlow = await cardFlowPromise;
    expect(cardFlow.recurring).toBeFalsy();
    expect(cardFlow.emi).toBeFalsy();
    expect(cardFlow.iframe).toBeFalsy();
  });
});
