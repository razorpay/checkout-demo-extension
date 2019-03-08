<div ref:item on:click="fire('select', event)">
  <Icon icon={icon} />
  <div ref:text>
    {text}
  </div>
</div>

<style>
  ref:item {
    order: 0;
    width: 33.33%;
    flex: 1 1 auto;
    align-self: auto;
    display: inline-block;
    outline: 1px solid #ebedf0;
    padding: 12px;
    box-sizing: border-box;
    text-align: center;
    transition: 0.3s background;
    cursor: pointer;
    height: 68px;
    position: relative;
    background: #fcfcfc;

    &:hover {
      background: #efefef;
    }
  }

  ref:text {
    position: absolute;
    bottom: 12px;
    left: 0;
    right: 0;
    font-size: 12px;
    line-height: 15px;
  }

  /* TODO: add a generic icon class in Icon component and reuse it */
  div :global(img, svg) {
    position: absolute;
    height: 24px;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
  }
</style>

<script>
  export default {
    components: {
      Icon: 'templates/views/ui/Icon.svelte'
    }
  }

</script>