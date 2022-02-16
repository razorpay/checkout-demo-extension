import { RTB } from 'checkoutstore/rtb';
import { render, fireEvent } from '@testing-library/svelte';

import { getPreferences } from 'razorpay';
import TrustedBadge from 'trusted-badge/ui/component/TrustedBadge.svelte';

jest.mock('razorpay', () => ({
  getPreferences: jest.fn(),
}));
describe('Trusted Badge', () => {
  test('RTB should be shown for RTB enabled', async () => {
    getPreferences.mockReturnValue(true);
    const { component, container, getByTestId, queryByTestId } = render(
      TrustedBadge,
      {
        sendAnalytics: false,
      }
    );
    expect(getByTestId('trusted-badge')).toBeInTheDocument();
    expect(queryByTestId('trusted-badge-info')).not.toBeInTheDocument();
    const onClick = jest.fn();
    // assign click event to component
    component.$on('click', onClick);
    const showInfo = container.querySelector('.trusted-badge-header-section');
    expect(showInfo).toBeInTheDocument();
    expect(showInfo).not.toBeNull();
    await fireEvent.click(showInfo);
    expect(getByTestId('trusted-badge-info')).toBeInTheDocument();
  });
  test('RTB should be shown for RTB enabled Experiment enabled with rtb_show variant', async () => {
    const data = {
      experiment: true,
      variant: 'rtb_show',
    };
    getPreferences.mockReturnValue(true);
    RTB.set(data);
    const { component, container, getByTestId, queryByTestId } = render(
      TrustedBadge,
      {
        sendAnalytics: false,
      }
    );
    expect(getByTestId('trusted-badge')).toBeInTheDocument();
    expect(queryByTestId('trusted-badge-info')).not.toBeInTheDocument();
    const onClick = jest.fn();
    // assign click event to component
    component.$on('click', onClick);
    const showInfo = container.querySelector('.trusted-badge-header-section');
    expect(showInfo).toBeInTheDocument();
    expect(showInfo).not.toBeNull();
    await fireEvent.click(showInfo);
    expect(getByTestId('trusted-badge-info')).toBeInTheDocument();
  });
  test('RTB should be shown for RTB enabled Experiment enabled with not_applicable variant', async () => {
    const data = {
      experiment: true,
      variant: 'not_applicable',
    };
    getPreferences.mockReturnValue(true);
    RTB.set(data);
    const { component, container, getByTestId, queryByTestId } = render(
      TrustedBadge,
      {
        sendAnalytics: false,
      }
    );
    expect(getByTestId('trusted-badge')).toBeInTheDocument();
    expect(queryByTestId('trusted-badge-info')).not.toBeInTheDocument();
    const onClick = jest.fn();
    // assign click event to component
    component.$on('click', onClick);
    const showInfo = container.querySelector('.trusted-badge-header-section');
    expect(showInfo).toBeInTheDocument();
    expect(showInfo).not.toBeNull();
    await fireEvent.click(showInfo);
    expect(getByTestId('trusted-badge-info')).toBeInTheDocument();
  });

  test('RTB should be not be shown for RTB enabled Experiment enabled with rtb_no_show variant', async () => {
    const data = {
      experiment: true,
      variant: 'rtb_no_show',
    };
    getPreferences.mockReturnValue(true);
    RTB.set(data);
    const { queryByTestId } = render(TrustedBadge, {
      sendAnalytics: false,
    });
    expect(queryByTestId('trusted-badge')).not.toBeInTheDocument();
    expect(queryByTestId('trusted-badge-info')).not.toBeInTheDocument();
  });

  test('RTB should  be shown for RTB enabled but  Experiment disabled ', async () => {
    const data = {
      experiment: false,
    };
    getPreferences.mockReturnValue(true);
    RTB.set(data);
    const { component, container, getByTestId, queryByTestId } = render(
      TrustedBadge,
      {
        sendAnalytics: false,
      }
    );
    expect(getByTestId('trusted-badge')).toBeInTheDocument();
    expect(queryByTestId('trusted-badge-info')).not.toBeInTheDocument();
    const onClick = jest.fn();
    // assign click event to component
    component.$on('click', onClick);
    const showInfo = container.querySelector('.trusted-badge-header-section');
    expect(showInfo).toBeInTheDocument();
    expect(showInfo).not.toBeNull();
    await fireEvent.click(showInfo);
    expect(getByTestId('trusted-badge-info')).toBeInTheDocument();
  });
});
