<script lang="ts">
  import Field from 'ui/components/Field.svelte';

  import { t, locale } from 'svelte-i18n';
  import { IFSC_LABEL, IFSC_HELP, IFSC_CUSTOM_HELP } from 'ui/labels/emandate';
  import { formatTemplateWithLocale } from 'i18n';
  import { isValidIFSC } from 'emandate/helper';

  export let id;
  export let name;
  export let readonly;
  export let dir;

  export let value: string;
  export let bankCode: string;
  let help_text = IFSC_HELP; // Help Text: Please enter a valid IFSC
  let field;
  const PATTERN = '^[a-zA-Z]{4}[a-zA-Z0-9]{7}$';

  function handleInput(event) {
    value = event.target.value;
    setValid();
  }

  function setValid() {
    if (value.length >= 4 && isValidIFSC(value, bankCode)) {
      // Help Text: Please enter a {bankCode} IFSC
      help_text = IFSC_CUSTOM_HELP;
      field.setValid(false);
    } else {
      help_text = IFSC_HELP;
    }
  }
</script>

<Field
  type="text"
  {name}
  {id}
  {readonly}
  {value}
  {dir}
  label={$t(IFSC_LABEL)}
  helpText={formatTemplateWithLocale(
    help_text,
    { bankCode: bankCode.slice(0, 4) },
    $locale
  )}
  maxlength="11"
  required={true}
  formatter={{ type: 'ifsc' }}
  pattern={PATTERN}
  spellcheck="false"
  autocorrect="off"
  autocapitalize="off"
  handleBlur
  handleFocus
  handleInput
  on:input={handleInput}
  bind:this={field}
/>
