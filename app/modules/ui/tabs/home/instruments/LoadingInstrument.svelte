<script>
  import { slide } from 'svelte/transition';
</script>

<style>
  div {
    box-sizing: content-box;
    padding: 12px 16px;
    border: 1px solid #e6e7e8;
  }

  span {
    width: 100%;
    height: 16px;
    overflow: hidden;
    position: relative;
    display: block;
    background-color: #fafafa;
  }

  span::after {
    position: absolute;
    width: 100%;
    height: 100%;
    display: block;
    content: '';
    background: linear-gradient(
      90deg,
      #fbfbfb 0%,
      #e3e3e3 33.33%,
      #fbfbfb 66.66%,
      #fbfbfb 100%
    );
    animation: instrument-skeleton 2s ease-in-out infinite;
    animation-fill-mode: both;
  }
</style>

<div class="loading-instrument uninteractive" out:slide>
  <span />
</div>
