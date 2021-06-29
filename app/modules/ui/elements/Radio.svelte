<script>
  // Util imports
  import { Track } from 'analytics';

  // Props
  export let id = '';
  export let checked = false;
  export let name = '';
  export let value = '';
  export let label = '';
  export let classes = '';
  export let tabindex = 0;

  // Computed
  export let identifier;
  export let classesToApply;

  $: identifier = id ? id : `id_${Track.makeUid()}`;
  $: classesToApply = `input-radio ${classes}`;
</script>

<div class={classesToApply}>
  <input
    type="radio"
    id={identifier}
    {checked}
    {name}
    {value}
    on:change
    {tabindex}
  />
  <label for={identifier}>
    <div class="radio-display" />
    {#if label}
      <div class="label-content">
        {@html label}
      </div>
    {/if}
  </label>
</div>

<style>
  label {
    min-width: 18px;
  }
</style>
