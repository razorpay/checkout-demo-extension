import { ignoreFirstCall, getAnimationOptions } from '../svelte-utils';
const mockSessionGet = jest.fn();

jest.mock('sessionmanager', () => {
  return {
    __esModule: true,
    getSession: jest.fn(() => ({
      get: mockSessionGet,
    })),
  };
});

describe('svelte utils', () => {
  describe('ignore first call', () => {
    it('should ignore first invoked call', () => {
      let counter = null;
      const testFn = (input) => (counter = input);

      const ignoredFn = ignoreFirstCall(testFn);

      expect(counter).toBe(null);
      ignoredFn(); // this call should be ignored
      expect(counter).toBe(null);

      ignoredFn('hello'); // this call should go through
      expect(counter).toBe('hello');

      ignoredFn('world'); // this call should go through
      expect(counter).toBe('world');
    });
  });

  describe('get animation duration', () => {
    describe('when animation are enabled', () => {
      it('it should not modify values', () => {
        mockSessionGet.mockReturnValue(true);

        const actual = getAnimationOptions({
          duration: 100,
          delay: 200,
          y: 100,
        });

        expect(actual).toEqual({
          duration: 100,
          delay: 200,
          y: 100,
        });
        expect(mockSessionGet).toHaveBeenCalledTimes(2);
        expect(mockSessionGet).toHaveBeenCalledWith('modal.animation');
      });
    });

    describe('when animation are NOT enabled', () => {
      it('it should not modify values', () => {
        mockSessionGet.mockReturnValue(false);

        const actual = getAnimationOptions({
          duration: 100,
          delay: 200,
          y: 100,
        });

        expect(actual).toEqual({
          duration: 0,
          delay: 0,
          y: 100, // should remain unchanged
        });
        expect(mockSessionGet).toHaveBeenCalledTimes(2);
        expect(mockSessionGet).toHaveBeenCalledWith('modal.animation');
      });
    });
  });
});
