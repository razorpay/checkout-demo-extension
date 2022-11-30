<script lang="ts">
  // svelte imports
  import { createEventDispatcher } from 'svelte';

  // ui imports
  import Icon from 'ui/elements/Icon.svelte';
  import DowntimeIcon from 'ui/elements/Downtime/Icon.svelte';

  // util imports
  import { truncateString } from 'utils/strings';
  import { isRedesignV15 } from 'razorpay';
  import { getIcons } from 'checkoutstore/theme';

  /* --- props --- */
  export let selectedBank: string;
  export let selectLabel: string;
  export let selectHelpLabel: string;
  export let bankList: { code: string; original: string }[];
  export let downtimeSeverity: string | boolean | undefined = undefined;
  export let invalid: boolean;
  /* --- props end --- */

  const { solid_down_arrow } = getIcons();
  const dispatch = createEventDispatcher();
  const isRedesignV15Enabled = isRedesignV15();

  let selectedBankName: string | null | undefined;
  let bankDropdownSelect: HTMLButtonElement;

  $: {
    if (selectedBank) {
      selectedBankName = bankList.find(
        (bank) => bank?.code === selectedBank
      )?.original;
    } else {
      selectedBankName = null;
    }
  }

  /**
   * bring dropdown select to focus
   */
  export function focus() {
    bankDropdownSelect.focus();
  }
</script>

<div class="elem-wrap">
  <div
    id="nb-elem"
    class="elem select"
    class:invalid
    class:nb-one-cc-wrapper={isRedesignV15Enabled}
  >
    {#if !isRedesignV15Enabled}
      <i class="select-arrow"></i>
    {/if}

    <!-- LABEL: Please select a bank -->
    <div class="help">
      {selectHelpLabel}
    </div>
    {#if selectedBank && isRedesignV15Enabled}
      <span class="nb-select-bank-text">{selectLabel}</span>
    {/if}

    {#if isRedesignV15Enabled}
      <span class="drop-down-icon-wrapper">
        <Icon icon={solid_down_arrow} />
      </span>
    {/if}

    <button
      aria-label={`${
        selectedBank ? `${selectedBankName} - ${selectLabel}` : selectLabel
      }`}
      class="input dropdown-like dropdown-bank"
      class:nb-one-cc-button={isRedesignV15Enabled}
      type="button"
      id="bank-select"
      bind:this={bankDropdownSelect}
      on:click={() => {
        dispatch('click');
      }}
      on:keypress={(ev) => {
        dispatch('keypress', ev);
      }}
    >
      {#if selectedBank}
        <div>
          {truncateString(selectedBankName, 28)}
        </div>
        {#if !!downtimeSeverity}
          <div>
            <DowntimeIcon severe={downtimeSeverity} />
          </div>
        {/if}
      {:else}
        <!-- LABEL: Select a different bank -->
        {selectLabel}
      {/if}
    </button>
  </div>
</div>

<style lang="scss">
  .dropdown-like {
    width: 100%;

    /* Fallback for IE */
    text-align: left;
    text-align: start;
  }
  .dropdown-bank {
    display: flex;
    justify-content: space-between;
    width: 90%;
  }

  #bank-select {
    padding-top: 0;
    margin-top: 12px;
  }

  .nb-one-cc-wrapper {
    border: 1px solid var(--light-dark-color);
    margin-top: 20px;
    border-radius: 4px;
    padding: 0px 12px;
    height: 48px;
    padding: 12px 16px;
    box-sizing: border-box;
    color: var(--primary-text-color);
  }

  .nb-one-cc-button {
    padding-top: 0px;
    padding-bottom: 0px;
    height: 100%;
    display: flex;
    margin-top: 2px !important;
    color: var(--tertiary-text-color);
  }

  .nb-one-cc-wrapper::after {
    border-bottom: none !important;
  }

  .nb-select-bank-text {
    position: absolute;
    top: -10px;
    background: white;
    padding: 0px 2px;
  }
  .screen-one-cc {
    min-height: 100%;
  }

  .drop-down-icon-wrapper {
    position: absolute;
    right: 14px;
    top: 14px;
  }
</style>
