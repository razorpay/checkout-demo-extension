<script>
  // UI imports
  import Field from 'templates/views/ui/Field.svelte';

  // Utils
  import { EMAIL_PATTERN } from 'common/constants';

  // Props
  export let value;

  // Utils
  import CheckoutStore from 'checkoutstore';

  const checkoutStore = CheckoutStore.get();

  const { optional, prefill, readonly, hidden } = checkoutStore;

  const prefilledEmail = prefill.email;
  const isEmailReadonly = readonly.email && prefilledEmail;

  const EMAIL_REGEX = optional.email ? '.*' : EMAIL_PATTERN;

  const label = optional.email ? 'Email (Optional)' : 'Email';
</script>

<div>
  <Field
    id="email"
    name="email"
    type="email"
    {value}
    required={!optional.email}
    pattern={EMAIL_REGEX}
    readonly={isEmailReadonly}
    {label}
    icon="&#xe603;"
    on:input={e => (value = e.target.value)}
    on:blur
    helpText="Please enter a valid email. Example: you@example.com" />
</div>
