<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // Store
  import { selectedPlanTextForNewCard } from 'checkoutstore/emi';

  // Utils
  import { getSession } from 'sessionmanager';

  // Props
  export let emiCtaView;
  export let savedCount = 0;

  const session = getSession();

  const dispatch = createEventDispatcher();

  function getEmiBanksList() {
    const { banks = {} } = session.emi_options || {};
    const bankList = _Obj.entries(banks).map(([_, bank]) => bank.name);
    return bankList.join(', ');
  }

  function handleEmiCtaClick(event) {
    dispatch('click', event.detail);
  }
</script>

<div id="elem-emi">
  <div
    class="strip emi-plans-info-container emi-plans-trigger"
    on:click={handleEmiCtaClick}>
    {#if emiCtaView === 'plans-unavailable'}
      <div class="emi-plan-unavailable emi-icon-multiple-cards">
        <span class="help">
          EMI is available on {getEmiBanksList()} cards. Enter your credit card
          to avail.
        </span>
        <div class="emi-plans-text">EMI unavailable</div>
        {#if session.methods.card}
          <div class="emi-plans-action theme-highlight">Pay entire amount</div>
        {/if}
      </div>
    {/if}
    {#if emiCtaView === 'plans-available'}
      <div class="emi-plan-selected emi-icon-multiple-cards">
        <div class="emi-plans-text">{$selectedPlanTextForNewCard}</div>
        <div class="emi-plans-action theme-highlight">Edit</div>
      </div>
    {/if}
    {#if emiCtaView === 'available'}
      <div class="emi-plan-unselected emi-icon-multiple-cards">
        <div class="emi-plans-text">EMI Available</div>
        <div class="emi-plans-action theme-highlight">Pay with EMI</div>
      </div>
    {/if}
    {#if emiCtaView === 'pay-without-emi'}
      <div class="emi-pay-without emi-icon-single-card">
        <div class="emi-plans-text no-action">
          Pay entire amount
          {#if savedCount}
            <span class="count-text">({savedCount} cards available)</span>
          {/if}
        </div>
        <div class="emi-plans-action theme-highlight" />
      </div>
    {/if}
  </div>
</div>
