import { isValidHexColorCode } from '../color';

describe('isValidHexColorCode tests', () => {
  test('should validate color code correctly', async () => {
    expect(isValidHexColorCode('#000000')).toBe(true);
    expect(isValidHexColorCode('#000')).toBe(true);
    expect(isValidHexColorCode('#fafafa')).toBe(true);
    expect(isValidHexColorCode('#FAFAFA')).toBe(true);
    expect(isValidHexColorCode('#fafafy')).toBe(false);
    expect(isValidHexColorCode('fafafa')).toBe(false);
    expect(isValidHexColorCode('#faf')).toBe(true);
    expect(isValidHexColorCode('#FAF')).toBe(true);
    expect(isValidHexColorCode('#fau')).toBe(false);
    expect(isValidHexColorCode('faf')).toBe(false);
    expect(isValidHexColorCode('rgb(255,255,255)')).toBe(false);
  });
});
