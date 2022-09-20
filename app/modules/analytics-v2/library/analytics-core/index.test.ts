import AnalyticsV2 from 'analytics-v2/library/analytics-core';
import Browserstorage from 'browserstorage';
import { uuid4 } from 'common/uuid';
import type { Identify, Track } from '../common/types';
import { CORE_EVENTS } from './constants';
import type { Config } from './types';

let analytics: AnalyticsV2;
let config: Config;

let trackCallback: Track;
let identifyCallback: Identify;
describe('Analytics Service', () => {
  beforeEach(() => {
    trackCallback = jest.fn();
    identifyCallback = jest.fn();
    config = {
      app: 'APP_NAME',
      plugins: [
        {
          name: 'TEST-PLUGIN-1',
          track: trackCallback,
          identify: identifyCallback,
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

  describe('analytics.setUserId', () => {
    test('should store user id in storage and state', () => {
      const userId = 'tarun';
      analytics.setUserId(userId);
      const state = analytics.getState();

      expect(state.userId).toEqual(userId);
      expect(Browserstorage.getItem(`${config.app}_user_id`)).toEqual(userId);
    });
  });

  describe('analytics.setAnonymousId', () => {
    test('should store anon id in storage and state', () => {
      const anonId = 'anon-tarun';
      analytics.setAnonymousId(anonId);
      const state = analytics.getState();

      expect(state.anonymousId).toEqual(anonId);
      expect(Browserstorage.getItem(`${config.app}_anon_id`)).toEqual(anonId);
    });
  });

  describe('analytics.on', () => {
    test('analytics.on triggers callback when userId is updated', () => {
      const callback = jest.fn();
      analytics.on(CORE_EVENTS.USER_ID_UPDATED, callback);
      const userId = 'tarun';
      analytics.setUserId(userId);

      expect(callback).toBeCalled();
      expect(callback).toBeCalledWith(userId);
      expect(callback).toBeCalledTimes(1);
    });

    test('analytics.on triggers callback when anonId is updated', () => {
      const callback = jest.fn();
      analytics.on(CORE_EVENTS.ANON_ID_UPDATED, callback);
      const anonId = 'anon-tarun';
      analytics.setAnonymousId(anonId);

      expect(callback).toBeCalled();
      expect(callback).toBeCalledWith(anonId);
      expect(callback).toBeCalledTimes(1);
    });
  });

  describe('analytics.identify', () => {
    test("analytics.identify should trigger plugin's identify callback", () => {
      const userId = 'tarun';
      analytics.identify(userId);

      expect(identifyCallback).toBeCalled();
      expect(identifyCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('analytics.reset', () => {
    test('reset should clear existing user and anon id and create a new anon id', () => {
      analytics.setUserId('tarun');
      const state = analytics.getState();
      const { userId: existingUserId, anonymousId: existingAnonId } = state;
      analytics.reset();
      const { userId, anonymousId } = analytics.getState();

      expect(anonymousId).not.toEqual(existingAnonId);
      expect(userId).not.toEqual(existingUserId);
      expect(Browserstorage.getItem(`${config.app}_anon_id`)).toEqual(
        anonymousId
      );
    });
  });
});
