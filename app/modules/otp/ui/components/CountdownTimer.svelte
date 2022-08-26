<script lang="ts">
  // svelte imports
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { linear as easing } from 'svelte/easing';

  // constant imports
  import { getTheme } from 'one_click_checkout/sessionInterface';
  import { formatToMMSS } from 'utils/date';

  const dispatch = createEventDispatcher();

  export let countdown = 30;
  export let width = 44;
  export let height = 44;
  export let counterStroke = getTheme().color;

  let duration = 1000;
  let radius = 0.4 * width;
  let now = Date.now();
  let end = now + countdown * 1000;
  let offset = tweened(1, { duration, easing });

  let timer = setInterval(updateTimer, 1000);
  function updateTimer() {
    now = Date.now();
  }

  let count;
  $: count = Math.round((end - now) / 1000);

  $: {
    dispatch('timerUpdate', count);
    if (count === 0) {
      clearInterval(timer);
      dispatch('timerComplete');
    }
  }

  $: offset.set(Math.max(count - 1, 0) / countdown);

  onDestroy(() => {
    clearInterval(timer);
  });
</script>

<div class="countdown-container">
  <div class="countdown-text" data-testId="countdown-text">
    <p>{formatToMMSS(count)}</p>
  </div>
  <svg viewBox="-{width / 2} -{height / 2} {width} {height}" {height} {width}>
    <g fill="none" stroke="currentColor" stroke-width="3">
      <circle stroke="#E0E0E0" r={radius} />
      <path
        stroke={counterStroke}
        d="M 0 -{radius} a {radius} {radius} 0 0 0 0 {radius *
          2} {radius} {radius} 0 0 0 0 -{radius * 2}"
        pathLength="1"
        stroke-dasharray="1"
        stroke-dashoffset={$offset}
      />
    </g>
  </svg>
</div>

<style>
  .countdown-container {
    position: relative;
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
  }

  .countdown-text {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    font-size: var(--font-size-small);
    color: var(--tertiary-text-color);
  }
</style>
