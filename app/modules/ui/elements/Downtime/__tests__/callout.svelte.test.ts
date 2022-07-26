import { render, fireEvent } from '@testing-library/svelte';
import { Events, DowntimeEvents, MetaProperties } from 'analytics/index';
import Callout from '../Callout.svelte';
jest.mock('razorpay', () => ({
  get: jest.fn(),
  isOneClickCheckout: () => false,
  isCustomerFeeBearer: () => false,
  isOfferForced: () => false,
  getPreferences: () => {},
  isRecurring: () => false,
  getOptionalObject: jest.fn(),
  getOption: jest.fn(),
  razorpayInstance: {
    createPayment: () => {
      return new Object({ on: () => {} });
    },
  },
}));

jest.mock('analytics', () => ({
  __esModule: true,
  Events: {
    setMeta: jest.fn(),
    TrackRender: jest.fn(),
  },
  DowntimeEvents: {},
  MetaProperties: {},
  default: {
    track: jest.fn(() => {}),
  },
}));

jest.mock('sessionmanager', () => ({
  getSession: () => ({
    r: {
      get: jest.fn(),
    },
    themeMeta: {
      icons: {
        saved_card: '',
      },
    },
    getPayload: jest.fn(),
    getAppliedOffer: jest.fn(),
    get: jest.fn(() => ({
      paused: false,
    })),
  }),
}));

describe('Downtime Callout Component Tests', () => {
  it('should render without any errors', async () => {
    expect(render(Callout, {})).toBeTruthy();
  });
  it('should  trigger events when set avoidTrackers not set in props ', async () => {
    const component = render(Callout, {
      showIcon: true,
      severe: 'high',
      customMessage: undefined,
    });
    expect(component).toBeTruthy();
    expect((Events as any).setMeta).toBeCalled();
    expect((Events as any).TrackRender).toBeCalled();
  });

  it('should not trigger events when set avoidTrackers set in props and set the custom message', async () => {
    const component = render(Callout, {
      avoidTrackers: true,
      showIcon: true,
      severe: 'high',
      customMessage: 'test custom message',
    });
    expect(component).toBeTruthy();
    expect((Events as any).setMeta).not.toBeCalled();
    expect((Events as any).TrackRender).not.toBeCalled();
    expect(component.queryByText('test custom message')).toBeInTheDocument();
  });
});
