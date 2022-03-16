import { render, cleanup, fireEvent, act } from '@testing-library/svelte';
import Analytics from 'analytics';
import { setupPreferences } from 'tests/setupPreferences';
import Offline from '../index.svelte';

jest.useFakeTimers();

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  customer_id: 'customer_id',
  get: (arg) => arg,
  getMode: () => 'test',
};

jest.mock('sessionmanager', () => {
  return {
    getSession: () => ({
      get: jest.fn(),
      r: razorpayInstance,
      getPayload: jest.fn(),
    }),
  };
});

global.fetch = {
  post: jest.fn((options) => {
    return new Promise((resolve) => {
      let response = {
        id: 'test_id',
        name: 'virtual accounts',
      };
      options.callback(response);
      resolve(response);
    });
  }),
};

const waitForTime = (time) =>
  new Promise((resolve) => setTimeout(resolve, time));

describe('Test Offline/index.svelte component', () => {
  beforeEach(() => {
    setupPreferences('internationalTests', razorpayInstance);
    Analytics.setR(razorpayInstance);
  });

  afterEach(cleanup);

  it('should render without breaking', () => {
    const { container } = render(Offline);
    expect(container).toBeTruthy();
  });

  it('should call create virtual accounts api', async () => {
    document.execCommand = jest.fn();
    const { getByText } = render(Offline);
    waitForTime(10).then(async () => {
      const copyButton = getByText('Copy Details');
      await fireEvent.click(copyButton);
      expect(document.execCommand).toHaveBeenCalledWith('copy');
      const beneficiaryName = getByText('Beneficiary Name');
      expect(beneficiaryName).toBeInTheDocument();
    });
  });
});
