<script>
  // Utils imports
  import { getSession } from 'sessionmanager';
  import Track from 'tracker';

  // Props
  export let id = '';
  export let type = 'text';
  export let name;
  export let value = null;
  export let required = false;
  export let autocomplete = 'off';
  export let placeholder = '';
  export let pattern = '.*';
  export let formatter = null;
  export let refresh = true;
  export let helpText = '';
  export let invalid = false;
  export let focused = false;
  export let maxlength = null;

  // Computed
  export let identifier;

  // Refs
  export let wrap;
  export let input;

  const session = getSession();

  $: {
    if (maxlength) {
      input.maxLength = maxlength;
    }
  }

  function formatterAction(node, data) {
    if (!(session && session.delegator && data)) {
      return;
    }

    const delegator = session.delegator;
    const formatterObj = delegator.add(data.type, node);

    _Obj.loop(data.on, (callback, event) => {
      formatterObj.on(event, callback);
    });
  }

  $: identifier = id ? id : `id_${Track.makeUid()}`;

  export function focus() {
    input.focus();
  }

  export function blur() {
    input.blur();
  }

  export function getValue() {
    return input.value;
  }

  export function setInvalid() {
    _El.addClass(wrap, 'invalid');
  }
</script>

<style>
  div:not(.help) {
    padding: 4px 0;
    input {
      opacity: 1;
      width: 100%;
    }
  }
</style>

<div bind:this={wrap} class="elem">
  <input
    class="input"
    bind:this={input}
    id={identifier}
    {type}
    {name}
    {value}
    {required}
    {autocomplete}
    {placeholder}
    {pattern}
    use:formatterAction={formatter}
    on:focus
    on:blur
    class:no-refresh={!refresh} />
  {#if helpText}
    <div class="help">{helpText}</div>
  {/if}
</div>
