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
  import {
    isEmailValid,
    isOptionalEmail,
  } from 'one_click_checkout/common/details/store';

  // Props
  export let value: string;

  // Utils
  import { isOneClickCheckout } from 'razorpay';
  import { isEmailReadOnly } from 'checkoutframe/customer';
  import { validateEmail } from 'one_click_checkout/common/validators/email';

  import { debounce } from 'lib/utils';
  import autotest from 'autotest';

  export let required: boolean;

  let EMAIL_REGEX = '';
  let label = '';

  $: {
    required = !$isOptionalEmail;
    EMAIL_REGEX = !required ? '.*' : EMAIL_PATTERN;

    // LABEL: Email (Optional) / Email
    label = !required ? EMAIL_LABEL_OPTIONAL : EMAIL_LABEL_REQUIRED;
  }

  // Form Validation for email - specifically for 1cc
  let validationText: string | null;
  export let showValidations = false;

  const debouncedValidator: (email: string, showValidation: boolean) => void =
    debounce((email: string, showValidation) => {
      validateEmail(email).then((isValid) => {
        validationText = !isValid ? $t(EMAIL_HELP_TEXT) : null;
        $isEmailValid = showValidation ? isValid : true;
      });
    }, 200);

  $: debouncedValidator(value, showValidations);
</script>

<div>
  <Field
    id="email"
    name="email"
    type="email"
    {value}
    {required}
    pattern={EMAIL_REGEX}
    readonly={isEmailReadOnly()}
    label={$t(label)}
    icon=""
    on:input={(e) => (value = e.target?.value)}
    on:blur
    on:input
    helpText={$t(EMAIL_HELP_TEXT)}
    autocomplete={isOneClickCheckout() ? 'email' : 'off'}
    {validationText}
    bind:showValidations
    attributes={{ ...autotest('email') }}
  />
  <!-- LABEL: Please enter a valid email. Example: you@example.com -->
</div>
