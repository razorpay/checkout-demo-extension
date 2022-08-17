<script lang="ts">
  // UI imports
  import Field from 'ui/components/Field.svelte';

  // Utils
  import { EMAIL_PATTERN } from 'common/constants';

  // i18n
  import {
    EMAIL_HELP_TEXT,
    EMAIL_LABEL_OPTIONAL,
    EMAIL_LABEL_REQUIRED,
  } from 'ui/labels/home';

  import { t } from 'svelte-i18n';

  // store
  import { isEmailValid } from 'one_click_checkout/common/details/store';

  // Props
  export let value: string;

  // Utils
  import { isEmailOptional, isOneClickCheckout } from 'razorpay';
  import { isEmailReadOnly } from 'checkoutframe/customer';
  import { validateEmail } from 'one_click_checkout/common/validators/email';

  import { debounce } from 'lib/utils';

  const isOptional = isEmailOptional();
  const EMAIL_REGEX = isOptional ? '.*' : EMAIL_PATTERN;

  // LABEL: Email (Optional) / Email
  const label = isOptional ? EMAIL_LABEL_OPTIONAL : EMAIL_LABEL_REQUIRED;

  // Form Validation for email - specifically for 1cc
  let validationText;
  export let showValidations = false;

  const debouncedValidator = debounce((email) => {
    validateEmail(email).then((isValid) => {
      validationText = !isValid ? $t(EMAIL_HELP_TEXT) : null;
      $isEmailValid = isValid;
    });
  }, 400);

  $: debouncedValidator(value);
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
    on:input={(e) => (value = e.target?.value)}
    on:blur
    helpText={$t(EMAIL_HELP_TEXT)}
    autocomplete={isOneClickCheckout() ? 'email' : 'off'}
    {validationText}
    {showValidations}
  />
  <!-- LABEL: Please enter a valid email. Example: you@example.com -->
</div>
