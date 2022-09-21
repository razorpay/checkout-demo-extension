<script lang="ts">
  export let readonly = false;
  export let label = 'Select';
  export let options: { value: string; label: string }[] = [];
  export let value = '';
  export let required = false;
  export let validationText = '';
  export let isInvalid = false;
  let isfocussed = false;

  const handleInputFocus = () => {
    isfocussed = true;
  };
  const handleInputBlur = () => {
    isfocussed = false;
    isInvalid = required && !value;
  };
</script>

<div class="elem-wrap">
  <div class="elem select" class:readonly class:elem-error={isInvalid}>
    <i class="select-arrow"></i>
    <select
      {required}
      class="input"
      bind:value
      on:focus={handleInputFocus}
      on:blur={handleInputBlur}
      class:isfocussed
      class:has-value={value}
    >
      <option value="">{label}</option>
      {#each options as { label, value } (value)}
        <option {value}>{label}</option>
      {/each}
    </select>
    {#if value}
      <label class="select-label">{label}</label>
    {/if}
    {#if isInvalid && validationText}
      <div class="error-label">{validationText}</div>
    {/if}
  </div>
</div>

<style>
  .select {
    border-bottom: none;
    padding: 0;
    margin-top: 8px;
  }
  .select-arrow {
    right: 16px;
    bottom: 14px;
  }
  .input {
    font-size: 12px;
    padding: 15px 26px 15px 16px;
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
  .select-label {
    color: var(--tertiary-text-color);
    font-size: var(--font-size-small);
    position: absolute;
    top: 36px;
    left: 15px;
    cursor: inherit;
    transition: all ease-in 0.2s;
  }

  .input.isfocussed + .select-label {
    top: 14px;
    background-color: transparent;
    padding: 0px 4px;
    left: 9px;
    color: var(--primary-color);
    transition: all ease-out 0.2s;
    background-color: #fff;
  }

  .input.has-value + .select-label,
  .input.has-value.isfocussed + .select-label {
    top: 12px;
    left: 9px;
    background: #fff;
    padding: 0px 4px;
    transform: scale(1) translateY(-20px);
  }
  .elem-error {
    .input {
      border: 1px solid var(--error-validation-color);
    }
    .select-arrow {
      top: 0;
      margin: auto;
      height: 48px;
    }
    .error-label {
      margin-top: 4px;
      font-size: 12px;
    }
    .error-label,
    .input.isfocussed + .select-label {
      color: var(--error-validation-color);
    }
  }
</style>
