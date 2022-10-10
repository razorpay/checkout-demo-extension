import AnalyticsV2 from 'analytics-v2/library/analytics-core';
import { PLUGIN_CALLBACK_TYPES } from 'analytics-v2/library/analytics-core/types';
import { processEvent } from '../events';
import { makeContext } from '../misc';

let analytics: AnalyticsV2;
let executionOrder: unknown[];
let trackCallback1 = jest.fn();
let trackCallback2 = jest.fn();
let trackCallback3 = jest.fn();

const eventPayload = {
  context: makeContext(),
  properties: {
    hello: 'world',
  },
  anonymousId: 'abc123',
  event: 'track test',
};

describe('Events Utils', () => {
  beforeEach(() => {
    executionOrder = [];
    analytics = new AnalyticsV2({
      app: 'TEST_APP',
      plugins: [
        {
          name: 'TEST_PLUGIN_1',
          enabled: true,
          loaded: () => true,
          track: () => {
            trackCallback1();
            executionOrder.push(1);
            return Promise.resolve();
          },
        },
        {
          name: 'TEST_PLUGIN_2',
          enabled: false,
          loaded: () => true,
          track: () => {
            trackCallback2();
            executionOrder.push(2);
            return Promise.resolve();
          },
        },
        {
          name: 'TEST_PLUGIN_3',
          enabled: true,
          loaded: () => true,
          track: () => {
            trackCallback3();
            executionOrder.push(3);
            return Promise.resolve();
          },
        },
      ],
    });
  });

  describe('processEvent', () => {
    test('should follow execution order from first plugin to last', () => {
      processEvent(
        { ...eventPayload, type: PLUGIN_CALLBACK_TYPES.TRACK },
        analytics.getState(),
        {},
        PLUGIN_CALLBACK_TYPES.TRACK
      );

      expect(executionOrder).toEqual([1, 3]);
    });

    test('should only call callbacks on active plugins', () => {
      processEvent(
        { ...eventPayload, type: PLUGIN_CALLBACK_TYPES.TRACK },
        analytics.getState(),
        {},
        PLUGIN_CALLBACK_TYPES.TRACK
      );

      expect(trackCallback1).toBeCalled();
      expect(trackCallback1).toHaveBeenCalledTimes(1);
      expect(trackCallback2).not.toBeCalled();
      expect(trackCallback3).toBeCalled();
      expect(trackCallback3).toHaveBeenCalledTimes(1);
    });

    // TODO: add test for pending queue when plugin is not loaded
  });
});
