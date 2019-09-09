<div ref:content class:screen-pad="pad" class:screen-pad-twice="padTwice">
  <slot></slot>
</div>

<style>

  ref:content {
    &.screen-pad {
      padding: 0 12px 12px 12px;
      &.screen-pad-twice {
        padding-left: 24px;
        padding-right: 24px;
      }
    }
    height: 100%;
    overflow: auto;
    box-sizing: border-box;
  }

</style>

<script>
  export default {
    data: () => ({
      pad: true,
      padTwice: false,
    })
  }
</script>