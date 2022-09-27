<script lang="ts">
  import { isRedesignV15 } from 'razorpay';
</script>

<div class="tab-list" class:tab-list-onecc={isRedesignV15()}>
  <slot />
</div>

<style>
  .tab-list {
    box-shadow: 0px 3px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    position: absolute;
    z-index: 1;
    background: #fff;
    width: 100%;
  }
  .tab-list-onecc {
    position: sticky;
    top: 0;
    z-index: 2;
  }
</style>
