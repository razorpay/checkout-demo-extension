<script>
  // Utils
  import CheckoutStore from 'checkoutstore';

  // Store
  import { contact } from 'checkoutstore/screens/home';

  // UI imports
  import Field from 'templates/views/ui/Field.svelte';

  // Props
  export let value;

  const checkoutStore = CheckoutStore.get();

  const { optional, readonly, hidden, prefill } = checkoutStore;

  const prefilledContact = prefill.contact;
  const isContactReadonly = readonly.contact && prefilledContact;
  const isContactHidden = hidden.contact && optional.contact;

  const CONTACT_REGEX = optional.contact ? '.*' : '^\\+?[0-9]{8,15}$';
</script>

<style>
  div {
    padding-bottom: 16px;
  }
</style>

<div class:hidden={isContactHidden}>
  <Field
    id="contact"
    name="contact"
    type="tel"
    required={!optional.contact}
    pattern={CONTACT_REGEX}
    readonly={isContactReadonly}
    label="Phone"
    icon="&#xe607;"
    on:input={e => ($contact = e.target.value)}
    bind:value
    helpText="Please enter a valid contact number" />
</div>
