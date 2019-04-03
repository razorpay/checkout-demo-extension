<div
  class="payment-option item"
  tab="{method.method}"

  on:click="fire('click', event)"
>

  <label>
    <i>{@html method.icon}</i>
    <span class="title">{method.title}</span>
    <span class="desc">{method.description}</span>
  </label>
</div>

<script>
  export default {
  }
</script>
