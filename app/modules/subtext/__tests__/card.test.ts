import * as CardSubtext from 'subtext/card';
import { addDefaultMessages } from 'i18n/init';
import type { CardInstrument } from 'subtext/type';

addDefaultMessages();

describe('Module: subtext/card', () => {
  describe('CardSubtext.generateSubtextForCardInstrument', () => {
    test('method: card', () => {
      let instrument;

      instrument = {
        method: 'card',
      };

      expect('All cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        iins: ['524192'],
      };

      expect('Only 524192 accepted').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        iins: ['524192', '524193'],
      };

      expect('Only 524192 and 524193 accepted').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        iins: ['524192', '524193', '524194'],
      };

      expect('Only 524192, 524193, and 524194 accepted').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        iins: ['524192', '524193', '524194', '524195'],
      };

      expect('Only select BINs accepted').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        types: ['credit'],
      };

      expect('Only credit cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        networks: ['MasterCard'],
      };

      expect('Only MasterCard cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        networks: ['MasterCard'],
        types: ['credit'],
      };

      expect('Only MasterCard credit cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        networks: ['MasterCard', 'Visa'],
      };

      expect('Only MasterCard and Visa cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        networks: ['MasterCard', 'Visa'],
        types: ['credit'],
      };

      expect('Only MasterCard and Visa credit cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        networks: ['MasterCard', 'Visa', 'RuPay'],
      };

      expect('Only select networks supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        networks: ['MasterCard', 'Visa', 'RuPay'],
        types: ['credit'],
      };

      expect('Only select network credit cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      // -----------------

      instrument = {
        method: 'card',
        issuers: ['HDFC'],
      };

      expect('Only HDFC cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC'],
        types: ['credit'],
      };

      expect('Only HDFC credit cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC'],
        networks: ['MasterCard'],
      };

      expect('Only HDFC MasterCard cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC'],
        networks: ['MasterCard'],
        types: ['credit'],
      };

      expect('Only HDFC MasterCard credit cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC'],
        networks: ['MasterCard', 'Visa'],
      };

      expect('Only select HDFC cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC'],
        networks: ['MasterCard', 'Visa'],
        types: ['credit'],
      };

      expect('Only select HDFC credit cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC'],
        networks: ['MasterCard', 'Visa', 'RuPay'],
      };

      expect('Only select HDFC cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC'],
        networks: ['MasterCard', 'Visa', 'RuPay'],
        types: ['credit'],
      };

      expect('Only select HDFC credit cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      // -----------------

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB'],
      };

      expect('Only HDFC and Axis cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB'],
        types: ['credit'],
      };

      expect('Only HDFC and Axis credit cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB'],
        networks: ['MasterCard'],
      };

      expect('Only HDFC and Axis MasterCard cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB'],
        networks: ['MasterCard'],
        types: ['credit'],
      };

      expect('Only select HDFC and Axis credit cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB'],
        networks: ['MasterCard', 'Visa'],
      };

      expect('Only select cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB'],
        networks: ['MasterCard', 'Visa'],
        types: ['credit'],
      };

      expect('Only select credit cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB'],
        networks: ['MasterCard', 'Visa', 'RuPay'],
      };

      expect('Only select cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB'],
        networks: ['MasterCard', 'Visa', 'RuPay'],
        types: ['credit'],
      };

      expect('Only select credit cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      // -----------------

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB', 'ICIC'],
      };

      expect('Only select cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB', 'ICIC'],
        types: ['credit'],
      };

      expect('Only select credit cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB', 'ICIC'],
        networks: ['MasterCard'],
      };

      expect('Only select MasterCard cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB', 'ICIC'],
        networks: ['MasterCard'],
        types: ['credit'],
      };

      expect('Only select MasterCard credit cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB', 'ICIC'],
        networks: ['MasterCard', 'Visa'],
      };

      expect('Only select cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB', 'ICIC'],
        networks: ['MasterCard', 'Visa'],
        types: ['credit'],
      };

      expect('Only select credit cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB', 'ICIC'],
        networks: ['MasterCard', 'Visa', 'RuPay'],
      };

      expect('Only select cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        issuers: ['HDFC', 'UTIB', 'ICIC'],
        networks: ['MasterCard', 'Visa', 'RuPay'],
        types: ['credit'],
      };

      expect('Only select credit cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      // -----------------

      instrument = {
        method: 'card',
        countries: ['non_IN'],
      };

      expect('Only international cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        countries: ['non_IN'],
        issuers: ['HDFC'],
      };

      expect('Only HDFC international cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        countries: ['non_IN'],
        issuers: ['HDFC', 'ICIC'],
      };

      expect('Only HDFC and ICICI international cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        countries: ['non_IN'],
        issuers: ['HDFC', 'ICIC'],
        networks: ['Visa'],
      };

      expect('Only HDFC and ICICI Visa international cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );
      instrument = {
        method: 'card',
        countries: ['non_IN'],
        issuers: ['HDFC', 'ICIC'],
        networks: ['Visa', 'MasterCard'],
      };

      expect('Only select international cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        countries: ['non_IN'],
        issuers: ['HDFC', 'ICIC'],
        networks: ['Visa', 'MasterCard'],
        types: ['credit'],
      };

      expect('Only select credit international cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        countries: ['non_IN'],
        types: ['credit'],
      };

      expect('Only credit international cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        countries: ['non_IN'],
        issuers: ['HDFC', 'ICIC'],
        types: ['credit'],
      };

      expect('Only HDFC and ICICI credit international cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );
      instrument = {
        method: 'card',
        countries: ['non_IN'],
        issuers: ['HDFC'],
        types: ['credit'],
      };

      expect('Only HDFC credit international cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );

      instrument = {
        method: 'card',
        countries: ['non_IN'],
        types: ['credit'],
      };

      expect('Only credit international cards supported').toBe(
        CardSubtext.generateSubtextForCardInstrument(
          instrument as CardInstrument,
          'en'
        )
      );
    });
  });
});
