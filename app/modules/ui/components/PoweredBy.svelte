<script>
  import { getOption } from 'checkoutstore';
  import { onMount } from 'svelte';

  const customLogo = getOption('partnership_logo');
  const brandLogo = getOption('brand_logo');
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
    In partnership with <br />
    <img alt="Logo" src={customLogo} />
  {:else if brandLogo && fontLoaded}
    <div class="branding">Powered By <img alt="Logo" src={brandLogo} /></div>
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
