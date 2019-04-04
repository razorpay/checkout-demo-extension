<div ref:grid>
  {#each items as item}
    <Item text={item.text}
      icon={item.icon}
      on:select="fire('select', item.id)"/>
  {/each}
</div>

<style>
  ref:grid {
    display: flex;
    align-content: stretch;
    flex-flow: row wrap;
    justify-content: flex-start;
    box-sizing: border-box;
    margin: 4px -12px;
    box-shadow: 0 2px 4px 0 rgba(0,0,0,0.04);
  }
</style>

<script>
  export default {
    components: {
      Item: './Item.svelte'
    },

    data() {
      return {
        items: []
      }
    },
  }
</script>