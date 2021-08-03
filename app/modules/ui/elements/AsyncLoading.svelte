<div class="async-loading loading">
  <div class="message">
    <slot />
  </div>
  <div class="spin">
    <div />
  </div>
  <div class="spin spin2">
    <div />
  </div>
  <span class="link" />
</div>

<style>
  .async-loading .message {
    white-space: normal;
    padding: 20px 30px;
    line-height: 22px;
    text-align: center;
  }
</style>
