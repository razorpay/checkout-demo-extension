<script lang="ts">
  import { slide } from 'svelte/transition';
</script>

<div class="skeleton-instrument uninteractive" data-type="skeleton" out:slide>
  <span />
</div>

<style>
  div {
    box-sizing: content-box;
    padding: 12px 16px;
    border: 1px solid #e6e7e8;
  }

  span {
    width: 100%;

    /* Fall-back for IE */
    height: 22px;
    /* 22px is the image height. 1.25 is the line-height of text. */
    height: calc(max(22px, 1.25rem));

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
