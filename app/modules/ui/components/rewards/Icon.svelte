<script>
  import { onMount } from 'svelte';

  import SlottedOption from 'ui/elements/options/Slotted/Option.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import Rewards from './index.svelte';

  import { showBackdrop } from 'checkoutstore/backdrop';

  import { getSession } from 'sessionmanager';

  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';

  const session = getSession();
  const icons = session.themeMeta.icons;

  onMount(() => {
    Analytics.track('rewards:icon:show', {
      type: AnalyticsTypes.RENDER,
    });
  });

  function showRewards() {
    Analytics.track('rewards:icon:click', {
      type: AnalyticsTypes.BEHAV,
    });
    session.svelteOverlay.$$set({
      component: Rewards,
      props: {
        onClick: function(e) {
          session.hideErrorMessage(e);
        },
      },
    });
    session.showSvelteOverlay();
    showBackdrop();
  }
</script>

<style>
  :global(#rewards-cta) {
    width: 56px;
  }
</style>

<SlottedOption on:click={showRewards} id="rewards-cta">
  <i slot="icon">
    <Icon icon={icons.present} />
  </i>
</SlottedOption>
