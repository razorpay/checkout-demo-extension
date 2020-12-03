<script>
  export let items;
  export let visibleindex;

  import { bounceOut as easingfunc } from 'svelte/easing';
  import { crossfade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { onMount } from 'svelte';

  let contents;
  let visible;

  let leftlist = [];
  let centerlist = [];

  function moveRight() {
    if (visibleindex < items.length - 1) {
      visibleindex++;
      leftlist = centerlist;
      centerlist = [items[visibleindex]];
    }
  }

  function moveLeft() {
    if (visibleindex < items.length && visibleindex > 0) {
      visibleindex--;
      centerlist = [items[visibleindex]];
      if (visibleindex !== 0) {
        leftlist = [items[visibleindex - 1]];
      } else {
        leftlist = [];
      }
    }
  }

  const [send, receive] = crossfade({
    fallback(node, params) {
      const style = getComputedStyle(node);
      const transform = style.transform === 'none' ? '' : style.transform;

      return {
        duration: 600,
        easing: easingfunc,
        css: t => `transform: ${transform} scale(${t});`,
      };
    },
  });

  onMount(() => {
    items = items.map((data, i) => {
      return { index: i, data: { ...data, moveRight } };
    });
    centerlist = [items[visibleindex]];
    leftlist = visibleindex > 0 ? [items[visibleindex - 1]] : [];
  });
  function handleClick(ind) {
    if (visibleindex > ind) {
      moveLeft();
    } else {
      moveRight();
    }
  }
</script>

<style>
  carousel {
    display: flex;
    max-width: 60%;
  }

  @media screen and (max-width: 500px) {
    carousel {
      max-width: 100%;
    }
  }
  @media screen and (max-width: 800px) and (min-width: 500px) {
    carousel {
      max-width: 70%;
    }
  }
  .justifycenter {
    justify-content: flex-end;
  }

  .justifystart {
    justify-content: flex-end;
  }
  paginator-item:before {
    content: '\25CF';
    font-size: 20px;
  }
  .active {
    color: orange;
  }
  .paginator-wrapper {
    position: absolute;
    bottom: -30px;
    left: 45%;
  }
</style>

<carousel
  bind:this={contents}
  class:justifycenter={leftlist.length === 0}
  class:justifystart={leftlist.length > 0}>
  {#each leftlist as row (row.index)}
    <carousel-item
      in:receive={{ key: row.index }}
      out:send={{ key: row.index }}
      animate:flip
      style={'opacity:0.4'}>
      <slot blah={row.data}>Missing template</slot>
    </carousel-item>
  {/each}
  {#each centerlist as row (row.index)}
    <carousel-item
      in:receive={{ key: row.index }}
      out:send={{ key: row.index }}
      animate:flip>
      <slot blah={row.data}>Missing template</slot>
    </carousel-item>
  {/each}
</carousel>
<div class="paginator-wrapper">
  {#each items as item, index}
    <paginator-item
      class:active={visibleindex === index}
      on:click={() => handleClick(index)} />
  {/each}
</div>
