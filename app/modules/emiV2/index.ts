import EmiScreen from './ui/EmiScreen.svelte';
import { pushStack } from 'navstack';
import { isSessionControlled } from 'navstack/store';
import { cardTab } from 'checkoutstore/screens/card';
import {
  updateSessionScreenStore,
  updateTabStore,
} from 'emiV2/helper/navigation';
import { emiViaCards } from './store';

export default function renderEmiOptions() {
  isSessionControlled.set(false);
  emiViaCards.set(false);
  // update tab store and screen store when emi L1 screen is rendered
  updateTabStore('emi');
  updateSessionScreenStore('emi');
  // If user is coming to emi screen
  // we need to set cardtab as null
  cardTab.set('');
  pushStack({
    component: EmiScreen,
  });
}
