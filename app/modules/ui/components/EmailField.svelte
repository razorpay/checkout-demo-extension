<script>
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

  // Props
  export let value;

  // Utils
  import { isEmailReadOnly, isEmailOptional } from 'checkoutstore';

  const isOptional = isEmailOptional();
  const EMAIL_REGEX = isOptional ? '.*' : EMAIL_PATTERN;

  // LABEL: Email (Optional) / Email
  const label = isOptional ? EMAIL_LABEL_OPTIONAL : EMAIL_LABEL_REQUIRED;
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
  />
  <!-- LABEL: Please enter a valid email. Example: you@example.com -->
</div>
