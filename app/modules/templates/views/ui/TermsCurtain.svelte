<script>
  // Props
  export let terms;
  export let visible = false;
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

  export function close(e) {
    visible = false;
  }
</script>

<div class={'tnc-curtain ' + (visible ? 'shown' : '')}>
  <div class="tnc-container-bg" on:click={close} />
  <div class="tnc-container">
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
    <div class="tnc-contents">{termsText}</div>
  </div>
</div>
