<script>
  import { fade } from 'svelte/transition';
  import { onMount } from 'svelte';

  export let activeSlideIndex = 0;
  export let totalSlides;

  onMount(() => {
    initSlides();
  });

  function initSlides() {
    const slides = document.getElementsByClassName('carousel-slide');
    totalSlides = slides.length;
    let offset = 0;
    for (let i = 0; i < totalSlides; i++) {
      slides[i].style.left = offset + 'px';
      offset += slides[i].clientWidth + 20;
    }
  }

  function plusSlides(n) {
    showSlides((slideIndex += n));
  }

  export function changeSlide(ind) {
    activeSlideIndex = ind;
    // const sliderMain = document.getElementsByClassName('carousel-track')[0];
    // sliderMain.style.left = `-${220 * ind}px`;
    const slides = document.getElementsByClassName('carousel-slide');
    totalSlides = slides.length;
    let offset = -220 * ind;
    for (let i = 0; i < totalSlides; i++) {
      slides[i].style.left = offset + 'px';
      offset += slides[i].clientWidth + 20;
    }
  }
</script>

<style>
  /* The dots/bullets/indicators */
  .dot {
    cursor: pointer;
    height: 15px;
    width: 15px;
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
    position: absolute;
    height: 100%;
    width: 100%;
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none;
  }
  .carousel-track :global(.carousel-slide) {
    position: absolute;
    transition: all 1s;
  }
  .carousel-track::-webkit-scrollbar {
    display: none;
  }
</style>

<div class="carousel-wrapper">
  <div class="carousel-track">
    <slot />
  </div>
  <div class="carousel-dots">
    {#each Array(totalSlides) as ind, index}
      <span
        class="dot"
        class:active={index === activeSlideIndex}
        on:click={() => changeSlide(index)} />
    {/each}
  </div>
</div>
