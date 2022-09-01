import { isInstrumentHidden } from '../instruments';
import { getCheckoutConfig } from 'razorpay';

jest.mock('razorpay', () => ({
  ...jest.requireActual('razorpay'),
  getCheckoutConfig: jest.fn(),
}));

describe('isInstrumentHidden', () => {
  describe('UPI QR v2', () => {
    describe('shown_default_blocks', () => {
      test('UPI QR v2 should be hidden if show_default_blocks is set to false', () => {
        getCheckoutConfig.mockImplementationOnce(() => {
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
        getCheckoutConfig.mockImplementationOnce(() => {
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
    });
    describe('UPI method hidden', () => {
      test('UPI QR v2 should be hidden if upi method is hidden', () => {
        getCheckoutConfig.mockImplementationOnce(() => {
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
        getCheckoutConfig.mockImplementationOnce(() => {
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
