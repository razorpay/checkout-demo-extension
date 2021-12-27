import { getNormalizedAmountFontSize } from 'checkoutframe/components/header';

describe('font size normalization', () => {
  let amountString = '₹604454987232343434239342';

  test('Font is normalized without fee bearer and without offer', function () {
    expect(
      getNormalizedAmountFontSize(amountString.slice(0, 5), false, false)
    ).toBe(24);
    expect(
      getNormalizedAmountFontSize(amountString.slice(0, 12), false, false)
    ).toBe(24);
    expect(
      getNormalizedAmountFontSize(amountString.slice(0, 13), false, false)
    ).toBe(22.5);
    expect(getNormalizedAmountFontSize(amountString, false, false)).toBe(17);
  });

  test('Font is normalized with fee bearer and without offer', function () {
    expect(
      getNormalizedAmountFontSize(amountString.slice(0, 5), true, false)
    ).toBe(24);
    expect(
      getNormalizedAmountFontSize(amountString.slice(0, 10), true, false)
    ).toBe(24);
    expect(
      getNormalizedAmountFontSize(amountString.slice(0, 11), true, false)
    ).toBe(22.5);
    expect(getNormalizedAmountFontSize(amountString, true, false)).toBe(17);
  });

  test('Font is normalized without fee bearer and with offer', function () {
    expect(
      getNormalizedAmountFontSize(amountString.slice(0, 5), false, true)
    ).toBe(24);
    expect(
      getNormalizedAmountFontSize(amountString.slice(0, 7), false, true)
    ).toBe(24);
    expect(
      getNormalizedAmountFontSize(amountString.slice(0, 8), false, true)
    ).toBe(22.5);
    expect(getNormalizedAmountFontSize(amountString, false, true)).toBe(17);
  });

  test('Font is normalized with fee bearer and with offer', function () {
    expect(
      getNormalizedAmountFontSize(amountString.slice(0, 5), true, true)
    ).toBe(24);
    expect(
      getNormalizedAmountFontSize(amountString.slice(0, 6), true, true)
    ).toBe(24);
    expect(
      getNormalizedAmountFontSize(amountString.slice(0, 7), true, true)
    ).toBe(22.5);
    expect(getNormalizedAmountFontSize(amountString, true, true)).toBe(17);
  });

  test('Font is normalized when amount is invalid', function () {
    expect(getNormalizedAmountFontSize('', false, false)).toBe(24);
  });
});
