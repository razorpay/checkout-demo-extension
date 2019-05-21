<div
  class={elementClass}

  on:click="fire('click', event)"
>
  <div
    class="expandable-card-title"
  >
    <slot name="title"></slot>
    {#if badge}
      <div class="badge">{badge}</div>
    {/if}
  </div>
  <div class="expandable-card-detail">
    <slot name="detail"></slot>
  </div>
</div>

<script>
  export default {
    computed: {
      elementClass: ({ expanded, badge }) => {
        const list = ['expandable-card'];

        if (expanded) {
          list.push('expandable-card--expanded');
        }

        if (badge) {
          list.push('expandable-card--has-badge');
        }

        return list.join(' ');
      },
    },
  }
</script>
