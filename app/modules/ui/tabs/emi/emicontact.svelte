<script>
  // UI Imports
  import CardBox from 'ui/elements/CardBox.svelte';
  import Field from 'ui/components/Field.svelte';

  import { INDIAN_CONTACT_PATTERN } from 'common/constants';

  // Store
  import { emiContact, contact } from 'checkoutstore/screens/home';
  import { cardNumber, selectedCard } from 'checkoutstore/screens/card';

  let contactValue = $emiContact || $contact || '';

  export let isSavedCard = false;
</script>

<style>
  :global(input[name='emi-contact']) {
    padding-top: 12px;
    font-size: 14px;
  }

  :global(input):-webkit-autofill {
    background-color: transparent;
  }

  .title:nth-of-type(1) {
    margin-top: 16px;
  }

  .contact {
    color: rgba(51, 51, 51, 0.6);
    font-size: 13px;
    padding: 12px;
    border: 1px solid #e6e7e8;
    background-color: #fcfcfc;
  }

  .contact :global(i) {
    z-index: 2;
  }

  .emi-contact {
    margin-left: -12px;
    margin-right: -12px;
  }
</style>

<div class="emi-contact">
  <h3 class="title">SELECTED DEBIT CARD</h3>
  <CardBox entity={isSavedCard ? $selectedCard.token : $cardNumber} />
  <h3 class="title">MOBILE NUMBER</h3>
  <div class="contact selected no-autofill-overlay">
    <span>
      Enter the mobile number registered with your bank and Debit Card.
    </span>
    <Field
      id="emi-contact"
      name="emi-contact"
      type="tel"
      autocomplete="tel"
      required
      xautocompletetype="phone-full"
      pattern={INDIAN_CONTACT_PATTERN}
      icon="&#xe607;"
      on:input
      on:blur
      handleFocus={true}
      handleBlur={true}
      handleInput={true}
      value={contactValue}
      helpText="Please enter a valid indian mobile number" />
  </div>
</div>
