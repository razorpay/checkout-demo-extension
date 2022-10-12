import { getInputSource } from 'one_click_checkout/helper';
import { getElementById } from 'utils/doc';
import {
  CONTACT_ERROR_LABEL,
  INDIA_CONTACT_ERROR_LABEL,
} from 'one_click_checkout/address/i18n/labels';
import { getIndErrLabel } from 'one_click_checkout/helper';

jest.mock('utils/doc', () => {
  const originalModule = jest.requireActual('utils/doc');
  return {
    __esModule: true,
    ...originalModule,
    getElementById: jest.fn(),
  };
});

describe('One Click Checkout helper tests', () => {
  describe('getIndErrLabel tests: returns error label for a passed phone number', () => {
    it('should return CONTACT_ERROR_LABEL label when phone number is not passed', () => {
      const label = getIndErrLabel('');
      const expectedLabel = CONTACT_ERROR_LABEL;

      expect(expectedLabel).toBe(label);
    });

    it('should return INDIA_CONTACT_ERROR_LABEL label when incomplete phone number is passed', () => {
      const label = getIndErrLabel('935');
      const expectedLabel = INDIA_CONTACT_ERROR_LABEL;

      expect(expectedLabel).toBe(label);
    });

    it('should return CONTACT_ERROR_LABEL label when phone number does not match regex', () => {
      const label = getIndErrLabel('0000000009');
      const expectedLabel = CONTACT_ERROR_LABEL;

      expect(expectedLabel).toBe(label);
    });
  });

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
