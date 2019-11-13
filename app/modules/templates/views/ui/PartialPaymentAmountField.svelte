<script>
  import Field from 'templates/views/ui/Field.svelte';

  export let maxAmount;

  let amount;

  let field;

  export function getAmount() {
    return amount;
  }

  export function focus() {
    field.focus();
  }
</script>

<Field
  id="amount-value"
  name="amount"
  type="tel"
  value={amount}
  required
  placeholder="Enter amount"
  helpText="Please enter a valid contact amount upto {maxAmount}"
  formatter={{ type: 'amount' }}
  bind:this={field} />
