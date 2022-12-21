import {
  getInstrumentMeta,
  getOrderedBlockData,
  isInstrumentHidden,
} from 'ui/tabs/home/instruments';
import { trackPaypalRendered } from '../helpers';
import { getCheckoutConfig } from 'razorpay';
import { blocks } from 'checkoutstore/screens/home';
import {
  getInstrumentMetaTestCases,
  getOrderedBlockDataTestCases,
} from './__mocks__/data';

jest.mock('razorpay', () => ({
  ...jest.requireActual('razorpay'),
  getCheckoutConfig: jest.fn(),
}));

const mockTrackRender = jest.fn();

jest.mock('analytics', () => {
  return {
    Events: {
      TrackRender: (event: any) => mockTrackRender(event),
    },
    HomeEvents: {
      PAYPAL_RENDERED: 'paypal:render',
    },
  };
});

describe('isInstrumentHidden', () => {
  describe('UPI QR v2', () => {
    describe('shown_default_blocks', () => {
      test('UPI QR v2 should be hidden if show_default_blocks is set to false', () => {
        (getCheckoutConfig as jest.Mock).mockImplementationOnce(() => {
          return {
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
              },
              sequence: ['block.hdfc'],
              preferences: {
                show_default_blocks: false,
              },
            },
          };
        });

        const hidden = isInstrumentHidden({ method: 'upi', flow: 'main_qr' });
        expect(hidden).toBe(true);
      });

      test('UPI QR v2 should be shown if show_default_blocks is set to true', () => {
        (getCheckoutConfig as jest.Mock).mockImplementationOnce(() => {
          return {
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
              },
              sequence: ['block.hdfc'],
              preferences: {
                show_default_blocks: true,
              },
            },
          };
        });

        const hidden = isInstrumentHidden({ method: 'upi', flow: 'main_qr' });
        expect(hidden).toBe(false);
      });

      test('UPI QR v2 should be shown if show_default_blocks is not set', () => {
        const hidden = isInstrumentHidden({ method: 'upi', flow: 'main_qr' });
        expect(hidden).toBe(false);
      });

      test('Should be false if instrument data is not passed correct', () => {
        const hidden = isInstrumentHidden({});
        expect(hidden).toBe(false);
      });
    });
    describe('UPI method hidden', () => {
      test('UPI QR v2 should be hidden if upi method is hidden', () => {
        (getCheckoutConfig as jest.Mock).mockImplementationOnce(() => {
          return {
            display: {
              hide: [{ method: 'upi' }],
            },
          };
        });

        const hidden = isInstrumentHidden({ method: 'upi', flow: 'main_qr' });
        expect(hidden).toBe(true);
      });

      test('UPI QR v2 should be shown if upi method is not hidden', () => {
        const hidden = isInstrumentHidden({ method: 'upi', flow: 'main_qr' });
        expect(hidden).toBe(false);
      });
    });

    describe('UPI flow hidden', () => {
      test('UPI QR v2 should be hidden if upi main_qr flow is hidden', () => {
        (getCheckoutConfig as jest.Mock).mockImplementationOnce(() => {
          return {
            display: {
              hide: [{ method: 'upi', flow: 'main_qr' }],
            },
          };
        });

        const hidden = isInstrumentHidden({ method: 'upi', flow: 'main_qr' });
        expect(hidden).toBe(true);
      });

      test('UPI QR v2 should be shown if some other upi flow is hidden', () => {
        const hidden = isInstrumentHidden({ method: 'upi', flow: 'collect' });
        expect(hidden).toBe(false);
      });
    });
  });
});

describe('Testing trackPaypalRendered function in ./helper.js', () => {
  test('If null is passed', () => {
    trackPaypalRendered(null);
    expect(mockTrackRender).not.toHaveBeenCalled();
  });

  test('If string is passed', () => {
    trackPaypalRendered('paypal');
    expect(mockTrackRender).not.toHaveBeenCalled();
  });

  test('If empty array is passed', () => {
    trackPaypalRendered([]);
    expect(mockTrackRender).not.toHaveBeenCalled();
  });

  test('If array is passed with no wallets array attached', () => {
    const data = [
      {
        method: 'wallet',
        meta: {
          preferred: true,
        },
        id: '0d82efba_rzp.preferred_0_0_wallet_false',
      },
    ];

    trackPaypalRendered(data);
    expect(mockTrackRender).not.toHaveBeenCalled();
  });

  test('If array is passed with empty wallets array', () => {
    const data = [
      {
        method: 'wallet',
        wallets: [],
        meta: {
          preferred: true,
        },
        id: '0d82efba_rzp.preferred_0_0_wallet_false',
      },
    ];

    trackPaypalRendered(data);
    expect(mockTrackRender).not.toHaveBeenCalled();
  });

  test('If array is passed with paypal present at 0 index', () => {
    const data = [
      {
        method: 'wallet',
        wallets: ['paypal'],
        meta: {
          preferred: true,
        },
        id: '0d82efba_rzp.preferred_0_0_wallet_false',
      },
    ];

    trackPaypalRendered(data);
    expect(mockTrackRender).toHaveBeenCalledTimes(1);
    expect(mockTrackRender).toHaveBeenCalledWith('paypal:render');
  });

  test('If array is passed with paypal present at 3 index', () => {
    const dataObj = {
      method: 'wallet',
      wallets: ['paytm'],
      meta: {
        preferred: true,
      },
      id: '0d82efba_rzp.preferred_0_0_wallet_false',
    };
    const data = [
      ...Array(3).fill(dataObj),
      { ...dataObj, wallets: ['paypal'] },
    ];

    trackPaypalRendered(data);
    expect(mockTrackRender).not.toHaveBeenCalled();
  });
});

describe('Testing getInstrumentMeta', () => {
  test.each(getInstrumentMetaTestCases)('$name', ({ input, output, block }) => {
    blocks.set(block);
    expect(getInstrumentMeta(input)).toEqual(output);
  });
});

describe('Testing getOrderedBlockData', () => {
  test.each(getOrderedBlockDataTestCases)('$name', ({ input, output }) => {
    expect(getOrderedBlockData(input)).toEqual(output);
  });
});
