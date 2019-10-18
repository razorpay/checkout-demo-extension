<div
  class={allClasses}
  class:drishy={visible}
>
  {#if showIcon}
    <span>&#x2139;</span>
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
        type: 'warning'
      };
    },

    computed: {
      allClasses: ({ classes = [], type }) => ['callout', type].concat(classes).join(' '),
    },
  }
</script>
