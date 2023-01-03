import { getTags, setTags } from '../tags';
import type { Tags } from '../interfaces';

describe('getTags', () => {
  it('should return common tags for sentry', () => {
    const actualTags: Tags = getTags();

    expect(actualTags).toEqual({
      merchant_url: expect.any(String),
    });
  });

  describe('merchant url', () => {
    it('should be hostname only', () => {
      const { merchant_url } = getTags();
      const expected = new URL(window.location.toString()).hostname;
      expect(merchant_url).toBe(expected);
    });
  });
});

describe('setTags() method', () => {
  it('should call sentry.setTags', () => {
    const Sentry = { setTags: jest.fn() };

    window.Sentry = Sentry;

    setTags();

    expect(window.Sentry.setTags).toHaveBeenCalledWith({
      merchant_url: expect.any(String),
    });
  });
});
