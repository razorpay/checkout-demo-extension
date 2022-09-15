import AnalyticsV2 from 'analytics-v2/library/analytics-core';
import Browserstorage from 'browserstorage';
import { uuid4 } from 'common/uuid';
import type { Track } from '../common/types';
import type { Config } from './types';

let analytics: AnalyticsV2;
let config: Config;

let trackCallback: Track;

describe('Analytics Service', () => {
  beforeEach(() => {
    trackCallback = jest.fn();
    config = {
      app: 'APP_NAME',
      plugins: [
        {
          name: 'TEST-PLUGIN-1',
          track: trackCallback,
          enabled: true,
          loaded: () => true,
        },
      ],
    };
    analytics = new AnalyticsV2(config);
  });

  test('Analytics should contain all API methods', () => {
    expect(typeof analytics.track).toBe('function');
    expect(typeof analytics.setContext).toBe('function');
    expect(typeof analytics.getState).toBe('function');
  });

  describe('analytics.getState', () => {
    test('should return state of analytics', () => {
      const state = analytics.getState();

      expect(state).toMatchObject({
        app: 'APP_NAME',
        anonymousId: expect.any(String),
        userId: expect.any(String),
        context: expect.any(Object),
        plugins: expect.any(Object),
      });
    });

    test('should use existing anonymoud id if present', () => {
      const uuid = uuid4();
      Browserstorage.setItem(`${config.app}_anon_id`, uuid);

      analytics = new AnalyticsV2({
        app: 'APP_NAME',
        plugins: [
          {
            name: 'TEST-PLUGIN-1',
            track: trackCallback,
            enabled: true,
            loaded: () => true,
          },
        ],
      });

      const state = analytics.getState();
      expect(state.anonymousId).toEqual(uuid);
    });
  });

  describe('analytics.setContext', () => {
    test('analytics.setContext should store new key value pair in context state', () => {
      const key = 'test-context-prop';
      const value = 'test-context-value';
      analytics.setContext(key, value);
      const state = analytics.getState();

      expect(state.context).toMatchObject({
        [key]: value,
      });
    });
  });

  describe('analytics.track', () => {
    test("should trigger plugin's track callback", () => {
      const eventName = 'test-track';
      const payload = { data: 'test-data' };
      analytics.track(eventName, payload);

      expect(trackCallback).toBeCalled();
      expect(trackCallback).toHaveBeenCalledTimes(1);
    });
  });
});
