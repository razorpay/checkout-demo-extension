import {
  CONTACT_ERROR_LABEL,
  INDIA_CONTACT_ERROR_LABEL,
} from 'one_click_checkout/address/i18n/labels';
import { getIndErrLabel } from 'ui/helpers';

describe('Helper tests', () => {
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
});
