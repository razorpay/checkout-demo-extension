<script>
  // UI imports
  import Callout from 'ui/elements/Callout.svelte';
  import Bottom from 'ui/layouts/Bottom.svelte';
  import EmiPlanCards from 'ui/tabs/emi/emiplancards.svelte';
  import { appliedOffer } from 'checkoutstore/offers';

  // Utils imports
  import { isMethodUsable } from 'checkoutstore/methods';

  // Props
  export let actions;
  export let branding = null;
  export let expanded = -1;
  export let plans;
  export let bank;
  export let amount;
  export let provider = null;
  export let on = {};

  // Computed
  export let showActions;

  // plans without offer
  let otherPlans = [];
  let offerPlans = [];

  $: showActions = actions && _Obj.keys(actions).length;
  $: {
    const _otherPlans = [];
    const _offerPlans = [];
    if ($appliedOffer) {
      plans.forEach(plan => {
        if (plan.offer_id !== $appliedOffer.id) {
          _otherPlans.push(plan);
        } else {
          _offerPlans.push(plan);
        }
      });
    }
    if (_otherPlans.length && _offerPlans.length) {
      otherPlans = _otherPlans;
      offerPlans = _offerPlans;
    } else {
      otherPlans = offerPlans = [];
    }
  }

  export function expand(plan) {
    expanded = plan.duration;

    invoke('select', {
      detail: plan,
    });
  }

  export function deselectAll() {
    expanded = -1;
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
</style>

<div id="form-emiplans" class="tab-content showable screen pad vertical-pad">
  <EmiPlanCards
    plans={otherPlans.length ? offerPlans : plans}
    {bank}
    {amount}
    {expand}
    {expanded}
    {provider} />
  {#if otherPlans.length}
    <EmiPlanCards
      title="Plans without offer"
      plans={otherPlans}
      {bank}
      {amount}
      {expand}
      {expanded}
      {provider} />
  {/if}

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
    {#if actions.payWithoutEmi && isMethodUsable('card')}
      <div
        class="actionlink theme-highlight"
        on:click={event => invoke('payWithoutEmi', event)}>
        Pay entire amount
      </div>
    {/if}
  </div>

  <Bottom tab="emiplans">
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
  </Bottom>
</div>
