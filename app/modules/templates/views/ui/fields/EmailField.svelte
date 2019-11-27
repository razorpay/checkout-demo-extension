<script>
  import { email } from 'checkoutstore/screens/home';
  import { getSession } from 'sessionmanager';

  import Field from 'templates/views/ui/Field.svelte';

  // TODO: import this from somewhere
  export let getStore;
  export let value;

  const session = getSession();
  const optional = getStore('optional');

  const prefilledEmail = session.get('prefill.email');
  const isEmailReadonly = session.get('readonly.email') && prefilledEmail;
  const isEmailHidden = session.get('hidden.email') && optional.email;

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
