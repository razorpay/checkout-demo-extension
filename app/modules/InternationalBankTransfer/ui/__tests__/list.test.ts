import { get } from 'svelte/store';
import { render, cleanup, waitFor, fireEvent } from '@testing-library/svelte';
import Analytics from 'analytics';
import { setupPreferences } from 'tests/setupPreferences';
import { selectedMethod } from 'checkoutstore/screens/intlBankTransfer';

// module
import List from '../List.svelte';

jest.mock('sessionmanager', () => ({
  getSession: () => ({
    setRawAmountInHeader: jest.fn(),
    getPayload: jest.fn(),
  }),
}));

const mockRzpPrototype: { [key: string]: Function | string | number } = {
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

jest.mock('utils/fetch');

describe('Test <List />', () => {
  beforeEach(() => {
    setupPreferences('internationalTests', razorpayInstance);
    Analytics.setR(razorpayInstance);
  });

  afterEach(cleanup);

  test('should render all accounts details', () => {
    const { getByText } = render(List);

    expect(getByText('USD Bank Account')).toBeInTheDocument();
    expect(getByText('EUR Bank Account')).toBeInTheDocument();
    expect(getByText('GBP Bank Account')).toBeInTheDocument();
    expect(getByText('CAD Bank Account')).toBeInTheDocument();
  });
  test('should select USD Bank Account', () => {
    const { getByText } = render(List);

    fireEvent.click(getByText('USD Bank Account'));

    expect(get(selectedMethod)).toStrictEqual('va_usd');
  });
  test('should select EUR Bank Account', () => {
    const { getByText } = render(List);

    fireEvent.click(getByText('EUR Bank Account'));

    expect(get(selectedMethod)).toStrictEqual('va_eur');
  });

  test('should select GBP Bank Account', () => {
    const { getByText } = render(List);

    fireEvent.click(getByText('GBP Bank Account'));

    expect(get(selectedMethod)).toStrictEqual('va_gbp');
  });
  test('should select CAD Bank Account', () => {
    const { getByText } = render(List);

    fireEvent.click(getByText('CAD Bank Account'));

    expect(get(selectedMethod)).toStrictEqual('va_cad');
  });
  test('should render details view if any method is selected', async () => {
    const { getByText } = render(List);

    fireEvent.click(getByText('CAD Bank Account'));

    await waitFor(() =>
      expect(getByText('Getting account details...')).toBeInTheDocument()
    );
  });

  test('should remove details view on back press', async () => {
    const { getByText, component, debug } = render(List);

    fireEvent.click(getByText('CAD Bank Account'));

    await waitFor(() =>
      expect(getByText('Getting account details...')).toBeInTheDocument()
    );

    component.onBack();

    await waitFor(() =>
      expect(getByText('Transfer money via')).toBeInTheDocument()
    );
  });
});
