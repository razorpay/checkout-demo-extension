<script lang="ts">
  import { input, focus, blur } from 'actions/input';

  import { ADDRESS_LABEL, ADDRESS_HELP } from 'ui/labels/home';
  import { t } from 'svelte-i18n';
  import { isRedesignV15 } from 'razorpay';
  import Field from 'ui/components/Field.svelte';

  export let value: string;
  export let showValidations = false;

  const ADDRESS_PATTERN = '[\\s\\S]{10}';

  function handleInput({ target }: any) {
    value = target.value;
  }
</script>

{#if isRedesignV15()}
  <Field
    id="address"
    name="address"
    type="address"
    {value}
    required={true}
    pattern={ADDRESS_PATTERN}
    maxlength={200}
    label={$t(ADDRESS_LABEL)}
    on:blur={() => {
      showValidations = !value || value.length < 10;
    }}
    on:input={handleInput}
    validationText={$t(ADDRESS_HELP)}
    bind:showValidations
  />
{:else}
  <div class="elem elem-address">
    <!-- LABEL: Address should be at least 10 characters long -->
    <div class="help">{$t(ADDRESS_HELP)}</div>
    <!-- LABEL: Address -->
    <label for="address">{$t(ADDRESS_LABEL)}</label>
    <textarea
      class="input no-validate no-focus no-blur"
      name="address"
      type="text"
      id="address"
      required
      pattern={ADDRESS_PATTERN}
      maxlength="200"
      rows="2"
      bind:value
      use:input
      use:focus
      use:blur
    />
  </div>
{/if}

<style>
  textarea {
    width: 100%;
    resize: none;
    max-height: 45px;
    padding-top: 0;
  }

  label {
    top: 0;
  }
</style>
