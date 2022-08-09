<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  export let max = 3;
  export let timeout = 300;

  let dots = '..';
  let timer: number;

  onMount(() => {
    timer = window.setInterval(() => {
      const next = dots.length === max ? 0 : dots.length + 1;
      dots = new Array(next).fill('.').join('');
    }, timeout);
  });

  onDestroy(() => {
    clearInterval(timer);
  });
</script>

<div>
  <slot />
  {dots}
</div>
