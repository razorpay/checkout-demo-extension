// utils
import { render, fireEvent, waitFor, cleanup } from '@testing-library/svelte';

// testable
import CurrencySelect from '../CurrencySelect.svelte';

// test data
import { sortedCurrencies } from '../../testsData/currenciesResponse';

const componentProps = {
  currencies: sortedCurrencies,
  selectedCurrency: 'USD',
  originalCurrency: 'INR',
};

describe('Test DCC CurrencySelect component', () => {
  afterEach(cleanup);

  test('should render without breaking', () => {
    const { getByText } = render(CurrencySelect, { props: componentProps });
    expect(() => getByText('USD')).not.toThrow();
  });
  test('should render currencies list on UI', () => {
    const { getByText } = render(CurrencySelect, { props: componentProps });
    expect(getByText('USD')).toBeInTheDocument();
    expect(getByText('CAD')).toBeInTheDocument();
  });
  test('should update selected currency', async () => {
    const { component, getByText, container } = render(CurrencySelect, {
      props: componentProps,
    });
    const onChange = jest.fn();
    component.$on('change', onChange);

    await fireEvent.click(getByText('CAD'));
    expect(container.querySelector('#currency_CAD')).toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(1);

    await fireEvent.click(getByText('USD'));
    expect(container.querySelector('#currency_USD')).toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(2);
  });
  test('should show markup on UI', () => {
    const { getByText, container } = render(CurrencySelect, {
      props: { ...componentProps, showMarkup: true },
    });

    expect(getByText('USD 1')).toBeInTheDocument();
    expect(getByText('CAD 1.47')).toBeInTheDocument();
    expect(container.querySelector('.dcc-charges')).toHaveTextContent(
      '1 USD = 1 INR (incl. 8% conversion charges)'
    );
  });
  test('should render more or change button', () => {
    const { getByText } = render(CurrencySelect, { props: componentProps });
    expect(getByText('More')).toBeInTheDocument();
  });
  test('should render other currency if selected currency is not in display currencies', () => {
    const { getByText } = render(CurrencySelect, {
      props: { ...componentProps, selectedCurrency: 'EUR' },
    });
    expect(getByText('Pay in EUR')).toBeInTheDocument();
    expect(getByText(`€`)).toBeInTheDocument();
    expect(getByText(`1.09`)).toBeInTheDocument();
  });
  test('should render other currency if selected currency is not in display currencies and show markup', () => {
    const { getByText, container } = render(CurrencySelect, {
      props: { ...componentProps, selectedCurrency: 'EUR', showMarkup: true },
    });

    expect(getByText('Pay in EUR (€ 1.09)')).toBeInTheDocument();
    expect(container.querySelector('.dcc-charges')).toHaveTextContent(
      '1 EUR = 1.006668 INR (incl. 8% conversion charges)'
    );
  });
  test('should render conversion fee checkbox', async () => {
    const { getByText, container, component, debug } = render(CurrencySelect, {
      props: {
        ...componentProps,
        originalCurrency: 'USD',
        selectedCurrency: 'EUR',
        showMarkup: true,
      },
    });

    const onChange = jest.fn();
    component.$on('change', onChange);

    const conversionCheckbox = getByText('Pay currency conversion fee');

    expect(container.querySelector('.dcc-charges')).toHaveTextContent(
      '1 EUR = 1.006668 USD (incl. 8% conversion charges)'
    );
    expect(conversionCheckbox).toBeInTheDocument();
    expect(container.querySelector('#dcc-fee-accept')).toBeChecked();

    await fireEvent.click(conversionCheckbox);
    expect(onChange).toHaveBeenCalledTimes(1);

    await component.$set({
      ...componentProps,
      originalCurrency: 'USD',
      selectedCurrency: 'USD',
    });

    expect(() => getByText('1 EUR')).toThrow();
    expect(() => getByText('Pay currency conversion fee')).toThrow();
  });
});
