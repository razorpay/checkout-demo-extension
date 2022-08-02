import { input } from 'actions/input';
import { getInputSource } from 'one_click_checkout/helper';
import { getElementById } from 'utils/doc';

jest.mock('utils/doc', () => {
  const originalModule = jest.requireActual('utils/doc');
  return {
    __esModule: true,
    ...originalModule,
    getElementById: jest.fn(),
  };
});

describe('One Click Checkout helper tests', () => {
  describe('getInputSource tests', () => {
    it('should return manual if background is same', () => {
      const el = document.createElement('input');
      el.id = 'email';
      el.setAttribute('style', 'background-color: rgba(0, 0, 0, 0)');

      getElementById.mockReturnValue(el);
      const source = getInputSource('email');

      expect(source).toBe('manual');
    });

    it('should return selection if background is different', () => {
      const el = document.createElement('input');
      el.id = 'email';
      el.setAttribute('style', 'background-color: rgba(143, 143, 143, 0)');

      getElementById.mockReturnValue(el);
      const source = getInputSource('email');

      expect(source).toBe('selection');
    });
  });
});
