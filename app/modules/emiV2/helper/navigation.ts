import Analytics from 'analytics';
import { screenStore, tabStore } from 'checkoutstore';
import { selectedPlan } from 'checkoutstore/emi';
import { selectedCard } from 'checkoutstore/screens/card';
import { selectedBank } from 'checkoutstore/screens/emi';
import { moveControlToSession } from 'navstack';
import { appliedOffer } from 'offers/store';
import { isEmiV2 } from 'razorpay';
import { getSession } from 'sessionmanager';
import { get } from 'svelte/store';
import { timer } from 'utils/timer';

// Handle the logic for back button click for EMI UX
// Since we are using a combination of navstack and session components for navigation
// This function can be used to handle logical back conditions when we move completely to navstack
export const handleBackNavigation = () => {
  const session = getSession();
  if (isEmiV2() && session.tab === 'emi') {
    let screen: string = session.screen;
    // current screen is card or cvv screen
    // set the current screen explicitly to emi plans screen
    if ((screen === 'card' || screen === 'cvv') && session.tab === 'emi') {
      selectedPlan.set(null);
      screen = 'emiPlans';
    }
    // set the current screen explicitly to emi base screen
    // and remove current plan selected
    // and remove no cost emi offer if it was applied
    else if (screen === 'emiPlans') {
      selectedPlan.set(null);
      if (get(appliedOffer)?.emi_subvention) {
        appliedOffer.set(null);
      }
      screen = 'emi';
    }
    // set the current screen explicitly to home screen
    // remove the value of selected bank
    else if (screen === 'emi') {
      screen = '';
      // Since on clicking back on emi screen we reach L0 screen
      // there for need to give control to session
      moveControlToSession(true);
      session.setScreen('');
      tabStore.set('');
      selectedBank.set(null);
      selectedCard.set(null);
    }
    // update the screen store for CTA to reflect correct label
    // Track screen change event since we are manually setting screen
    Analytics.track('screen:switch', {
      data: {
        from: session.screen || '',
        to: screen || '',
      },
    });
    Analytics.setMeta('screen', screen);
    const getDuration = timer();
    Analytics.setMeta('timeSince.screen', getDuration());

    session.screen = screen;
    screenStore.set(screen);
  }
};