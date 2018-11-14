{#if visible}
<div class="options-list" transition:fade>
  {#each listItems as item}
  <div class="option" on:click="selectOption(item.value)">
    {@html item.text }
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
    };
  },
  methods: {
    selectOption(value) {
      this.options.methods.onSelect.call(null, value);
    },
  },
};
</script>