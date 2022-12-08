import { render } from '@testing-library/svelte';
import { BANK_TYPES } from 'common/bank';
import BankRadioOptions from 'fpx/ui/components/BankRadioOptions.svelte';

describe('BankRadioOptions', () => {
  test('should be rendered', async () => {
    const result = render(BankRadioOptions, {});
    expect(result).toBeTruthy();
  });

  test('should keep retail option as checked as default', async () => {
    const { getByTestId } = render(BankRadioOptions, {});

    expect(getByTestId('fpx_type_retail')).toBeChecked();
  });

  test(`activeType=${BANK_TYPES.RETAIL}: should mark retail option as checked`, async () => {
    const { getByTestId } = render(BankRadioOptions, {
      props: { activeType: BANK_TYPES.RETAIL },
    });

    expect(getByTestId('fpx_type_retail')).toBeChecked();
  });

  test(`activeType=${BANK_TYPES.CORPORATE}: should mark corporate option as checked`, async () => {
    const { getByTestId } = render(BankRadioOptions, {
      props: { activeType: BANK_TYPES.CORPORATE },
    });

    expect(getByTestId('fpx_type_corporate')).toBeChecked();
  });

  test('retailDisabled=true, should disable retail option', async () => {
    const { getByTestId } = render(BankRadioOptions, {
      props: { retailDisabled: true },
    });

    expect(getByTestId('fpx_type_retail')).toBeDisabled();
  });

  test('corporateDisabled=true, should disable corporate option', async () => {
    const { getByTestId } = render(BankRadioOptions, {
      props: { corporateDisabled: true },
    });

    expect(getByTestId('fpx_type_corporate')).toBeDisabled();
  });
});
