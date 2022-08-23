<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  // analytics
  import {
    trackBackClick,
    trackCurrencySelect,
    trackScreenShow,
  } from '../events';

  // i18n
  import { t } from 'svelte-i18n';

  // config
  import RazorpayConfig from 'common/RazorpayConfig';

  // stores
  import { hideCta } from 'cta';
  import {
    selectedMethod,
    setSelectedMethod,
  } from 'checkoutstore/screens/intlBankTransfer';

  // components
  import Tab from 'ui/tabs/Tab.svelte';
  import SlottedOption from 'ui/elements/options/Slotted/Option.svelte';
  import Details from './Details.svelte';

  // constants
  import {
    TAB_NAME,
    VIEWS_MAP,
    HELP_TEXT_MAPPING,
    METHOD_ICON_MAPPING,
  } from '../constants';

  // helpers
  import { getAllMethods } from '../helpers';

  // variables
  export let directlyToDetails = false;

  let currentView: string = directlyToDetails
    ? VIEWS_MAP.DETAILS
    : VIEWS_MAP.LIST;

  const allMethods = getAllMethods();
  const CDN_BASE = RazorpayConfig.cdn;

  function getMethodTitle(method: string) {
    return $t(`intl_bank_transfer.${method}.title`);
  }

  function getMethodSubtitle(method: string) {
    return $t(`intl_bank_transfer.${method}.subtitle`);
  }

  function getMethodIcon(method: string) {
    return `${CDN_BASE}international/${METHOD_ICON_MAPPING[method]}`;
  }

  function onMethodClick(id: string) {
    setSelectedMethod(id);
    // show details view and fetch virtual accounts details
    currentView = VIEWS_MAP.DETAILS;

    trackCurrencySelect(id);
  }

  export function onBack() {
    trackBackClick(currentView);
    if (currentView === VIEWS_MAP.DETAILS) {
      currentView = VIEWS_MAP.LIST;
      setSelectedMethod(null);
      return true;
    }
    return false;
  }

  onMount(() => {
    hideCta();

    trackScreenShow();
  });

  onDestroy(() => {
    setSelectedMethod(null);
  });
</script>

<Tab method={TAB_NAME} pad={false} methodSupported overrideMethodCheck shown>
  {#if currentView === VIEWS_MAP.LIST}
    <div class="intl-bt__wrapper">
      <div class="intl-bt__title">{$t(HELP_TEXT_MAPPING.title)}</div>
      <div role="list" class="border-list">
        {#each allMethods as method, i (method.id)}
          <SlottedOption
            id={method.id}
            flexGrow
            on:click={() => onMethodClick(method.id)}
          >
            <div slot="icon">
              <img src={getMethodIcon(method.id)} alt={method.id} />
            </div>
            <div slot="title">{getMethodTitle(method.id)}</div>
            <div slot="subtitle">
              {getMethodSubtitle(method.id)}
            </div>
            <div slot="extra" />
          </SlottedOption>
        {/each}
      </div>
    </div>
  {:else if $selectedMethod}
    <div class="intl-bt__method-info">
      {getMethodSubtitle($selectedMethod)}
    </div>
    <div class="intl-bt__wrapper">
      <Details method={$selectedMethod} />
    </div>
  {/if}
</Tab>

<style lang="css">
  .intl-bt__wrapper {
    padding-left: 16px;
    padding-right: 16px;
  }

  .intl-bt__title {
    margin: 10px 0 14px 0;
  }

  .intl-bt__method-info {
    display: flex;
    padding: 10px 24px;
    align-items: center;
    background-color: var(--secondary-highlight-color);
  }

  div[slot='icon'] {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 16px;
  }

  div[slot='icon'] > img {
    object-fit: cover;
    width: 100%;
  }

  div[slot='title'] {
    margin: 0;
    font-weight: 600;
    font-size: 1rem;
    line-height: 1.1rem;
    color: #4f4f4f;
    text-transform: none;
  }

  div[slot='subtitle'] {
    margin: 4px 0 0 0;
    line-height: 1rem;
    color: #828282;
  }

  div[slot='extra'] {
    position: relative;
    color: #828282;
  }

  div[slot='extra']::after {
    content: '\e604';
    font-size: 10px;
    position: absolute;
    right: 0;
    top: 1px;
    transform: translateY(-50%) rotate(180deg);
  }
</style>
