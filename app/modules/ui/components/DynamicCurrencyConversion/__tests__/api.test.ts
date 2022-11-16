// testable
import { fetchCurrencies } from '../api';

// test data
import {
  successResponse,
  withoutAllCurrenciesResponse,
  sortedCurrencies,
} from '../testsData/currenciesResponse';

// mock
import { getCurrencies } from 'razorpay';

jest.mock('razorpay');
const mockGetCurrencies = <jest.Mock<Promise<unknown>>>getCurrencies;

describe('Test getCurrencies', () => {
  test('should fetch all DCC currencies', async () => {
    mockGetCurrencies.mockImplementation(() =>
      Promise.resolve(successResponse)
    );
    const response = await fetchCurrencies({
      entity: '424242',
      identifier: 'iin',
      amount: 100,
    });
    expect(response).toStrictEqual({
      data: {
        ...successResponse,
        amount: 100,
        currencies: sortedCurrencies,
        originalCurrency: undefined,
        selectedCurrency: 'USD',
      },
    });
    expect(mockGetCurrencies).toHaveBeenCalledWith({
      iin: '424242',
      tokenId: undefined,
      cardNumber: undefined,
      walletCode: undefined,
      amount: 100,
      currency: undefined,
      provider: undefined,
    });
  });
  test('should return error if api failed to respond', async () => {
    mockGetCurrencies.mockImplementation(() =>
      Promise.resolve({ error: 'Failed to fetch response' })
    );
    const response = await fetchCurrencies({
      entity: '424242',
      identifier: 'iin',
      amount: 100,
    });
    expect(response).toStrictEqual({
      error: 'DCC Error: Failed to fetch response',
    });
  });
  test('should return error if valid DCC identifier is not provided', async () => {
    mockGetCurrencies.mockImplementation(() =>
      Promise.resolve({ error: 'Failed to fetch response' })
    );
    const response = await fetchCurrencies({
      entity: 'Adam',
      identifier: 'apple',
      amount: 100,
    });
    expect(response).toStrictEqual({
      error:
        'DCC Error: DCC is not supported on identifier: apple. To add DCC on Adam:apple, update isDCCAllowedOnIdentifier list.',
    });
    expect(mockGetCurrencies).not.toHaveBeenCalled();
  });
  test('should return empty currencies if all_currencies is not present in response', async () => {
    mockGetCurrencies.mockImplementation(() =>
      Promise.resolve(withoutAllCurrenciesResponse)
    );
    const response = await fetchCurrencies({
      entity: 'token_id',
      identifier: 'tokenId',
      amount: 100,
    });
    expect(response).toStrictEqual({
      data: {
        ...withoutAllCurrenciesResponse,
        amount: 100,
        currencies: [],
        originalCurrency: undefined,
        selectedCurrency: 'USD',
      },
    });
  });
  test('should pass tokenId as request param', async () => {
    mockGetCurrencies.mockImplementation(() =>
      Promise.resolve(successResponse)
    );
    const response = await fetchCurrencies({
      entity: 'token_id',
      identifier: 'tokenId',
      amount: 100,
    });
    expect(response).toStrictEqual({
      data: {
        ...successResponse,
        amount: 100,
        currencies: sortedCurrencies,
        originalCurrency: undefined,
        selectedCurrency: 'USD',
      },
    });
    expect(mockGetCurrencies).toHaveBeenCalledWith({
      iin: undefined,
      tokenId: 'token_id',
      cardNumber: undefined,
      walletCode: undefined,
      amount: 100,
      currency: undefined,
      provider: undefined,
    });
  });
  test('should pass provider as request param', async () => {
    mockGetCurrencies.mockImplementation(() =>
      Promise.resolve(successResponse)
    );
    const response = await fetchCurrencies({
      entity: 'trustly',
      identifier: 'provider',
      amount: 100,
    });
    expect(response).toStrictEqual({
      data: {
        ...successResponse,
        amount: 100,
        currencies: sortedCurrencies,
        originalCurrency: undefined,
        selectedCurrency: 'USD',
      },
    });
    expect(mockGetCurrencies).toHaveBeenCalledWith({
      iin: undefined,
      tokenId: undefined,
      cardNumber: undefined,
      walletCode: undefined,
      amount: 100,
      currency: undefined,
      provider: 'trustly',
    });
  });
  test('should pass walletCode as request param', async () => {
    mockGetCurrencies.mockImplementation(() =>
      Promise.resolve(successResponse)
    );
    const response = await fetchCurrencies({
      entity: 'paypal',
      identifier: 'walletCode',
      amount: 100,
    });
    expect(response).toStrictEqual({
      data: {
        ...successResponse,
        amount: 100,
        currencies: sortedCurrencies,
        originalCurrency: undefined,
        selectedCurrency: 'USD',
      },
    });
    expect(mockGetCurrencies).toHaveBeenCalledWith({
      iin: undefined,
      tokenId: undefined,
      cardNumber: undefined,
      walletCode: 'paypal',
      amount: 100,
      currency: undefined,
      provider: undefined,
    });
  });
});
