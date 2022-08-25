import { isBlockVisible } from '../instruments';
import { getBlockConfig } from 'configurability';
import { getMerchantConfig } from 'checkoutstore';

jest.mock('configurability', () => ({
  getBlockConfig: jest.fn(),
}));
jest.mock('checkoutstore', () => ({
  getMerchantConfig: jest.fn(),
}));

describe('Check if show_default_blocks is false', () => {
  getMerchantConfig.mockImplementationOnce(() => {
    return {
      config: {
        display: {
          blocks: {
            hdfc: {
              name: 'Pay using HDFC Bank',
              instruments: [
                {
                  method: 'card',
                  issuers: ['HDFC'],
                },
                {
                  method: 'netbanking',
                  banks: ['HDFC'],
                },
              ],
            },
            other: {
              name: 'Other Payment modes',
              instruments: [
                {
                  method: 'card',
                  issuers: ['ICIC'],
                },
                {
                  method: 'netbanking',
                },
              ],
            },
          },
          sequence: ['block.hdfc', 'block.other'],
          preferences: {
            show_default_blocks: false,
          },
        },
      },
    };
  });

  getBlockConfig.mockImplementationOnce(() => {
    return {
      display: {
        sequence: ['block.hdfc', 'block.other'],
        blocks: [
          {
            code: 'block.hdfc',
            _type: 'block',
            instruments: [
              {
                _ungrouped: [
                  {
                    issuer: 'HDFC',
                    method: 'card',
                    _type: 'instrument',
                  },
                ],
                issuers: ['HDFC'],
                method: 'card',
                _type: 'instrument',
              },
            ],
            title: 'Pay using HDFC Bank',
          },
          {
            code: 'block.other',
            _type: 'block',
            instruments: [
              {
                _ungrouped: [
                  {
                    issuer: 'ICIC',
                    method: 'card',
                    _type: 'instrument',
                  },
                ],
                issuers: ['ICIC'],
                method: 'card',
                _type: 'instrument',
              },
              {
                _ungrouped: [
                  {
                    method: 'netbanking',
                    _type: 'method',
                  },
                ],
                method: 'netbanking',
                _type: 'method',
              },
            ],
            title: 'Other Payment modes',
          },
        ],
        hide: {
          instruments: [],
          methods: [],
        },
        preferences: {
          show_default_blocks: false,
        },
      },
      restrictions: {
        allow: {
          code: 'rzp.restrict_allow',
          _type: 'block',
          instruments: [],
        },
      },
      _meta: {
        hasCustomizations: true,
        hasRestrictedInstruments: false,
      },
    };
  });
  it('Should return false', () => {
    const value = isBlockVisible('upi');
    expect(value).toBeFalsy();
  });
});

describe('Check if upi is add in hide configurability', () => {
  getMerchantConfig.mockImplementationOnce(() => {
    return {
      config: {
        display: {
          blocks: {
            hdfc: {
              name: 'Pay using HDFC Bank',
              instruments: [
                {
                  method: 'card',
                  issuers: ['HDFC'],
                },
                {
                  method: 'netbanking',
                  banks: ['HDFC'],
                },
              ],
            },
            other: {
              name: 'Other Payment modes',
              instruments: [
                {
                  method: 'card',
                  issuers: ['ICIC'],
                },
                {
                  method: 'netbanking',
                },
              ],
            },
          },
          hide: [
            {
              method: 'upi',
            },
          ],
          sequence: ['block.hdfc', 'block.other'],
          preferences: {
            show_default_blocks: true,
          },
        },
      },
    };
  });

  getBlockConfig.mockImplementationOnce(() => {
    return {
      display: {
        sequence: ['block.hdfc', 'block.other'],
        blocks: [
          {
            code: 'block.hdfc',
            _type: 'block',
            instruments: [
              {
                _ungrouped: [
                  {
                    issuer: 'HDFC',
                    method: 'card',
                    _type: 'instrument',
                  },
                ],
                issuers: ['HDFC'],
                method: 'card',
                _type: 'instrument',
              },
            ],
            title: 'Pay using HDFC Bank',
          },
          {
            code: 'block.other',
            _type: 'block',
            instruments: [
              {
                _ungrouped: [
                  {
                    issuer: 'ICIC',
                    method: 'card',
                    _type: 'instrument',
                  },
                ],
                issuers: ['ICIC'],
                method: 'card',
                _type: 'instrument',
              },
              {
                _ungrouped: [
                  {
                    method: 'netbanking',
                    _type: 'method',
                  },
                ],
                method: 'netbanking',
                _type: 'method',
              },
            ],
            title: 'Other Payment modes',
          },
        ],
        hide: {
          instruments: [],
          methods: ['upi'],
        },
        preferences: {
          show_default_blocks: true,
        },
      },
      restrictions: {
        allow: {
          code: 'rzp.restrict_allow',
          _type: 'block',
          instruments: [],
        },
      },
      _meta: {
        hasCustomizations: true,
        hasRestrictedInstruments: false,
      },
    };
  });
  it('Should return false', () => {
    const value = isBlockVisible('upi');
    expect(value).toBeFalsy();
  });
});

describe('Check if show_default_blocks is true', () => {
  getMerchantConfig.mockImplementationOnce(() => {
    return {
      config: {
        display: {
          blocks: {
            hdfc: {
              name: 'Pay using HDFC Bank',
              instruments: [
                {
                  method: 'card',
                  issuers: ['HDFC'],
                },
                {
                  method: 'netbanking',
                  banks: ['HDFC'],
                },
              ],
            },
            other: {
              name: 'Other Payment modes',
              instruments: [
                {
                  method: 'card',
                  issuers: ['ICIC'],
                },
                {
                  method: 'netbanking',
                },
              ],
            },
          },
          sequence: ['block.hdfc', 'block.other'],
          preferences: {
            show_default_blocks: true,
          },
        },
      },
    };
  });

  getBlockConfig.mockImplementationOnce(() => {
    return {
      display: {
        sequence: ['block.hdfc', 'block.other'],
        blocks: [
          {
            code: 'block.hdfc',
            _type: 'block',
            instruments: [
              {
                _ungrouped: [
                  {
                    issuer: 'HDFC',
                    method: 'card',
                    _type: 'instrument',
                  },
                ],
                issuers: ['HDFC'],
                method: 'card',
                _type: 'instrument',
              },
            ],
            title: 'Pay using HDFC Bank',
          },
          {
            code: 'block.other',
            _type: 'block',
            instruments: [
              {
                _ungrouped: [
                  {
                    issuer: 'ICIC',
                    method: 'card',
                    _type: 'instrument',
                  },
                ],
                issuers: ['ICIC'],
                method: 'card',
                _type: 'instrument',
              },
              {
                _ungrouped: [
                  {
                    method: 'netbanking',
                    _type: 'method',
                  },
                ],
                method: 'netbanking',
                _type: 'method',
              },
            ],
            title: 'Other Payment modes',
          },
        ],
        hide: {
          instruments: [],
          methods: [],
        },
        preferences: {
          show_default_blocks: true,
        },
      },
      restrictions: {
        allow: {
          code: 'rzp.restrict_allow',
          _type: 'block',
          instruments: [],
        },
      },
      _meta: {
        hasCustomizations: true,
        hasRestrictedInstruments: false,
      },
    };
  });
  it('Should return true', () => {
    const value = isBlockVisible('upi');
    expect(value).toBeTruthy();
  });
});
