<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // Store
  import { selectedPlanTextForNewCard } from 'checkoutstore/emi';
  import { isMethodUsable } from 'checkoutstore/methods';
  import { getEMIBanksText } from 'checkoutframe/paymentmethods';

  // i18n
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';

  import {
    UNAVAILABLE_HELP,
    UNAVAILABLE_BTN,
    EDIT_PLAN_TEXT,
    EDIT_PLAN_ACTION,
    AVAILABLE_TEXT,
    AVAILABLE_ACTION,
    PAY_ENTIRE_AMOUNT_ACTION,
    PAY_ENTIRE_AMOUNT_COUNT,
  } from 'ui/labels/emi';

  // Props
  export let emiCtaView;
  export let savedCount = 0;

  const dispatch = createEventDispatcher();

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
          <!-- LABEL: EMI is available on {issuers} cards. Enter your credit card
          to avail. -->
          {formatTemplateWithLocale(UNAVAILABLE_HELP, { issuers: getEMIBanksText($locale) }, $locale)}
        </span>
        <!-- LABEL: EMI unavailable -->
        <div class="emi-plans-text">{$t(UNAVAILABLE_BTN)}</div>
        {#if isMethodUsable('card')}
          <!-- LABEL: Pay entire amount -->
          <div class="emi-plans-action theme-highlight">
            {$t(PAY_ENTIRE_AMOUNT_ACTION)}
          </div>
        {/if}
      </div>
    {/if}
    {#if emiCtaView === 'plans-available'}
      <div class="emi-plan-selected emi-icon-multiple-cards">
        <!-- LABEL: {duration} Months ({amount}/mo) -->
        <div class="emi-plans-text">
          {formatTemplateWithLocale(EDIT_PLAN_TEXT, $selectedPlanTextForNewCard, $locale)}
        </div>
        <!-- LABEL: Edit -->
        <div class="emi-plans-action theme-highlight">
          {$t(EDIT_PLAN_ACTION)}
        </div>
      </div>
    {/if}
    {#if emiCtaView === 'available' && isMethodUsable('emi')}
      <div class="emi-plan-unselected emi-icon-multiple-cards">
        <!-- LABEL: EMI Available -->
        <div class="emi-plans-text">{$t(AVAILABLE_TEXT)}</div>
        <!-- LABEL: Pay with EMI -->
        <div class="emi-plans-action theme-highlight">
          {$t(AVAILABLE_ACTION)}
        </div>
      </div>
    {/if}
    {#if emiCtaView === 'pay-without-emi' && isMethodUsable('card')}
      <div class="emi-pay-without emi-icon-single-card">
        <div class="emi-plans-text no-action">
          <!-- LABEL: Pay entire amount -->
          {$t(PAY_ENTIRE_AMOUNT_ACTION)}
          {#if savedCount}
            <span class="count-text">
              <!-- LABEL: {count} cards available -->
              {formatTemplateWithLocale(PAY_ENTIRE_AMOUNT_COUNT, { count: savedCount }, $locale)}
            </span>
          {/if}
        </div>
        <div class="emi-plans-action theme-highlight" />
      </div>
    {/if}
  </div>
</div>
