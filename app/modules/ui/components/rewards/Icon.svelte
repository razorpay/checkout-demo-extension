<script>
  // Svelte imports
  import { onMount } from 'svelte';

  //i18n
  import { t } from 'svelte-i18n';

  import SlottedOption from 'ui/elements/options/Slotted/Option.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import Rewards from './index.svelte';
  import Snackbar from 'ui/components/Snackbar.svelte';

  import { REWARDS_TOOLTIP_TEXT } from 'ui/labels/rewards';

  //store
  import { showBackdrop } from 'checkoutstore/backdrop';

  // Utils
  import { getSession } from 'sessionmanager';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { getThemeMeta } from 'checkoutstore/theme';

  const session = getSession();
  const themeMeta = getThemeMeta();
  const icons = themeMeta.icons;
  let snackBar;
  let shown = true;

  onMount(() => {
    Analytics.track('rewards:icon:show', {
      type: AnalyticsTypes.RENDER,
    });
    setTimeout(() => {
      snackBar = new Snackbar({
        target: document.getElementById('rewards-cta'),
        props: {
          align: 'bottom',
          parentElem: 'rewards-cta',
          shown,
          timer: 5000,
          text: $t(REWARDS_TOOLTIP_TEXT),
        },
      });
    }, 1000);
  });

  function showRewards() {
    Analytics.track('rewards:icon:click', {
      type: AnalyticsTypes.BEHAV,
    });
    shown = false;
    if (snackBar) {
      snackBar.removeSnackBar();
    }
    session.svelteOverlay.$$set({
      component: Rewards,
      props: {
        onClick: function (e) {
          session.hideErrorMessage(e);
        },
      },
    });
    session.showSvelteOverlay();
    showBackdrop();
  }
</script>

<SlottedOption on:click={showRewards} id="rewards-cta">
  <i class="rewards-icon" slot="icon">
    <Icon icon={icons.present} />
  </i>
</SlottedOption>

<style>
  :global(#rewards-cta) {
    position: relative;
    width: 50px;
    padding: 12px 20px 12px 11px;
  }
  i.rewards-icon {
    width: 27px;
  }
</style>
