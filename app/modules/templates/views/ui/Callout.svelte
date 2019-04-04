<div
  class={allClasses}
  class:drishy={visible}
>
  {#if showIcon}
    <span></span>&nbsp;
  {/if}
  <slot></slot>
</div>

<script>
  export default {
    data: function () {
      return {
        visible: true,
        showIcon: true,
        classes: [],
        icon: '&#x2139',
      };
    },

    computed: {
      allClasses: ({ classes = [] }) => ['callout'].concat(classes).join(' '),
    },
  }
</script>
