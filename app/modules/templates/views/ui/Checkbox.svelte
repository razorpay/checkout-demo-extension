<div class="something" >
  <input type="checkbox" id={_id} bind:checked='checked'>
  <label for={_id}>{label}</label>
</div>

<style>
  .something {
    background: red;

    input {
      display: block;
    }
  }
</style>

<script>
  export default {
    computed: {
      _id: _=> _.id || `check-${Math.random().toString(36).substr(2)}`
    }
  }
</script>