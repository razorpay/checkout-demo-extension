<script lang="ts">
  import { t } from 'svelte-i18n';
  import { PLAN_LIST_TITLE } from 'ui/labels/emi';
  import EmiPlanCard from './EmiPlanCard.svelte';
  import { selectedPlan } from 'checkoutstore/emi';
  import Icon from 'ui/elements/Icon.svelte';
  import info from 'ui/icons/payment-methods/info';
  import { clickOutside } from 'one_click_checkout/helper';
  import { DEBIT_CARD_REQUIRED, PAN_CARD_REQUIRED } from 'ui/labels/debit-emi';
  import { emiViaCards, selectedBank } from 'checkoutstore/screens/emi';
  import { isCardlessTab } from 'emiV2/helper/tabs';
  import { getEmiPlans } from 'emiV2/helper/plans';
  import { handlePlanOffer } from 'emiV2/helper/offers';
  import type { DebitCardlessProviders, EmiPlan, EmiPlans } from 'emiV2/types';
  import {
    trackEmiPlansRendered,
    trackEmiPlansSelected,
  } from 'emiV2/events/tracker';
  import { selectedCard } from 'checkoutstore/screens/card';
  import { selectedTab } from 'components/Tabs/tabStore';

  let plans: EmiPlans = getEmiPlans();

  let showPanTooltip = false;

  $: {
    showPanTooltip =
      isCardlessTab() && !!($selectedBank && $selectedBank.debitCardlessConfig);
  }

  $: {
    // Track emi plans rendered
    if (plans) {
      const emiPlansMeta = plans.map((plan) => {
        return {
          nc_emi_tag:
            plan.subvention === 'merchant' || plan.interest === 'No-Cost EMI',
          tenure: plan.duration,
        };
      });
      trackEmiPlansRendered(
        {
          provider_name: $selectedBank?.name || 'NA',
          tab_name: $selectedTab,
          emi_plans: emiPlansMeta,
          emi_via_cards_screen: $emiViaCards,
          pan_verified_tooltip_rendered: showPanTooltip,
          pan_verified_tooltip_clicked: showTooltip,
        },
        $selectedCard
      );
    }
  }

  export let expanded = -1;

  export function expand(plan: EmiPlan) {
    expanded = plan.duration;
    $selectedPlan = plan;
    handlePlanOffer();
  }

  $: showTooltip = false;

  function handleShowTooltip() {
    showTooltip = !showTooltip;
  }

  function handleHideTooltip() {
    showTooltip = false;
  }

  // Helper function to show tooltip text in case of cardless plans
  // Since instacred requires PAN or debitcard details
  // Inform the users before hand
  const getTooltipText = (config: DebitCardlessProviders) => {
    if (config.meta) {
      if (config.meta.flow === 'pan') {
        return $t(PAN_CARD_REQUIRED);
      } else if (config.meta.flow === 'debit_card') {
        return $t(DEBIT_CARD_REQUIRED);
      }
    }
  };
</script>

<div id="form-emiplans" class="emi-plans-list">
  <div>
    <div class="label-container">
      <h3 class="plans-label">{$t(PLAN_LIST_TITLE)}</h3>
      {#if isCardlessTab() && $selectedBank && $selectedBank.debitCardlessConfig}
        <div class="tooltip-container" on:click={handleShowTooltip}>
          <Icon icon={info('#666666')} />
          <div
            class="elem-wrap-save-address-tc"
            use:clickOutside
            on:click_outside={handleHideTooltip}
          >
            {#if showTooltip}
              <div class="plans-title-tooltip">
                {getTooltipText($selectedBank.debitCardlessConfig)}
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>
    {#if plans}
      {#each plans as plan (plan.duration)}
        <EmiPlanCard
          {plan}
          expanded={plan.duration === expanded}
          bank={$selectedBank?.code}
          on:click={() => {
            // Track EMI plan selected
            trackEmiPlansSelected({
              provider_name: $selectedBank?.name,
              tab_name: $selectedTab,
              emi_plan: {
                nc_emi_tag: plan.subvention === 'merchant',
                tenure: plan.duration,
              },
              emi_via_cards_screen: $emiViaCards,
            });
            expand(plan);
          }}
        />
      {/each}
    {/if}
  </div>
</div>

<style>
  .label-container {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }
  .plans-label {
    margin: 0;
    color: #263a4a;
    font-size: 13px;
    font-weight: 600;
    text-transform: none;
    margin-right: 10px;
  }
  .actionlink-container {
    margin: 12px 0;
  }
  .tooltip-container {
    position: relative;
    cursor: pointer;
    top: 2px;
  }
  .plans-title-tooltip {
    transition: 0.25s ease-in transform, 0.16s ease-in opacity;
    transform: translateY(-10px);
    color: #fff;
    position: absolute;
    line-height: 17px;
    padding: 12px;
    font-size: 12px;
    background: #2d313a;
    box-shadow: rgba(0, 0, 0, 0.05) 1px 1px 2px 0;
    z-index: 3;
    border-radius: 2px;
    bottom: -90px;
    letter-spacing: 0.125px;
    width: 200px;
    left: -40px;
  }
  .plans-title-tooltip::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-width: 8px;
    border-style: solid;
    border-color: transparent transparent #2d313a;
    bottom: 100%;
    left: 48px;
    margin: 0 0 -1px -10px;
  }
  :global(#form-emiplans
      .expandable-card
      .expandable-card-detail
      [slot='detail']:not(:empty):first-child) {
    border-color: #e6e7e8;
  }
  :global(.emi-plans-list) {
    margin-left: 0px;
    margin-right: 0px;
  }
</style>
