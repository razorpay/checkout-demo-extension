import Analytics from 'analytics';
import { RTBExperiment } from 'rtb/store';
import { country, phone } from 'checkoutstore/screens/home';
import * as razorpay from 'razorpay';
import { get } from 'svelte/store';
import { getRTBAnalyticsPayload, isRTBEnabled, setRTBVariant } from '..';
import * as RTB from 'rtb/types/rtb';

jest.mock('razorpay', () => ({
  getPreferences: jest.fn(),
}));

const getPreferences = razorpay.getPreferences as jest.MockedFunction<
  typeof razorpay.getPreferences
>;

let razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: (arg: any) => arg,
  getMode: jest.fn(),
};
describe('#isRTBEnabled', () => {
  beforeEach(() => {
    Analytics.setR(razorpayInstance);
    jest.resetAllMocks();
  });
  it('Should Return True', () => {
    const data: RTB.RTBExperiment = {
      experiment: true,
      variant: RTB.ExperimentVariants.Show,
    };
    getPreferences.mockReturnValueOnce(true);
    let shouldShow = isRTBEnabled(data);

    expect(shouldShow).toBeTruthy();
  });

  it('Should Return True', () => {
    const data: RTB.RTBExperiment = {
      experiment: true,
      variant: RTB.ExperimentVariants.NotApplicable,
    };
    getPreferences.mockReturnValueOnce(true);
    let shouldShow = isRTBEnabled(data);
    expect(shouldShow).toBeTruthy();
  });
  it('Should Return True', () => {
    const data: RTB.RTBExperiment = {
      experiment: false,
    } as RTB.RTBExperiment;
    getPreferences.mockReturnValue(true);
    let shouldShow = isRTBEnabled(data);
    expect(shouldShow).toBeTruthy();
  });

  it('Should Return False', () => {
    const data: RTB.RTBExperiment = {
      experiment: true,
      variant: RTB.ExperimentVariants.Show,
    };
    getPreferences.mockReturnValueOnce(false);
    let shouldShow = isRTBEnabled(data);
    expect(shouldShow).toBeFalsy();
  });

  it('Should Return False', () => {
    const data: RTB.RTBExperiment = {
      experiment: true,
      variant: RTB.ExperimentVariants.NoShow,
    };
    getPreferences.mockReturnValueOnce(true);
    let shouldShow = isRTBEnabled(data);
    expect(shouldShow).toBeFalsy();
  });
});

describe('#setRTBVariant', () => {
  beforeEach(() => {
    Analytics.setR(razorpayInstance);
    jest.resetAllMocks();
  });
  test('Experiment Value Set From rtb_experiment from preferences', () => {
    const data: RTB.RTBExperiment = {
      experiment: true,
      variant: RTB.ExperimentVariants.Show,
    };
    getPreferences.mockReturnValue(data);
    setRTBVariant(data);

    expect(data).toEqual(get(RTBExperiment));
  });

  test('Experiment Value Set From rtb from preferences', () => {
    RTBExperiment.set({});
    const exp = {
      experiment: true,
      variant: RTB.ExperimentVariants.NotApplicable,
    };
    getPreferences.mockReturnValue(true);
    setRTBVariant(exp);

    expect(exp).toEqual(get(RTBExperiment));
  });

  test('RTB Value Should Be Set Only Once', () => {
    const exp = {
      experiment: true,
      variant: RTB.ExperimentVariants.Show,
    };
    getPreferences.mockReturnValue(true);
    setRTBVariant(exp);

    expect(exp).not.toEqual(get(RTBExperiment));
  });
});

describe('#getRTBAnalyticsPayload', () => {
  beforeEach(() => {
    Analytics.setR(razorpayInstance);
    jest.resetAllMocks();
  });
  const data: RTB.RTBExperiment = {
    experiment: true,
    variant: RTB.ExperimentVariants.Show,
  };
  const expectValue = {
    rtb_experiment_variant: RTB.ExperimentVariants.Show,
    contact: '+918888888888',
  };
  test('Should have payload', () => {
    RTBExperiment.set(data);
    country.set('+91');
    phone.set('8888888888');
    let payload = getRTBAnalyticsPayload();
    expect(expectValue).toEqual(payload);
  });
});
