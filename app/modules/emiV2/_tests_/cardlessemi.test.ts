import { selectedBank } from 'emiV2/store';
import { cardlessEmiStore } from 'emiV2/ui/components/EmiTabsScreen/store';
import { emiContact } from 'checkoutstore/screens/home';
import { cardlessEmiPlansChecker } from 'emiV2/helper/eligibility';
import { isCardlessPlanNoCost } from 'emiV2/helper/plans';
import {
  getCardlessPlansForProvider,
  updateCardlessEmiStore,
} from 'emiV2/payment/cardlessEmi/helper';
import type { CardlessEMIStore, EmiPlan } from 'emiV2/types';

describe('Validate: getCardlessPlansForProvider', () => {
  let provider: string = 'hdfc';
  let contact: string = '8888888888';
  let expected: CardlessEMIStore | null = null;

  test('if cardless provider store is empty', () => {
    expect(getCardlessPlansForProvider(provider, contact)).toBe(expected);
  });

  test('if cardless provider has matching provider and contact', () => {
    cardlessEmiStore.set([
      {
        providerCode: provider,
        contact,
      },
    ]);

    expected = {
      providerCode: provider,
      contact,
    };

    expect(JSON.stringify(getCardlessPlansForProvider(provider, contact))).toBe(
      JSON.stringify(expected)
    );
  });

  test('If emi plans are there update the store for provider', () => {
    updateCardlessEmiStore({
      providerCode: provider,
      contact,
      plans: {
        [provider]: [
          {
            duration: 3,
            interest: 14,
            min_amount: 100000,
            subvention: 'customer',
          },
          {
            duration: 6,
            interest: 14,
            min_amount: 100000,
            subvention: 'customer',
          },
        ],
      },
    });

    expected = {
      providerCode: provider,
      contact,
      plans: {
        [provider]: [
          {
            duration: 3,
            interest: 14,
            min_amount: 100000,
            subvention: 'customer',
          },
          {
            duration: 6,
            interest: 14,
            min_amount: 100000,
            subvention: 'customer',
          },
        ],
      },
    };

    expect(JSON.stringify(getCardlessPlansForProvider(provider, contact))).toBe(
      JSON.stringify(expected)
    );
  });
});

describe('Validate: cardlessEmiPlansChecker', () => {
  test('If cardless emi plans does not exists in store for the selected provider', () => {
    emiContact.set('+918888888888');
    selectedBank.set({
      code: 'hdfc',
      name: 'HDFC',
    });

    expect(cardlessEmiPlansChecker()).toBe(null);
  });

  test('If cardless emi plans exists in store for the selected provider', () => {
    let contact: string = '+918888888888';
    emiContact.set(contact);
    selectedBank.set({
      code: 'hdfc',
      name: 'HDFC',
    });

    let expected = {
      providerCode: 'hdfc',
      contact,
      plans: {
        hdfc: [
          {
            duration: 3,
            interest: 14,
            min_amount: 100000,
            subvention: 'customer',
          },
          {
            duration: 6,
            interest: 14,
            min_amount: 100000,
            subvention: 'customer',
          },
        ],
      },
    };

    cardlessEmiStore.set([expected]);
    expect(JSON.stringify(cardlessEmiPlansChecker())).toBe(
      JSON.stringify(expected)
    );
  });

  describe('Validate: isCardlessPlanNoCost', () => {
    let plan: EmiPlan = {
      duration: 3,
      interest: 'No-Cost EMI',
      min_amount: 100000,
    };

    test('If selected cardless plan is No Cost', () => {
      expect(isCardlessPlanNoCost(plan)).toBeTruthy();
      plan = {
        duration: 3,
        interest: 10,
        min_amount: 100000,
      };

      expect(isCardlessPlanNoCost(plan)).toBeFalsy();
    });
  });
});
