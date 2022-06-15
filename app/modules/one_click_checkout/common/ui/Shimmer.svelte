<script lang="ts">
  export let height;
  export let width;
  export let style;
  export let borderRadius;

  let shimmerStyle;

  $: shimmerStyle = style || '';
  $: if (width) {
    shimmerStyle += `;width: ${
      typeof width === 'number' ? `${width}px` : width
    }`;
  }
  $: if (height) {
    shimmerStyle += `;height: ${
      typeof height === 'number' ? `${height}px` : height
    }`;
  }
  $: if (borderRadius) {
    shimmerStyle += `;border-radius: ${borderRadius}`;
  }
</script>

<div class="shimmer-bg shimmer-line" style={shimmerStyle} />

<style>
  .shimmer-bg {
    animation-duration: 2.2s;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    animation-name: shimmer;
    animation-timing-function: linear;
    background: linear-gradient(to right, #f6f6f6 8%, #f0f0f0 18%, #f6f6f6 33%);
    background-size: 1200px 100%;
  }

  @-webkit-keyframes shimmer {
    0% {
      background-position: -100% 0;
    }
    100% {
      background-position: 100% 0;
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -1200px 0;
    }
    100% {
      background-position: 1200px 0;
    }
  }

  .shimmer-line {
    border-radius: 2px;
    height: 12px;
    width: 100%;
  }
</style>
