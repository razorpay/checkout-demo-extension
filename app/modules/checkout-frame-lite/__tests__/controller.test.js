import { fetchPreferences } from '../controller';
import browserstorage from '../../browserstorage';
import fetch from 'utils/fetch';

const merchantKey = 'dummyKey';
const mockDummyPrefs = { merchantKey };
const storageKey = `rzp_lite_preferences_${merchantKey}`;

jest.mock('utils/fetch', () => {
  return {
    __esModule: true,
    default: jest.fn(({ callback }) => {
      callback(mockDummyPrefs);
    }),
  };
});

describe('fetch preferences', () => {
  afterEach(() => {
    browserstorage.removeItem(storageKey);
  });

  describe('preferences missing from cache', () => {
    it('should fetch preferences from api and cache it', async () => {
      const mockedUpdatedAt = 11111;
      jest.spyOn(Date, 'now').mockReturnValue(mockedUpdatedAt);

      const expected = {
        updatedAt: mockedUpdatedAt,
        preferences: mockDummyPrefs,
      };

      const prefs = await fetchPreferences({ key_id: merchantKey });
      expect(prefs).toEqual(expected.preferences);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toBeCalledWith({
        url: expect.stringContaining('/v1/preferences?key_id=dummyKey'),
        callback: expect.anything(),
      });

      // should be persisted in storage as well
      const storedPrefs = JSON.parse(browserstorage.getItem(storageKey));
      expect(storedPrefs).toEqual(expected);
    });
  });

  describe('preferences present in cache', () => {
    describe('and cache is active', () => {
      it('should retrieve preferences from cache and skip api call', async () => {
        // emulate recent storage persistence
        const mockUpdatedAt = Date.now() - 100;

        // emulate cache presense
        browserstorage.setItem(
          storageKey,
          JSON.stringify({
            updatedAt: mockUpdatedAt,
            preferences: mockDummyPrefs,
          })
        );

        const expected = {
          updatedAt: mockUpdatedAt,
          preferences: mockDummyPrefs,
        };

        const prefs = await fetchPreferences({ key_id: merchantKey });
        expect(prefs).toEqual(expected.preferences);

        // api call should not happen
        expect(fetch).toHaveBeenCalledTimes(0);
      });
    });

    describe('and cache is stale', () => {
      it('should retrieve preferences from api and update storage', async () => {
        // emulate recent storage persistence
        const newUpdatedAt = Date.now();
        jest.spyOn(Date, 'now').mockReturnValue(newUpdatedAt);

        // emulate stale cache
        browserstorage.setItem(
          storageKey,
          JSON.stringify({
            updatedAt: 0,
            preferences: mockDummyPrefs,
          })
        );

        const expected = {
          updatedAt: newUpdatedAt,
          preferences: mockDummyPrefs,
        };

        const prefs = await fetchPreferences({ key_id: merchantKey });
        expect(prefs).toEqual(expected.preferences);

        // api call should happen
        expect(fetch).toHaveBeenCalledTimes(1);

        // should update storage as well
        const storedPrefs = JSON.parse(browserstorage.getItem(storageKey));
        expect(storedPrefs).toEqual(expected);
      });
    });
  });
});
