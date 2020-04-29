import * as CardSubtext from 'subtext/card';

test('Module: subtext/card', t => {
  test('CardSubtext.generateSubtextForCardInstrument', t => {
    test('method: card', t => {
      let instrument;

      // -----------------

      instrument = {
        method: 'card',
      };

      t.equal(
        'All cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: all, Networks: all, Types: all'
      );

      instrument = {
        method: 'card',
        types: ['credit'],
      };

      t.equal(
        'Only credit cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: all, Networks: all, Types: 1'
      );

      instrument = {
        method: 'card',
        networks: ['MasterCard'],
      };

      t.equal(
        'Only MasterCard cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: all, Networks: 1, Types: all'
      );

      instrument = {
        method: 'card',
        networks: ['MasterCard'],
        types: ['credit'],
      };

      t.equal(
        'Only MasterCard credit cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: all, Networks: 1, Types: 1'
      );

      instrument = {
        method: 'card',
        networks: ['MasterCard', 'Visa'],
      };

      t.equal(
        'Only MasterCard and Visa cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: all, Networks: 2, Types: all'
      );

      instrument = {
        method: 'card',
        networks: ['MasterCard', 'Visa'],
        types: ['credit'],
      };

      t.equal(
        'Only MasterCard and Visa credit cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: all, Networks: 2, Types: 1'
      );

      instrument = {
        method: 'card',
        networks: ['MasterCard', 'Visa', 'RuPay'],
      };

      t.equal(
        'Only select networks supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: all, Networks: 2+, Types: all'
      );

      instrument = {
        method: 'card',
        networks: ['MasterCard', 'Visa', 'RuPay'],
        types: ['credit'],
      };

      t.equal(
        'Only select network credit cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: all, Networks: 2+, Types: 1'
      );

      // -----------------

      instrument = {
        method: 'card',
        issuers: ['HDFC'],
      };

      t.equal(
        'Only HDFC cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: 1, Networks: all, Types: all'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC'],
        types: ['credit'],
      };

      t.equal(
        'Only HDFC credit cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: 1, Networks: all, Types: 1'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC'],
        networks: ['MasterCard'],
      };

      t.equal(
        'Only HDFC MasterCard cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: 1, Networks: 1, Types: all'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC'],
        networks: ['MasterCard'],
        types: ['credit'],
      };

      t.equal(
        'Only HDFC MasterCard credit cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: 1, Networks: 1, Types: 1'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC'],
        networks: ['MasterCard', 'Visa'],
      };

      t.equal(
        'Only select HDFC cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: 1, Networks: 2, Types: all'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC'],
        networks: ['MasterCard', 'Visa'],
        types: ['credit'],
      };

      t.equal(
        'Only select HDFC credit cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: 1, Networks: 2, Types: 1'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC'],
        networks: ['MasterCard', 'Visa', 'RuPay'],
      };

      t.equal(
        'Only select HDFC cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: 1, Networks: 2+, Types: all'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC'],
        networks: ['MasterCard', 'Visa', 'RuPay'],
        types: ['credit'],
      };

      t.equal(
        'Only select HDFC credit cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: 1, Networks: 2+, Types: 1'
      );

      // -----------------

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB'],
      };

      t.equal(
        'Only HDFC and Axis cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: 2, Networks: all, Types: all'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB'],
        types: ['credit'],
      };

      t.equal(
        'Only HDFC and Axis credit cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: 2, Networks: all, Types: 1'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB'],
        networks: ['MasterCard'],
      };

      t.equal(
        'Only HDFC and Axis MasterCard cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: 2, Networks: 1, Types: all'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB'],
        networks: ['MasterCard'],
        types: ['credit'],
      };

      t.equal(
        'Only select HDFC and Axis credit cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: 2, Networks: 1, Types: 1'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB'],
        networks: ['MasterCard', 'Visa'],
      };

      t.equal(
        'Only select cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: 2, Networks: 2, Types: all'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB'],
        networks: ['MasterCard', 'Visa'],
        types: ['credit'],
      };

      t.equal(
        'Only select credit cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: 2, Networks: 2, Types: 1'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB'],
        networks: ['MasterCard', 'Visa', 'RuPay'],
      };

      t.equal(
        'Only select cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: 2, Networks: 2+, Types: all'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB'],
        networks: ['MasterCard', 'Visa', 'RuPay'],
        types: ['credit'],
      };

      t.equal(
        'Only select credit cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: 2, Networks: 2+, Types: 1'
      );

      // -----------------

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB', 'ICIC'],
      };

      t.equal(
        'Only select cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: 2+, Networks: all, Types: all'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB', 'ICIC'],
        types: ['credit'],
      };

      t.equal(
        'Only select credit cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: 2+, Networks: all, Types: 1'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB', 'ICIC'],
        networks: ['MasterCard'],
      };

      t.equal(
        'Only select MasterCard cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: 2+, Networks: 1, Types: all'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB', 'ICIC'],
        networks: ['MasterCard'],
        types: ['credit'],
      };

      t.equal(
        'Only select MasterCard credit cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: 2+, Networks: 1, Types: 1'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB', 'ICIC'],
        networks: ['MasterCard', 'Visa'],
      };

      t.equal(
        'Only select cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: 2+, Networks: 2, Types: all'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB', 'ICIC'],
        networks: ['MasterCard', 'Visa'],
        types: ['credit'],
      };

      t.equal(
        'Only select credit cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: 2+, Networks: 2, Types: 1'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB', 'ICIC'],
        networks: ['MasterCard', 'Visa', 'RuPay'],
      };

      t.equal(
        'Only select cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: 2+, Networks: 2+, Types: all'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB', 'ICIC'],
        networks: ['MasterCard', 'Visa', 'RuPay'],
        types: ['credit'],
      };

      t.equal(
        'Only select credit cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument),
        'Issuers: 2+, Networks: 2+, Types: 1'
      );

      // -----------------

      t.end();
    });

    t.end();
  });

  t.end();
});
