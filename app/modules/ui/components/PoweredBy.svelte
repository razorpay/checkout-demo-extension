<script>
  import { getOption, getOrgDetails } from 'checkoutstore';
  import { onMount } from 'svelte';
  import { POWERED_BY_LABEL, PARTNERSHIP_LABEL } from 'ui/labels/powered-by';

  import { t, locale } from 'svelte-i18n';

  const customLogo = getOption('partnership_logo');
  const orgDetails = getOrgDetails();
  const orgLogo =
    orgDetails?.id !== '100000razorpay' ? orgDetails?.checkout_logo_url : null;
  let fontLoaded = false;
  let fontTimeout = null;
  let ref;

  onMount(() => {
    applyFont(ref, 0);
  });

  function applyFont(anchor, retryCount) {
    if (anchor.offsetWidth / anchor.offsetHeight > 3) {
      _El.addClass(_Doc.querySelector('#container'), 'font-loaded');
      fontLoaded = true;
    } else if (retryCount < 25) {
      fontTimeout = setTimeout(
        () => applyFont(anchor, ++retryCount),
        120 + retryCount * 50
      );
    }
  }
</script>

<i id="powered-by" class:branded={customLogo && fontLoaded}>
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
      tabindex="-1">
      &#xe608;
    </a>
  {/if}
</i>
