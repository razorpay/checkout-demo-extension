<script lang="ts">
  import { isRedesignV15 } from 'razorpay';

  export let isReadOnly = false;
  export let showError = false;
  export let isfocussed = false;
  export let optionsArr = [];
  export let fieldLabel = '';
  export let fieldName = '';
  export let value = '';
  export let helpText = '';
  export let validationText = '';
  export let preFilledOption = null;
  export let isRequired = false;

  const handleInputFocus = () => {
    isfocussed = true;
  };
  const handleInputBlur = () => {
    isfocussed = false;
    showError = !value;
  };
</script>

<div class="elem-wrap">
  <div
    class="elem select"
    class:readonly={isReadOnly}
    class:elem-error={showError}
  >
    <i class="select-arrow"></i>
    <!-- LABEL: Please select a bank account type -->
    <div class="help">{helpText}</div>
    <select
      name={fieldName}
      required={isRequired}
      class="input"
      bind:value
      on:focus={handleInputFocus}
      on:blur={handleInputBlur}
      class:isfocussed
      class:has-value={preFilledOption || value}
    >
      {#if preFilledOption}
        <option value={preFilledOption.value}>
          {preFilledOption.label}
        </option>
      {:else}
        <!-- LABEL: Type of Bank Account -->
        {#if !isRedesignV15()}
          <option value="">{fieldLabel}</option>
        {/if}
        {#each optionsArr as opt (opt)}
          <option value={opt.value}>{opt.label}</option>
        {/each}
      {/if}
    </select>
    {#if isRedesignV15()}
      <label class="field-label">{fieldLabel}</label>
      {#if showError}
        <div class="error-label">{validationText}</div>
      {/if}
    {/if}
  </div>
</div>

<style>
  :global(.redesign) {
    .select {
      border-bottom: none;
    }
    .select-arrow {
      right: 16px;
      bottom: 14px;
    }
    .input {
      font-size: 12px;
      padding: 15px 16px;
      border: 1px solid var(--light-dark-color);
      line-height: 16px;
      border-radius: 4px;
      color: var(--primary-text-color);
    }
    .input.isfocussed,
    .input.has-value.isfocussed {
      border: 1px solid var(--primary-color);
    }
    .input.has-value {
      border: 1px solid var(--light-dark-color);
    }
    .field-label {
      color: var(--tertiary-text-color);
      font-size: var(--font-size-small);
      position: absolute;
      top: 36px;
      left: 15px;
      cursor: inherit;
      transition: all ease-in 0.2s;
    }

    .input.isfocussed + .field-label {
      top: 14px;
      background-color: transparent;
      padding: 0px 4px;
      left: 9px;
      color: var(--primary-color);
      transition: all ease-out 0.2s;
      background-color: #fff;
    }

    .input.has-value + .field-label,
    .input.has-value.isfocussed + .field-label {
      top: 14px;
      left: 9px;
      background: #fff;
      padding: 0px 4px;
      transform: none;
    }
    .elem-error {
      .input {
        border: 1px solid var(--error-validation-color);
      }
      .select-arrow {
        bottom: 32px;
      }
      .error-label {
        margin-top: 4px;
        font-size: 12px;
      }
      .error-label,
      .input.isfocussed + .field-label {
        color: var(--error-validation-color);
      }
    }
  }
</style>
