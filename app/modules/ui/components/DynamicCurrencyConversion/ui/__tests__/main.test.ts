// utils
import { render, cleanup } from '@testing-library/svelte';

// mock
import { getCurrencies } from 'razorpay';

// store
import { getDCCPayloadData } from '../../store';

// testable
import Main from '../DynamicCurrencyConversion.svelte';

// test data
import {
  successResponse,
  sortedCurrencies,
  failedResponse,
} from '../../testsData/currenciesResponse';

jest.mock('razorpay');

const mockGetCurrencies = <jest.Mock<Promise<unknown>>>getCurrencies;

const waitForTimeout = (time = 20) =>
  new Promise((resolve) => setTimeout(resolve, time));

const componentProps = {
  amount: 100,
  originalCurrency: 'INR',
  entity: '424242',
  identifier: 'iin',
};

describe('Test DynamicCurrencyConversion main component', () => {
  afterEach(cleanup);

  test('should render without breaking', async () => {
    const { component, container } = render(Main, {
      ...componentProps,
      dccEnabled: false,
    });

    await component.$set({ ...componentProps, dccEnabled: true });

    expect(container.querySelector('.dcc-view')).toBeDefined();
  });
  test('should fetch currencies and update events', async () => {
    // send response for fetchCurrencies api
    mockGetCurrencies.mockImplementation(() =>
      Promise.resolve(successResponse)
    );

    const { component, getByText } = render(Main, componentProps);

    const onCurrencyMetaLoaded = jest.fn((evt) => {
      expect(evt.detail).toStrictEqual({
        currency_request_id: successResponse.currency_request_id,
        avs_required: successResponse.avs_required,
        all_currencies: successResponse.all_currencies,
        card_currency: successResponse.card_currency,
        currencies: sortedCurrencies,
        originalCurrency: 'INR',
        selectedCurrency: 'USD',
        amount: 100,
      });
    });
    component.$on('currencyMetaLoaded', onCurrencyMetaLoaded);

    const onSelectedCurrencyChange = jest.fn((evt) => {
      expect(evt.detail).toEqual({ selectedCurrency: 'USD', amount: 100 });
    });
    component.$on('selectedCurrencyChange', onSelectedCurrencyChange);

    await waitForTimeout();

    expect(onCurrencyMetaLoaded).toHaveBeenCalledTimes(1);
    expect(onSelectedCurrencyChange).toHaveBeenCalledTimes(1);
    expect(getDCCPayloadData()).toEqual({
      originalCurrency: 'INR',
      selectedCurrency: 'USD',
      defaultCurrency: 'USD',
      amount: 100,
      enable: true,
      method: '',
      currency_request_id: successResponse.currency_request_id,
      avs_required: successResponse.avs_required,
      all_currencies: successResponse.all_currencies,
      card_currency: successResponse.card_currency,
      currencies: sortedCurrencies,
    });

    await component.$set({ ...componentProps, selectedCurrency: 'USD' });

    expect(getByText('USD')).toBeInTheDocument();
    expect(getByText('CAD')).toBeInTheDocument();
    expect(getByText('$')).toBeInTheDocument();
    expect(getByText('1')).toBeInTheDocument();
  });
  test('should failed to fetch currencies and update events', async () => {
    // send response for fetchCurrencies api
    mockGetCurrencies.mockImplementation(() => Promise.resolve(failedResponse));

    const props = {
      amount: 100,
      originalCurrency: 'INR',
      entity: '424242',
      identifier: 'iin',
    };
    const { component } = render(Main, componentProps);

    const onCurrencyMetaFailed = jest.fn((evt) => {
      expect(evt.detail).toEqual({ isError: true });
    });
    component.$on('currencyMetaFailed', onCurrencyMetaFailed);

    const onSelectedCurrencyChange = jest.fn((evt) => {
      expect(evt.detail).toEqual('USD');
    });
    component.$on('selectedCurrencyChange', onSelectedCurrencyChange);

    await waitForTimeout();

    expect(onCurrencyMetaFailed).toHaveBeenCalledTimes(1);
    expect(onSelectedCurrencyChange).toHaveBeenCalledTimes(0);
  });
});
