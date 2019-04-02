<div ref:card class:theme-border="selected" on:click="fire('click', event)">
  <slot></slot>
</div>


<style>
  ref:card {
    display: block;
    margin: 4px -12px;
    background: #fcfcfc;
    border: 1px solid #ebedf0;
    border-radius: 1px;
    box-shadow: 4px 4px 4px 0 rgba(0,0,0,0.04);
    padding: 12px;
    position: relative;
  }
</style>

<script>
  export default {
    data() {
      return {
        selected: false
      }
    }
  }
</script>
