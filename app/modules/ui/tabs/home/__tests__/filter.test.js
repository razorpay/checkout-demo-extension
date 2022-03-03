import { methodsBlockFilter } from '../filter';
import { isUserLoggedIn } from 'common/helpers/customer';

const prefferedBlock = {
  code: 'rzp.preferred',
  _type: 'block',
  title: 'Preferred Payment Methods',
  instruments: [
    {
      _ungrouped: [
        {
          token_id: 'token_HMpQW2ILsIXGxA',
          type: 'debit',
          issuer: 'ICIC',
          network: 'Visa',
          method: 'card',
          meta: {
            preferred: true,
          },
        },
      ],
      method: 'card',
      types: ['debit'],
      issuers: ['UTIB'],
      networks: ['Visa'],
      token_id: 'token_HMpQW2ILsIXGxA',
      meta: {
        preferred: true,
      },
      id: 'b740feb2_rzp.preferred_0_1_card_true',
    },
  ],
};

const frequentUsedMethodsCardInstrument = {
  _ungrouped: [
    {
      method: 'card',
      _type: 'method',
    },
  ],
  method: 'card',
  _type: 'method',
  id: 'ba6693da_block.used_1_0_card_true',
};

const frequentUsedMethodsCredInstrument = {
  _ungrouped: [
    {
      provider: 'cred',
      method: 'app',
      _type: 'instrument',
    },
  ],
  method: 'app',
  providers: ['cred'],
  _type: 'instrument',
  id: 'ba6693da_block.used_1_1_app_true',
};

const frequentlyUsedMethodsBlock = {
  code: 'block.used',
  _type: 'block',
  instruments: [
    frequentUsedMethodsCardInstrument,
    frequentUsedMethodsCredInstrument,
  ],
  title: 'Frequently Used Methods',
};

const methodsClusterBlock = {
  code: 'rzp.cluster',
  _type: 'block',
  instruments: [
    {
      _ungrouped: [
        {
          _type: 'method',
          code: 'card',
          method: 'card',
        },
      ],
      _type: 'method',
      code: 'card',
      method: 'card',
      id: 'b740feb2_rzp.cluster_1_0_card_true',
    },
    {
      _ungrouped: [
        {
          _type: 'method',
          code: 'upi',
          method: 'upi',
        },
      ],
      _type: 'method',
      code: 'upi',
      method: 'upi',
      id: 'b740feb2_rzp.cluster_1_1_upi_true',
    },
    {
      _ungrouped: [
        {
          _type: 'method',
          code: 'netbanking',
          method: 'netbanking',
        },
      ],
      _type: 'method',
      code: 'netbanking',
      method: 'netbanking',
      id: 'b740feb2_rzp.cluster_1_2_netbanking_true',
    },
  ],
};

jest.mock('common/helpers/customer', () => ({
  isUserLoggedIn: jest.fn((cb) => (cb ? cb() : false)),
}));

describe('Filter and Slot UPI and Saved Card Instruments', () => {
  test('should filter out preferred methods block when user is logged out', () => {
    isUserLoggedIn.mockImplementation(() => false);

    const blocks = [
      prefferedBlock,
      frequentlyUsedMethodsBlock,
      methodsClusterBlock,
    ];
    const filteredBlocks = blocks.filter(methodsBlockFilter);

    expect(filteredBlocks).toHaveLength(2);

    expect(filteredBlocks).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({
          code: 'rzp.preferred',
        }),
      ])
    );
  });

  test('should not filter out preferred methods block when user is logged in', () => {
    isUserLoggedIn.mockImplementation(() => true);

    const blocks = [
      prefferedBlock,
      frequentlyUsedMethodsBlock,
      methodsClusterBlock,
    ];
    const filteredBlocks = blocks.filter(methodsBlockFilter);

    expect(filteredBlocks).toHaveLength(3);

    expect(filteredBlocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'rzp.preferred',
        }),
      ])
    );
  });
});
