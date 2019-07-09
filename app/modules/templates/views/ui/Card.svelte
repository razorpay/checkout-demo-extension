<div ref:card class:theme-border="selected" on:click="fire('click', event)">
  <slot></slot>
  <!-- {#if radioValue}
  <input
    on:change="radioChange(event)"
    {checked}
    ref:radioInp
    value="{radioValue}"
    type="radio"
    name="isSelected"
    style="position:absolute;right:8px;top:25px;display:inline;cursor:pointer;font-size:20px;"
  />
  {/if} -->
</div>

<style>
  ref:card {
    display: block;
    margin: 4px -12px;
    background: #fcfcfc;
    border: 1px solid #ebedf0;
    border-radius: 1px;
    box-shadow: 4px 4px 4px 0 rgba(0, 0, 0, 0.04);
    padding: 12px;
    position: relative;
  }
</style>

<script>
  export default {
    data() {
      return {
        selected: false,
        radioValue: null,
        checked: null,
      };
    },
    methods: {
    },
  };
</script>
