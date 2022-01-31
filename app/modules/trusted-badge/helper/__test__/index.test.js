import { RTB } from 'checkoutstore/rtb';
import { country, phone } from 'checkoutstore/screens/home';
import { getPreferences } from 'razorpay';
import { get } from 'svelte/store';
import {
  getTrustedBadgeAnaltyicsPayload,
  getTrustedBadgeHighlights,
  setTrustedBadgeVariant,
} from '..';

jest.mock('razorpay', () => ({
  getPreferences: jest.fn(),
}));
describe('#getTrustedBadgeHighlights', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('Should Return True', () => {
    const data = {
      experiment: true,
      variant: 'rtb_show',
    };
    getPreferences.mockReturnValueOnce(true);
    let shouldShow = getTrustedBadgeHighlights(data);

    expect(shouldShow).toBeTruthy();
  });

  it('Should Return True', () => {
    const data = {
      experiment: true,
      variant: 'not_applicable',
    };
    getPreferences.mockReturnValueOnce(true);
    let shouldShow = getTrustedBadgeHighlights(data);
    expect(shouldShow).toBeTruthy();
  });
  it('Should Return True', () => {
    const data = {
      experiment: false,
    };
    getPreferences.mockReturnValue(true);
    let shouldShow = getTrustedBadgeHighlights(data);
    expect(shouldShow).toBeTruthy();
  });

  it('Should Return False', () => {
    const data = {
      experiment: true,
    };
    getPreferences.mockReturnValueOnce(false);
    let shouldShow = getTrustedBadgeHighlights(data);
    expect(shouldShow).toBeFalsy();
  });

  it('Should Return False', () => {
    const data = {
      experiment: true,
      variant: 'rtb_no_show',
    };
    getPreferences.mockReturnValueOnce(true);
    let shouldShow = getTrustedBadgeHighlights(data);
    expect(shouldShow).toBeFalsy();
  });
});

describe('#setTrustedBadgeVariant', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  test('Experiment Value Set From rtb_experiment from preferences', () => {
    const data = {
      experiment: true,
      variant: 'rtb_show',
    };
    getPreferences.mockReturnValue(data);
    setTrustedBadgeVariant(data, false);

    expect(data).toEqual(get(RTB));
  });

  test('Experiment Value Set From rtb from preferences', () => {
    RTB.set({});
    const exp = {
      experiment: true,
      variant: 'not_applicable',
    };
    getPreferences.mockReturnValue(true);
    setTrustedBadgeVariant(exp, false);

    expect(exp).toEqual(get(RTB));
  });

  test('RTB Value Should Be Set Only Once', () => {
    const exp = {
      experiment: true,
      variant: 'rtb_show',
    };
    getPreferences.mockReturnValue(true);
    setTrustedBadgeVariant(exp, false);

    expect(exp).not.toEqual(get(RTB));
  });
});

describe('#getTrustedBadgeAnaltyicsPayload', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  const data = {
    experiment: true,
    variant: 'rtb_show',
  };
  const expectValue = {
    rtb_experiment_variant: 'rtb_show',
    contact: '+918888888888',
  };
  test('Should have payload', () => {
    RTB.set(data);
    country.set('+91');
    phone.set(8888888888);
    let payload = getTrustedBadgeAnaltyicsPayload();
    expect(expectValue).toEqual(payload);
  });
});
