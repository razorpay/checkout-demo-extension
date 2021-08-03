<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI imports
  import Icon from 'ui/elements/Icon.svelte';

  // Props
  export let icon;
  export let text;

  const dispatch = createEventDispatcher();
</script>

<div on:click={(event) => dispatch('select', event.detail)}>
  <Icon {icon} alt={text} />
  <div class="ref-text">{text}</div>
</div>

<style>
  div:not(.ref-text) {
    order: 0;
    width: 33.33%;
    flex: 1 1 auto;
    align-self: auto;
    display: inline-block;
    outline: 1px solid #ebedf0;
    padding: 12px;
    box-sizing: border-box;
    text-align: center;
    transition: 0.3s background;
    cursor: pointer;
    height: 68px;
    position: relative;
    background: #fcfcfc;

    &:hover {
      background: #efefef;
    }
  }

  div > .ref-text {
    position: absolute;
    bottom: 12px;
    left: 0;
    right: 0;
    font-size: 12px;
    line-height: 15px;
  }

  /* TODO: add a generic icon class in Icon component and reuse it */
  div {
    :global(img),
    :global(svg) {
      position: absolute;
      height: 24px;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
    }
  }
</style>
