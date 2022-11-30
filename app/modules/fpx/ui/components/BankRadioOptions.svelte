<script lang="ts">
  // svelte imports
  import { createEventDispatcher } from 'svelte';

  // i18n imports
  import { t } from 'svelte-i18n';
  import {
    FPX_CORPORATE_RADIO_LABEL,
    FPX_RETAIL_RADIO_LABEL,
    FPX_SELECTION_RADIO_TEXT,
  } from 'fpx/i18n/label';

  // util imports
  import { BANK_TYPES } from 'common/bank';

  const dispatch = createEventDispatcher();

  /* --- props --- */
  // type of bank ( retail / corporate )
  export let activeType = BANK_TYPES.RETAIL;
  // whether retail radio button is disabled or not
  export let retailDisabled = false;
  // whether corporate radio button is disabled or not
  export let corporateDisabled = false;
  /* --- props end --- */
</script>

<div>
  <!-- LABEL: Complete Payment Using -->
  <p class="select-bank-type">{$t(FPX_SELECTION_RADIO_TEXT)}</p>
  <div class="flex-row">
    <div class="input-radio">
      <input
        type="radio"
        id="fpx_type_retail"
        checked={activeType === BANK_TYPES.RETAIL}
        disabled={retailDisabled}
        on:click={() => {
          dispatch('click', { type: BANK_TYPES.RETAIL });
        }}
      />
      <label class="flex-row" for="fpx_type_retail">
        <div class:disabled={retailDisabled} class="radio-display" />
        <!-- LABEL: Personal Banking -->
        <div class:disabled={retailDisabled} class="label-content">
          {$t(FPX_RETAIL_RADIO_LABEL)}
        </div>
      </label>
    </div>
    <div class="input-radio">
      <input
        type="radio"
        id="fpx_type_corporate"
        disabled={corporateDisabled}
        checked={activeType === BANK_TYPES.CORPORATE}
        on:click={() => {
          dispatch('click', { type: BANK_TYPES.CORPORATE });
        }}
      />
      <label class="flex-row" for="fpx_type_corporate">
        <div class:disabled={corporateDisabled} class="radio-display" />
        <!-- LABEL: Business Banking -->
        <div class:disabled={corporateDisabled} class="label-content">
          {$t(FPX_CORPORATE_RADIO_LABEL)}
        </div>
      </label>
    </div>
  </div>
</div>

<style lang="scss">
  * {
    box-sizing: border-box;
    margin: 0px;
    padding: 0px;
  }

  .flex-row {
    display: flex;
    align-items: center;
  }

  .select-bank-type {
    color: var(--primary-text-color);
    font-size: 14px;
    font-weight: var(--font-weight-semibold);
    margin-bottom: 10px;
  }

  .input-radio {
    margin-right: 16px;

    input[type='radio']:disabled {
      cursor: default;
    }

    label {
      .disabled {
        color: rgba(0, 0, 0, 0.4);
        cursor: default;
      }

      .radio-display {
        position: static;
        &:after {
          top: 6px;
        }
      }
      .label-content {
        font-size: 14px;
        padding: 4px 0px 4px 8px;
      }
    }
  }
</style>
