import { screenStore } from 'checkoutstore';
import { selectedPlan } from 'checkoutstore/emi';
import { currentCardType, selectedCard } from 'checkoutstore/screens/card';
import cardTab from 'ui/tabs/card/index.svelte';
import { getSelectedEmiBank, selectedBank } from 'emiV2/store';
import { cardlessEligibilityError } from 'emiV2/ui/components/EmiTabsScreen/store';
import { selectedTab } from 'components/Tabs/tabStore';
import { handleEmiPaymentV2 } from 'emiV2/payment';
import type { CardlessEMIStore } from 'emiV2/types';
import { popStack, pushStack } from 'navstack';
import { getSession } from 'sessionmanager';
import { get } from 'svelte/store';
import { isSelectedBankBajaj } from './helper';
import { cardlessEmiPlansChecker } from './eligibility';
import EmiScreenSvelte from 'ui/tabs/emi/EmiScreen.svelte';
import { isCardlessTab } from './tabs';
import CVVScreenSvelte from 'emiV2/ui/components/Cards/CvvScreen.svelte';
import { trackPayFullAmount } from 'emiV2/events/tracker';
import Analytics from 'analytics';
import { timer } from 'utils/timer';

export const handleEmiProviderSelection = () => {
  const session = getSession();
  const currentTab = get(selectedTab);
  const plan = get(selectedPlan);
  const card = get(selectedCard);

  /**
   * Send to Bajaj EMI screen if selected emi bank is Bajaj
   */
  let nextScreen = '';
  if (isSelectedBankBajaj()) {
    // when redirecting to bajaj card scree set the screen value as bajaj
    // since new cta checks a combination of current screen and tab with store values
    // screen=emi and tab=emi is already used by EMI l1 screen
    // screen=card and tab=emi is used by add card screen for emi
    // therefore a new screen value for proper CTA to load
    nextScreen = 'bajaj';
    pushStack({
      component: EmiScreenSvelte,
    });
  } else if (card) {
    nextScreen = 'cvv';
    // if selected plan from saved cards flow -> render the show cvv screen
    pushStack({
      component: CVVScreenSvelte,
    });
  } else if (currentTab && isCardlessTab()) {
    // If Cardless tab is enabled but user is not eligible redirect to L1 screen
    if (get(cardlessEligibilityError)) {
      // Track Try Another Emi Option Click
      trackPayFullAmount(
        {
          provider_name: get(selectedBank)?.name,
          tab_name: get(selectedTab),
          card_type: get(currentCardType),
        },
        'try_another'
      );
      screenStore.set('emi');
      session.screen = 'emi';
      popStack();
      cardlessEligibilityError.set('');
      return;
    }
    /** if selected emi provider is of cardless bank emi
     * initiate the payment
     */
    const cardlessEmiProviderStore: CardlessEMIStore | null =
      cardlessEmiPlansChecker();

    if (cardlessEmiProviderStore && cardlessEmiProviderStore.providerCode) {
      handleEmiPaymentV2({
        action: 'cardless',
        payloadData: {
          provider: cardlessEmiProviderStore.providerCode,
          contact: cardlessEmiProviderStore.contact,
          ott: cardlessEmiProviderStore.ott,
        },
      });
    }
  } else {
    nextScreen = 'card';
    pushStack({
      component: cardTab,
      props: {
        emiPayload: {
          plan,
          bank: getSelectedEmiBank(),
          tab: currentTab,
        },
        isRenderedByNavstack: true, // since card screen is rendered using navstack therefore passing that as a flag
      },
    });
  }
  if (nextScreen) {
    // Track screen change event since we are manually setting screen
    Analytics.track('screen:switch', {
      data: {
        from: session.screen || '',
        to: nextScreen || '',
      },
    });
    Analytics.setMeta('screen', screen);
    const getDuration = timer();
    Analytics.setMeta('timeSince.screen', getDuration());

    session.screen = nextScreen;
    screenStore.set(nextScreen);
  }
};
