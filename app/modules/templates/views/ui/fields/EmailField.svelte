<script>
  // Store
  import { email } from 'checkoutstore/screens/home';

  // UI imports
  import Field from 'templates/views/ui/Field.svelte';

  // Props
  export let value;

  // Utils
  import CheckoutStore from 'checkoutstore';

  const checkoutStore = CheckoutStore.get();

  const { optional, prefill, readonly, hidden } = checkoutStore;

  const prefilledEmail = prefill.email;
  const isEmailReadonly = readonly.email && prefilledEmail;
  const isEmailHidden = hidden.email && optional.email;

  const EMAIL_REGEX = optional.email
    ? '.*'
    : '^[^@\\s]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)+$';

  const label = optional.email ? 'Email (Optional)' : 'Email';
</script>

<div class="elem-wrap" class:invisible={isEmailHidden} id="elem-wrap-email">
  <Field
    id="email"
    name="email"
    type="email"
    bind:value
    required={!optional.email}
    pattern={EMAIL_REGEX}
    readonly={isEmailReadonly}
    {label}
    icon="&#xe603;"
    on:input={e => ($email = e.target.value)}
    helpText="Please enter a valid email. Example: you@example.com" />
</div>
