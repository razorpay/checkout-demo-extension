<script>
  // UI imports
  import Callout from 'templates/views/ui/Callout.svelte';
  import EmiPlanCard from 'templates/tabs/emiplans/emiplancard.svelte';

  // Props
  export let actions;
  export let branding = null;
  export let expanded = -1;
  export let plans;
  export let amount;
  export let provider = null;
  export let on;

  // Computed
  export let showActions;
  export let hasCallout;

  $: showActions = actions && _Obj.keys(actions).length;

  $: {
    const hasBranding = Boolean(branding);
    const hasAgreement = actions.showAgreement && expanded >= 0;

    hasCallout = hasBranding || hasAgreement;
  }

  export function expand(index) {
    expanded = index;

    invoke('select', plans[index]);
  }

  export function invoke(type, event) {
    if (on[type]) {
      on[type](event);
    }
  }
</script>

<style>
  .actionlink-container {
    margin: 12px 0;
  }

  :global(.emi-branding-callout) {
    padding-left: 12px !important;
    background: white !important;

    img {
      max-height: 24px;
    }
  }

  .has-callout {
    padding-bottom: 64px;
  }

  :global(.mobile) {
    .has-callout {
      padding-bottom: 120px;
    }
  }
  .sanitized h3 {
    text-transform: none;
    color: black;
  }
</style>

<div
  id="form-emiplans"
  class="tab-content showable screen pad vertical-pad"
  class:has-callout={hasCallout}>
  {#if plans.length}
    <h3>Select an EMI Plan</h3>
  {:else}
    <div class="sanitized">
      <h3>
        There is a mismatch between the selected offer and entered card details.
      </h3>
      <h3>Please go back and select a different offer or card.</h3>
    </div>
  {/if}

  <div class="emi-plans-list expandable-card-list">
    {#each plans as plan, index}
      <EmiPlanCard
        {plan}
        expanded={index === expanded}
        {amount}
        {provider}
        on:click={() => expand(index)} />
    {/each}
  </div>

  <div
    class="emi-plans-actions actionlink-container"
    class:hidden={!showActions}>
    {#if actions.viewAll}
      <div
        class="actionlink theme-highlight"
        on:click={event => invoke('viewAll', event)}>
        View all EMI Plans
      </div>
    {/if}
    {#if actions.payWithoutEmi}
      <div
        class="actionlink theme-highlight"
        on:click={event => invoke('payWithoutEmi', event)}>
        Pay entire amount
      </div>
    {/if}
  </div>
  {#if actions.showAgreement && expanded >= 0}
    <div
      class="callout drishy"
      on:click={event => invoke('viewAgreement', event)}>
      <span>&#x2139;</span>
      By clicking on Pay, you agree to the terms of our&nbsp;
      <span class="theme-highlight">Loan Agreement</span>
    </div>
  {/if}

  {#if branding}
    <Callout classes={['emi-branding-callout']} showIcon={false}>
      <img src={branding} alt={provider} />
    </Callout>
  {/if}
</div>
