import * as helper from 'checkoutframe/helper';
import { getAmount, getOrderId } from 'razorpay';
import { EventsV2 } from 'analytics-v2';
import * as exp from 'experiments';
import * as mock from './mock/helper';
jest.mock('razorpay', () => ({
  getAmount: jest.fn(() => {}),
  getOrderId: jest.fn(() => {}),
}));

describe('Module: checkoutframe/helper', () => {
  it('should set AnalyticsV2 context amount', () => {
    const preferences = {};
    (getAmount as unknown as jest.Mock).mockReturnValue(60000);
    helper.updateAnalyticsFromPreferences(preferences as any);
    const expectedContextAmount = 60000;
    const state = EventsV2.getState() as any;
    expect(state.context.checkout.amount).toEqual(expectedContextAmount);
  });

  it('should set AnalyticsV2 context features', () => {
    const preferences = {
      features: {
        google_pay: true,
        phonepe_intent: true,
        save_vpa: true,
        redirect_to_zestmoney: true,
        dcc: true,
        show_mor_tnc: true,
      },
    };
    helper.updateAnalyticsFromPreferences(preferences as any);
    const expectedContextFeatures = preferences.features;
    const state = EventsV2.getState() as any;
    expect(state.context.checkout.features).toEqual(expectedContextFeatures);
  });

  it('should set AnalyticsV2 context merchant key', () => {
    const preferences = {
      merchant_key: 'rzp_test_1DP5mmOlF5G5ag',
    };
    helper.updateAnalyticsFromPreferences(preferences as any);
    const expectedMerchantKey = 'rzp_test_1DP5mmOlF5G5ag';
    const state = EventsV2.getState() as any;
    expect(state.context.checkout.merchant.key).toEqual(expectedMerchantKey);
  });

  it('should set AnalyticsV2 context merchant name', () => {
    const preferences = {
      merchant_name: 'Rzp Test QA KNSFPK',
    };
    helper.updateAnalyticsFromPreferences(preferences as any);
    const expectedMerchantName = 'Rzp Test QA KNSFPK';
    const state = EventsV2.getState() as any;
    expect(state.context.checkout.merchant.name).toEqual(expectedMerchantName);
  });

  it('should set AnalyticsV2 context mode', () => {
    const preferences = {
      mode: 'test',
    };
    helper.updateAnalyticsFromPreferences(preferences as any);
    const expectedMode = 'test';
    const state = EventsV2.getState() as any;
    expect(state.context.checkout.mode).toEqual(expectedMode);
  });
  it('should set AnalyticsV2 context order id', () => {
    const preferences = {};
    (getOrderId as unknown as jest.Mock).mockReturnValue(
      'order_K9u6Ysp8XTNqj4'
    );
    helper.updateAnalyticsFromPreferences(preferences as any);
    const expectedOrderId = 'order_K9u6Ysp8XTNqj4';
    const state = EventsV2.getState() as any;
    expect(state.context.checkout.order.id).toEqual(expectedOrderId);
  });

  it('should set AnalyticsV2 context experiments', () => {
    (exp.getExperimentsFromStorage as any) = jest
      .fn()
      .mockImplementation(() => {
        return mock.storageExperiments;
      });
    helper.updateAnalyticsFromPreferences(mock.experimentPreferences as any);
    const state = EventsV2.getState() as any;
    expect(state.context.checkout.experiments).toEqual(
      mock.expectedExperiments
    );
  });
  it('should set AnalyticsV2 context experiment configs', () => {
    (exp.getRegisteredExperiments as any) = jest.fn().mockImplementation(() => {
      return mock.registeredExperiments;
    });
    const preferences = {};
    helper.updateAnalyticsFromPreferences(preferences as any);
    const state = EventsV2.getState() as any;
    expect(state.context.checkout.experimentConfigs).toEqual(
      mock.expectedExperimentConfigs
    );
  });
});
