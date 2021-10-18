import { render, fireEvent } from '@testing-library/svelte';
import RecurringCardsOverlay from '../RecurringCardsOverlay.svelte';

describe('RecurringCardsOverlay.svelte', () => {
  function setup(close = () => {}) {
    return render(RecurringCardsOverlay, {
      props: { close },
    });
  }

  describe('Labels', () => {
    it('should display modal title', () => {
      const label = 'Supported cards for recurring payments';
      const { getByText } = setup();
      expect(getByText(label, { exact: false })).toBeInTheDocument();
    });

    it.each([['Bank'], ['Credit Card'], ['Debit Card']])(
      'should display table heading - %s',
      (label) => {
        const { getByTestId } = setup();
        expect(getByTestId('table-headings')).toHaveTextContent(label);
      }
    );
  });

  describe('Banks support', () => {
    it.each`
      bankName                        | isCredit | isDebit
      ${'HSBC'}                       | ${true}  | ${false}
      ${'Equitas Small Finance Bank'} | ${false} | ${true}
      ${'Karur Vysya Bank'}           | ${true}  | ${true}
      ${'OneCard'}                    | ${true}  | ${false}
    `(
      '$bankName, supports credit card - $isCredit, debit card - $isDebit',
      ({ bankName, isCredit, isDebit }) => {
        const { getByText } = setup();
        const bankNameEl = getByText(bankName);
        const [, creditEl, debitEl] = bankNameEl.parentElement.children;

        const label = (predicate) => (predicate ? 'Yes' : '—');

        expect(creditEl).toHaveTextContent(label(isCredit));
        expect(debitEl).toHaveTextContent(label(isDebit));
      }
    );
  });

  describe('close overlay', () => {
    it('should close overlay on click of close icon', () => {
      const closeFn = jest.fn();
      const { getByText } = setup(closeFn);

      expect(closeFn).toHaveBeenCalledTimes(0);

      const closeEl = getByText('✕');
      fireEvent.click(closeEl);

      expect(closeFn).toHaveBeenCalledTimes(1);
    });
  });
});
