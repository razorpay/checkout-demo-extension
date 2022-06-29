import * as Card from 'common/card';
import { luhnCheck } from 'lib/utils';

const testCards = {
  amex: '378282246310005',
  bajaj: '2030401231231234',
  diners: '36148900647913',
  discover: '6011000990139424',
  jcb: '3528000700000000',
  maestro: '6799990100000000019',
  mastercard: '5555555555554444',
  visa: '4242424242424242',
};

const testCardsWithSpacing = {
  amex: '3782 822463 10005',
  bajaj: '2030 4012 3123 1234',
  mastercard: '5555 5555 5555 4444',
  visa: '4242 4242 4242 4242',
};

describe('common/card', () => {
  test('getCardType', function () {
    expect(Card.getCardType(testCards.bajaj)).toBe('bajaj');
    expect(Card.getCardType(testCards.visa)).toBe('visa');
    expect(Card.getCardType(testCards.mastercard)).toBe('mastercard');
    expect(Card.getCardType(testCards.amex)).toBe('amex');
    expect(Card.getCardType(testCards.maestro)).toBe('maestro');
    expect(Card.getCardType(testCards.diners)).toBe('diners');
    expect(Card.getCardType(testCards.discover)).toBe('discover');
    expect(Card.getCardType(testCards.jcb)).toBe('jcb');

    expect(Card.getCardType('')).toBe('');
    expect(Card.getCardType()).toBe('');
    expect(Card.getCardType(null)).toBe('');
  });

  test('getNetworkFromCardNumber', function () {
    expect(Card.getNetworkFromCardNumber(testCards.bajaj)).toBe('bajaj');
    expect(Card.getNetworkFromCardNumber(testCards.visa)).toBe('visa');
    expect(Card.getNetworkFromCardNumber(testCards.mastercard)).toBe(
      'mastercard'
    );
    expect(Card.getNetworkFromCardNumber(testCards.amex)).toBe('amex');
    expect(Card.getNetworkFromCardNumber(testCards.maestro)).toBe('maestro');
    expect(Card.getNetworkFromCardNumber(testCards.diners)).toBe('diners');
    expect(Card.getNetworkFromCardNumber(testCards.discover)).toBe('discover');
    expect(Card.getNetworkFromCardNumber(testCards.jcb)).toBe('jcb');
  });

  test('getCardMaxLen', function () {
    expect(Card.getCardMaxLen(Card.getCardType(testCards.bajaj))).toBe(16);
    expect(Card.getCardMaxLen(Card.getCardType(testCards.visa))).toBe(16);
    expect(Card.getCardMaxLen(Card.getCardType(testCards.mastercard))).toBe(16);
    expect(Card.getCardMaxLen(Card.getCardType(testCards.amex))).toBe(15);
    expect(Card.getCardMaxLen(Card.getCardType(testCards.maestro))).toBe(19);
    expect(Card.getCardMaxLen(Card.getCardType(testCards.diners))).toBe(14);
    expect(Card.getCardMaxLen(Card.getCardType(testCards.discover))).toBe(16);
    expect(Card.getCardMaxLen(Card.getCardType(testCards.jcb))).toBe(16);
  });

  test('getCardSpacing', function () {
    const addSpacingToCard = (cardNumber) => {
      let spacing = Card.getCardSpacing(
        Card.getCardMaxLen(Card.getCardType(cardNumber))
      );
      let formatted = cardNumber;
      if (spacing) {
        formatted = cardNumber.replace(spacing, '$1 ');
      }
      return formatted.trim();
    };

    expect(addSpacingToCard(testCards.maestro)).toBe(testCards.maestro);
    expect(addSpacingToCard(testCards.amex)).toBe(testCardsWithSpacing.amex);
    expect(addSpacingToCard(testCards.bajaj)).toBe(testCardsWithSpacing.bajaj);
    expect(addSpacingToCard(testCards.visa)).toBe(testCardsWithSpacing.visa);
    expect(addSpacingToCard(testCards.mastercard)).toBe(
      testCardsWithSpacing.mastercard
    );
  });

  test('luhnCheck', function () {
    expect(luhnCheck(testCards.visa)).toBe(true);
    expect(luhnCheck(testCards.mastercard)).toBe(true);
    expect(luhnCheck(testCards.maestro)).toBe(true);
    expect(luhnCheck('4242424242424246')).toBe(false);
  });
});
