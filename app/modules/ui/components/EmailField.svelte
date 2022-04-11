<script>
  // UI imports
  import Field from 'ui/components/Field.svelte';

  // Utils
  import {
    EMAIL_PATTERN,
    EMAIL_REGEX as EMAIL_VALIDATOR,
  } from 'common/constants';

  // i18n
  import {
    EMAIL_HELP_TEXT,
    EMAIL_LABEL_OPTIONAL,
    EMAIL_LABEL_REQUIRED,
  } from 'ui/labels/home';

  import { t } from 'svelte-i18n';

  // Props
  export let value;

  // Utils
  import { isEmailReadOnly, isEmailOptional } from 'razorpay';

  const isOptional = isEmailOptional();
  const EMAIL_REGEX = isOptional ? '.*' : EMAIL_PATTERN;

  // LABEL: Email (Optional) / Email
  const label = isOptional ? EMAIL_LABEL_OPTIONAL : EMAIL_LABEL_REQUIRED;

  // Form Validation for email - specifically for 1cc
  let validationText;
  $: validationText = !EMAIL_VALIDATOR.test(value) ? $t(EMAIL_HELP_TEXT) : null;
</script>

<div>
  <Field
    id="email"
    name="email"
    type="email"
    {value}
    required={!isOptional}
    pattern={EMAIL_REGEX}
    readonly={isEmailReadOnly()}
    label={$t(label)}
    icon=""
    on:input={(e) => (value = e.target.value)}
    on:blur
    helpText={$t(EMAIL_HELP_TEXT)}
    {validationText}
  />
  <!-- LABEL: Please enter a valid email. Example: you@example.com -->
</div>
