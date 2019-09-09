<div
  class={allClasses}
>
  <slot></slot>
</div>

<style>
  .note {
    border: 1px solid #F6E1B3;
    border-left-width: 4px;
    border-radius: 2px;
    padding: 12px 18px;
    color: #8E8B80;
    background-color: #FFFCF2;
    line-height: 20px;
    font-size: 14px;
  }
</style>

<script>
  export default {
    data: function () {
      return {
        classes: [],
      };
    },

    computed: {
      allClasses: ({ classes = [] }) => ['note'].concat(classes).join(' '),
    },
  }
</script>
