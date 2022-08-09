import { render, cleanup, waitFor, fireEvent } from '@testing-library/svelte';
import Analytics from 'analytics';
import { setupPreferences } from 'tests/setupPreferences';
import fetch from 'utils/fetch';
import { copyToClipboard } from 'common/clipboard';

// module
import Details from '../Details.svelte';

jest.mock('sessionmanager', () => ({
  getSession: () => ({
    setRawAmountInHeader: jest.fn(),
    getPayload: jest.fn(),
  }),
}));

jest.mock('utils/fetch');

jest.mock('common/clipboard');

const fetchMock = fetch as unknown as jest.Mock;

const successResponse = {
  account: {
    routing_code: 'routing_code',
    routing_type: 'ACH',
    account_number: '1234567889',
    beneficiary_name: 'GemsGems',
    va_currency: 'USD',
  },
  amount: 1030,
  currency: 'USD',
  symbol: '$',
};

const errorResponse = {
  error: {
    description: 'something went wrong',
  },
};

const mockRzpPrototype: {
  [key: string]: ((...args: unknown[]) => void) | string | number;
} = {
  key: 'key',
  amount: 100,
  sendMessage: jest.fn(),
};

const razorpayInstance = {
  id: 'id',
  get: (arg: string) => {
    if (!arg) {
      return mockRzpPrototype;
    }
    return mockRzpPrototype[arg] || arg;
  },
  getMode: () => 'test',
  ...mockRzpPrototype,
};

describe('Test <Details />', () => {
  beforeEach(() => {
    setupPreferences('internationalTests', razorpayInstance);
    Analytics.setR(razorpayInstance);
  });

  afterEach(cleanup);

  test('should render without breaking', () => {
    const { getByText } = render(Details, { method: '' });

    expect(getByText('Getting account details...')).toBeInTheDocument();
  });
  test('should render accounts details', async () => {
    fetchMock.mockImplementation(({ callback }) => callback(successResponse));
    const { getByText } = render(Details, { method: 'va_usd' });

    expect(getByText('Getting account details...')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalled();

    await waitFor(() =>
      getByText(
        'Add the account below as a beneficiary and transfer the given payment amount:'
      )
    );

    expect(getByText('1234567889')).toBeInTheDocument();
    expect(getByText('routing_code')).toBeInTheDocument();
    expect(getByText('GemsGems')).toBeInTheDocument();
    expect(getByText('ACH')).toBeInTheDocument();
    expect(getByText('$ 1030')).toBeInTheDocument();
  });
  test('should show retry button on api failure', async () => {
    fetchMock.mockImplementation(({ callback }) => callback(errorResponse));

    const { getByText } = render(Details, { method: 'va_usd' });
    expect(getByText('Getting account details...')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalled();

    await waitFor(() => getByText('something went wrong'));

    expect(getByText('Retry')).toBeInTheDocument();
    fireEvent.click(getByText('Retry'));
    expect(fetchMock).toHaveBeenCalled();
  });
  test('should copy accounts details', async () => {
    fetchMock.mockImplementation(({ callback }) => callback(successResponse));

    const { getByText } = render(Details, { method: 'va_usd' });
    expect(getByText('Getting account details...')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalled();

    await waitFor(() =>
      getByText(
        'Add the account below as a beneficiary and transfer the given payment amount:'
      )
    );

    expect(getByText('Copy Details')).toBeInTheDocument();
    fireEvent.click(getByText('Copy Details'));
    expect(copyToClipboard).toHaveBeenCalledTimes(1);
  });
});
