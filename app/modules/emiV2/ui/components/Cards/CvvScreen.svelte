<script lang="ts">
  import { currentCvv, selectedCard } from 'checkoutstore/screens/card';
  import { PAY_NOW_CTA_LABEL } from 'cta/i18n';
  import { handleEmiPaymentV2 } from 'emiV2/payment';
  import { isRedesignV15 } from 'razorpay';

  import { t } from 'svelte-i18n';
  import CtaOld from 'ui/elements/CTA.svelte';
  import CTA from 'cta';
  import { ENTER_CVV } from 'ui/labels/card';
  import { isCardTokenized } from 'ui/tabs/card/utils';
  import SavedCard from './SavedCard.svelte';
  import AccountTab from 'account_modal/ui/AccountTab.svelte';
  import { trackCVVEnteredForSavedCards } from 'emiV2/events/tracker';
  import { selectedBank } from 'emiV2/store';
  import { selectedTab } from 'components/Tabs/tabStore';
  import { selectedPlan } from 'checkoutstore/emi';
  import { offerWindowOpen } from 'offers/store';
  import { handleBackNavigation } from 'emiV2/helper/navigation';

  // const cardSelected = $selectedCard;

  const { card } = $selectedCard;

  function handleCvvChange(event) {
    $currentCvv = event.detail.cvv;
  }

  function handleCVVBlur() {
    if ($selectedPlan) {
      // Track CVV Change
      trackCVVEnteredForSavedCards({
        provider_name: $selectedBank?.code || 'NA',
        tab_name: $selectedTab,
        emi_plan: {
          nc_emi_tag: $selectedPlan.subvention === 'merchant',
          tenure: $selectedPlan.duration,
        },
        saved_card: {
          card_type: card.type,
          card_network: card.network,
          card_issuer: card.issuer,
        },
      });
    }
  }

  const isRedesignV15Enabled: boolean = isRedesignV15();

  const initiatePayment = () => {
    handleEmiPaymentV2({
      action: 'card',
    });
  };

  export function preventBack() {
    handleBackNavigation();
    return false;
  }
</script>

<div class:screen-one-cc={isRedesignV15Enabled}>
  <div
    class:tab-content-one-cc={isRedesignV15Enabled}
    class="tab-content screen collapsible"
  >
    <div class="cvv-container">
      <header>{$t(ENTER_CVV)}</header>
      <SavedCard
        {card}
        isTokenised={isCardTokenized(card)}
        showCVV={true}
        cvvDigits={card.cvvDigits}
        on:cvvchange={handleCvvChange}
        on:cvvblur={handleCVVBlur}
      />
    </div>
  </div>
  <AccountTab />
  <CTA
    show={!$offerWindowOpen}
    tab="emi"
    screen="cvv"
    disabled={!$currentCvv.length}
    onSubmit={() => initiatePayment()}
  >
    {$t(PAY_NOW_CTA_LABEL)}
  </CTA>
  {#if !isRedesignV15Enabled}
    <CtaOld
      show={Boolean($currentCvv.length)}
      disabled={!$currentCvv.length}
      on:click={initiatePayment}
    >
      {$t(PAY_NOW_CTA_LABEL)}
    </CtaOld>
  {/if}
</div>

<style>
  .cvv-container {
    padding: 24px 16px;
  }
  header {
    font-size: 14px;
    font-weight: 600;
    color: #263a4a;
  }
  .cvv-body {
    margin-top: 24px;
    display: flex;
  }
  .cardtype {
    width: 36px;
    height: 26px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    border: 1px solid rgba(121, 116, 126, 0.16);
    box-shadow: inset 0px 0px 8px rgba(0, 0, 0, 0.04);
  }

  .card-non-tokenised {
    color: red;
    font-size: 16px;
    font-weight: 500;
    margin-left: 2px;
  }

  :global(.cvv-container .know-more-text-saved-cards) {
    top: 0 !important;
  }
  .tab-content-one-cc {
    margin-top: 0px;
    height: 100%;
    overflow-y: unset;
  }
</style>
