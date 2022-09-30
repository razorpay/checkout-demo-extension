import { getMethodDowntimes } from 'checkoutframe/downtimes/methodDowntimes';
import { getPreferences } from 'razorpay';
jest.mock('razorpay', () => ({
  getPreferences: jest.fn(() => {}),
}));

const netBankingDowntimes = [
  {
    id: 'down_ESuz2VEvLXotiY',
    entity: 'payment.downtime',
    method: 'netbanking',
    begin: 1584367811,
    end: null,
    status: 'started',
    scheduled: false,
    severity: 'high',
    instrument: { bank: 'KKBK' },
    created_at: 1584367812,
    updated_at: 1584523239,
  },
  {
    id: 'down_ET04wL0xBaRRf1',
    entity: 'payment.downtime',
    method: 'netbanking',
    begin: 1584367811,
    end: null,
    status: 'started',
    scheduled: false,
    severity: 'high',
    instrument: { bank: 'CNRB' },
    created_at: 1584385755,
    updated_at: 1584523526,
  },
];

const upiDowntimes = [
  {
    id: 'down_DEW7D9S10PEsl1',
    entity: 'payment.downtime',
    method: 'upi',
    begin: 1567686386,
    end: null,
    status: 'started',
    scheduled: false,
    severity: 'high',
    instrument: {
      // psp: 'paytm',
    },
    created_at: 1567686387,
    updated_at: 1567686387,
  },
  {
    id: 'down_DEW7D9S10PEsl2',
    entity: 'payment.downtime',
    method: 'upi',
    begin: 1567686386,
    end: null,
    status: 'started',
    scheduled: false,
    severity: 'low',
    instrument: {
      // psp: 'whatsapp-biz',
    },
    created_at: 1567686387,
    updated_at: 1567686387,
  },
];
const mockPrefs = {
  methods: {
    upi: true,
    upiqr: true,
    netbanking: {
      CNRB: 'Canara Bank',
      KKBK: 'Kotak Mahindra Bank',
    },
  },
  payment_downtime: {
    entity: 'collection',
    count: 2,
    items: [],
  },
};
describe('getMethodDowntimes method tests', () => {
  it('should return high and low downtime methods as a object', () => {
    (getPreferences as unknown as jest.Mock).mockReturnValue(mockPrefs);
    expect(getMethodDowntimes()).toEqual({
      high: [],
      low: [],
    });
  });
  it('should return upi/qr as high downtime method when prefs has payment.downtimes with no instrument', () => {
    (getPreferences as unknown as jest.Mock).mockReturnValue({
      ...mockPrefs,
      payment_downtime: {
        ...mockPrefs.payment_downtime,
        items: upiDowntimes.map((data) => ({
          ...data,
          scheduled: true,
          severity: undefined,
          instrument: undefined,
        })),
      },
    });
    expect(getMethodDowntimes()).toEqual({
      high: ['upi', 'qr'],
      low: [],
    });
  });

  it('should return upi/qr as high downtime method when prefs has payment.downtimes with scheduled downtime', () => {
    (getPreferences as unknown as jest.Mock).mockReturnValue({
      ...mockPrefs,
      payment_downtime: {
        ...mockPrefs.payment_downtime,
        items: upiDowntimes,
      },
    });
    expect(getMethodDowntimes()).toEqual({
      high: ['upi', 'qr'],
      low: [],
    });
  });
  it('should return NB as high downtime method when prefs has payment.downtimes with all enabled banks', () => {
    (getPreferences as unknown as jest.Mock).mockReturnValue({
      ...mockPrefs,
      payment_downtime: {
        ...mockPrefs.payment_downtime,
        items: netBankingDowntimes,
      },
    });
    expect(getMethodDowntimes()).toEqual({
      high: ['netbanking'],
      low: [],
    });
  });
  it('should return NB as Low downtime method when prefs has payment.downtimes low with all enabled banks', () => {
    (getPreferences as unknown as jest.Mock).mockReturnValue({
      ...mockPrefs,
      payment_downtime: {
        ...mockPrefs.payment_downtime,
        items: netBankingDowntimes.map((data) => ({
          ...data,
          severity: 'low',
        })),
      },
    });
    expect(getMethodDowntimes()).toEqual({
      high: [],
      low: ['netbanking'],
    });
  });
  it('edge cases', () => {
    (getPreferences as unknown as jest.Mock).mockReturnValueOnce({
      ...mockPrefs,
      netbanking: undefined,
      payment_downtime: undefined,
    });
    expect(getMethodDowntimes()).toEqual({
      high: [],
      low: [],
    });
    (getPreferences as unknown as jest.Mock).mockReturnValueOnce({
      ...mockPrefs,
      methods: undefined,
      payment_downtime: undefined,
    });
    expect(getMethodDowntimes()).toEqual({
      high: [],
      low: [],
    });
    (getPreferences as unknown as jest.Mock).mockReturnValueOnce(undefined);
    expect(getMethodDowntimes()).toEqual({
      high: [],
      low: [],
    });
  });
});
