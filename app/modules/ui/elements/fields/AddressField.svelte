<script>
  import { input, focus, blur } from 'actions/input';

  export let value;

  const ADDRESS_PATTERN = '[\\s\\S]{10}';
</script>

<style>
  textarea {
    width: 100%;
    resize: none;
    max-height: 45px;
    padding-top: 0;
  }

  label {
    top: 0;
  }
</style>

<div class="elem elem-address">
  <div class="help">Address should be at least 10 characters long</div>
  <label>Address</label>
  <textarea
    class="input no-validate no-focus no-blur"
    name="address"
    type="text"
    id="address"
    required
    pattern={ADDRESS_PATTERN}
    maxlength="200"
    rows="2"
    bind:value
    use:input
    use:focus
    use:blur />
</div>
