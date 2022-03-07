import { filterAndSlotUpiAndSavedCardInstruments } from '../helpers';

const firstUpiInstrument = {
  method: 'upi',
  flows: ['collect'],
  vpas: ['demo@ybl'],
  token_id: 'token_GpaXi2JbdnNQo4',
  meta: {
    preferred: true,
  },
};

const secondUpiInstrument = {
  method: 'upi',
  flows: ['collect'],
  vpas: ['demo2@ybl'],
  token_id: 'token_GpaXi2JbdnNSSS',
  meta: {
    preferred: true,
  },
};

const firstCardInstrument = {
  method: 'card',
  types: ['debit'],
  issuers: ['UTIB'],
  networks: ['Visa'],
  token_id: 'token_HMpQW2ILsIXGxA',
  meta: {
    preferred: true,
  },
};

const secondCardInstrument = {
  method: 'card',
  types: ['debit'],
  issuers: ['UTIB'],
  networks: ['Visa'],
  token_id: 'token_EGADb8swOCgtto',
  meta: {
    preferred: true,
  },
};

const firstWalletInstrument = {
  method: 'wallet',
  token_id: 'token_EGADb8swOWWWWW',
};

const secondWalletInstrument = {
  method: 'wallet',
  token_id: 'token_EGADb8swOXXXX',
};

describe('Filter and Slot UPI and Saved Card Instruments', () => {
  test('should keep 1 upi and 1 card when more than 2 upi and 2 cards are present', () => {
    const filteredInstruments = filterAndSlotUpiAndSavedCardInstruments([
      firstUpiInstrument,
      secondUpiInstrument,
      firstCardInstrument,
      secondCardInstrument,
    ]);

    expect(filteredInstruments).toHaveLength(2);

    expect(filteredInstruments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          method: 'upi',
          token_id: firstUpiInstrument.token_id,
        }),
        expect.objectContaining({
          method: 'card',
          token_id: firstCardInstrument.token_id,
        }),
      ])
    );
  });

  test('should keep 2 upi and 0 card when only 2 upi instruments are present', () => {
    const filteredInstruments = filterAndSlotUpiAndSavedCardInstruments([
      firstUpiInstrument,
      secondUpiInstrument,
    ]);

    expect(filteredInstruments).toHaveLength(2);

    expect(filteredInstruments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          method: 'upi',
          token_id: firstUpiInstrument.token_id,
        }),
        expect.objectContaining({
          method: 'upi',
          token_id: secondUpiInstrument.token_id,
        }),
      ])
    );
  });

  test('should keep 2 card and 0 upi when only 2 card instruments are present', () => {
    const filteredInstruments = filterAndSlotUpiAndSavedCardInstruments([
      firstCardInstrument,
      secondCardInstrument,
    ]);

    expect(filteredInstruments).toHaveLength(2);

    expect(filteredInstruments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          method: 'card',
          token_id: firstCardInstrument.token_id,
        }),
        expect.objectContaining({
          method: 'card',
          token_id: secondCardInstrument.token_id,
        }),
      ])
    );
  });

  test('should keep 0 instruments when instruments other than upi and card are present', () => {
    const filteredInstruments = filterAndSlotUpiAndSavedCardInstruments([
      firstWalletInstrument,
      secondWalletInstrument,
    ]);

    expect(filteredInstruments).toHaveLength(0);
  });

  test('should not keep invalid instruments', () => {
    const filteredInstruments = filterAndSlotUpiAndSavedCardInstruments([
      null,
      null,
    ]);

    expect(filteredInstruments).toHaveLength(0);
  });
});
