<script>
  import { locale } from 'svelte-i18n';
  import { formatMessageWithLocale, getLongBankName } from 'i18n';
  import { cardWithRecurringSupport } from './constant';
  import { banksUnderOneCard } from 'common/bank';

  export let close;

  /**
   * wrapping under new Map(), will remove duplicates
   * as OneCard can be one-of 4 bank codes
   */
  const bankEntries = new Map(
    Object.entries(cardWithRecurringSupport).map(([bankCode, value]) => {
      let bankName = banksUnderOneCard.includes(bankCode)
        ? formatMessageWithLocale('misc.one_card', $locale)
        : getLongBankName(bankCode, $locale);
      return [bankName, value];
    })
  );
</script>

<section class="recurring-card-overlay-inner">
  <div class="recurring-cards-title">
    Supported cards for recurring payments:
  </div>
  <div class="recurring-cards-row recurring-cards-heading">
    <div class="recurring-cards-col">
      <!-- LABEL: Bank -->
      Bank
    </div>
    <div class="recurring-cards-col">
      <!-- LABEL: Credit Card -->
      Credit Card
    </div>
    <div class="recurring-cards-col">
      <!-- LABEL: Debit Card-->
      Debit Card
    </div>
  </div>
  <div />
  {#each [...bankEntries] as [bankName, value]}
    <div class="recurring-cards-row">
      <div class="recurring-cards-col">
        <!-- LABEL: Bank long name -->
        {bankName}
      </div>
      <div class="recurring-cards-col">{value.credit ? 'Yes' : '—'}</div>
      <div class="recurring-cards-col">{value.debit ? 'Yes' : '—'}</div>
    </div>
  {/each}
  <div class="close recurring-cards-close-icon" on:click={close}>✕</div>
</section>

<style>
  .recurring-card-overlay-inner {
    border-radius: 3px;
    display: inline-block;
    background: #fff;
    width: 100%;
    position: relative;
    text-align: left;
    top: 50%;
    transform: translateY(-50%);
  }

  .recurring-cards-title {
    line-height: 32px;
    font-size: 18px;
    padding: 16px 26px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .recurring-cards-row {
    padding: 16px 26px;
    display: flex;
    font-size: 14px;

    display: flex;
    border-top: 1px solid #e9e9e9;
  }

  .recurring-cards-col {
    flex-basis: 0;
    flex-grow: 2;
    flex-shrink: 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .recurring-cards-col ~ * {
    flex-grow: 1;
    text-align: right;
  }

  .recurring-cards-heading {
    font-weight: bold;
  }

  .recurring-cards-close-icon {
    padding: 8px;
    font-size: 18px;
    width: auto;
    height: auto;
    line-height: 1;
  }
</style>
