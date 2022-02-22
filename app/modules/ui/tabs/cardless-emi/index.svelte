<script>
  // UI imports
  import NextOption from 'ui/elements/options/NextOption.svelte';

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

  let sectionTitle = {
    default:
      Object.keys(sectionProviderMap).length <= 1
        ? SELECT_OPTION_TITLE
        : OTHER_OPTIONS,
    recommended: SELECT_RECOMMENDED_TITLE,
  };

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
</script>

<div class="tab-content showable screen pad collapsible" id="form-cardless_emi">
  <input type="hidden" name="emi_duration" />
  <input type="hidden" name="provider" />
  <input type="hidden" name="ott" />
  {#each sections as providerSection (providerSection)}
    <!-- TITLE: Select an option | Recommended | Other Options -->
    <h3>{$t(sectionTitle[providerSection])}</h3>
    <div class="options">
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
</style>
