<script lang="ts">
  import { getOption, getOrgDetails, isRedesignV15 } from 'razorpay';
  import { onMount } from 'svelte';
  import { POWERED_BY_LABEL, PARTNERSHIP_LABEL } from 'ui/labels/powered-by';

  import { t } from 'svelte-i18n';
  import * as _El from 'utils/DOM';
  import { querySelector } from 'utils/doc';

  const customLogo = getOption('partnership_logo');
  const { isOrgRazorpay, checkout_logo_url } = getOrgDetails() || {};
  const orgLogo = isOrgRazorpay ? null : checkout_logo_url;

  let fontLoaded = false;
  let fontTimeout = null;
  let ref;

  onMount(() => {
    applyFont(ref, 0);
  });

  function applyFont(anchor, retryCount) {
    if (anchor.offsetWidth / anchor.offsetHeight > 3) {
      _El.addClass(querySelector('#container'), 'font-loaded');
      fontLoaded = true;
    } else if (retryCount < 25) {
      fontTimeout = setTimeout(
        () => applyFont(anchor, ++retryCount),
        120 + retryCount * 50
      );
    }
  }
</script>

<i
  id="powered-by"
  class:branded={customLogo && fontLoaded}
  class:powered-one-cc={isRedesignV15() && isOrgRazorpay}
>
  {#if customLogo && fontLoaded}
    {$t(PARTNERSHIP_LABEL)}
    <br />
    <img alt="Logo" src={customLogo} />
  {:else if orgLogo && fontLoaded}
    <div class="branding">
      <span>{$t(POWERED_BY_LABEL)}</span>
      <img alt="Logo" src={orgLogo} />
    </div>
  {:else}
    <a
      bind:this={ref}
      href="https://razorpay.com?ref=org-in-chk"
      target="_blank"
      tabindex="-1"
    >
      &#xe608;
    </a>
  {/if}
</i>
