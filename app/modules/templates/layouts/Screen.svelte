<div class:pad>
  <slot></slot>
</div>

<style>

div {
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
}

.pad {
  padding: 0 12px 12px 12px;
}

</style>

<script>

export default {
  data() {
    return {
      pad: true
    };
  }
}

</script>
