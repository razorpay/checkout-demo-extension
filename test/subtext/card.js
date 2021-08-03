import * as CardSubtext from 'subtext/card';
import { addDefaultMessages } from 'i18n/init';

addDefaultMessages();

test('Module: subtext/card', (t) => {
  test('CardSubtext.generateSubtextForCardInstrument', (t) => {
    test('method: card', (t) => {
      let instrument;

      // -----------------

      instrument = {
        method: 'card',
      };

      t.equal(
        'All cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
        'Issuers: all, Networks: all, Types: all'
      );

      instrument = {
        method: 'card',
        iins: ['524192'],
      };

      t.equal(
        'Only 524192 accepted',
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
        'Iins: 1'
      );

      instrument = {
        method: 'card',
        iins: ['524192', '524193'],
      };

      t.equal(
        'Only 524192 and 524193 accepted',
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
        'Iins: 2'
      );

      instrument = {
        method: 'card',
        iins: ['524192', '524193', '524194'],
      };

      t.equal(
        'Only 524192, 524193, and 524194 accepted',
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
        'Iins: 3'
      );

      instrument = {
        method: 'card',
        iins: ['524192', '524193', '524194', '524195'],
      };

      t.equal(
        'Only select BINs accepted',
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
        'Iins: 3+'
      );

      instrument = {
        method: 'card',
        types: ['credit'],
      };

      t.equal(
        'Only credit cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
        'Issuers: all, Networks: all, Types: 1'
      );

      instrument = {
        method: 'card',
        networks: ['MasterCard'],
      };

      t.equal(
        'Only MasterCard cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
        'Issuers: all, Networks: 1, Types: all'
      );

      instrument = {
        method: 'card',
        networks: ['MasterCard'],
        types: ['credit'],
      };

      t.equal(
        'Only MasterCard credit cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
        'Issuers: all, Networks: 1, Types: 1'
      );

      instrument = {
        method: 'card',
        networks: ['MasterCard', 'Visa'],
      };

      t.equal(
        'Only MasterCard and Visa cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
        'Issuers: all, Networks: 2, Types: all'
      );

      instrument = {
        method: 'card',
        networks: ['MasterCard', 'Visa'],
        types: ['credit'],
      };

      t.equal(
        'Only MasterCard and Visa credit cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
        'Issuers: all, Networks: 2, Types: 1'
      );

      instrument = {
        method: 'card',
        networks: ['MasterCard', 'Visa', 'RuPay'],
      };

      t.equal(
        'Only select networks supported',
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
        'Issuers: all, Networks: 2+, Types: all'
      );

      instrument = {
        method: 'card',
        networks: ['MasterCard', 'Visa', 'RuPay'],
        types: ['credit'],
      };

      t.equal(
        'Only select network credit cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
        'Issuers: all, Networks: 2+, Types: 1'
      );

      // -----------------

      instrument = {
        method: 'card',
        issuers: ['HDFC'],
      };

      t.equal(
        'Only HDFC cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
        'Issuers: 1, Networks: all, Types: all'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC'],
        types: ['credit'],
      };

      t.equal(
        'Only HDFC credit cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
        'Issuers: 1, Networks: all, Types: 1'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC'],
        networks: ['MasterCard'],
      };

      t.equal(
        'Only HDFC MasterCard cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
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
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
        'Issuers: 1, Networks: 1, Types: 1'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC'],
        networks: ['MasterCard', 'Visa'],
      };

      t.equal(
        'Only select HDFC cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
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
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
        'Issuers: 1, Networks: 2, Types: 1'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC'],
        networks: ['MasterCard', 'Visa', 'RuPay'],
      };

      t.equal(
        'Only select HDFC cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
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
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
        'Issuers: 1, Networks: 2+, Types: 1'
      );

      // -----------------

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB'],
      };

      t.equal(
        'Only HDFC and Axis cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
        'Issuers: 2, Networks: all, Types: all'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB'],
        types: ['credit'],
      };

      t.equal(
        'Only HDFC and Axis credit cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
        'Issuers: 2, Networks: all, Types: 1'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB'],
        networks: ['MasterCard'],
      };

      t.equal(
        'Only HDFC and Axis MasterCard cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
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
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
        'Issuers: 2, Networks: 1, Types: 1'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB'],
        networks: ['MasterCard', 'Visa'],
      };

      t.equal(
        'Only select cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
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
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
        'Issuers: 2, Networks: 2, Types: 1'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB'],
        networks: ['MasterCard', 'Visa', 'RuPay'],
      };

      t.equal(
        'Only select cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
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
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
        'Issuers: 2, Networks: 2+, Types: 1'
      );

      // -----------------

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB', 'ICIC'],
      };

      t.equal(
        'Only select cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
        'Issuers: 2+, Networks: all, Types: all'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB', 'ICIC'],
        types: ['credit'],
      };

      t.equal(
        'Only select credit cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
        'Issuers: 2+, Networks: all, Types: 1'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB', 'ICIC'],
        networks: ['MasterCard'],
      };

      t.equal(
        'Only select MasterCard cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
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
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
        'Issuers: 2+, Networks: 1, Types: 1'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB', 'ICIC'],
        networks: ['MasterCard', 'Visa'],
      };

      t.equal(
        'Only select cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
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
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
        'Issuers: 2+, Networks: 2, Types: 1'
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB', 'ICIC'],
        networks: ['MasterCard', 'Visa', 'RuPay'],
      };

      t.equal(
        'Only select cards supported',
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
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
        CardSubtext.generateSubtextForCardInstrument(instrument, 'en'),
        'Issuers: 2+, Networks: 2+, Types: 1'
      );

      // -----------------

      t.end();
    });

    t.end();
  });

  test('CardSubtext.generateSubtextForRecurring', (t) => {
    const allNetworks = { mastercard: true, visa: true, amex: true };
    const allTypes = { credit: true, debit: true };
    const allIssuers = {
      CITI: 'CITI Bank',
      CNRB: 'Canara Bank',
      ICIC: 'ICICI Bank',
      KKBK: 'Kotak Mahindra Bank',
    };

    const allNetworksText = 'Visa, Mastercard, and American Express';
    const debitCardBanksText =
      'CITI Bank, Canara Bank, ICICI Bank, and Kotak Mahindra Bank';

    test('type: subscription', (t) => {
      t.equal(
        'Subscription payments are supported on ' +
          allNetworksText +
          ' credit cards and debit cards from ' +
          debitCardBanksText +
          '.',
        CardSubtext.generateSubtextForRecurring({
          types: allTypes,
          networks: allNetworks,
          issuers: allIssuers,
          subscription: 'subscription_id',
          locale: 'en',
        }),
        'Issuers: all, Networks: 3, Types: all'
      );

      t.equal(
        'Subscription payments are supported on debit cards from ' +
          debitCardBanksText +
          '.',
        CardSubtext.generateSubtextForRecurring({
          types: { debit: true },
          networks: allNetworks,
          issuers: allIssuers,
          subscription: 'subscription_id',
          locale: 'en',
        }),
        'Issuers: all, Networks: 3, Types: all'
      );

      t.equal(
        'Subscription payments are supported on Mastercard and American Express credit cards.',
        CardSubtext.generateSubtextForRecurring({
          types: { credit: true },
          networks: { mastercard: true, amex: true },
          subscription: 'subscription_id',
          locale: 'en',
        }),
        'Issuers: all, Networks: 2, Types: all'
      );

      t.end();
    });

    test('type: offer', (t) => {
      const offer = { issuer: 'HDFC' };

      t.equal(
        'All HDFC cards are supported for this payment.',
        CardSubtext.generateSubtextForRecurring({
          types: allTypes,
          subscription: false,
          offer: offer,
          locale: 'en',
        }),
        'Issuers: HDFC, Types: all'
      );

      t.equal(
        'All HDFC credit cards are supported for this payment.',
        CardSubtext.generateSubtextForRecurring({
          types: { credit: true },
          subscription: false,
          offer: offer,
          locale: 'en',
        }),
        'Issuers: HDFC, Types: credit'
      );

      t.equal(
        'All HDFC debit cards are supported for this payment.',
        CardSubtext.generateSubtextForRecurring({
          types: { debit: true },
          subscription: false,
          offer: offer,
          locale: 'en',
        }),
        'Issuers: HDFC, Types: debit'
      );

      t.end();
    });

    test('type: without subscription or offer', (t) => {
      t.equal(
        '' +
          allNetworksText +
          ' credit cards and debit cards from ' +
          debitCardBanksText +
          ' are supported for this payment.',
        CardSubtext.generateSubtextForRecurring({
          types: allTypes,
          networks: allNetworks,
          issuers: allIssuers,
          locale: 'en',
        }),
        'Issuers: all, Networks: 3, Types: all'
      );

      t.equal(
        'Only debit cards from ' +
          debitCardBanksText +
          ' are supported for this payment.',
        CardSubtext.generateSubtextForRecurring({
          types: { debit: true },
          networks: allNetworks,
          issuers: allIssuers,
          locale: 'en',
        }),
        'Issuers: all, Networks: 3, Types: debit'
      );

      t.equal(
        'Only ' +
          allNetworksText +
          ' credit cards are supported for this payment.',
        CardSubtext.generateSubtextForRecurring({
          types: { credit: true },
          networks: allNetworks,
          locale: 'en',
        }),
        'Issuers: all, Networks: 3, Types: credit'
      );

      t.end();
    });

    t.end();
  });

  t.end();
});
