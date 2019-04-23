<div class="async-loading loading">
  <div class="message">{message}</div>
  <div class="spin"><div></div></div>
  <div class="spin spin2"><div></div></div>
  <span class="link"></span>
</div>

<style>
  .async-loading .message {
    white-space: normal;
    padding: 20px 30px;
    line-height: 22px;
  }
</style>

<script>
  export default {

    data: function () {
      return {
        message: 'Please wait...'
      };
    },

    computed: {}
  }
</script>
