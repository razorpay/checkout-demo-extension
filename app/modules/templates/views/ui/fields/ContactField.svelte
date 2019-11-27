<script>
  import { contact } from 'checkoutstore/screens/home';
  import { getSession } from 'sessionmanager';

  import Field from 'templates/views/ui/Field.svelte';

  // TODO: import this from somewhere
  export let getStore;
  export let value;

  const session = getSession();
  const optional = getStore('optional');

  const prefilledContact = session.get('prefill.contact');
  const isContactReadonly = session.get('readonly.contact') && prefilledContact;
  const isContactHidden = session.get('hidden.contact') && optional.contact;

  const CONTACT_REGEX = optional.contact ? '.*' : '^\\+?[0-9]{8,15}$';
</script>

<div class="elem-wrap" class:invisible={isContactHidden} id="elem-wrap-contact">
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
