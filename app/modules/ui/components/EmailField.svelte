<script>
  // UI imports
  import Field from 'ui/components/Field.svelte';

  // Utils
  import { EMAIL_PATTERN } from 'common/constants';

  // Props
  export let value;

  // Utils
  import { isEmailReadOnly, isEmailOptional } from 'checkoutstore';

  const isOptional = isEmailOptional();
  const EMAIL_REGEX = isOptional ? '.*' : EMAIL_PATTERN;
  const label = isOptional ? 'Email (Optional)' : 'Email';
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
    {label}
    icon="&#xe603;"
    on:input={e => (value = e.target.value)}
    on:blur
    helpText="Please enter a valid email. Example: you@example.com" />
</div>
