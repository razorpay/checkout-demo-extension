<script>
  import { popStack } from 'navstack';

  // UI imports
  import AsyncLoading from 'ui/elements/AsyncLoading.svelte';

  // Props
  export let terms;
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
</script>

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
      <span class="tnc-close" on:click={() => popStack()}>&times;</span>
    </div>
    <div class="separator" />
    <div class="tnc-contents">
      <div>{termsText}</div>
    </div>
  {/if}
</div>

<style>
  .tnc-container {
    opacity: 1;
    overflow: hidden;
    height: 90%;
    max-height: 420px;
    width: 90vw !important;
    max-width: 560px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    background-color: #fff;
    box-shadow: 4px 4px 4px 0 rgba(0, 0, 0, 0.04);
    border-radius: 2px;
    text-align: left;
  }
  .tnc-container > div {
    padding: 12px 24px;
  }
  .tnc-container .tnc-header {
    padding-right: 32px;
    padding-top: 24px;
    padding-bottom: 24px;
    color: #535a78;
    font-size: 14px;
    line-height: 18px;
    font-weight: 600;
    text-transform: uppercase;
    white-space: normal;
    position: relative;
  }
  .tnc-container .tnc-header span:not(.tnc-close) {
    vertical-align: middle;
    display: inline-block;
  }
  .tnc-container .tnc-header .tnc-provider-image {
    margin-left: 8px;
    padding: 0px 12px;
    border-left: 1px solid #d7e7fe;
  }
  .tnc-container .tnc-header .tnc-provider-image img {
    max-height: 20px;
    width: auto;
    display: inline-block;
    vertical-align: top;
  }
  .tnc-container .tnc-header .tnc-close {
    cursor: pointer;
    position: absolute;
    right: 24px;
    font-size: 18px;
  }
  .tnc-container .separator {
    padding: 0;
    margin: 0 24px;
    background-color: #d7e7fe;
    height: 1px;
  }
  .tnc-container .tnc-contents {
    white-space: pre-line;
    overflow: scroll;
    height: calc(100% - 84px);
    font-size: 14px;
    line-height: 18px;
    color: #646d8b;
  }
  .tnc-container .tnc-contents div {
    padding-bottom: 45px;
  }
  :global(.mobile) .tnc-container {
    height: 100%;
    width: 100%;
    max-height: unset;
    max-width: unset;
  }
</style>
