<script lang="ts">
  // Util imports
  import { Track } from 'analytics';

  export let id = `id_${Track.makeUid()}`;
  export let checked = false;
  export let label = '';
  export let name = '';
  export let value = '';
  export let classes = '';
  export let tabIndex = 0;
</script>

<label class={`native-radio-control${classes ? ` ${classes}`: ''}`} for={id}>
  <input type="radio" id={id} {value} {checked} {name} {tabIndex} on:change />
  <div class="native-radio-control--input" />
  {#if label}
    <span class="native-radio-control--label">{label}</span>
  {/if}
</label>

<style lang="scss">
  .native-radio-control {
    display: inline-flex;
    align-items: center;

    & + :global(&) {
      margin-left: 1rem;
    }

    .native-radio-control--label {
      padding-left: 0.5rem;
    }

    .native-radio-control--input {
      position: relative;
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 50%;
      border: 1px solid rgba(218, 218, 218, 1);

      &::after {
        display: none;
        content: '';
        position: absolute;
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
        left: 2px;
        top: 2px;
      }
    }

    input[type='radio']:checked + .native-radio-control--input {
      border-color: var(--primary-color);

      &::after {
        display: block;
        background-color: var(--primary-color);
      }
    }
  }
</style>
