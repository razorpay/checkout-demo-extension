import * as Card from 'common/card';

const testCards = {
  visa: '4242424242424242',
  mastercard: '5555555555554444',
  amex: '378282246310005',
  maestro: '6799990100000000019',
  diners: '36148900647913',
  discover: '6011000990139424',
  jcb: '3528000700000000'
};

const testCardsWithSpacing = {
  visa: '4242 4242 4242 4242',
  mastercard: '5555 5555 5555 4444',
  amex: '3782 822463 10005'
};

test('getCardType', function(t) {
  t.equal(Card.getCardType(testCards.visa), 'visa', 'Detected Visa Card');
  t.equal(
    Card.getCardType(testCards.mastercard),
    'mastercard',
    'Detected MasterCard Card'
  );
  t.equal(Card.getCardType(testCards.amex), 'amex', 'Detected Amex Card');
  t.equal(
    Card.getCardType(testCards.maestro),
    'maestro',
    'Detected Maestro Card'
  );
  t.equal(Card.getCardType(testCards.diners), 'diners', 'Detected Diners Card');
  t.equal(
    Card.getCardType(testCards.discover),
    'discover',
    'Detected Discover Card'
  );
  t.equal(Card.getCardType(testCards.jcb), 'jcb', 'Detected JCB Card');

  t.end();
});

test('getCardMaxLen', function(t) {
  t.equal(
    Card.getCardMaxLen(Card.getCardType(testCards.visa)),
    16,
    'Detected Visa Card Length'
  );
  t.equal(
    Card.getCardMaxLen(Card.getCardType(testCards.mastercard)),
    16,
    'Detected MasterCard Card Length'
  );
  t.equal(
    Card.getCardMaxLen(Card.getCardType(testCards.amex)),
    15,
    'Detected Amex Card Length'
  );
  t.equal(
    Card.getCardMaxLen(Card.getCardType(testCards.maestro)),
    19,
    'Detected Maestro Card Length'
  );
  t.equal(
    Card.getCardMaxLen(Card.getCardType(testCards.diners)),
    14,
    'Detected Diners Card Length'
  );
  t.equal(
    Card.getCardMaxLen(Card.getCardType(testCards.discover)),
    16,
    'Detected Discover Card Length'
  );
  t.equal(
    Card.getCardMaxLen(Card.getCardType(testCards.jcb)),
    16,
    'Detected JCB Card Length'
  );

  t.end();
});

test('getCardSpacing', function(t) {
  const addSpacingToCard = cardNumber => {
    let spacing = Card.getCardSpacing(
      Card.getCardMaxLen(Card.getCardType(cardNumber))
    );
    let formatted = cardNumber;
    if (spacing) {
      formatted = cardNumber.replace(spacing, '$1 ');
    }
    return formatted.trim();
  };

  t.equal(
    addSpacingToCard(testCards.maestro),
    testCards.maestro,
    'No spacing for Maestro'
  );
  t.equal(
    addSpacingToCard(testCards.amex),
    testCardsWithSpacing.amex,
    'Add spacing to Amex'
  );
  t.equal(
    addSpacingToCard(testCards.visa),
    testCardsWithSpacing.visa,
    'Add spacing to Visa'
  );
  t.equal(
    addSpacingToCard(testCards.mastercard),
    testCardsWithSpacing.mastercard,
    'Add spacing to MasterCard'
  );

  t.end();
});

test('luhnCheck', function(t) {
  t.equal(
    Card.luhnCheck(testCards.visa),
    true,
    'Luhn check returns true for correct Visa card'
  );
  t.equal(
    Card.luhnCheck(testCards.mastercard),
    true,
    'Luhn check returns true for correct MasterCard card'
  );
  t.equal(
    Card.luhnCheck(testCards.maestro),
    true,
    'Luhn check returns true for correct Maestro card'
  );
  t.equal(
    Card.luhnCheck('4242424242424246'),
    false,
    'Luhn check returns false for incorrect card number'
  );

  t.end();
});
