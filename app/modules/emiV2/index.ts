import EmiScreen from './ui/EmiScreen.svelte';
import { pushStack } from 'navstack';
import { isSessionControlled } from 'navstack/store';
import { emiViaCards } from 'checkoutstore/screens/emi';
import { cardTab } from 'checkoutstore/screens/card';

export default function renderEmiOptions() {
  isSessionControlled.set(false);
  emiViaCards.set(false);
  // If user is coming to emi screen
  // we need to set cardtab as null
  cardTab.set('');
  pushStack({
    component: EmiScreen,
  });
}
