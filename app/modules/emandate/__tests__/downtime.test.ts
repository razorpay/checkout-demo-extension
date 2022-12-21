import { METHODS } from 'checkoutframe/constants';
import { getDowntimes } from 'checkoutframe/downtimes';
import { getDowntimesSeverity } from 'checkoutframe/downtimes/methodDowntimes';
import { getDownTimeSeverityMessage } from 'checkoutframe/downtimes/utils';
import { getLongBankName } from 'i18n';

jest.mock('checkoutframe/downtimes', () => ({
  ...jest.requireActual('checkoutframe/downtimes'),
  getDowntimes: jest.fn(),
}));

const EMANDATE_HIGH_DOWNTIME = {
  emandate: {
    high: [
      {
        id: 'down_ESuz2VEvLXotiY',
        entity: 'payment.downtime',
        method: 'emandate',
        begin: 1584367811,
        end: null,
        status: 'started',
        scheduled: false,
        severity: 'high',
        instrument: {
          bank: 'SBIN',
        },
        created_at: 1584367812,
        updated_at: 1584523239,
      },
    ],
    medium: [],
    low: [],
  },
};

const EMANDATE_MEDIUM_DOWNTIME = {
  emandate: {
    high: [],
    medium: [
      {
        id: 'down_ESuz2VEvLXotiY',
        entity: 'payment.downtime',
        method: 'emandate',
        begin: 1584367811,
        end: null,
        status: 'started',
        scheduled: false,
        severity: 'medium',
        instrument: {
          bank: 'HDFC',
        },
        created_at: 1584367812,
        updated_at: 1584523239,
      },
    ],
    low: [],
  },
};

const EMANDATE_LOW_DOWNTIME = {
  emandate: {
    high: [],
    medium: [],
    low: [
      {
        id: 'down_ESuz2VEvLXotiY',
        entity: 'payment.downtime',
        method: 'emandate',
        begin: 1584367811,
        end: null,
        status: 'started',
        scheduled: false,
        severity: 'low',
        instrument: {
          bank: 'SBIN',
        },
        created_at: 1584367812,
        updated_at: 1584523239,
      },
    ],
  },
};

const EMANDATE_NO_DOWNTIME = {
  emandate: {
    high: [],
    medium: [],
    low: [],
  },
};

describe.only('getDowntimeSeverity for emandate method', () => {
  it('should return high downtime severity when prefs have high dowtime instrument value', () => {
    (getDowntimes as jest.Mock).mockReturnValue(EMANDATE_HIGH_DOWNTIME);

    const downtimeSeverity = getDowntimesSeverity(
      METHODS.EMANDATE,
      'bank',
      'SBIN'
    );
    expect(downtimeSeverity).toEqual('high');
  });

  it('should return empty downtime severity when prefs have no high dowtime instrument value', () => {
    (getDowntimes as jest.Mock).mockReturnValue(EMANDATE_HIGH_DOWNTIME);

    const downtimeSeverity = getDowntimesSeverity(
      METHODS.EMANDATE,
      'bank',
      'HSBC'
    );
    expect(downtimeSeverity).toEqual('');
  });

  it('should return medium downtime severity when prefs have medium dowtime instrument value', () => {
    (getDowntimes as jest.Mock).mockReturnValue(EMANDATE_MEDIUM_DOWNTIME);

    const downtimeSeverity = getDowntimesSeverity(
      METHODS.EMANDATE,
      'bank',
      'HDFC'
    );
    expect(downtimeSeverity).toEqual('medium');
  });

  it('should return low downtime severity when prefs have low dowtime instrument value', () => {
    (getDowntimes as jest.Mock).mockReturnValue(EMANDATE_LOW_DOWNTIME);

    const downtimeSeverity = getDowntimesSeverity(
      METHODS.EMANDATE,
      'bank',
      'SBIN'
    );
    expect(downtimeSeverity).toEqual('low');
  });

  it('should return empty downtime severity when prefs have no dowtime', () => {
    (getDowntimes as jest.Mock).mockReturnValue(EMANDATE_NO_DOWNTIME);

    const downtimeSeverity = getDowntimesSeverity(
      METHODS.EMANDATE,
      'bank',
      'KKBK'
    );
    expect(downtimeSeverity).toEqual('');
  });

  it('should return empty downtime severity when we dont pass selected instrument value', () => {
    (getDowntimes as jest.Mock).mockReturnValue(EMANDATE_HIGH_DOWNTIME);

    const downtimeSeverity = getDowntimesSeverity(METHODS.EMANDATE, 'bank', '');
    expect(downtimeSeverity).toEqual('');
  });
});

describe.only('getDowntimeSeverityMessage', () => {
  it('should return correct downtime severity message for a selected bank', () => {
    const message =
      'This payment authorisation might fail because State Bank of India is facing technical difficulties.';
    const bankName = getLongBankName('SBIN', 'en');
    const downtimeSeverityMessage = getDownTimeSeverityMessage(bankName);

    expect(downtimeSeverityMessage).toEqual(message);
  });
});
