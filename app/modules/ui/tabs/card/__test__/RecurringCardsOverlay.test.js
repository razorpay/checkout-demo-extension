import { render, within, fireEvent } from '@testing-library/svelte';
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
  });

  describe('Banks support', () => {
    it.each`
      bankName         | isCredit | isDebit  | isSuperCard
      ${'City Union'}  | ${false} | ${true}  | ${false}
      ${'Equitas'}     | ${false} | ${true}  | ${false}
      ${'HSBC'}        | ${true}  | ${false} | ${false}
      ${'Karur Vysya'} | ${true}  | ${true}  | ${false}
      ${'OneCard'}     | ${true}  | ${false} | ${false}
    `(
      '$bankName, supports credit card - $isCredit, debit card - $isDebit, super cards - $isSuperCard',
      ({ bankName, isCredit, isDebit, isSuperCard }) => {
        const { getByText, getByTestId } = setup();
        const bankNameEl = getByText(bankName);
        expect(bankNameEl).toHaveTextContent(bankName);
        if (isCredit) {
          const creditCardsContainer = getByTestId(`${bankName}-credit-cards`);
          expect(creditCardsContainer).toHaveTextContent('Credit Cards');
        }
        if (isDebit) {
          const debitCardsContainer = getByTestId(`${bankName}-debit-cards`);
          expect(debitCardsContainer).toHaveTextContent('Debit Cards');
        }
        if (isSuperCard) {
          const debitCardsContainer = getByTestId(`${bankName}-super-cards`);
          expect(debitCardsContainer).toHaveTextContent('Super Cards');
        }
      }
    );
  });

  // Check if networks are shown as configured below
  describe('Network support', () => {
    it.each`
      bankName         | creditCards               | debitCards                | superCards
      ${'City Union'}  | ${[]}                     | ${['Visa', 'MasterCard']} | ${[]}
      ${'Equitas'}     | ${[]}                     | ${['Visa', 'MasterCard']} | ${[]}
      ${'HSBC'}        | ${['Visa', 'MasterCard']} | ${[]}                     | ${[]}
      ${'Karur Vysya'} | ${['Visa']}               | ${['Visa', 'MasterCard']} | ${[]}
      ${'OneCard'}     | ${['Visa']}               | ${[]}                     | ${[]}
    `(
      '$bankName, supports this networks - In debit - $debitCards, In Credit - ${creditCards}, and in Super Cards - ${superCards}',
      ({ bankName, creditCards, debitCards, superCards }) => {
        const { getByTestId } = setup();
        if (creditCards.length) {
          const creditCardsContainer = getByTestId(
            `${bankName}-credit-networks`
          );
          for (let i = 0; i < creditCards.length; i++) {
            let el = within(creditCardsContainer).getByTestId(creditCards[i]);
            expect(el).toHaveTextContent(creditCards[i]);
          }
        }
        if (debitCards.length) {
          const debitCardsContainer = getByTestId(`${bankName}-debit-networks`);
          for (let i = 0; i < debitCards.length; i++) {
            let el = within(debitCardsContainer).getByTestId(debitCards[i]);
            expect(el).toHaveTextContent(debitCards[i]);
          }
        }
        if (superCards.length) {
          const superCardsContainer = getByTestId(`${bankName}-super-networks`);
          for (let i = 0; i < superCards.length; i++) {
            let el = within(superCardsContainer).getByTestId(superCards[i]);
            expect(el).toHaveTextContent(superCards[i]);
          }
        }
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
