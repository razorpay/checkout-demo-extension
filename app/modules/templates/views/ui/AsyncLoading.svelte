<script>
  // Props
  export let message = 'Please wait...';
</script>

<style>
  .async-loading .message {
    white-space: normal;
    padding: 20px 30px;
    line-height: 22px;
  }
</style>

<div class="async-loading loading">
  <div class="message">{message}</div>
  <div class="spin">
    <div />
  </div>
  <div class="spin spin2">
    <div />
  </div>
  <span class="link" />
</div>
