import * as Subtext from 'common/subtext';

test('Module: common/subtext', t => {
  test('Subtext.getSubtextForInstrument', t => {
    test('method: card', t => {
      let instrument;

      // -----------------

      instrument = {
        method: 'card',
      };

      t.equal(
        'All cards supported',
        Subtext.getSubtextForInstrument(instrument),
        'Issuers: all, Networks: all, Types: all'
      );

      instrument = {
        method: 'card',
        types: ['credit'],
      };

      t.equal(
        'Only credit cards supported',
        Subtext.getSubtextForInstrument(instrument),
        'Issuers: all, Networks: all, Types: 1'
      );

      instrument = {
        method: 'card',
        networks: ['mastercard'],
      };

      t.equal(
        'Only MasterCard cards supported',
        Subtext.getSubtextForInstrument(instrument),
        'Issuers: all, Networks: 1, Types: all'
      );

      instrument = {
        method: 'card',
        networks: ['mastercard'],
        types: ['credit'],
      };

      t.equal(
        'Only MasterCard credit cards supported',
        Subtext.getSubtextForInstrument(instrument),
        'Issuers: all, Networks: 1, Types: 1'
      );

      instrument = {
        method: 'card',
        networks: ['mastercard', 'visa'],
      };

      t.equal(
        'Only MasterCard and Visa cards supported',
        Subtext.getSubtextForInstrument(instrument),
        'Issuers: all, Networks: 2, Types: all'
      );

      instrument = {
        method: 'card',
        networks: ['mastercard', 'visa'],
        types: ['credit'],
      };

      t.equal(
        'Only MasterCard and Visa credit cards supported',
        Subtext.getSubtextForInstrument(instrument),
        'Issuers: all, Networks: 2, Types: 1'
      );

      instrument = {
        method: 'card',
        networks: ['mastercard', 'visa', 'rupay'],
      };

      t.equal(
        'Only select networks supported',
        Subtext.getSubtextForInstrument(instrument),
        'Issuers: all, Networks: 2+, Types: all'
      );

      instrument = {
        method: 'card',
        networks: ['mastercard', 'visa', 'rupay'],
        types: ['credit'],
      };

      t.equal(
        'Only select network credit cards supported',
        Subtext.getSubtextForInstrument(instrument),
        'Issuers: all, Networks: 2+, Types: 1'
      );

      // -----------------

      instrument = {
        method: 'card',
        issuers: ['HDFC'],
      };

      t.equal(
        'Only HDFC cards supported',
        Subtext.getSubtextForInstrument(instrument),
        'Issuers: 1, Networks: all, Types: all'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC'],
        types: ['credit'],
      };

      t.equal(
        'Only HDFC credit cards supported',
        Subtext.getSubtextForInstrument(instrument),
        'Issuers: 1, Networks: all, Types: 1'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC'],
        networks: ['mastercard'],
      };

      t.equal(
        'Only HDFC MasterCard cards supported',
        Subtext.getSubtextForInstrument(instrument),
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
        Subtext.getSubtextForInstrument(instrument),
        'Issuers: 1, Networks: 1, Types: 1'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC'],
        networks: ['mastercard', 'visa'],
      };

      t.equal(
        'Only select HDFC cards supported',
        Subtext.getSubtextForInstrument(instrument),
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
        Subtext.getSubtextForInstrument(instrument),
        'Issuers: 1, Networks: 2, Types: 1'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC'],
        networks: ['mastercard', 'visa', 'rupay'],
      };

      t.equal(
        'Only select HDFC cards supported',
        Subtext.getSubtextForInstrument(instrument),
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
        Subtext.getSubtextForInstrument(instrument),
        'Issuers: 1, Networks: 2+, Types: 1'
      );

      // -----------------

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB'],
      };

      t.equal(
        'Only HDFC and Axis cards supported',
        Subtext.getSubtextForInstrument(instrument),
        'Issuers: 2, Networks: all, Types: all'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB'],
        types: ['credit'],
      };

      t.equal(
        'Only HDFC and Axis credit cards supported',
        Subtext.getSubtextForInstrument(instrument),
        'Issuers: 2, Networks: all, Types: 1'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB'],
        networks: ['mastercard'],
      };

      t.equal(
        'Only HDFC and Axis MasterCard cards supported',
        Subtext.getSubtextForInstrument(instrument),
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
        Subtext.getSubtextForInstrument(instrument),
        'Issuers: 2, Networks: 1, Types: 1'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB'],
        networks: ['mastercard', 'visa'],
      };

      t.equal(
        'Only select cards supported',
        Subtext.getSubtextForInstrument(instrument),
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
        Subtext.getSubtextForInstrument(instrument),
        'Issuers: 2, Networks: 2, Types: 1'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB'],
        networks: ['mastercard', 'visa', 'rupay'],
      };

      t.equal(
        'Only select cards supported',
        Subtext.getSubtextForInstrument(instrument),
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
        Subtext.getSubtextForInstrument(instrument),
        'Issuers: 2, Networks: 2+, Types: 1'
      );

      // -----------------

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB', 'ICIC'],
      };

      t.equal(
        'Only select cards supported',
        Subtext.getSubtextForInstrument(instrument),
        'Issuers: 2+, Networks: all, Types: all'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB', 'ICIC'],
        types: ['credit'],
      };

      t.equal(
        'Only select credit cards supported',
        Subtext.getSubtextForInstrument(instrument),
        'Issuers: 2+, Networks: all, Types: 1'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB', 'ICIC'],
        networks: ['mastercard'],
      };

      t.equal(
        'Only select MasterCard cards supported',
        Subtext.getSubtextForInstrument(instrument),
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
        Subtext.getSubtextForInstrument(instrument),
        'Issuers: 2+, Networks: 1, Types: 1'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB', 'ICIC'],
        networks: ['mastercard', 'visa'],
      };

      t.equal(
        'Only select cards supported',
        Subtext.getSubtextForInstrument(instrument),
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
        Subtext.getSubtextForInstrument(instrument),
        'Issuers: 2+, Networks: 2, Types: 1'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB', 'ICIC'],
        networks: ['mastercard', 'visa', 'rupay'],
      };

      t.equal(
        'Only select cards supported',
        Subtext.getSubtextForInstrument(instrument),
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
        Subtext.getSubtextForInstrument(instrument),
        'Issuers: 2+, Networks: 2+, Types: 1'
      );

      // -----------------

      t.end();
    });

    t.end();
  });

  t.end();
});
