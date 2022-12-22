import { getDowntimes } from 'checkoutframe/downtimes';
import { checkOffline, checkRedirectForFpx } from 'fpx/helper';
import { getMerchantOption } from 'razorpay';

jest.mock('checkoutframe/downtimes', () => {
  return {
    ...jest.requireActual('checkoutframe/downtimes'),
    getDowntimes: jest.fn(),
  };
});

jest.mock('razorpay', () => {
  return {
    ...jest.requireActual('razorpay'),
    getMerchantOption: jest.fn(),
  };
});

const FPX_HIGH_DOWNTIME = {
  fpx: {
    high: [
      {
        id: 'down_ESuz2VEvLXotiY',
        entity: 'payment.downtime',
        method: 'fpx',
        begin: 1584367811,
        end: null,
        status: 'started',
        scheduled: false,
        severity: 'high',
        instrument: {
          bank: 'CITI_C',
        },
        created_at: 1584367812,
        updated_at: 1584523239,
      },
    ],
    medium: [],
    low: [],
  },
};

const FPX_MEDIUM_DOWNTIME = {
  fpx: {
    high: [],
    medium: [
      {
        id: 'down_ESuz2VEvLXotiY',
        entity: 'payment.downtime',
        method: 'fpx',
        begin: 1584367811,
        end: null,
        status: 'started',
        scheduled: false,
        severity: 'medium',
        instrument: {
          bank: 'CITI_C',
        },
        created_at: 1584367812,
        updated_at: 1584523239,
      },
    ],
    low: [],
  },
};

const FPX_LOW_DOWNTIME = {
  fpx: {
    high: [],
    medium: [],
    low: [
      {
        id: 'down_ESuz2VEvLXotiY',
        entity: 'payment.downtime',
        method: 'fpx',
        begin: 1584367811,
        end: null,
        status: 'started',
        scheduled: false,
        severity: 'low',
        instrument: {
          bank: 'CITI_C',
        },
        created_at: 1584367812,
        updated_at: 1584523239,
      },
    ],
  },
};

const FPX_NO_DOWNTIME = {
  fpx: {
    high: [],
    medium: [],
    low: [],
  },
};

describe('module/fpx/helper', () => {
  describe('checkOffline', () => {
    test('should return true if bank is offline', () => {
      (getDowntimes as jest.Mock).mockReturnValue(FPX_HIGH_DOWNTIME);
      const isOffline = checkOffline('CITI_C');

      expect(isOffline).toBe(true);
    });
    test('should return false if bank is not offline', () => {
      (getDowntimes as jest.Mock).mockReturnValue(FPX_HIGH_DOWNTIME);
      const isOffline = checkOffline('HSBC');

      expect(isOffline).toBe(false);
    });

    test('should return false if bank has medium downtime', () => {
      (getDowntimes as jest.Mock).mockReturnValue(FPX_MEDIUM_DOWNTIME);
      const isOffline = checkOffline('CITI_C');

      expect(isOffline).toBe(false);
    });

    test('should return false if bank has low downtime', () => {
      (getDowntimes as jest.Mock).mockReturnValue(FPX_LOW_DOWNTIME);
      const isOffline = checkOffline('CITI_C');

      expect(isOffline).toBe(false);
    });

    test('should return false if no downtime', () => {
      (getDowntimes as jest.Mock).mockReturnValue(FPX_NO_DOWNTIME);
      const isOffline = checkOffline('CITI_C');

      expect(isOffline).toBe(false);
    });
  });

  describe('checkRedirectForFpx', () => {
    test('redirect = true: should return true', () => {
      (getMerchantOption as jest.Mock).mockReturnValue(true);

      const isRedirectEnabled = checkRedirectForFpx();
      expect(isRedirectEnabled).toBe(true);
    });

    test('redirect = false: should return false', () => {
      (getMerchantOption as jest.Mock).mockReturnValue(false);

      const isRedirectEnabled = checkRedirectForFpx();
      expect(isRedirectEnabled).toBe(false);
    });

    test('redirect = undefined: should return true', () => {
      (getMerchantOption as jest.Mock).mockReturnValue(undefined);

      const isRedirectEnabled = checkRedirectForFpx();
      expect(isRedirectEnabled).toBe(true);
    });
  });
});
