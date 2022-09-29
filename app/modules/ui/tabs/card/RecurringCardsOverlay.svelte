<script lang="ts">
  import { t, locale } from 'svelte-i18n';
  import RazorpayConfig from 'common/RazorpayConfig';
  import {
    formatMessageWithLocale,
    getLongBankName,
    getNetworkName,
  } from 'i18n';
  import {
    supportedNetworksAndProviders,
    cobrandingPartners,
  } from './constant';
  import {
    CREDIT_CARD,
    DEBIT_CARD,
    SUPER_CARD,
    SUPPORTED_CARDS,
  } from 'ui/labels/recurring-callout-overlay';
  import { popStack } from 'navstack';

  /**
   * wrapping under new Map(), will remove duplicates
   * as OneCard can be one-of 4 bank codes
   */
  const providerEntries = new Map(
    Object.entries(supportedNetworksAndProviders).map(([provider, value]) => {
      let providerName = cobrandingPartners.includes(provider)
        ? formatMessageWithLocale(`misc.${provider.toLowerCase()}`, $locale)
        : getLongBankName(provider, $locale);
      return [providerName, { value, code: provider }];
    })
  );
</script>

<section class="recurring-card-overlay-inner">
  <div class="recurring-cards-title">
    <!-- LABEL: Supported cards for recurring payments -->
    {$t(SUPPORTED_CARDS)}
  </div>

  <div />
  <div class="networks-list-container">
    {#each [...providerEntries] as [providerName, { value, code }]}
      <div class="recurring-cards-row">
        <div class="recurring-cards-col">
          <img
            class="bank-logo"
            src={`${RazorpayConfig.cdn}bank/${code}.gif`}
            alt={code}
          />
        </div>
        <div class="recurring-provider-wrapper">
          <!-- LABEL: Bank short name -->
          <div class="recurring-provider" id={providerName}>
            {providerName}
          </div>
          <div
            class="recurring-networks-container"
            id={`${providerName}-networkd`}
          >
            <!-- if credit cards is available and has any supporting networkd-->
            {#if value.credit && value.credit.length}
              <div class="recurring-card-networks">
                <!-- Card type -->
                <div
                  class="recurring-card-type"
                  data-testid={`${providerName}-credit-cards`}
                >
                  {$t(CREDIT_CARD)}
                </div>
                <span class="dot" />
                <div
                  class="recurring-networks"
                  data-testid={`${providerName}-credit-networks`}
                >
                  <!-- Supported networks under credit cards-->
                  {#each [...value.credit] as network}
                    <span data-testid={`${getNetworkName(network, $locale)}`}>
                      {getNetworkName(network, $locale)}
                    </span>
                    <hr />
                  {/each}
                </div>
              </div>
            {/if}

            <!-- if debit cards is available and has any supporting networkd-->
            {#if value.debit && value.debit.length}
              <div class="recurring-card-networks">
                <!-- Card type -->
                <div
                  class="recurring-card-type"
                  data-testid={`${providerName}-debit-cards`}
                >
                  {$t(DEBIT_CARD)}
                </div>
                <span class="dot" />
                <div
                  class="recurring-networks"
                  data-testid={`${providerName}-debit-networks`}
                >
                  <!-- Supported networks under debit cards-->
                  {#each [...value.debit] as network}
                    <span data-testid={`${getNetworkName(network, $locale)}`}>
                      {getNetworkName(network, $locale)}
                    </span>
                    <hr />
                  {/each}
                </div>
              </div>
            {/if}

            <!-- if super cards is available and has any supporting networkd-->
            {#if value.super_cards && value.super_cards.length}
              <div class="recurring-card-networks">
                <!-- Card type -->
                <div
                  class="recurring-card-type"
                  data-testid={`${providerName}-super-cards`}
                >
                  {$t(SUPER_CARD)}
                </div>
                <span class="dot" />
                <div
                  class="recurring-networks"
                  data-testid={`${providerName}-super-networks`}
                >
                  <!-- Supported networks under super cards-->
                  {#each [...value.super_cards] as network}
                    <span data-testid={`${getNetworkName(network, $locale)}`}>
                      {getNetworkName(network, $locale)}
                    </span>
                    <hr />
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>
  <div class="close recurring-cards-close-icon" on:click={() => popStack()}>
    ✕
  </div>
</section>

<style>
  .recurring-networks {
    display: flex;
    flex-direction: inherit;
    flex-grow: 2;
    padding-left: 4px;
    align-items: center;
  }
  .recurring-cards-row {
    padding: 8px 26px;
    display: flex;
    font-size: 12px;
    display: flex;
    border-top: 1px solid #e9e9e9;
  }
  .recurring-card-networks {
    display: flex;
    justify-content: flex-start;
    padding: 0 4px;
    line-height: 30px;
    align-items: center;
  }
  .recurring-card-type {
    min-width: 70px;
    text-align: start;
  }
  .dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #5d6d86;
    display: inline-block;
    margin: 6px 6px;
  }
  hr {
    margin: 5px;
    height: 8px;
  }
  hr:last-child {
    display: none;
  }
  .recurring-cards-col {
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: unset;
  }

  .recurring-cards-col ~ * {
    flex-grow: 1;
    text-align: right;
  }

  .recurring-cards-close-icon {
    padding: 8px;
    font-size: 18px;
    width: auto;
    height: auto;
    line-height: 1;
    top: 15px;
    right: 20px;
  }
  img {
    width: 31px;
    height: 31px;
    display: inline-block;
  }
  .recurring-card-overlay-inner {
    width: 100%;
    height: 100%;
    text-align: left;
  }
  .recurring-provider-wrapper {
    display: flex;
    flex-direction: column;
    margin-left: 11px;
  }
  .networks-list-container {
    overflow: auto;
    height: 101%;
    background: #fff;
  }
  .mobile .networks-list-container {
    max-height: calc(100% - 51px);
    overflow: auto;
  }
  :global(.redesign) {
    .networks-list-container {
      max-height: calc(100% - 51px);
    }
  }
  .recurring-provider {
    font-size: 14px;
    line-height: 17px;
    font-weight: 400;
    text-align: left;
    margin-bottom: -4px;
    color: #333;
    white-space: pre-wrap;
  }
  .recurring-networks-container {
    border: none;
    display: flex;
    flex-direction: column;
    font-weight: 400;
    font-size: 10px;
    line-height: 12px;
    padding-top: 6px;
    color: #333;
  }
  .recurring-card-networks {
    line-height: 10px;
    padding-left: 0;
  }
  .recurring-cards-row {
    padding: 16px;
  }
  .recurring-cards-close-icon {
    top: 8px;
  }
  .recurring-cards-title {
    line-height: 19px;
    padding: 16px;
    background: #fff;
    font-weight: 500;
    color: #424242;
    border-radius: 3px 3px 0 0;
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-transform: capitalize;
  }
</style>
