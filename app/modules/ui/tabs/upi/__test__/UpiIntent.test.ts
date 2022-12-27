import UpiIntent from '../UpiIntent.svelte';
import { render, fireEvent } from '@testing-library/svelte';
import { enableUPITiles } from 'upi/features';
import Analytics, { Events } from 'analytics';
import { checkDowntime } from 'checkoutframe/downtimes';
import { tick } from 'svelte';

const Apps = [
  {
    package_name: 'in.org.npci.upiapp',
    shortcode: 'bhim',
    app_name: 'BHIM',
    app_icon: 'bhim',
  },
  {
    package_name: 'in.org.phonepe',
    shortcode: 'phonepe',
    app_name: 'Phonepe',
  },
  {
    package_name: 'in.org.gpay',
    shortcode: 'google_pay',
    url_schema: 'gpay://upi/pay',
  },
  {
    package_name: 'in.org.paytm',
    shortcode: 'paytm',
    url_schema: {
      ios: 'paytmmp://upi/pay',
      android: 'paytmmp://pay',
    },
  },
  {
    package_name: 'in.org.amazonpay',
    shortcode: 'amazonpay',
    app_name: 'Amazonpay',
  },
  {
    package_name: 'in.org.mobikwik',
    shortcode: 'mobikwik',
    app_name: 'Mobikwik',
  },
];

jest.mock('upi/features', () => ({
  enableUPITiles: jest.fn(() => ({})),
}));

jest.mock('analytics', () => ({
  __esModule: true,
  ...jest.requireActual('analytics'),
  Events: {
    TrackRender: jest.fn(),
    TrackMetric: jest.fn(),
    TrackBehav: jest.fn(),
    setMeta: jest.fn(),
  },
  default: {
    track: jest.fn(() => {}),
  },
}));
jest.mock('checkoutframe/downtimes', () => ({
  ...jest.requireActual('checkoutframe/downtimes'),
  checkDowntime: jest.fn(() => false),
}));

/**
 * Tests cover
 * * Component renders without errors
 * * Able to render UPI apps
 * * Render UPI Apps in List View + Make sure analytic events trigger on selection
 * * Render UPI Apps in List View + Make sure analytic events trigger on selection + Downtime + make sure on selection callback received
 * * Render UPI app in Grid View
 * * Render UPI app in list view with preselected app provided + downtime
 */

describe('UpiIntent', () => {
  test('render UPIIntent without error', () => {
    expect(
      render(UpiIntent, {
        props: {
          apps: [],
        },
      })
    ).toBeTruthy();
  });
  test('render UPIIntent with apps', () => {
    expect(
      render(UpiIntent, {
        props: {
          payUsingApps: false,
          apps: Apps.slice(0, 2),
        },
      })
    );
    // check radio button renders 2 for apps
    expect(document.getElementsByClassName('input-radio')).toHaveLength(2);
    expect(document.querySelector('[data-name="bhim"]')).toBeInTheDocument();
    expect(document.querySelector('[data-name="phonepe"]')).toBeInTheDocument();
  });

  test('render UPIIntent with apps & enableUPITiles status is false + analytic events trigger', () => {
    (enableUPITiles as jest.Mock).mockImplementation(() => ({
      status: false,
      variant: 'row',
      config: {},
    }));
    expect(
      render(UpiIntent, {
        props: {
          skipCTA: true,
          apps: Apps,
        },
      })
    );
    // check radio button renders {4} from first four app as showall is disable {1} for other apps
    expect(document.getElementsByClassName('radio-option')).toHaveLength(5);

    expect(Events.TrackRender).toHaveBeenCalledTimes(2);
    fireEvent.click(document.querySelector('[data-name="bhim"]') as Element);
    expect(Analytics.track).toHaveBeenCalledTimes(2);
  });

  test('render UPIIntent with apps & enableUPITiles status is false & with downtime + select callback invoke', () => {
    (enableUPITiles as jest.Mock).mockImplementation(() => ({
      status: false,
      variant: 'row',
      config: {},
    }));
    (checkDowntime as jest.Mock).mockImplementation(() => true);

    const results = render(UpiIntent, {
      props: {
        skipCTA: true,
        apps: Apps,
      },
    });
    const onSelect = jest.fn();
    results.component.$on('select', onSelect);

    // check radio button renders {4} from first four app as showall is disable {1} for other apps
    expect(document.getElementsByClassName('radio-option')).toHaveLength(5);

    expect(Events.TrackRender).toHaveBeenCalledTimes(2);
    fireEvent.click(document.querySelector('[data-name="bhim"]') as Element);
    expect(Analytics.track).toHaveBeenCalledTimes(2);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls.length).toEqual(1);
  });

  test('render UPIIntent with apps & enableUPITiles status is true', () => {
    (enableUPITiles as jest.Mock).mockImplementation(() => ({
      status: true,
      variant: 'row',
      config: {},
    }));

    render(UpiIntent, {
      props: {
        showRecommendedUPIApp: true,
        apps: Apps,
      },
    });

    // check radio button renders is disable {1} for other apps
    expect(document.getElementsByClassName('input-radio')).toHaveLength(1);
    expect(
      document.querySelector('[data-appid="mobikwik"]')
    ).toBeInTheDocument();
    fireEvent.click(document.querySelector('[data-appid="bhim"]') as Element);
  });

  test('render UPIIntent with apps & enableUPITiles status is false & with downtime + select callback invoke + preselected app', async () => {
    (enableUPITiles as jest.Mock).mockImplementation(() => ({
      status: false,
      variant: 'row',
      config: {},
    }));
    (checkDowntime as jest.Mock).mockImplementation(() => true);

    const results = render(UpiIntent, {
      props: {
        skipCTA: true,
        selected: 'in.org.npci.upiapp',
        apps: Apps.slice(0, 2),
      },
    });
    const onSelect = jest.fn();
    results.component.$on('select', onSelect);

    // check radio button renders {2} from app & {1} for other apps
    expect(document.getElementsByClassName('radio-option')).toHaveLength(3);

    expect(Events.TrackRender).toHaveBeenCalledTimes(2);
    fireEvent.click(document.querySelector('[data-name="bhim"]') as Element);
    expect(Analytics.track).toHaveBeenCalledTimes(2);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls.length).toEqual(1);
    await tick();
    expect(document.querySelector('.downtime-callout')).toBeInTheDocument();
  });
});
