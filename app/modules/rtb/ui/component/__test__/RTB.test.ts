import { RTBExperiment } from 'rtb/store';
import { fireEvent, render } from '@testing-library/svelte';

import * as razorpay from 'razorpay';
import RTBBanner from 'rtb/ui/component/RTBBanner.svelte';
import Analytics from 'analytics';
import { RTB } from 'rtb/types/rtb';
import RTBOverlay from '../RTBOverlay.svelte';
import { pushOverlay } from 'navstack';

jest.mock('razorpay', () => ({
  getPreferences: jest.fn(),
}));

// Disabling exp for test cases temporarily till we completely move to the new feature
jest.mock('rtb/experiments', () => ({
  showRTBBottomSheet: {
    enabled: jest.fn(() => true),
  },
}));

jest.mock('navstack', () => ({
  pushOverlay: jest.fn(),
}));

let razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: (arg: any) => arg,
  getMode: jest.fn(),
};

const getPreferences = razorpay.getPreferences as jest.MockedFunction<
  typeof razorpay.getPreferences
>;

describe('RTB', () => {
  beforeEach(() => {
    Analytics.setR(razorpayInstance);
  });

  test('RTB banner should be shown for RTB enabled merchants', async () => {
    getPreferences.mockReturnValue(true);
    RTBExperiment.set({});
    const { getByTestId } = render(RTBBanner);
    expect(getByTestId('rtb-banner')).toBeInTheDocument();
  });

  test('RTB banner should NOT be shown for non-RTB enabled merchants', async () => {
    getPreferences.mockReturnValue(false);
    RTBExperiment.set({});
    const { queryByTestId } = render(RTBBanner);
    expect(queryByTestId('rtb-banner')).not.toBeInTheDocument();
  });

  test('RTB banner should NOT be shown for non-RTB enabled merchants with experiment false', async () => {
    getPreferences.mockReturnValue(false);
    RTBExperiment.set({
      experiment: false,
    } as RTB.RTBExperiment);
    const { queryByTestId } = render(RTBBanner);
    expect(queryByTestId('rtb-banner')).not.toBeInTheDocument();
  });

  test('RTB banner should NOT be shown for non-RTB enabled merchants with experiment true', async () => {
    getPreferences.mockReturnValue(false);
    RTBExperiment.set({
      experiment: false,
    } as RTB.RTBExperiment);
    const { queryByTestId } = render(RTBBanner);
    expect(queryByTestId('rtb-banner')).not.toBeInTheDocument();
  });

  test('RTB banner should NOT be shown for RTB enabled merchants with variant "no_show"', async () => {
    getPreferences.mockReturnValue(true);
    RTBExperiment.set({
      experiment: true,
    } as RTB.RTBExperiment);
    const { queryByTestId } = render(RTBBanner);
    expect(queryByTestId('rtb-banner')).not.toBeInTheDocument();
  });

  test('RTB banner should be shown for RTB enabled merchants with experiment false', async () => {
    getPreferences.mockReturnValue(true);
    RTBExperiment.set({
      experiment: false,
      variant: RTB.ExperimentVariants.NoShow,
    });
    const { getByTestId } = render(RTBBanner);
    expect(getByTestId('rtb-banner')).toBeInTheDocument();
  });

  test('RTB banner should be shown for RTB enabled merchants with variant show', async () => {
    getPreferences.mockReturnValue(true);
    RTBExperiment.set({
      experiment: true,
      variant: RTB.ExperimentVariants.Show,
    });
    const { getByTestId } = render(RTBBanner);
    expect(getByTestId('rtb-banner')).toBeInTheDocument();
  });

  test('RTB banner should be shown for RTB enabled merchants with variant "not_applicable"', async () => {
    getPreferences.mockReturnValue(true);
    RTBExperiment.set({
      experiment: true,
      variant: RTB.ExperimentVariants.NotApplicable,
    });
    const { getByTestId } = render(RTBBanner);
    expect(getByTestId('rtb-banner')).toBeInTheDocument();
  });

  test('Clicking on RTB banner should trigger overlay open', async () => {
    getPreferences.mockReturnValue(true);
    RTBExperiment.set({
      experiment: true,
      variant: RTB.ExperimentVariants.Show,
    });
    const { getByTestId } = render(RTBBanner);
    expect(getByTestId('rtb-banner')).toBeInTheDocument();
    expect(pushOverlay).not.toHaveBeenCalled();

    await fireEvent.click(getByTestId('rtb-banner'));

    expect(pushOverlay).toHaveBeenCalledTimes(1);
    expect(pushOverlay).toHaveBeenCalledWith(
      expect.objectContaining({
        component: RTBOverlay,
      })
    );
  });

  test('Overlay should not be triggered if RTB is not enabled for the merchant', async () => {
    getPreferences.mockReturnValue(false);
    RTBExperiment.set({
      experiment: true,
      variant: RTB.ExperimentVariants.Show,
    });
    const { container, queryByTestId } = render(RTBBanner);
    expect(queryByTestId('rtb-banner')).not.toBeInTheDocument();

    await fireEvent.click(container);
    expect(pushOverlay).not.toHaveBeenCalled();
  });
});
