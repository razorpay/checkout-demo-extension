// utils
import { render } from '@testing-library/svelte';

// testable
import CurrencySelectDialog from '../CurrencySelectDialog.svelte';

describe('Test CurrencySelectDialog', () => {
  test('should render without breaking', () => {
    const { getByText } = render(CurrencySelectDialog, {
      item: { currency: 'USD', symbol: '$', name: 'Dollar' },
    });

    expect(
      getByText((text) => text.trim().replace(/\n/g, '') === 'Dollar (USD)')
    ).toBeInTheDocument();
    expect(getByText('$')).toBeInTheDocument();
  });
  test('should render RTL currency', () => {
    const { getByText, container } = render(CurrencySelectDialog, {
      item: { currency: 'KWD', symbol: 'د.ك', name: 'Kuwaiti dinar' },
    });

    expect(
      getByText(
        (text) => text.trim().replace(/\n/g, '') === 'Kuwaiti dinar (KWD)'
      )
    ).toBeInTheDocument();
    expect(getByText('د.ك')).toBeInTheDocument();
    expect(container.querySelector('[dir="rtl"]')).toBeDefined();
  });
});
