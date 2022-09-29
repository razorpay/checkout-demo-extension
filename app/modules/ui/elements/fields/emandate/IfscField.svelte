<script lang="ts">
  import Field from 'ui/components/Field.svelte';

  import { t, locale } from 'svelte-i18n';
  import { IFSC_LABEL, IFSC_HELP, IFSC_CUSTOM_HELP } from 'ui/labels/emandate';
  import { formatTemplateWithLocale } from 'i18n';
  import { isValidIFSC } from 'emandate/helper';
  import { Formatter } from 'formatter';

  export let id;
  export let name;
  export let readonly;
  export let dir;

  export let value: string;
  export let bankCode: string;
  let help_text = IFSC_HELP; // Help Text: Please enter a valid IFSC
  let field = null;
  const PATTERN = '^[a-zA-Z]{4}[a-zA-Z0-9]{7}$';
  let showValidations = false;

  function handleInput(event) {
    value = event.target.value;
  }

  function handleInputBlur() {
    if (value && value.length >= 4) {
      if (isValidIFSC(value, bankCode)) {
        let isValid = Formatter.rules.ifsc.isValid.call({
          value: field.getRawValue() || '',
        });
        showValidations = !isValid;
        help_text = showValidations ? IFSC_HELP : '';
        field.setValid(isValid);
      } else {
        showValidations = true;
        help_text = IFSC_CUSTOM_HELP;
        field.setValid(false);
      }
    } else {
      showValidations = true;
      help_text = IFSC_HELP;
      field.setValid(false);
    }
  }
</script>

<Field
  type="text"
  labelClasses="fs-12"
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
  validationText={formatTemplateWithLocale(
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
  handleInput
  on:input={handleInput}
  on:blur={handleInputBlur}
  bind:this={field}
  bind:showValidations
/>
