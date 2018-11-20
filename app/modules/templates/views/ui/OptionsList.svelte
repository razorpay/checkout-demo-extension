{#if visible}
<div class="options-list" transition:fade>
  {#each listItems as item}
  <div class="option" on:click="selectOption(item.value)">
    <span>{@html item.text}</span>
    {#if item.badge}
      <div class="badge">{item.badge}</div>
    {/if}
  </div>
  {/each}
</div>
{/if}

<script>
export default {
  transitions: {
    fade(node, { delay = 0, duration = 200 }) {
      const o = +window.getComputedStyle(node).opacity;

      return {
        delay,
        duration,
        css: t => `opacity: ${t * o}`,
      };
    },
  },
  data() {
    return {
      listItems: [],
      visible: true,
      badge: false
    };
  },
  methods: {
    selectOption(value) {
      this.options.methods.onSelect.call(null, value);
    },
  },
};
</script>