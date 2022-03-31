<script>
  // UI imports
  import NextOption from 'ui/elements/options/NextOption.svelte';
  import AccountTab from 'one_click_checkout/account_modal/ui/AccountTab.svelte';
  import { getThemeColor } from 'checkoutstore/theme';
  import Icon from 'ui/elements/Icon.svelte';

  // Utils imports
  import { createProvider } from 'common/cardlessemi';
  import {
    getCardlessEMIProviders,
    isMethodUsable,
    isDebitEMIEnabled,
  } from 'checkoutstore/methods';
  import { getSession } from 'sessionmanager';
  import { isOneClickCheckout } from 'razorpay';
  import { isShowAccountTab } from 'one_click_checkout/account_modal/helper';

  // Store imports
  import { methodInstrument } from 'checkoutstore/screens/home';

  // i18n
  import { t, locale } from 'svelte-i18n';
  import { getCardlessEmiProviderName, getCardlessEmiProviderData } from 'i18n';
  import {
    SELECT_OPTION_TITLE,
    SELECT_RECOMMENDED_TITLE,
    OTHER_OPTIONS,
  } from 'ui/labels/cardlessemi';

  const session = getSession();
  const icons = session.themeMeta.icons;

  const sectionMeta = {
    default: { order: 1 },
    recommended: { order: 0 },
  };

  const providers = getAllProviders();

  const sectionProviderMap = providers.reduce((acc, current) => {
    let section = current.section || 'default';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(current);
    return acc;
  }, {});
  const isOneCCEnabled = isOneClickCheckout();

  let sectionTitle = {
    default:
      Object.keys(sectionProviderMap).length <= 1
        ? SELECT_OPTION_TITLE
        : OTHER_OPTIONS,
    recommended: SELECT_RECOMMENDED_TITLE,
  };
  let cardlessEmiEle;
  let showAccountTab;

  /**
   * Returns _all_ Cardless EMI providers
   *
   * @returns {Array<Provider>}
   */
  function getAllProviders() {
    let providers = [];

    if (isMethodUsable('emi')) {
      providers = [createProvider('cards')];
    }

    _Obj.loop(getCardlessEMIProviders(), (providerObj) => {
      if (providerObj.pushToFirst) {
        // higher priority then cardemi
        providers.unshift(createProvider(providerObj.code, providerObj));
      } else {
        providers.push(createProvider(providerObj.code, providerObj));
      }
    });

    return providers;
  }

  /**
   * Filters providers against the given instrument.
   * Only allows those providers that match the given instruments.
   *
   * @param {Array<string>} providers
   * @param {Instrument} instrument
   *
   * @returns {Object}
   */
  function filterProvidersAgainstInstrument(providers, instrument) {
    if (!instrument || instrument.method !== 'cardless_emi') {
      return providers;
    }

    if (!instrument.providers) {
      return providers;
    }
    const filteredProviders = providers.filter((provider) =>
      instrument.providers.includes(provider.data.code)
    );

    return filteredProviders;
  }

  let filteredProviders = sectionProviderMap;
  let sections = Object.keys(filteredProviders);
  $: {
    Object.keys(filteredProviders).forEach((sectionId) => {
      filteredProviders[sectionId] = filterProvidersAgainstInstrument(
        filteredProviders[sectionId],
        $methodInstrument
      );
      if (filteredProviders[sectionId].length === 0) {
        delete filteredProviders[sectionId];
      }
    });
    // if after filter, some instrument removed then we may need to update the title accordingly
    sectionTitle = {
      default:
        Object.keys(filteredProviders).length <= 1
          ? SELECT_OPTION_TITLE
          : OTHER_OPTIONS,
      recommended: SELECT_RECOMMENDED_TITLE,
    };
    // sort section by order
    sections = Object.keys(filteredProviders).sort((a, b) => {
      return sectionMeta[a].order - sectionMeta[b].order;
    });
  }

  function getOverriddenProviderCode(code) {
    if (code === 'cards' && isDebitEMIEnabled()) {
      code = 'credit_debit_cards';
    }
    return code;
  }

  function onScroll() {
    showAccountTab = isShowAccountTab(cardlessEmiEle);
  }
</script>

<div
  class="tab-content showable screen collapsible"
  id="form-cardless_emi"
  class:content-one-cc={isOneCCEnabled}
  on:scroll={onScroll}
  bind:this={cardlessEmiEle}
  class:one-cc={isOneCCEnabled}
>
  <div class="cardless-emi-wrapper" class:screen-one-cc={isOneCCEnabled}>
    <input type="hidden" name="emi_duration" />
    <input type="hidden" name="provider" />
    <input type="hidden" name="ott" />
    {#each sections as providerSection (providerSection)}
      <!-- TITLE: Select an option | Recommended | Other Options -->
      <h3 class="emi-header" class:one-cc={isOneCCEnabled}>
        {$t(sectionTitle[providerSection])}
      </h3>
      <div class="options emi-section">
        {#each filteredProviders[providerSection] as provider (provider.data.code)}
          <div class="cm-single-option">
            <NextOption {...provider} on:select>
              {getCardlessEmiProviderName(
                getOverriddenProviderCode(provider.data.code),
                $locale
              )}
              <span class="cm-side-label"
                >{getCardlessEmiProviderData(
                  provider.data.code,
                  'sideLabel',
                  $locale
                )}</span
              >
            </NextOption>
            {#if Boolean(provider.highlightLabel)}
              <div
                class="cm-highlightLabel"
                style={`background:${getThemeColor()}1a;`}
              >
                <Icon icon={icons.tick_flag} />
                <span>{$t(provider.highlightLabel) || ''}</span>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/each}
    <AccountTab {showAccountTab} />
  </div>
</div>

<style>
  .cm-single-option {
    position: relative;
  }

  .cm-side-label {
    color: #828282;
    font-size: 10px;
    line-height: 16px;
  }

  .cm-highlightLabel {
    background: rgba(58, 151, 252, 0.1);
    border: 1px solid #e6e7e8;
    height: 21px;
    border-top: 0;
    color: #828282;
    z-index: 2;
    font-size: 10px;
    line-height: 16px;
    padding: 0 24px;
    display: flex;
    align-items: center;
  }

  :global(.cm-highlightLabel svg) {
    align-self: flex-start;
  }
  .cm-highlightLabel span {
    margin-left: 16px;
  }

  .emi-section {
    margin: 0 18px 14px;
  }

  .emi-header {
    margin: 14px 28px;
  }

  .cardless-emi-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  #form-cardless_emi .screen-one-cc .options {
    min-height: inherit;
    overflow: unset;
  }
  .screen-one-cc {
    min-height: 110%;
  }
  .content-one-cc {
    margin-top: 0px;
  }
  .tab-content.one-cc {
    margin-top: 0;
  }

  .emi-header.one-cc {
    font-weight: 600;
    color: #263a4a;
    text-transform: none;
  }
</style>
