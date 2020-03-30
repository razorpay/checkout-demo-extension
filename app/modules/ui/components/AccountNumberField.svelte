<script>
  import Field from 'ui/components/Field.svelte';

  export let id;
  export let name;

  export let bankCode;

  const PATTERN = '^[a-zA-Z0-9]{(4, 20)}$';
</script>

<Field
  type="text"
  {name}
  {id}
  label="Bank Account Number"
  helpText="Please enter a valid account number"
  maxlength="20"
  required={true}
  formatter={{ type: 'alphanumeric' }}
  pattern={PATTERN} />
