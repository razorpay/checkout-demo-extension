import { render, within, fireEvent } from '@testing-library/svelte';
import RecurringCardsOverlay from '../RecurringCardsOverlay.svelte';
import { popStack } from 'navstack';

jest.mock('navstack', () => {
  return {
    popStack: jest.fn(),
  };
});

describe('RecurringCardsOverlay.svelte', () => {
  function setup() {
    return render(RecurringCardsOverlay);
  }

  describe('Labels', () => {
    it('should display modal title', () => {
      const label = 'Supported cards';
      const { getByText } = setup();
      expect(getByText(label, { exact: false })).toBeInTheDocument();
    });
  });

  describe('Banks support', () => {
    it.each`
      bankName                        | isCredit | isDebit  | isSuperCard
      ${'City Union Bank'}            | ${false} | ${true}  | ${false}
      ${'Equitas Small Finance Bank'} | ${false} | ${true}  | ${false}
      ${'HSBC'}                       | ${true}  | ${false} | ${false}
      ${'Indian Bank'}                | ${false} | ${true}  | ${false}
      ${'Indian Overseas Bank'}       | ${true}  | ${true}  | ${false}
      ${'Jupiter'}                    | ${false} | ${true}  | ${false}
      ${'Karur Vysya Bank'}           | ${true}  | ${true}  | ${false}
      ${'Niyo Global Cards'}          | ${true}  | ${false} | ${false}
      ${'OneCard'}                    | ${true}  | ${false} | ${false}
      ${'Punjab National Bank'}       | ${true}  | ${false} | ${false}
      ${'RazorpayX'}                  | ${true}  | ${false} | ${false}
      ${'Slice'}                      | ${false} | ${false} | ${true}
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
      bankName                        | creditCards               | debitCards                | superCards
      ${'City Union Bank'}            | ${[]}                     | ${['Visa', 'MasterCard']} | ${[]}
      ${'Equitas Small Finance Bank'} | ${[]}                     | ${['Visa', 'MasterCard']} | ${[]}
      ${'HSBC'}                       | ${['Visa', 'MasterCard']} | ${[]}                     | ${[]}
      ${'Indian Bank'}                | ${[]}                     | ${['Visa', 'MasterCard']} | ${[]}
      ${'Indian Overseas Bank'}       | ${['Visa']}               | ${['Visa', 'MasterCard']} | ${[]}
      ${'Jupiter'}                    | ${[]}                     | ${['Visa']}               | ${[]}
      ${'Karur Vysya Bank'}           | ${['Visa']}               | ${['Visa', 'MasterCard']} | ${[]}
      ${'Niyo Global Cards'}          | ${['Visa', 'MasterCard']} | ${[]}                     | ${[]}
      ${'OneCard'}                    | ${['Visa']}               | ${[]}                     | ${[]}
      ${'Punjab National Bank'}       | ${['Visa']}               | ${[]}                     | ${[]}
      ${'RazorpayX'}                  | ${['Visa']}               | ${[]}                     | ${[]}
      ${'Slice'}                      | ${[]}                     | ${[]}                     | ${['Visa']}
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
      const { getByText } = setup();

      expect(popStack).toHaveBeenCalledTimes(0);

      const closeEl = getByText('✕');
      fireEvent.click(closeEl);

      expect(popStack).toHaveBeenCalledTimes(1);
    });
  });
});
