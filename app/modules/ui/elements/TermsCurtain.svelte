<script>
  // UI imports
  import AsyncLoading from 'ui/elements/AsyncLoading.svelte';

  // Props
  export let terms;
  export let visible = false;
  export let loading = false;
  export let heading = 'Terms and Conditions';
  export let image;
  export let imageAlt;

  // Computed
  export let termsText;

  $: {
    const div = document.createElement('div');

    div.innerHTML = terms;

    termsText = div.innerText.replace(/\n{3,}/g, '\n\n');
  }

  export function close() {
    visible = false;
  }
</script>

<div class="tnc-curtain" class:shown={visible}>
  <div class="tnc-container-bg" on:click={close} />
  <div class="tnc-container">
    {#if loading}
      <AsyncLoading>Loading terms...</AsyncLoading>
    {:else}
      <div class="tnc-header">
        <span>
          {@html heading}
        </span>
        {#if image}
          <span class="tnc-provider-image">
            <img src={image} alt={imageAlt} />
          </span>
        {/if}
        <span class="tnc-close" on:click={close}>&times;</span>
      </div>
      <div class="separator" />
      <div class="tnc-contents">
        <div>{termsText}</div>
      </div>
    {/if}
  </div>
</div>
