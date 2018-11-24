<div
  class={elementClass}

  on:click="fire('click', event)"
>
  <div class="expandable-card-title">
    {@html title}
    {#if badge}
      <div class="badge">{badge}</div>
    {/if}
  </div>
  <div class="expandable-card-detail">{@html detail}</div>
</div>

<script>
  export default {
    computed: {
      elementClass: ({ expanded }) => {
        const list = ['expandable-card'];

        if (expanded) {
          list.push('expandable-card--expanded');
        }

        return list.join(' ');
      },
    },
  }
</script>
