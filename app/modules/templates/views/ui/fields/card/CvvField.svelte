<script>
  import Field from 'templates/views/ui/Field.svelte';

  function getCvvDigits(type) {
    return type === 'amex' ? 4 : 3;
  }

  function handleInput(event) {
    value = event.target.value;
  }

  export let cardType = null;
  export let value = '';

  const cvvLength = getCvvDigits(cardType);
  const cvvPattern = `[0-9]{${cvvLength}}`;
</script>

<style>
  /* TODO: find a better way */
  :global(#card_cvv) {
    -webkit-text-security: disc;
  }
</style>

<!-- TODO: make helpText support an image as well -->
<Field
  formatter={{ type: 'number' }}
  helpText="It's a {cvvLength} digit code printed on the back of your card."
  id="card_cvv"
  name="card[cvv]"
  label="CVV"
  pattern={cvvPattern}
  required
  type="tel"
  maxlength={cvvLength}
  {value}
  on:input={handleInput}
  handleBlur
  handleFocus
  handleInput />
