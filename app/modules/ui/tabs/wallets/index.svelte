<script>
  /* global each, Event */

  // Svelte imports
  import { onMount, tick } from 'svelte';

  // UI Imports
  import Tab from 'ui/tabs/Tab.svelte';
  import Callout from 'ui/elements/Callout.svelte';
  import Screen from 'ui/layouts/Screen.svelte';
  import AddCardView from 'ui/tabs/card/AddCardView.svelte';
  import EmiActions from 'ui/components/EmiActions.svelte';
  import SavedCards from 'ui/tabs/card/savedcards.svelte';
  import OffersPortal from 'ui/components/OffersPortal.svelte';
  import DowntimeCallout from 'ui/elements/DowntimeCallout.svelte';

  // Store
  import {
    cardCvv,
    cardExpiry,
    cardName,
    cardNumber,
    remember,
  } from 'checkoutstore/screens/card';

  import { contact } from 'checkoutstore/screens/home';
  import { isRecurring, shouldRememberCustomer } from 'checkoutstore';
  import {
    isMethodEnabled,
    getEMIBanks,
    getEMIBankPlans,
  } from 'checkoutstore/methods';
  import { newCardEmiDuration } from 'checkoutstore/emi';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import { getSavedCards, transform } from 'common/token';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { getCardType } from 'common/card';

  // Transitions
  import { fade } from 'svelte/transition';

  const session = getSession();
</script>

<style>

</style>

<div>Test</div>
