<script>
  // Svelte imports
  import { onMount } from 'svelte';

  export let activeSlideIndex = 0;
  export let totalSlides;

  onMount(() => {
    initSlides();
    const track = document.getElementsByClassName('carousel-track')[0];
    track.addEventListener('scroll', e => {
      activeSlideIndex = parseInt(track.scrollLeft / 180);
    });
  });

  function initSlides() {
    const slides = document.getElementsByClassName('carousel-slide');
    totalSlides = slides.length;
  }

  export function changeSlide(ind) {
    activeSlideIndex = ind;
    const track = document.getElementsByClassName('carousel-track')[0];
    let offset = 220 * ind;
    track.scrollLeft = offset;
  }
</script>

<style>
  /* The dots/bullets/indicators */
  .dot {
    cursor: pointer;
    height: 10px;
    width: 10px;
    margin: 0 2px;
    background-color: #bbb;
    border-radius: 50%;
    display: inline-block;
    transition: background-color 0.6s ease;
  }

  .active,
  .dot:hover {
    background-color: #717171;
  }
  .carousel-dots {
    text-align: center;
    margin-top: 10px;
    position: absolute;
    bottom: 0;
    left: 45%;
  }
  .carousel-wrapper {
    position: relative;
    height: 230px;
    overflow-x: hidden;
  }
  .carousel-track {
    height: 100%;
    width: 100%;
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none;
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
  }
  .carousel-track :global(.carousel-slide) {
    transition: all 0.5s;
    flex-shrink: 0;
  }
  .carousel-track::-webkit-scrollbar {
    display: none;
  }
  .carousel-offset {
    width: 60px;
    display: inline-block;
    height: 100%;
    flex-shrink: 0;
  }
</style>

<div class="carousel-wrapper">
  <div class="carousel-track">
    <div class="carousel-offset" />
    <slot />
    <div class="carousel-offset" />
  </div>
  {#if totalSlides > 1}
    <div class="carousel-dots">
      {#each Array(totalSlides) as ind, index}
        <span
          class="dot"
          class:active={index === activeSlideIndex}
          on:click={() => changeSlide(index)} />
      {/each}
    </div>
  {/if}
</div>
