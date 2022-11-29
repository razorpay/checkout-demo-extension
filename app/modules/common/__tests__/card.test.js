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

  //isCountryInAllowedList restrict through country codes
  test('isCountryInAllowedList', function () {
    expect(Card.isCountryInAllowedList('US', ['non_IN'])).toBe(true);
    expect(Card.isCountryInAllowedList('US', ['IN'])).toBe(false);
    expect(Card.isCountryInAllowedList('IN', ['IN'])).toBe(true);
    expect(Card.isCountryInAllowedList('IN', ['non_IN'])).toBe(false);
    expect(Card.isCountryInAllowedList('IN', ['BR'])).toBe(false);
    expect(Card.isCountryInAllowedList('IN', ['non_IN', 'non_US'])).toBe(false);
    expect(Card.isCountryInAllowedList('IN', ['non_IN', 'IN'])).toBe(true);
  });

  test('getCardEntityFromPayload', () => {
    expect(Card.getCardEntityFromPayload({ iin: '4111111' })).toBe('411111');
    expect(Card.getCardEntityFromPayload({ tokenId: '8bYRD2x6PTFvav' })).toBe(
      '8bYRD2x6PTFvav'
    );
    expect(Card.getCardEntityFromPayload({ cardNumber: testCards.visa })).toBe(
      '424242'
    );
    expect(
      Card.getCardEntityFromPayload({ 'card[number]': testCards.visa })
    ).toBe('424242');
    expect(
      Card.getCardEntityFromPayload({ number: testCards.visa })
    ).toBeFalsy();
    expect(Card.getCardEntityFromPayload({ iin: '4111' })).toBe('4111');
  });

  test('getFullNetworkLogo', () => {
    expect(Card.getFullNetworkLogo('SBIN')).toBe(
      'https://cdn.razorpay.com/acs/network/SBIN.svg'
    );
    expect(Card.getFullNetworkLogo('ICICI')).toBe(
      'https://cdn.razorpay.com/acs/network/ICICI.svg'
    );
  });

  test('findNetworkNameByCode', () => {
    expect(Card.findNetworkNameByCode('amex')).toBe('American Express');
    expect(Card.findNetworkNameByCode('mastercard')).toBe('MasterCard');
    expect(Card.findNetworkNameByCode('bajaj')).toBe('Bajaj Finserv');
    expect(Card.findNetworkNameByCode('unknown')).toBe('unknown');
  });

  test('isAmex', () => {
    expect(Card.isAmex(testCards.amex)).toBe(true);
    expect(Card.isAmex(testCards.visa)).toBe(false);
    expect(Card.isAmex(testCards.mastercard)).toBe(false);
    expect(Card.isAmex(testCards.bajaj)).toBe(false);
  });

  test('isIinValid', () => {
    expect(Card.isIinValid(testCards.amex)).toBe(true);
    expect(Card.isIinValid(testCards.visa)).toBe(true);
    expect(Card.isIinValid(testCards.mastercard)).toBe(true);
    expect(Card.isIinValid(testCardsWithSpacing.visa)).toBe(true);
    expect(Card.isIinValid('41111')).toBe(false);
  });
});
