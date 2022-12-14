import { initiateNecessaryFlow } from 'upi/ui/components/UPIAppStack/helper';
import { showDowntimeAlert } from 'checkoutframe/downtimes/utils';

jest.mock('checkoutframe/downtimes/utils', () => ({
  showDowntimeAlert: jest.fn(),
}));

const setData = jest.fn();
const proceedForAction = jest.fn();
const initialData = {
  app: {
    app_name: 'Google Pay',
    package_name: 'com.google.android.apps.nbu.paisa.user',
    app_icon: 'https://cdn.razorpay.com/app/googlepay.svg',
    handles: ['okhdfcbank', 'okicici', 'okaxis', 'oksbi'],
    verify_registration: true,
    shortcode: 'google_pay',
  },
  downtimeConfig: {
    downtimeInstrument: 'google_pay',
    severe: '',
  },
  position: {
    row: 0,
    column: 0,
  },
};

describe('Test initiateNecessaryFlow', () => {
  test('Test initiateNecessaryFlow with no downtime', () => {
    initiateNecessaryFlow(
      initialData as UPI.UpiAppForPay,
      setData,
      proceedForAction
    );
    expect(setData).toHaveBeenCalledTimes(1);
    expect(setData).toHaveBeenCalledWith(initialData);
    expect(proceedForAction).toHaveBeenCalledTimes(1);
  });
  test('Test initiateNecessaryFlow with high downtime', () => {
    const data = {
      ...initialData,
      downtimeConfig: {
        downtimeInstrument: 'google_pay',
        severe: 'high',
      },
    };
    initiateNecessaryFlow(data as UPI.UpiAppForPay, setData, proceedForAction);
    expect(setData).toHaveBeenCalledTimes(1);
    expect(setData).toHaveBeenCalledWith(data);
    expect(showDowntimeAlert).toHaveBeenCalledTimes(1);
    expect(showDowntimeAlert).toHaveBeenCalledWith(data.app.app_name);
  });
  test('Test initiateNecessaryFlow with medium downtime', () => {
    const data = {
      ...initialData,
      downtimeConfig: {
        downtimeInstrument: 'google_pay',
        severe: 'medium',
      },
    };
    initiateNecessaryFlow(data as UPI.UpiAppForPay, setData, proceedForAction);
    expect(setData).toHaveBeenCalledTimes(1);
    expect(setData).toHaveBeenCalledWith(data);
    expect(showDowntimeAlert).not.toHaveBeenCalled();
  });
});
