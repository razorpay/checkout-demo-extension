<script lang="ts">
  // UI imports
  import Callout from 'ui/elements/Callout.svelte';
  import Bottom from 'ui/layouts/Bottom.svelte';
  import EmiPlanCards from 'ui/tabs/emi/EmiPlanCards.svelte';
  import EmiContact from 'ui/tabs/emi/emicontact.svelte';
  import AccountTab from 'account_modal/ui/AccountTab.svelte';

  // Store
  import { appliedOffer } from 'offers/store';
  import CTA, {
    showCta,
    hideCta,
    showContinue,
    showSelectEmiPlan,
    showCtaWithDefaultText,
  } from 'cta';

  // i18n
  import { t } from 'svelte-i18n';
  import {
    PLAN_LIST_TITLE,
    PLAN_LIST_TITLE_WITHOUT_OFFER,
    PLAN_LIST_VIEW_ALL_ACTION,
    PLAN_LIST_PAY_ENTIRE_ACTION,
    PLAN_LIST_CALLOUT_AGREEMENT,
    PLAN_LIST_CALLOUT_AGREEMENT_HIGHLIGHT,
  } from 'ui/labels/emi';
  import { CTA_LABEL, SELECT_EMI_PLAN_LABEL } from 'cta/i18n';

  // Util imports
  import { INDIAN_CONTACT_REGEX } from 'common/constants';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';

  // Utils imports
  import { isMethodUsable } from 'checkoutstore/methods';
  import { toggleHeader } from 'one_click_checkout/header/helper';
  import { isRedesignV15 } from 'razorpay';
  import { tabStore } from 'checkoutstore';

  // Props
  export let actions;
  export let branding = null;
  export let expanded = -1;
  export let plans;
  export let bank;
  export let amount;
  export let provider = null;
  export let on = {};
  export let type; // new/saved/bajaj

  // Computed
  export let showActions;

  let CTAState = {
    show: true,
    disabled: true,
    showAmount: false,
    label: SELECT_EMI_PLAN_LABEL,
  };

  // Constants
  const Views = {
    PLANS: 'plans',
    CONTACT: 'contact',
  };
  const isRedesignV15Enabled = isRedesignV15();
  // Local variables
  let currentView = Views.PLANS;

  // plans without offer
  let otherPlans = [];
  let offerPlans = [];

  $: showActions = actions && Object.keys(actions || {}).length;
  $: {
    const _otherPlans = [];
    const _offerPlans = [];
    if ($appliedOffer) {
      plans.forEach((plan) => {
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

  $: {
    if (currentView === Views.PLANS) {
      showSelectEmiPlan();
      Analytics.track('emi:plans', {
        type: AnalyticsTypes.RENDER,
      });
    } else if (currentView === Views.CONTACT) {
      showContinue();
      CTAState.label = CTA_LABEL;
      Analytics.track('emi:contact', {
        type: AnalyticsTypes.RENDER,
      });
    } else {
      showCtaWithDefaultText();
    }
  }

  function setView(view) {
    currentView = view;
  }

  function setContact(contact) {
    const validContact = INDIAN_CONTACT_REGEX.test(contact);
    // Don't let the user continue if the contact is invalid.
    if (validContact) {
      showCta();
      CTAState.show = true;
    } else {
      hideCta();
      CTAState.show = false;
    }
    // However, invoke setContact everytime the value changes.
    invoke('setContact', contact);
  }

  function onContactFilled(contact) {
    const validContact = INDIAN_CONTACT_REGEX.test(contact);
    Analytics.track('emi:contact:filled', {
      type: AnalyticsTypes.BEHAV,
      data: {
        valid: validContact,
      },
    });
  }

  export function onShown() {
    toggleHeader(true);
    showPlansView();
    CTAState.disabled = expanded === -1;
  }

  export function showPlansView() {
    setView(Views.PLANS);
    invoke('setContact', '');
  }

  export function showContactView() {
    setView(Views.CONTACT);
  }

  export function expand(plan) {
    expanded = plan.duration;
    CTAState.disabled = false;
    CTAState.show = true;
    CTAState.label = '';

    invoke('select', {
      detail: plan,
    });
  }

  export function deselectAll() {
    expanded = -1;
    CTAState.disabled = true;
  }

  export function invoke(type, event) {
    if (on[type]) {
      on[type](event);
    }
  }
</script>

<div
  id="form-emiplans"
  class="tab-content showable screen pad vertical-pad"
  class:one-cc={isRedesignV15Enabled}
>
  <div class:emiplans-one-cc={isRedesignV15Enabled}>
    {#if currentView === Views.PLANS}
      <!-- LABEL: Select an EMI Plan -->
      <EmiPlanCards
        title={$t(PLAN_LIST_TITLE)}
        plans={otherPlans.length ? offerPlans : plans}
        {bank}
        {amount}
        {expand}
        {expanded}
        {provider}
      />
      {#if otherPlans.length}
        <!-- LABEL: Plan without offer -->
        <EmiPlanCards
          title={$t(PLAN_LIST_TITLE_WITHOUT_OFFER)}
          plans={otherPlans}
          {bank}
          {amount}
          {expand}
          {expanded}
          {provider}
        />
      {/if}

      <div
        class="emi-plans-actions actionlink-container"
        class:hidden={!showActions}
      >
        {#if actions.viewAll}
          <div
            class="actionlink theme-highlight"
            on:click={(event) => invoke('viewAll', event)}
          >
            <!-- LABEL: View all EMI Plans -->
            {$t(PLAN_LIST_VIEW_ALL_ACTION)}
          </div>
        {/if}
        {#if actions.payWithoutEmi && isMethodUsable('card')}
          <div
            class="actionlink theme-highlight"
            on:click={(event) => invoke('payWithoutEmi', event)}
          >
            <!-- Pay entire amount -->
            {$t(PLAN_LIST_PAY_ENTIRE_ACTION)}
          </div>
        {/if}
      </div>
      <Bottom tab="emiplans">
        {#if actions.showAgreement && expanded >= 0}
          <div
            class="callout drishy"
            on:click={(event) => invoke('viewAgreement', event)}
          >
            <span>&#x2139;</span>
            <!-- TODO: Support theme highlight through FormattedText and unify -->
            <!-- LABEL: By clicking on Pay, you agree to the terms of our&nbsp; -->
            {$t(PLAN_LIST_CALLOUT_AGREEMENT)}
            <!-- LABEL: Loan Agreement -->
            <span class="theme-highlight">
              {$t(PLAN_LIST_CALLOUT_AGREEMENT_HIGHLIGHT)}
            </span>
          </div>
        {/if}

        {#if branding}
          <Callout classes={['emi-branding-callout']} showIcon={false}>
            <img src={branding} alt={provider} />
          </Callout>
        {/if}
      </Bottom>
    {:else if currentView === Views.CONTACT}
      <EmiContact
        on:input={(e) => setContact(e.target.value)}
        on:blur={(e) => onContactFilled(e.target.value)}
        isSavedCard={type === 'saved'}
      />
    {/if}
  </div>
  <CTA
    screen="emiplans"
    tab={$tabStore}
    disabled={CTAState.disabled}
    show={CTAState.show}
    showAmount={CTAState.showAmount}
    label={CTAState.label}
  />
  <AccountTab />
</div>

<style>
  #form-emiplans.one-cc {
    margin-top: 0;
    overflow: auto;
    padding: 0px;
  }
  .actionlink-container {
    margin: 12px 0;
  }

  :global(.emi-branding-callout) {
    padding-left: 12px !important;
    background: white !important;
  }

  :global(.emi-branding-callout) img {
    max-height: 24px;
  }

  .emiplans-one-cc {
    min-height: 110%;
    padding: 0px 18px 56px;
  }
</style>
