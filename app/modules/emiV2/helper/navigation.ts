import Analytics from 'analytics';
import { screenStore, tabStore } from 'checkoutstore';
import { selectedPlan } from 'checkoutstore/emi';
import { selectedCard } from 'checkoutstore/screens/card';
import { clearPaymentRequest } from 'emiV2/payment/prePaymentHandler';
import { selectedBank } from 'emiV2/store';
import { moveControlToSession } from 'navstack';
import { appliedOffer } from 'offers/store';
import { isEmiV2 } from 'razorpay';
import { getSession } from 'sessionmanager';
import { get } from 'svelte/store';
import { timer } from 'utils/timer';

/**
 * Helper function to update the session.scree value
 * and update screenStore
 * Also track the screen switch event for navstack
 * @param screen {string}
 */
export const updateSessionScreenStore = (screen = '') => {
  const session = getSession();
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
};

/**
 * Helper function to update the session.tab value
 * and update tabStore
 * Also track the screen switch event for navstack screen updates
 * @param tab {string}
 */
export const updateTabStore = (tab = '') => {
  const session = getSession();
  const getDuration = timer();

  let diff = 0;
  if (session.tabSwitchStart > 0) {
    diff = (Date.now() - session.tabSwitchStart) / 1000;
  }
  Analytics.track('tab:switch', {
    data: {
      from: session.tab || '',
      to: tab || '',
      timeSpentInTab: diff > 0 ? diff : 'NA',
    },
  });
  Analytics.setMeta('tab', tab);
  Analytics.setMeta('timeSince.tab', getDuration());
  session.tab = tab;
  tabStore.set(tab);
};

// Handle the logic for back button click for EMI UX
// Since we are using a combination of navstack and session components for navigation
// This function can be used to handle logical back conditions when we move completely to navstack
export const handleBackNavigation = () => {
  const session = getSession();
  if (isEmiV2() && session.tab === 'emi') {
    let screen: string = session.screen;
    // current screen is card / bajaj card screen or cvv screen
    // set the current screen explicitly to emi plans screen
    if (['card', 'cvv', 'bajaj'].includes(screen) && session.tab === 'emi') {
      selectedPlan.set(null);
      screen = 'emiPlans';
    }
    // set the current screen explicitly to emi base screen
    // and remove current plan selected
    // and remove no cost emi offer if it was applied
    else if (screen === 'emiPlans') {
      selectedPlan.set(null);
      // clear the selected provider state on reaching L1 screen
      selectedBank.set(null);
      if (get(appliedOffer)?.emi_subvention) {
        appliedOffer.set(null);
      }
      // If the eligiblity was checked but payment with any other bank method is made
      // clear the request
      if (session.r && session.r._payment) {
        clearPaymentRequest();
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
