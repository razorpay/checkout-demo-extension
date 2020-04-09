import * as Card from 'common/card';

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

test('common/card', t => {
  test('getCardType', function(t) {
    t.equal(Card.getCardType(testCards.bajaj), 'bajaj', 'Detected Bajaj Card');
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
    t.equal(
      Card.getCardType(testCards.diners),
      'diners',
      'Detected Diners Card'
    );
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
      Card.getCardMaxLen(Card.getCardType(testCards.bajaj)),
      16,
      'Detected Bajaj Finserv Card Length'
    );
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
      addSpacingToCard(testCards.bajaj),
      testCardsWithSpacing.bajaj,
      'Add spacing to Bajaj Finserv'
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

  test('getSubtextFromCardInstrument', t => {
    let instrument;

    // -----------------

    instrument = {
      method: 'card',
    };

    t.equal(
      'All cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: all, Networks: all, Types: all'
    );

    instrument = {
      method: 'card',
      types: ['credit'],
    };

    t.equal(
      'Only credit cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: all, Networks: all, Types: 1'
    );

    instrument = {
      method: 'card',
      networks: ['mastercard'],
    };

    t.equal(
      'Only MasterCard cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: all, Networks: 1, Types: all'
    );

    instrument = {
      method: 'card',
      networks: ['mastercard'],
      types: ['credit'],
    };

    t.equal(
      'Only MasterCard credit cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: all, Networks: 1, Types: 1'
    );

    instrument = {
      method: 'card',
      networks: ['mastercard', 'visa'],
    };

    t.equal(
      'Only MasterCard and Visa cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: all, Networks: 2, Types: all'
    );

    instrument = {
      method: 'card',
      networks: ['mastercard', 'visa'],
      types: ['credit'],
    };

    t.equal(
      'Only MasterCard and Visa credit cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: all, Networks: 2, Types: 1'
    );

    instrument = {
      method: 'card',
      networks: ['mastercard', 'visa', 'rupay'],
    };

    t.equal(
      'Only select networks supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: all, Networks: 2+, Types: all'
    );

    instrument = {
      method: 'card',
      networks: ['mastercard', 'visa', 'rupay'],
      types: ['credit'],
    };

    t.equal(
      'Only select network credit cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: all, Networks: 2+, Types: 1'
    );

    // -----------------

    instrument = {
      method: 'card',
      issuers: ['HDFC'],
    };

    t.equal(
      'Only HDFC cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: 1, Networks: all, Types: all'
    );

    instrument = {
      method: 'card',
      issuers: ['HDFC'],
      types: ['credit'],
    };

    t.equal(
      'Only HDFC credit cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: 1, Networks: all, Types: 1'
    );

    instrument = {
      method: 'card',
      issuers: ['HDFC'],
      networks: ['mastercard'],
    };

    t.equal(
      'Only HDFC MasterCard cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: 1, Networks: 1, Types: all'
    );

    instrument = {
      method: 'card',
      issuers: ['HDFC'],
      networks: ['mastercard'],
      types: ['credit'],
    };

    t.equal(
      'Only HDFC MasterCard credit cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: 1, Networks: 1, Types: 1'
    );

    instrument = {
      method: 'card',
      issuers: ['HDFC'],
      networks: ['mastercard', 'visa'],
    };

    t.equal(
      'Only select HDFC cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: 1, Networks: 2, Types: all'
    );

    instrument = {
      method: 'card',
      issuers: ['HDFC'],
      networks: ['mastercard', 'visa'],
      types: ['credit'],
    };

    t.equal(
      'Only select HDFC credit cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: 1, Networks: 2, Types: 1'
    );

    instrument = {
      method: 'card',
      issuers: ['HDFC'],
      networks: ['mastercard', 'visa', 'rupay'],
    };

    t.equal(
      'Only select HDFC cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: 1, Networks: 2+, Types: all'
    );

    instrument = {
      method: 'card',
      issuers: ['HDFC'],
      networks: ['mastercard', 'visa', 'rupay'],
      types: ['credit'],
    };

    t.equal(
      'Only select HDFC credit cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: 1, Networks: 2+, Types: 1'
    );

    // -----------------

    instrument = {
      method: 'card',
      issuers: ['HDFC', 'UTIB'],
    };

    t.equal(
      'Only HDFC and Axis cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: 2, Networks: all, Types: all'
    );

    instrument = {
      method: 'card',
      issuers: ['HDFC', 'UTIB'],
      types: ['credit'],
    };

    t.equal(
      'Only HDFC and Axis credit cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: 2, Networks: all, Types: 1'
    );

    instrument = {
      method: 'card',
      issuers: ['HDFC', 'UTIB'],
      networks: ['mastercard'],
    };

    t.equal(
      'Only HDFC and Axis MasterCard cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: 2, Networks: 1, Types: all'
    );

    instrument = {
      method: 'card',
      issuers: ['HDFC', 'UTIB'],
      networks: ['mastercard'],
      types: ['credit'],
    };

    t.equal(
      'Only select HDFC and Axis credit cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: 2, Networks: 1, Types: 1'
    );

    instrument = {
      method: 'card',
      issuers: ['HDFC', 'UTIB'],
      networks: ['mastercard', 'visa'],
    };

    t.equal(
      'Only select cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: 2, Networks: 2, Types: all'
    );

    instrument = {
      method: 'card',
      issuers: ['HDFC', 'UTIB'],
      networks: ['mastercard', 'visa'],
      types: ['credit'],
    };

    t.equal(
      'Only select credit cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: 2, Networks: 2, Types: 1'
    );

    instrument = {
      method: 'card',
      issuers: ['HDFC', 'UTIB'],
      networks: ['mastercard', 'visa', 'rupay'],
    };

    t.equal(
      'Only select cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: 2, Networks: 2+, Types: all'
    );

    instrument = {
      method: 'card',
      issuers: ['HDFC', 'UTIB'],
      networks: ['mastercard', 'visa', 'rupay'],
      types: ['credit'],
    };

    t.equal(
      'Only select credit cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: 2, Networks: 2+, Types: 1'
    );

    // -----------------

    instrument = {
      method: 'card',
      issuers: ['HDFC', 'UTIB', 'ICIC'],
    };

    t.equal(
      'Only select cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: 2+, Networks: all, Types: all'
    );

    instrument = {
      method: 'card',
      issuers: ['HDFC', 'UTIB', 'ICIC'],
      types: ['credit'],
    };

    t.equal(
      'Only select credit cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: 2+, Networks: all, Types: 1'
    );

    instrument = {
      method: 'card',
      issuers: ['HDFC', 'UTIB', 'ICIC'],
      networks: ['mastercard'],
    };

    t.equal(
      'Only select MasterCard cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: 2+, Networks: 1, Types: all'
    );

    instrument = {
      method: 'card',
      issuers: ['HDFC', 'UTIB', 'ICIC'],
      networks: ['mastercard'],
      types: ['credit'],
    };

    t.equal(
      'Only select MasterCard credit cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: 2+, Networks: 1, Types: 1'
    );

    instrument = {
      method: 'card',
      issuers: ['HDFC', 'UTIB', 'ICIC'],
      networks: ['mastercard', 'visa'],
    };

    t.equal(
      'Only select cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: 2+, Networks: 2, Types: all'
    );

    instrument = {
      method: 'card',
      issuers: ['HDFC', 'UTIB', 'ICIC'],
      networks: ['mastercard', 'visa'],
      types: ['credit'],
    };

    t.equal(
      'Only select credit cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: 2+, Networks: 2, Types: 1'
    );

    instrument = {
      method: 'card',
      issuers: ['HDFC', 'UTIB', 'ICIC'],
      networks: ['mastercard', 'visa', 'rupay'],
    };

    t.equal(
      'Only select cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: 2+, Networks: 2+, Types: all'
    );

    instrument = {
      method: 'card',
      issuers: ['HDFC', 'UTIB', 'ICIC'],
      networks: ['mastercard', 'visa', 'rupay'],
      types: ['credit'],
    };

    t.equal(
      'Only select credit cards supported',
      Card.getSubtextFromCardInstrument(instrument),
      'Issuers: 2+, Networks: 2+, Types: 1'
    );

    // -----------------

    t.end();
  });

  t.end();
});
