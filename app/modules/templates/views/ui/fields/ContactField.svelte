<script>
  // Utils
  import CheckoutStore from 'checkoutstore';

  // Store
  import { contact } from 'checkoutstore/screens/home';

  // UI imports
  import Field from 'templates/views/ui/Field.svelte';

  import { CONTACT_PATTERN } from 'common/constants';

  // Props
  export let value;

  const checkoutStore = CheckoutStore.get();

  const { optional, readonly, hidden, prefill } = checkoutStore;

  const prefilledContact = prefill.contact;
  const isContactReadonly = readonly.contact && prefilledContact;

  const CONTACT_REGEX = optional.contact ? '.*' : CONTACT_PATTERN;

  const label = optional.contact ? 'Phone (Optional)' : 'Phone';
</script>

<div>
  <Field
    id="contact"
    name="contact"
    type="tel"
    required={!optional.contact}
    pattern={CONTACT_REGEX}
    readonly={isContactReadonly}
    {label}
    icon="&#xe607;"
    on:input={e => ($contact = e.target.value)}
    on:blur
    bind:value
    helpText="Please enter a valid contact number" />
</div>
